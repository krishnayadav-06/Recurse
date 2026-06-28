import { createClient } from "../../../utils/supabase/server";
import { ProblemsClient } from "./components/ProblemsClient";
import type { Problem, UserStatus } from "./types";

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const supabase = await createClient();

  // Fire both queries in parallel
  const [problemsRes, statusRes] = await Promise.all([
    supabase
      .from("problems")
      .select("id, title, difficulty, patterns")
      .order("title", { ascending: true }),
    supabase.from("user_problems").select("problem_id, reps"),
  ]);

  if (problemsRes.error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="p-8">
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
            Failed to load problems: {problemsRes.error.message}
          </div>
        </div>
      </div>
    );
  }

  const initialProblems = (problemsRes.data || []) as Problem[];

  const initialStatusMap: Record<string, number> = {};
  if (statusRes.data) {
    for (const row of statusRes.data as UserStatus[]) {
      initialStatusMap[row.problem_id] = row.reps;
    }
  }

  return (
    <ProblemsClient
      initialProblems={initialProblems}
      initialStatusMap={initialStatusMap}
    />
  );
}
