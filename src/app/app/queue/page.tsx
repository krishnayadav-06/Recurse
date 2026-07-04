import { createClient } from "../../../utils/supabase/server";
import { getRetrievability } from "../../../utils/fsrs";
import { QueueClient, QueueProblem, Difficulty } from "./components/QueueClient";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Please log in to view your queue.
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("user_problems")
    .select(`
      problem_id, due, reps, stability, difficulty, elapsed_days, scheduled_days, lapses, state, last_review, is_mastered,
      problems (id, title, difficulty, patterns)
    `)
    .eq("user_id", user.id)
    .eq("is_mastered", false);

  if (error || !data) {
    console.error("Error fetching due problems:", error);
    return (
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Error loading queue: {error?.message || "Unknown error"}
        </div>
      </main>
    );
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const daily: QueueProblem[] = [];
  const backlog: QueueProblem[] = [];
  const upcoming: QueueProblem[] = [];

  for (const row of data) {
    const problemData = Array.isArray(row.problems) ? row.problems[0] : row.problems;
    const dueDate = new Date(row.due);
    
    // Calculate calendar days from today
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const daysFromNow = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const isOverdue = daysFromNow < 0;

    const { value: retrievabilityValue, display: retrievabilityDisplay } = getRetrievability(row, now);

    const mapped: QueueProblem = {
      id: problemData.id,
      title: problemData.title,
      difficulty: problemData.difficulty as Difficulty,
      patterns: problemData.patterns || [],
      due: dueDate,
      repetitions: row.reps || 0,
      isOverdue,
      overdueDays: isOverdue ? Math.abs(daysFromNow) : 0,
      upcomingDays: daysFromNow > 0 ? daysFromNow : 0,
      retrievabilityValue,
      retrievabilityDisplay
    };

    if (isOverdue) {
      backlog.push(mapped);
    } else if (daysFromNow === 0) {
      daily.push(mapped);
    } else {
      upcoming.push(mapped);
    }
  }

  return (
    <QueueClient 
      initialDaily={daily} 
      initialBacklog={backlog} 
      initialUpcoming={upcoming} 
    />
  );
}
