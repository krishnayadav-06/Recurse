"use client";

import { useState, useEffect } from "react";
import { LayoutMode, ProblemToolbar } from "../../../../components/problem/ProblemToolbar";
import { ProblemPanel } from "../../../../components/problem/ProblemPanel";
import { EditorPanel } from "../../../../components/problem/EditorPanel";
import { TestCasesPanel, TestCaseState } from "../../../../components/problem/TestCasesPanel";
import { ResizableWorkspace } from "../../../../components/problem/ResizableWorkspace";

const MOCK_PROBLEM = {
  id: "two-sum",
  title: "1. Two Sum",
  difficulty: "Easy" as const,
  tags: ["Array", "Hash Table"],
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ],
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
    },
  ],
  hints: [
    "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness.",
    "So, if we fix one of the numbers, say `x`, we have to scan the entire array to find the next number `y` which is `value - x` where value is the input parameter. Can we change our array keeping a track of the elements in a way that we don't need to scan everything?",
    "The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?"
  ],
  testCases: [
    { id: "case1", input: "nums = [2,7,11,15]\ntarget = 9", expected: "[0,1]", output: "", status: undefined as any },
    { id: "case2", input: "nums = [3,2,4]\ntarget = 6", expected: "[1,2]", output: "", status: undefined as any },
    { id: "case3", input: "nums = [3,3]\ntarget = 6", expected: "[0,1]", output: "", status: undefined as any },
  ]
};

const DEFAULT_CODE = {
  python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # ___
        pass`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
};

export default function ReviewPage({ params }: { params: { id: string } }) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("two-column");
  const [testCaseState, setTestCaseState] = useState<TestCaseState>("results");
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [testCases, setTestCases] = useState(MOCK_PROBLEM.testCases);
  const [gradingResult, setGradingResult] = useState<{ correct: boolean; message: string; solution?: string }>();

  // Check window width on mount for responsive default
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setLayoutMode("vertical");
    }
  }, []);

  // Update code when language changes
  useEffect(() => {
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE]);
  }, [language]);

  const handleRun = () => {
    setTestCaseState("running");
    
    // Mock run logic
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
    
    // Mock grading logic
    setTimeout(() => {
      setGradingResult({
        correct: true,
        message: "against the reference pattern.",
      });
      setTestCaseState("graded");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Shell Nav - normally part of layout, placing here to match design spec context */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900">Recurse</span>
          <nav className="hidden md:flex gap-4">
            <span className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Dashboard</span>
            <span className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Queue</span>
            <span className="text-sm text-gray-900 font-medium cursor-pointer">Problems</span>
          </nav>
        </div>
        <div className="text-sm text-gray-500 cursor-pointer">User ▾</div>
      </header>

      <ProblemToolbar
        title={MOCK_PROBLEM.title}
        difficulty={MOCK_PROBLEM.difficulty}
        tags={MOCK_PROBLEM.tags}
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
            title={MOCK_PROBLEM.title}
            description={MOCK_PROBLEM.description}
            constraints={MOCK_PROBLEM.constraints}
            examples={MOCK_PROBLEM.examples}
            hints={MOCK_PROBLEM.hints}
            tags={MOCK_PROBLEM.tags}
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
