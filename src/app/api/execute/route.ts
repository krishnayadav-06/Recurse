import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
 *   action: "run" | "submit"
 * }
 *
 * "run"    → executes only against sample_cases (visible to user)
 * "submit" → executes against sample_cases + hidden_cases (full evaluation)
 */
export async function POST(request: NextRequest) {
  try {
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

    if (!['run', 'submit'].includes(action)) {
      return NextResponse.json(
        { error: `Invalid action: ${action}. Must be "run" or "submit".` },
        { status: 400 }
      )
    }

    // --- Fetch problem metadata (public, anon key) ---
    const anonClient = createAnonClient()
    const { data: problem, error: problemError } = await anonClient
      .from('problems')
      .select('input_types, output_type, unordered_output, sample_cases, starter_code')
      .eq('id', problemId)
      .single()

    if (problemError || !problem) {
      return NextResponse.json(
        { error: `Problem not found: ${problemId}` },
        { status: 404 }
      )
    }

    const { input_types, output_type, unordered_output, sample_cases, starter_code } = problem

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

    // If "submit", also fetch hidden_cases using the Service Role Key
    if (action === 'submit') {
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

    // --- Generate the harness code ---
    // Convert tabs to 4 spaces to avoid invisible indentation errors in languages like Python
    const sanitizedCode = code.replace(/\t/g, '    ')
    
    const harnessOptions = {
      userCode: sanitizedCode,
      functionName,
      inputTypes: input_types,
      outputType: output_type,
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

    // --- Send to Piston ---
    const runtime = getPistonRuntime(language)
    const pistonPayload = {
      language: runtime.language,
      version: runtime.version,
      files: [
        {
          name: language === 'java' ? 'Main.java' : language === 'cpp' ? 'main.cpp' : 'main.py',
          content: harnessCode,
        },
      ],
      stdin: JSON.stringify(testCases),
      run_timeout: 3000,
      compile_timeout: 10000,
    }

    const startTime = Date.now()

    const pistonResponse = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pistonPayload),
    })

    const executionTimeMs = Date.now() - startTime

    if (!pistonResponse.ok) {
      const errText = await pistonResponse.text()
      return NextResponse.json(
        { error: `Piston execution failed: ${errText}` },
        { status: 502 }
      )
    }

    const pistonResult = await pistonResponse.json()

    // --- Check for compile errors ---
    if (pistonResult.compile && pistonResult.compile.code !== 0) {
      return NextResponse.json({
        passed: false,
        totalCases: testCases.length,
        passedCases: 0,
        failedCaseIndex: null,
        failedCase: null,
        error: `Compilation Error:\n${pistonResult.compile.stderr || pistonResult.compile.output}`,
        executionTimeMs,
      } satisfies ExecutionResult)
    }

    // --- Check for runtime errors ---
    if (pistonResult.run.code !== 0 && !pistonResult.run.stdout) {
      return NextResponse.json({
        passed: false,
        totalCases: testCases.length,
        passedCases: 0,
        failedCaseIndex: null,
        failedCase: null,
        error: `Runtime Error:\n${pistonResult.run.stderr || pistonResult.run.output}`,
        executionTimeMs,
      } satisfies ExecutionResult)
    }

    // --- Parse line-by-line stdout results ---
    const stdout = (pistonResult.run.stdout || '').trim()
    const stderr = (pistonResult.run.stderr || '').trim()
    const outputLines = stdout ? stdout.split('\n') : []

    let passedCases = 0
    let failedCaseIndex: number | null = null
    let failedCase: ExecutionResult['failedCase'] = null

    for (let i = 0; i < testCases.length; i++) {
      if (i >= outputLines.length) {
        // Program crashed before completing this test case
        failedCaseIndex = i
        failedCase = {
          input: testCases[i].input,
          expected: testCases[i].expected,
          actual: stderr ? `Runtime Error: ${stderr}` : 'No output (possible crash)',
        }
        break
      }

      const outputLine = outputLines[i].trim()

      // Check if the harness caught an error
      try {
        const parsed = JSON.parse(outputLine)
        if (parsed && typeof parsed === 'object' && parsed.error) {
          failedCaseIndex = i
          failedCase = {
            input: testCases[i].input,
            expected: testCases[i].expected,
            actual: `Error: ${parsed.error}`,
          }
          break
        }
      } catch {
        // Not a JSON error object, proceed with comparison
      }

      // Compare actual vs expected
      const expected = testCases[i].expected.trim()
      let actual = outputLine

      // Normalize for comparison
      let expectedNorm = normalizeValue(expected)
      let actualNorm = normalizeValue(actual)

      // Handle unordered output: sort arrays before comparing
      if (unordered_output) {
        expectedNorm = sortJsonArray(expectedNorm)
        actualNorm = sortJsonArray(actualNorm)
      }

      if (actualNorm === expectedNorm) {
        passedCases++
      } else {
        failedCaseIndex = i
        failedCase = {
          input: testCases[i].input,
          expected: testCases[i].expected,
          actual: outputLine,
        }
        break
      }
    }

    const passed = passedCases === testCases.length

    return NextResponse.json({
      passed,
      totalCases: testCases.length,
      passedCases,
      failedCaseIndex,
      failedCase,
      error: stderr && !passed ? stderr : null,
      executionTimeMs,
    } satisfies ExecutionResult)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Normalizes a JSON value string for comparison.
 * Removes whitespace, parses and re-stringifies JSON to ensure
 * consistent formatting.
 */
function normalizeValue(value: string): string {
  try {
    // Handle Python-style None -> null, True/False -> true/false
    const cleaned = value
      .replace(/\bNone\b/g, 'null')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/'/g, '"')

    const parsed = JSON.parse(cleaned)
    return JSON.stringify(parsed)
  } catch {
    // If it's not valid JSON, return the trimmed string
    return value.replace(/\s/g, '')
  }
}

/**
 * If the value is a JSON array, sort it for unordered comparison.
 */
function sortJsonArray(value: string): string {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed.sort())
    }
    return value
  } catch {
    return value
  }
}
