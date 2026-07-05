import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '../../../utils/supabase/server';
import { fsrs, Rating, State, createEmptyCard } from 'ts-fsrs';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewLogId, problemId: manualProblemId, rating } = body;

    if (rating === undefined) {
      return NextResponse.json({ error: 'Missing required field: rating' }, { status: 400 });
    }

    if (!reviewLogId && !manualProblemId) {
      return NextResponse.json({ error: 'Must provide either reviewLogId or problemId' }, { status: 400 });
    }

    const serverClient = await createServerClient();
    let { data: { user } } = await serverClient.auth.getUser();

    if (!user && process.env.NODE_ENV === 'development' && process.env.DEV_USER_ID) {
      user = { id: process.env.DEV_USER_ID } as any;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let problemId = manualProblemId;
    let executionPassed = rating > 1; // Default fallback for manual actions

    // 1. If grading a real submission, verify it exists and get the trusted execution result
    if (reviewLogId) {
      const { data: reviewLog, error: logError } = await serverClient
        .from('review_logs')
        .select('problem_id, execution_passed')
        .eq('id', reviewLogId)
        .eq('user_id', user.id)
        .single();

      if (logError || !reviewLog) {
        return NextResponse.json({ error: 'Submission not found or unauthorized' }, { status: 404 });
      }

      problemId = reviewLog.problem_id;
      executionPassed = reviewLog.execution_passed;

      // Update the rating on the log
      await serverClient
        .from('review_logs')
        .update({ rating })
        .eq('id', reviewLogId);
    }

    // 2. Fetch current FSRS state
    const { data: existing } = await serverClient
      .from('user_problems')
      .select('*')
      .eq('user_id', user.id)
      .eq('problem_id', problemId)
      .single();

    const now = new Date();

    // If rating is 5 (Mastered/Don't Track), we suspend it.
    if (rating === 5) {
      if (existing) {
        await serverClient.from('user_problems').update({
          is_mastered: true,
          mastered_at: now.toISOString(),
          last_review: now.toISOString(),
          updated_at: now.toISOString()
        }).eq('id', existing.id);
      } else {
        await serverClient.from('user_problems').insert({
          user_id: user.id,
          problem_id: problemId,
          is_mastered: true,
          mastered_at: now.toISOString(),
          last_review: now.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        });
      }
      return NextResponse.json({ success: true, message: "Problem suspended" });
    }

    // 3. Run FSRS math for ratings 1-4
    const f = fsrs();
    let card = existing ? {
      ...createEmptyCard(),
      due: new Date(existing.due),
      stability: existing.stability,
      difficulty: existing.difficulty,
      elapsed_days: existing.elapsed_days,
      scheduled_days: existing.scheduled_days,
      reps: existing.reps,
      lapses: existing.lapses,
      state: existing.state > 3 ? State.New : existing.state as State,
      last_review: existing.last_review ? new Date(existing.last_review) : undefined
    } : createEmptyCard();

    // Map 1-4 to Rating enum
    const fsrsRating = rating as Rating;

    const schedulingInfo = f.repeat(card, now);
    const nextState = schedulingInfo[fsrsRating].card;

    // 4. Update the DB
    if (existing) {
      await serverClient.from('user_problems').update({
        due: nextState.due.toISOString(),
        stability: nextState.stability,
        difficulty: nextState.difficulty,
        elapsed_days: nextState.elapsed_days,
        scheduled_days: nextState.scheduled_days,
        reps: nextState.reps,
        lapses: nextState.lapses,
        state: nextState.state,
        is_mastered: false,
        mastered_at: null,
        last_review: now.toISOString(),
        updated_at: now.toISOString()
      }).eq('id', existing.id);
    } else {
      await serverClient.from('user_problems').insert({
        user_id: user.id,
        problem_id: problemId,
        due: nextState.due.toISOString(),
        stability: nextState.stability,
        difficulty: nextState.difficulty,
        elapsed_days: nextState.elapsed_days,
        scheduled_days: nextState.scheduled_days,
        reps: nextState.reps,
        lapses: nextState.lapses,
        state: nextState.state,
        is_mastered: false,
        mastered_at: null,
        last_review: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    }

    revalidatePath('/app/dashboard');
    revalidatePath('/app/queue');

    return NextResponse.json({ success: true, nextDue: nextState.due.toISOString() });
  } catch (err: any) {
    console.error("Error in /api/rate:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
