"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { LayoutMode, ProblemToolbar } from "../../../../components/problem/ProblemToolbar";
import { ProblemPanel } from "../../../../components/problem/ProblemPanel";
import { EditorPanel } from "../../../../components/problem/EditorPanel";
import { TestCasesPanel, TestCaseState } from "../../../../components/problem/TestCasesPanel";
import { ResizableWorkspace } from "../../../../components/problem/ResizableWorkspace";
import { supabase } from "../../../../lib/supabase";
import { Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types matching Supabase row shape                                         */
/* -------------------------------------------------------------------------- */

interface SampleCase {
  example_num: number;
  example_text: string;
  images?: string[];
}

interface ProblemRow {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string | null;
  patterns: string[];
  starter_code: { python?: string; java?: string; cpp?: string } | null;
  sample_cases: SampleCase[] | null;
  constraints: string[] | null;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Parse "Input: ...\nOutput: ...\nExplanation: ..." from example_text */
function parseSampleCase(raw: SampleCase): { input: string; output: string; explanation?: string; images?: string[] } {
  const text = raw.example_text || "";
  const lines = text.split("\n");

  let input = "";
  let output = "";
  let explanation: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Input:")) {
      input = trimmed.replace(/^Input:\s*/, "");
    } else if (trimmed.startsWith("Output:")) {
      output = trimmed.replace(/^Output:\s*/, "");
    } else if (trimmed.startsWith("Explanation:")) {
      explanation = trimmed.replace(/^Explanation:\s*/, "");
    }
  }

  return { input, output, explanation, images: raw.images };
}

/**
 * Extract the problem body from the raw description.
 * The description often ends with "Example N:" and "Constraints:" headers
 * with the actual values stripped out.
 */
function parseDescription(raw: string | null): string {
  if (!raw) return "";

  // Split at "Constraints:" if present
  const constraintsIdx = raw.indexOf("Constraints:");
  const beforeConstraints = constraintsIdx >= 0 ? raw.substring(0, constraintsIdx) : raw;

  // Remove all "Example N:" fragments (sometimes lack a leading newline)
  const body = beforeConstraints
    .replace(/\s*Example \d+:\s*/g, "")
    .trim();

  return body;
}

/** Build test cases array from sample_cases for TestCasesPanel */
function buildTestCases(samples: SampleCase[] | null) {
  if (!samples || samples.length === 0) return [];
  return samples.map((sc, idx) => {
    const parsed = parseSampleCase(sc);
    return {
      id: `case${idx + 1}`,
      input: parsed.input,
      expected: parsed.output,
      output: "",
      status: undefined as any,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  /* ---- Problem data ---- */
  const [problem, setProblem] = useState<ProblemRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---- UI state ---- */
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("two-column");
  const [testCaseState, setTestCaseState] = useState<TestCaseState>("results");
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState<any[]>([]);
  const [gradingResult, setGradingResult] = useState<{ correct: boolean; message: string; solution?: string }>();

  /* ---- Fetch problem on mount ---- */
  useEffect(() => {
    let cancelled = false;

    async function fetchProblem() {
      const { data, error: fetchError } = await supabase
        .from("problems")
        .select("id, title, difficulty, description, patterns, starter_code, sample_cases, constraints")
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (fetchError || !data) {
        setError(fetchError?.message || "Problem not found");
        setLoading(false);
        return;
      }

      const row = data as ProblemRow;
      setProblem(row);

      // Initialize test cases from sample_cases
      setTestCases(buildTestCases(row.sample_cases));

      // Initialize code from starter_code
      const starterCode = row.starter_code;
      if (starterCode?.python) {
        setCode(starterCode.python);
      }

      setLoading(false);
    }

    fetchProblem();
    return () => { cancelled = true; };
  }, [id]);

  /* ---- Responsive layout on mount ---- */
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setLayoutMode("vertical");
    }
  }, []);

  /* ---- Update code when language changes ---- */
  useEffect(() => {
    if (!problem?.starter_code) return;
    const langKey = language as keyof NonNullable<ProblemRow["starter_code"]>;
    const newCode = problem.starter_code[langKey];
    if (newCode) setCode(newCode);
  }, [language, problem]);

  /* ---- Handlers ---- */
  const handleRun = () => {
    setTestCaseState("running");
    // Mock run — will be replaced with real execution later
    setTimeout(() => {
      setTestCases(prev => prev.map(tc => ({
        ...tc,
        output: tc.expected,
        status: "pass"
      })));
      setTestCaseState("results");
    }, 1500);
  };

  const handleSubmit = () => {
    setTestCaseState("grading");
    // Mock grading — will be replaced with real AI grading later
    setTimeout(() => {
      setGradingResult({
        correct: true,
        message: "against the reference pattern.",
      });
      setTestCaseState("graded");
    }, 2000);
  };

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>Recurse</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="text-sm text-gray-500">Loading problem…</span>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Error state ---- */
  if (error || !problem) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>Recurse</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-sm text-red-700 max-w-md text-center">
            <p className="font-medium mb-1">Problem not found</p>
            <p className="text-red-600">{error || `No problem with ID "${id}" exists.`}</p>
            <button
              onClick={() => router.push("/app/problems")}
              className="mt-4 bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Back to Problems
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Derived data ---- */
  const descriptionBody = parseDescription(problem.description);
  const constraints = problem.constraints || [];
  const examples = (problem.sample_cases || []).map(parseSampleCase);
  const tags = problem.patterns || [];

  // Hints are not stored in the DB yet — pass empty array
  const hints: string[] = [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Shell Nav */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>Recurse</span>
          <nav className="hidden md:flex gap-4">
            <span className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Dashboard</span>
            <span className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Queue</span>
            <span
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={() => router.push("/app/problems")}
            >
              Problems
            </span>
          </nav>
        </div>
        <div className="text-sm text-gray-500 cursor-pointer">User ▾</div>
      </header>

      <ProblemToolbar
        title={problem.title}
        difficulty={problem.difficulty}
        tags={tags}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        language={language}
        setLanguage={setLanguage}
      />

      <ResizableWorkspace
        layoutMode={layoutMode}
        testCaseState={testCaseState}
        problemPanel={
          <ProblemPanel
            title={problem.title}
            description={descriptionBody}
            constraints={constraints}
            examples={examples}
            hints={hints}
            tags={tags}
          />
        }
        editorPanel={
          <EditorPanel
            language={language}
            code={code}
            onChange={(val) => setCode(val || "")}
            isSubmitting={testCaseState === "grading"}
            onRun={handleRun}
            onSubmit={handleSubmit}
          />
        }
        testCasesPanel={
          <TestCasesPanel
            state={testCaseState}
            testCases={testCases}
            onClose={() => setTestCaseState("hidden")}
            gradingResult={gradingResult}
          />
        }
      />
    </div>
  );
}
