import { createClient } from "../../../utils/supabase/server";
import { ProblemsClient } from "./components/ProblemsClient";
import type { Problem, UserStatus } from "./types";

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let userId = user?.id;
  if (!userId && process.env.NODE_ENV === "development" && process.env.DEV_USER_ID) {
    userId = process.env.DEV_USER_ID;
  }

  const statusPromise = userId 
    ? supabase.from("user_problems").select("problem_id, reps").eq("user_id", userId)
    : Promise.resolve({ data: [], error: null });

  // Fire both queries in parallel
  const [problemsRes, statusRes] = await Promise.all([
    supabase
      .from("problems")
      .select("id, title, difficulty, patterns")
      .order("title", { ascending: true }),
    statusPromise,
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
