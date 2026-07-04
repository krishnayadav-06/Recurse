import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Overdue cutoff is today at 00:00:00 (anything due before today is backlog)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cutoff = today.toISOString();

  const { data: spreadCount, error: rpcError } = await supabase
    .rpc('spread_backlog', {
      p_user_id: user.id,
      p_cutoff: cutoff
    });

  if (rpcError) {
    console.error("Error calling spread_backlog RPC:", rpcError);
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  if (spreadCount === 0) {
    return NextResponse.json({ success: true, message: "No backlog to spread" });
  }

  revalidatePath('/app/dashboard');
  revalidatePath('/app/queue');

  return NextResponse.json({ success: true, spreadCount });
}
