/**
 * Shared utilities for the execution pipeline.
 * Extracts function names from starter code and provides
 * common type definitions.
 */

export interface TestCase {
  input: string
  expected: string
}

export interface ExecutionResult {
  passed: boolean
  totalCases: number
  passedCases: number
  failedCaseIndex: number | null
  failedCase: {
    input: string
    expected: string
    actual: string
  } | null
  error: string | null
  executionTimeMs: number
}

/**
 * Extracts the function name from the starter code.
 * 
 * Python:  "def twoSum(self, nums: List[int]..." -> "twoSum"
 * Java:    "public int[] twoSum(int[] nums..."   -> "twoSum"
 * C++:     "vector<int> twoSum(vector<int>&..."  -> "twoSum"
 */
export function extractFunctionName(starterCode: string, language: string): string {
  let match: RegExpMatchArray | null = null

  switch (language) {
    case 'python':
      // Match "def functionName(self, ..."
      match = starterCode.match(/def\s+(\w+)\s*\(\s*self/)
      break
    case 'java':
      // Match "public ReturnType functionName(..." but skip "class" lines
      // Look for method declarations inside the class
      match = starterCode.match(/public\s+\S+\s+(\w+)\s*\(/)
      break
    case 'cpp':
      // Match the method inside "class Solution { public: ReturnType functionName(..."
      // Skip common return types and find the method name
      match = starterCode.match(/(?:public:\s*\n?\s*)(?:[\w<>,\s*&]+?)\s*(\w+)\s*\(/)
      break
  }

  if (match && match[1]) {
    return match[1]
  }

  throw new Error(`Could not extract function name from ${language} starter code`)
}

/**
 * Maps the language key used in our database (starter_code JSON keys)
 * to the Piston runtime language identifier and version.
 */
export function getPistonRuntime(language: string): { language: string; version: string } {
  const runtimes: Record<string, { language: string; version: string }> = {
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'c++', version: '10.2.0' },
  }

  const runtime = runtimes[language]
  if (!runtime) {
    throw new Error(`Unsupported language: ${language}`)
  }
  return runtime
}

/**
 * Parses sample_cases example_text into structured test cases for "Run" mode.
 * 
 * Example input text:
 *   "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: ..."
 * 
 * Returns: { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" }
 */
export function parseSampleCase(exampleText: string): TestCase | null {
  const lines = exampleText.split('\n')

  let inputStr = ''
  let expectedStr = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('Input:')) {
      inputStr = trimmed.replace('Input:', '').trim()
    } else if (trimmed.startsWith('Output:')) {
      expectedStr = trimmed.replace('Output:', '').trim()
    }
  }

  if (!inputStr || !expectedStr) {
    return null
  }

  return { input: inputStr, expected: expectedStr }
}
