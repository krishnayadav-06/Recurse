import { createClient } from "../../../utils/supabase/server";
import { MasteredClient, MasteredProblem } from "./components/MasteredClient";

export const dynamic = "force-dynamic";

export default async function MasteredPage() {
  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return <MasteredClient initialProblems={[]} isAuthenticated={false} />;
  }

  const { data: userProblems, error: userError } = await supabase
    .from('user_problems')
    .select('problem_id')
    .eq('user_id', userData.user.id)
    .eq('is_mastered', true);

  if (userError) {
    console.error("Error fetching mastered problems:", userError);
    return (
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Failed to load mastered problems.
        </div>
      </main>
    );
  }

  if (!userProblems || userProblems.length === 0) {
    return <MasteredClient initialProblems={[]} />;
  }

  const problemIds = userProblems.map(up => up.problem_id);

  const { data: problemData, error: probError } = await supabase
    .from('problems')
    .select('id, title, difficulty, patterns')
    .in('id', problemIds);

  if (probError) {
    console.error("Error fetching problem details:", probError);
    return (
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Failed to load problem details.
        </div>
      </main>
    );
  }

  const initialProblems = (problemData || []) as MasteredProblem[];

  return <MasteredClient initialProblems={initialProblems} />;
}
