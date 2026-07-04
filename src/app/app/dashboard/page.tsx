import { createClient } from '../../../utils/supabase/server';
import { PageHeader } from './components/PageHeader';
import { StatRow } from './components/StatRow';
import { ActivityContainer } from './components/ActivityContainer';
import { BreakdownPanel } from './components/BreakdownPanel';
import { RecentActivity } from './components/RecentActivity';
import { Footer } from '../../../components/landing/Footer';

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProblems = [];
  let reviewLogs = [];

  if (user) {
    const [upRes, rlRes] = await Promise.all([
      supabase
        .from("user_problems")
        .select(`
          problem_id, due, is_mastered, reps,
          problems (title, difficulty, patterns)
        `)
        .eq("user_id", user.id),
      supabase
        .from("review_logs")
        .select(`
          id, reviewed_at, execution_passed, rating, review_duration_ms,
          problems (title)
        `)
        .eq("user_id", user.id)
        .order("reviewed_at", { ascending: false })
        .limit(100)
    ]);
    
    if (upRes.data) userProblems = upRes.data;
    if (rlRes.data) reviewLogs = rlRes.data;
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {/* Page content */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <PageHeader userName={userName} userProblems={userProblems} />

        <div className="py-6 border-y border-gray-200 mb-6">
          <StatRow userProblems={userProblems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityContainer reviewLogs={reviewLogs} userProblems={userProblems} />
            <RecentActivity reviewLogs={reviewLogs} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <BreakdownPanel userProblems={userProblems} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
