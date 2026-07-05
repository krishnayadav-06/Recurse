
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '../../../utils/supabase/server'
import { generatePythonHarness } from '../../../lib/runners/python'
import { generateCppHarness } from '../../../lib/runners/cpp'
import { generateJavaHarness } from '../../../lib/runners/java'
import {
  extractFunctionName,
  getPistonRuntime,
  parseSampleCase,
  type TestCase,
  type ExecutionResult,
} from '../../../lib/runners/utils'

const PISTON_API_URL = process.env.PISTON_API_URL || 'http://localhost:2000/api/v2/execute'

function checkAnswer(problemId: string, expectedStr: string, actualStr: string, unordered: boolean, inputStr: string): boolean {
  // --- Problem-specific custom validators ---

  // two-sum-ii: multiple valid index pairs; verify nums[i-1]+nums[j-1]==target
  if (problemId === 'two-sum-ii-input-array-is-sorted') {
    try {
      const a = JSON.parse(actualStr);
      if (Array.isArray(a) && a.length === 2) {
        const parts = inputStr.split(', target = ');
        let numsStr = parts[0];
        if (numsStr.startsWith('numbers = ')) numsStr = numsStr.substring(10);
        const nums = JSON.parse(numsStr);
        const target = parseInt(parts[1]);
        if (nums[a[0] - 1] + nums[a[1] - 1] === target && a[0] < a[1]) return true;
      }
    } catch { }
  }

  // evaluate-division: float precision — compare each element with relative tolerance
  if (problemId === 'evaluate-division') {
    try {
      const e = JSON.parse(expectedStr);
      const a = JSON.parse(actualStr);
      if (Array.isArray(e) && Array.isArray(a) && e.length === a.length) {
        const EPS = 1e-4;
        for (let i = 0; i < e.length; i++) {
          if (e[i] === -1.0 && a[i] === -1.0) continue;
          if (e[i] === -1.0 || a[i] === -1.0) return false;
          const diff = Math.abs(e[i] - a[i]);
          const denom = Math.max(Math.abs(e[i]), 1e-12);
          if (diff / denom > EPS) return false;
        }
        return true;
      }
    } catch { }
  }

  // find-k-pairs-with-smallest-sums: order among equal-sum pairs varies
  if (problemId === 'find-k-pairs-with-smallest-sums') {
    try {
      const e = JSON.parse(expectedStr);
      const a = JSON.parse(actualStr);
      if (Array.isArray(e) && Array.isArray(a) && e.length === a.length) {
        const sumE = e.map((p: number[]) => p[0] + p[1]).sort((x: number, y: number) => x - y);
        const sumA = a.map((p: number[]) => p[0] + p[1]).sort((x: number, y: number) => x - y);
        if (JSON.stringify(sumE) === JSON.stringify(sumA)) return true;
      }
    } catch { }
  }

  // group-anagrams: group order and inner element order both vary
  if (problemId === 'group-anagrams') {
    try {
      const e = JSON.parse(expectedStr);
      const a = JSON.parse(actualStr);
      if (Array.isArray(e) && Array.isArray(a) && e.length === a.length) {
        const normalize = (groups: string[][]) =>
          groups
            .map((g: string[]) => [...g].sort().join('\x00'))
            .sort()
            .join('\x01');
        if (normalize(e) === normalize(a)) return true;
      }
    } catch { }
  }

  // k-closest-points-to-origin: among equidistant points, selection order varies
  if (problemId === 'k-closest-points-to-origin') {
    try {
      const e = JSON.parse(expectedStr);
      const a = JSON.parse(actualStr);
      if (Array.isArray(e) && Array.isArray(a) && e.length === a.length) {
        const dist = (p: number[]) => p[0] * p[0] + p[1] * p[1];
        const eDists = e.map(dist).sort((x: number, y: number) => x - y);
        const aDists = a.map(dist).sort((x: number, y: number) => x - y);
        if (JSON.stringify(eDists) === JSON.stringify(aDists)) return true;
      }
    } catch { }
  }

  // pacific-atlantic-water-flow: DB stores Python tuples (r,c) vs C++ outputs [r,c]
  if (problemId === 'pacific-atlantic-water-flow') {
    try {
      // Normalize parentheses to brackets, stripping wrapping quotes first
      const unquote = (s: string) => s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;
      const norm = (s: string) => s.replace(/\(/g, '[').replace(/\)/g, ']');
      const eNorm = norm(unquote(expectedStr));
      const aNorm = norm(unquote(actualStr));
      const e = JSON.parse(eNorm);
      const a = JSON.parse(aNorm);
      if (Array.isArray(e) && Array.isArray(a) && e.length === a.length) {
        const toSet = (arr: number[][]) => new Set(arr.map((p: number[]) => `${p[0]},${p[1]}`));
        const eSet = toSet(e);
        const aSet = toSet(a);
        if (eSet.size === aSet.size && [...eSet].every(v => aSet.has(v))) return true;
      }
    } catch { }
  }

  // product-of-array-except-self: 32-bit signed int overflow cast
  if (problemId === 'product-of-array-except-self') {
    try {
      const e = JSON.parse(expectedStr);
      const a = JSON.parse(actualStr);
      if (Array.isArray(e) && Array.isArray(a) && e.length === a.length) {
        for (let i = 0; i < e.length; i++) {
          if (a[i] !== (e[i] | 0)) return false;
        }
        return true;
      }
    } catch { }
  }

  // find-unique-binary-string: multiple valid binary strings
  if (problemId === 'find-unique-binary-string') {
    try {
      let numsStr = inputStr;
      if (numsStr.startsWith("nums = ")) numsStr = numsStr.substring(7);
      const nums = JSON.parse(numsStr);
      let actual = actualStr.replace(/[\s"']/g, '');
      if (actual.length === nums[0].length && !nums.includes(actual)) {
        return true;
      }
      return false;
    } catch { }
  }

  // powx-n: float comparison with relative tolerance
  if (problemId === 'powx-n') {
    try {
      const e = parseFloat(expectedStr);
      const a = parseFloat(actualStr);
      if (!isNaN(e) && !isNaN(a)) {
        const diff = Math.abs(e - a);
        const denom = Math.max(Math.abs(e), 1e-12);
        if (diff / denom <= 1e-4) return true;
      }
    } catch { }
  }

  // path-with-maximum-probability: absolute float comparison
  if (problemId === 'path-with-maximum-probability') {
    try {
      const e = parseFloat(expectedStr);
      const a = parseFloat(actualStr);
      if (!isNaN(e) && !isNaN(a)) {
        if (Math.abs(e - a) <= 1e-5) return true;
      }
    } catch { }
  }

  // intersection-of-two-linked-lists: multiple ways to represent null
  if (problemId === 'intersection-of-two-linked-lists') {
    const unquote = (s: string) => s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;
    const e = unquote(expectedStr).trim();
    const a = unquote(actualStr).trim();
    const isNullOrEmpty = (s: string) => s === 'No intersection' || s === 'null' || s === '[]' || s === 'None';
    if (isNullOrEmpty(e) && isNullOrEmpty(a)) return true;
  }

  //  // Null vs Empty array/list equivalence
  // Python sometimes returns "None" for empty trees/lists, while C++ harness prints "[]"
  if ((expectedStr === 'None' || expectedStr === 'null') && (actualStr === '[]' || actualStr === 'null' || actualStr === 'None')) return true;
  if ((actualStr === 'None' || actualStr === 'null') && (expectedStr === '[]' || expectedStr === 'null' || expectedStr === 'None')) return true;

  // --- Generic comparison ---
  if (expectedStr === actualStr) return true;
  if (!unordered) return false;
  try {
    const e = JSON.parse(expectedStr);
    const a = JSON.parse(actualStr);
    if (Array.isArray(e) && Array.isArray(a)) {
      if (e.length !== a.length) return false;
      const es = [...e].sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
      const as = [...a].sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
      return JSON.stringify(es) === JSON.stringify(as);
    }
  } catch (err) { }
  return false;
}

/**
 * Creates a Supabase admin client using the Service Role Key.
 * Used exclusively for reading problem_test_suites (which has no public RLS policies).
 */
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Creates a Supabase anon client for reading public data (problems table).
 */
function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

/**
 * POST /api/execute
 *
 * Body: {
 *   problemId: string,
 *   code: string,
 *   language: "python" | "cpp" | "java",
 *   action: "run" | "submit" | "generate_expected"
 * }
 *
 * "run"    → executes only against sample_cases (visible to user)
 * "submit" → executes against sample_cases + hidden_cases (full evaluation)
 */
export async function POST(request: NextRequest) {
  try {
    // --- Authenticate the user ---
    const serverClient = await createServerClient()
    let { data: { user } } = await serverClient.auth.getUser()

    if (!user && process.env.NODE_ENV === 'development' && process.env.DEV_USER_ID) {
      user = { id: process.env.DEV_USER_ID } as any
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to execute code.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { problemId, code, language, action } = body

    // --- Validate input ---
    if (!problemId || !code || !language || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: problemId, code, language, action' },
        { status: 400 }
      )
    }

    if (!['python', 'cpp', 'java'].includes(language)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    if (!['run', 'submit', 'generate_expected'].includes(action)) {
      return NextResponse.json(
        { error: `Invalid action: ${action}. Must be "run" or "submit".` },
        { status: 400 }
      )
    }

    // --- Fetch problem metadata (public, anon key) ---
    const anonClient = createAnonClient()
    const { data: problem, error: problemError } = await anonClient
      .from('problems')
      .select('input_types, output_type, unordered_output, sample_cases, starter_code, in_place')
      .eq('id', problemId)
      .single()

    if (problemError || !problem) {
      return NextResponse.json(
        { error: `Problem not found: ${problemId}` },
        { status: 404 }
      )
    }

    const { input_types, output_type, unordered_output, sample_cases, starter_code, in_place } = problem

    // --- Extract function name from starter code ---
    const starterForLang = starter_code?.[language]
    if (!starterForLang) {
      return NextResponse.json(
        { error: `No starter code available for language: ${language}` },
        { status: 400 }
      )
    }

    const functionName = extractFunctionName(starterForLang, language)

    // --- Build the test cases array ---
    let testCases: TestCase[] = []

    // Parse sample_cases from display text into structured format
    if (sample_cases && Array.isArray(sample_cases)) {
      for (const sc of sample_cases) {
        if (sc.example_text) {
          const parsed = parseSampleCase(sc.example_text)
          if (parsed) {
            testCases.push(parsed)
          }
        }
      }
    }

    // If "submit" or "generate_expected", also fetch hidden_cases using the Service Role Key
    if (action === 'submit' || action === 'generate_expected') {
      const adminClient = createAdminClient()
      const { data: testSuite, error: suiteError } = await adminClient
        .from('problem_test_suites')
        .select('hidden_cases')
        .eq('problem_id', problemId)
        .single()

      if (suiteError || !testSuite) {
        return NextResponse.json(
          { error: `Test suite not found for problem: ${problemId}` },
          { status: 404 }
        )
      }

      // Append hidden cases to the test cases array
      if (testSuite.hidden_cases && Array.isArray(testSuite.hidden_cases)) {
        testCases = testCases.concat(testSuite.hidden_cases as TestCase[])
      }
    }

    if (testCases.length === 0) {
      return NextResponse.json(
        { error: 'No test cases available for this problem.' },
        { status: 400 }
      )
    }

    // --- Filter out excessively large test cases ---
    // Piston's API has a hard 100kb body limit. If a single test case is > 50kb, it will crash the API.
    testCases = testCases.filter(tc => JSON.stringify(tc).length <= 50000);

    // --- Filter out test cases that exceed 32-bit integer bounds if output_type is integer ---
    if (problem.output_type === 'integer' || problem.output_type === 'int') {
      testCases = testCases.filter(tc => {
        if (typeof tc.expected === 'number') {
          return tc.expected >= -2147483648 && tc.expected <= 2147483647;
        }
        if (typeof tc.expected === 'string') {
          const num = Number(tc.expected);
          if (!isNaN(num)) {
            return num >= -2147483648 && num <= 2147483647;
          }
        }
        return true;
      });
    }

    if (testCases.length === 0) {
      return NextResponse.json(
        { error: 'All test cases exceeded the maximum payload size of 50kb.' },
        { status: 400 }
      )
    }

    // --- Generate the harness code ---
    // Convert tabs to 4 spaces to avoid invisible indentation errors in languages like Python
    const sanitizedCode = code.replace(/\t/g, '    ')

    const harnessOptions = {
      problemId,
      userCode: sanitizedCode,
      functionName,
      inputTypes: input_types,
      outputType: output_type,
      inPlace: in_place,
    }

    let harnessCode: string
    switch (language) {
      case 'python':
        harnessCode = generatePythonHarness(harnessOptions)
        break
      case 'cpp':
        harnessCode = generateCppHarness(harnessOptions)
        break
      case 'java':
        harnessCode = generateJavaHarness(harnessOptions)
        break
      default:
        return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }

    // --- Send to Piston in Concurrent Batches ---
    const runtime = getPistonRuntime(language)
    const MAX_PAYLOAD_SIZE = 50000;
    const CUSTOM_BATCH_SIZES: Record<string, number> = {
      '3sum': 3,
      '4sum': 3,
      'sudoku-solver': 5,
      'coin-change-ii': 5,
    };
    const MAX_BATCH_SIZE = CUSTOM_BATCH_SIZES[problemId] || 300;
    const batches: { startIndex: number, cases: any[] }[] = [];
    let currentBatch: any[] = [];
    let currentBatchSize = 0;
    let startIndex = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const caseSize = JSON.stringify(testCase).length;

      if (currentBatch.length > 0 && (currentBatchSize + caseSize > MAX_PAYLOAD_SIZE || currentBatch.length >= MAX_BATCH_SIZE)) {
        batches.push({ startIndex, cases: currentBatch });
        startIndex = i;
        currentBatch = [];
        currentBatchSize = 0;
      }
      currentBatch.push(testCase);
      currentBatchSize += caseSize;
    }
    if (currentBatch.length > 0) {
      batches.push({ startIndex, cases: currentBatch });
    }


    let batchResults;
    try {
      const CONCURRENCY_LIMIT = 1;
      batchResults = [];
      const executing = new Set<Promise<void>>();

      for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
        const batch = batches[batchIdx];
        const task = (async () => {
          const pistonPayload = {
            language: runtime.language,
            version: runtime.version,
            files: [
              {
                name: language === 'java' ? 'Main.java' : language === 'cpp' ? 'main.cpp' : 'main.py',
                content: harnessCode,
              },
            ],
            stdin: JSON.stringify(batch.cases),
            run_timeout: 10000,
            output_limit: 10000000,
            compile_timeout: 10000,

            compile_args: language === 'cpp' ? ['-std=c++20'] : undefined,
          };

          const pistonResponse = await fetch(PISTON_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pistonPayload),
          });

          if (!pistonResponse.ok) {
            const errText = await pistonResponse.text();
            throw new Error(`Piston execution failed: ${errText}`);
          }

          const pistonResult = await pistonResponse.json();
          batchResults.push({ batch, batchIdx, pistonResult });
        })();

        executing.add(task);
        task.finally(() => executing.delete(task));

        if (executing.size >= CONCURRENCY_LIMIT) {
          await Promise.race(executing);
        }
      }

      await Promise.all(executing);

      // Sort results by batchIdx to maintain order
      batchResults.sort((a, b) => a.batchIdx - b.batchIdx);

    } catch (err: any) {
      return NextResponse.json(
        { error: err.message },
        { status: 502 }
      )
    }

    // Native execution time accumulated from harness [NATIVE_TIME_MS] markers
    let executionTimeMs = 0

    let passedCases = 0
    let failedCaseIndex: number | null = null
    let failedCase: ExecutionResult['failedCase'] = null
    let globalError: string | null = null
    const allGeneratedOutputs: string[] = []

    for (const { batch, batchIdx, pistonResult } of batchResults) {
      if (failedCaseIndex !== null) break;

      // --- Check for compile errors ---
      if (pistonResult.compile && pistonResult.compile.code !== 0) {
        globalError = `Compilation Error:\\n${pistonResult.compile.stderr || pistonResult.compile.output}`
        break
      }

      // --- Check for runtime errors ---
      if (pistonResult.run.code !== 0 && !pistonResult.run.stdout) {
        globalError = `Runtime Error:\\n${pistonResult.run.stderr || pistonResult.run.output}`
        break
      }

      const stdout = (pistonResult.run.stdout || '').trim()
      const stderr = (pistonResult.run.stderr || '').trim()
      const rawOutputLines = stdout ? stdout.split('\n') : []

      // Extract native execution time from the harness marker line and strip it from output
      const outputLines: string[] = []
      for (const line of rawOutputLines) {
        const timeMatch = line.match(/^\[NATIVE_TIME_MS\]=([\d.]+)$/)
        if (timeMatch) {
          executionTimeMs += parseFloat(timeMatch[1])
        } else {
          outputLines.push(line)
        }
      }

      for (let i = 0; i < batch.cases.length; i++) {
        const globalIndex = batch.startIndex + i;
        if (i >= outputLines.length) {
          failedCaseIndex = globalIndex
          failedCase = {
            input: batch.cases[i].input,
            expected: batch.cases[i].expected,
            actual: stderr ? `Runtime Error: ${stderr}` : 'No output (possible crash)',
          }
          break
        }

        const outputLine = outputLines[i].trim()

        // Check if the harness caught an error
        try {
          const parsed = JSON.parse(outputLine)
          if (parsed && typeof parsed === 'object' && parsed.error) {
            if (action !== 'generate_expected') {
              failedCaseIndex = globalIndex
              failedCase = {
                input: batch.cases[i].input,
                expected: batch.cases[i].expected,
                actual: `Error: ${parsed.error}`,
              }
              break
            } else {
              allGeneratedOutputs.push(`Error: ${parsed.error}`);
              continue;
            }
          }
        } catch {
          // Not a JSON error object, proceed with comparison
        }

        if (action === 'generate_expected') {
          allGeneratedOutputs.push(outputLine);
          continue;
        }

        // Compare actual vs expected
        const expected = batch.cases[i].expected.trim()
        let actual = outputLine

        // Normalize for comparison
        let expectedNorm = normalizeValue(expected)
        let actualNorm = normalizeValue(actual)

        let isMatch = checkAnswer(problemId, expectedNorm, actualNorm, unordered_output, batch.cases[i].input);

        // Loose fallback comparison to catch unquoted database primitives vs quoted stdout JSON
        if (!isMatch) {
          const looseActual = actualNorm.replace(/[\s"']/g, '');
          const looseExpected = expectedNorm.replace(/[\s"']/g, '');
          if (looseActual === looseExpected) {
            isMatch = true;
          }
        }

        if (isMatch) {
          passedCases++
        } else {
          failedCaseIndex = globalIndex
          failedCase = {
            input: batch.cases[i].input,
            expected: batch.cases[i].expected,
            actual: outputLine,
          }
        }
      } // End of inner loop
    } // End of outer loop

    if (action === 'generate_expected') {
      return NextResponse.json({
        outputs: allGeneratedOutputs,
        error: globalError
      });
    }

    // Round accumulated native time up and enforce a 1ms floor for clean display
    executionTimeMs = Math.max(1, Math.ceil(executionTimeMs))

    const passed = !globalError && passedCases === testCases.length

    let reviewLogId: string | undefined;

    if (action === 'submit') {
      const { data: logData, error: logError } = await serverClient.from('review_logs').insert({
        user_id: user.id,
        problem_id: problemId,
        rating: null,
        execution_passed: passed,
        review_duration_ms: executionTimeMs,
        code,
        language,
        reviewed_at: new Date().toISOString()
      }).select('id').single();

      if (!logError && logData) {
        reviewLogId = logData.id;
      } else {
        console.error("Failed to insert review_log:", logError);
      }
    }

    if (globalError) {
      return NextResponse.json({
        passed: false,
        totalCases: testCases.length,
        passedCases,
        failedCaseIndex,
        failedCase,
        error: globalError,
        executionTimeMs,
        reviewLogId,
      } satisfies ExecutionResult)
    }

    return NextResponse.json({
      passed,
      totalCases: testCases.length,
      passedCases,
      failedCaseIndex,
      failedCase,
      error: !passed ? 'Test failed' : null,
      executionTimeMs,
      reviewLogId,
    } satisfies ExecutionResult)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Normalizes a JSON value string for comparison.
 * Removes whitespace, parses and re-stringifies JSON to ensure
 * consistent formatting. It also cleans Python-style constants.
 */
function normalizeValue(value: string): string {
  if (!value) return value;

  // Clean up python-isms the scraper might have inserted
  const cleaned = value
    .replace(/\bNone\b/g, 'null')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/'/g, '"');

  try {
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed);
  } catch {
    // If it's not valid JSON (e.g. a raw string like 100 instead of "100"), 
    // it will throw. We wrap it in quotes and parse it again.
    try {
      const parsedRaw = JSON.parse(`"${cleaned}"`);
      return JSON.stringify(parsedRaw);
    } catch {
      // Complete fallback: strip all whitespace and quotes
      return cleaned.replace(/[\s"']/g, '');
    }
  }
}

/**
 * Compare two JSON strings, treating arrays as unordered sets with frequencies.
 * O(N) complexity using Maps.
 */
function compareUnorderedJson(actual: string, expected: string): boolean {
  try {
    const act = JSON.parse(actual)
    const exp = JSON.parse(expected)
    return deepEqualUnordered(act, exp)
  } catch {
    return actual === expected
  }
}

function deepEqualUnordered(a: any, b: any): boolean {
  if (a === b) return true

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false

    // Convert elements to stable strings for frequency counting
    const mapA = new Map<string, number>()
    for (const item of a) {
      // Sort inner nested elements to ensure consistent stringification
      const key = JSON.stringify(sortForHashing(item))
      mapA.set(key, (mapA.get(key) || 0) + 1)
    }

    const mapB = new Map<string, number>()
    for (const item of b) {
      const key = JSON.stringify(sortForHashing(item))
      mapB.set(key, (mapB.get(key) || 0) + 1)
    }

    if (mapA.size !== mapB.size) return false
    for (const [key, val] of mapA.entries()) {
      if (mapB.get(key) !== val) return false
    }
    return true
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (const key of keysA) {
      if (!deepEqualUnordered(a[key], b[key])) return false
    }
    return true
  }

  return false
}

function sortForHashing(item: any): any {
  if (Array.isArray(item)) {
    const sorted = item.map(sortForHashing)
    return sorted.sort((a, b) => {
      const strA = JSON.stringify(a)
      const strB = JSON.stringify(b)
      return strA.localeCompare(strB)
    })
  }
  return item
}
// touch 1
