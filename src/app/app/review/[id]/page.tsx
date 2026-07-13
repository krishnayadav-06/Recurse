"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { LayoutMode, ProblemToolbar } from "../../../../components/problem/ProblemToolbar";
import { ProblemPanel } from "../../../../components/problem/ProblemPanel";
import { EditorPanel } from "../../../../components/problem/EditorPanel";
import { TestCasesPanel, TestCaseState, type TestCase } from "../../../../components/problem/TestCasesPanel";
import { ResizableWorkspace } from "../../../../components/problem/ResizableWorkspace";
import { createClient } from "../../../../utils/supabase/client";
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
  html_content: string | null;
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
  let explanation = "";
  let currentState: "input" | "output" | "explanation" | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Input:")) {
      currentState = "input";
      input = trimmed.replace(/^Input:\s*/, "");
    } else if (trimmed.startsWith("Output:")) {
      currentState = "output";
      output = trimmed.replace(/^Output:\s*/, "");
    } else if (trimmed.startsWith("Explanation:")) {
      currentState = "explanation";
      explanation = trimmed.replace(/^Explanation:\s*/, "");
    } else if (trimmed !== "") {
      if (currentState === "input") {
        input += "\n" + line;
      } else if (currentState === "output") {
        output += "\n" + line;
      } else if (currentState === "explanation") {
        explanation += "\n" + line;
      }
    }
  }

  return { 
    input: input.trim(), 
    output: output.trim(), 
    explanation: explanation.trim() || undefined, 
    images: raw.images 
  };
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
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("two-column");
  const [testCaseState, setTestCaseState] = useState<"hidden" | "running" | "results">("hidden");
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "graded">("idle");
  const [panelTab, setPanelTab] = useState<"description" | "solutions" | "submissions">("description");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [gradingResult, setGradingResult] = useState<{ correct: boolean; message: string; solution?: string; executionTimeMs?: number; reviewLogId?: string } | undefined>();
  const [isMasterySuggested, setIsMasterySuggested] = useState(false);

  /* ---- Fetch problem on mount ---- */
  useEffect(() => {
    let cancelled = false;

    async function fetchProblem() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("problems")
        .select("id, title, difficulty, description, html_content, patterns, starter_code, sample_cases, constraints")
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

      // Check for mastery heuristic
      const { data: userProb } = await supabase
        .from("user_problems")
        .select("reps, stability, scheduled_days")
        .eq("problem_id", id)
        .maybeSingle();

      if (userProb) {
        if (userProb.scheduled_days >= 60 || (userProb.reps >= 4 && userProb.stability >= 30)) {
          setIsMasterySuggested(true);
        }
      }
      


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
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleRun = async () => {
    if (!problem) return;

    // Abort any pending execution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setTestCaseState("running");

    try {
      const response = await fetch("/api/execute", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language,
          action: "run",
        }),
      });

      const data = await response.json();

      setTestCaseState("results");

      if (!response.ok || data.error) {
        setGradingResult({
          correct: false,
          message: data.error || "An unknown error occurred during execution.",
        });
        return;
      }

      setTestCases(prev => prev.map((tc, idx) => {
        if (data.failedCaseIndex !== null && idx === data.failedCaseIndex) {
          return { ...tc, status: "fail", output: data.failedCase.actual };
        } else if (data.failedCaseIndex === null || idx < data.failedCaseIndex) {
          return { ...tc, status: "pass", output: tc.expected };
        }
        return { ...tc, status: undefined, output: "" }; // Pending / not run
      }));
      setGradingResult(undefined);

    } catch (err: any) {
      setTestCaseState("results");
      if (err.name !== 'AbortError') {
        setGradingResult({
          correct: false,
          message: err.message || "Failed to connect to execution server.",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    
    // Abort any pending execution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSubmissionState("submitting");
    setPanelTab("submissions");
    setTestCaseState("hidden");

    try {
      const response = await fetch("/api/execute", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language,
          action: "submit",
        }),
      });

      const data = await response.json();

      setSubmissionState("graded");

      if (!response.ok || data.error) {
        setGradingResult({
          correct: false,
          message: data.error || "An unknown error occurred during execution.",
        });
        return;
      }

      if (data.passed) {
        setGradingResult({
          correct: true,
          message: `Passed all ${data.totalCases} test cases!`,
          executionTimeMs: data.executionTimeMs,
          reviewLogId: data.reviewLogId,
        });
      } else {
        setGradingResult({
          correct: false,
          message: `Failed on test case ${data.failedCaseIndex + 1}. Expected: ${data.failedCase.expected}, Actual: ${data.failedCase.actual}`,
          solution: `Input: ${data.failedCase.input}\nExpected: ${data.failedCase.expected}\nActual: ${data.failedCase.actual}`,
          reviewLogId: data.reviewLogId,
        });

        // Auto-rate as Again (1) on failure
        if (data.reviewLogId) {
          fetch("/api/rate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reviewLogId: data.reviewLogId,
              rating: 1, // Again
            })
          }).catch(console.error);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setSubmissionState("graded");
        setGradingResult({
          correct: false,
          message: err.message || "Failed to connect to execution server.",
        });
      }
    }
  };

  const handleRatingConfirm = async (ratingLabel: string) => {
    if (!problem || !gradingResult || !gradingResult.reviewLogId) return;
    
    // Map string to FSRS rating number (1-4, 5 for Mastered)
    const ratingMap: Record<string, number> = {
      "Again": 1,
      "Hard": 2,
      "Good": 3,
      "Easy": 4,
      "Mastered": 5
    };
    const ratingValue = ratingMap[ratingLabel] || 3;

    try {
      await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewLogId: gradingResult.reviewLogId,
          rating: ratingValue,
        })
      });
      // Auto-advance to queue
      router.push("/app/queue");
    } catch (err) {
      console.error("Failed to save rating:", err);
    }
  };

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white">

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
      {/* 
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>Recurse</span>
          <nav className="hidden md:flex gap-4">
            <span 
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={() => router.push("/app/dashboard")}
            >
              Dashboard
            </span>
            <span 
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={() => router.push("/app/queue")}
            >
              Queue
            </span>
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
      */}
      <ProblemToolbar
        title={problem.title}
        difficulty={problem.difficulty}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        language={language}
        setLanguage={setLanguage}
        onRun={handleRun}
        onSubmit={handleSubmit}
        isSubmitting={submissionState === "submitting"}
      />

      <ResizableWorkspace
        layoutMode={layoutMode}
        testCaseState={testCaseState}
        problemPanel={
          <ProblemPanel
            problemId={problem.id}
            title={problem.title}
            description={descriptionBody}
            htmlContent={problem.html_content || undefined}
            constraints={constraints}
            examples={examples}
            hints={hints}
            tags={tags}
            activeTab={panelTab}
            onTabChange={setPanelTab}
            submissionState={submissionState}
            gradingResult={gradingResult}
            onRatingConfirm={handleRatingConfirm}
            isMasterySuggested={isMasterySuggested}
            onClearSubmission={() => setSubmissionState("idle")}
          />
        }
        editorPanel={
          <EditorPanel
            language={language}
            code={code}
            onChange={(val) => setCode(val || "")}
            isSubmitting={submissionState === "submitting"}
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
