import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Setup environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// CONFIGURATION
// ============================================================================
// Paths to downloaded datasets
const DATA_DIR = path.join(process.cwd(), 'data');
const NEENZA_FILE = path.join(DATA_DIR, 'merged_problems.json');
const NEWFACADE_FILE = path.join(DATA_DIR, 'LeetCodeDataset-v0.3.1-train.jsonl.gz');

// Optional: Limit to specific problems (e.g. Neetcode 150/250).
// Leave empty to seed all matched problems.
const ALLOWLIST = new Set<string>([
  // e.g., 'two-sum', 'best-time-to-buy-and-sell-stock'
]);

// Problems where output order doesn't matter
const UNORDERED_PROBLEMS = new Set<string>([
  'two-sum',
  '3sum',
  '4sum',
  'group-anagrams',
  'permutations',
  'permutations-ii',
  'combinations',
  'subsets',
  'subsets-ii',
  'combination-sum',
  'combination-sum-ii',
  'combination-sum-iii',
  'letter-combinations-of-a-phone-number',
  'generate-parentheses'
]);

// Manual type overrides for problems that regex fails on or use custom types
const TYPE_OVERRIDES: Record<string, { input_types: string[], output_type: string }> = {
  // 'add-two-numbers': { input_types: ['ListNode', 'ListNode'], output_type: 'ListNode' },
};

// ============================================================================
// UTILITIES
// ============================================================================

function mapPythonTypeToVocab(pyType: string): string {
  pyType = pyType.trim();
  const map: Record<string, string> = {
    'int': 'int',
    'float': 'double',
    'str': 'string',
    'bool': 'boolean',
    'List[int]': 'int[]',
    'List[float]': 'double[]',
    'List[str]': 'string[]',
    'List[bool]': 'boolean[]',
    'List[List[int]]': 'int[][]',
    'List[List[str]]': 'string[][]',
    'TreeNode': 'TreeNode',
    'Optional[TreeNode]': 'TreeNode',
    'ListNode': 'ListNode',
    'Optional[ListNode]': 'ListNode',
  };
  return map[pyType] || pyType; // fallback to raw string if unknown
}

function parseSignature(python3Code: string) {
  // Matches: def methodName(self, param1: Type1, param2: Type2) -> ReturnType:
  const sigRegex = /def\s+\w+\s*\(\s*self\s*(?:,\s*(.*?))?\s*\)(?:\s*->\s*(.*?))?\s*:/;
  const match = python3Code.match(sigRegex);

  if (!match) return null;

  const paramsStr = match[1] || '';
  const returnStr = (match[2] || '').trim();

  const input_types = paramsStr
    .split(',')
    .filter(p => p.trim().length > 0)
    .map(p => {
      const parts = p.split(':');
      if (parts.length < 2) return 'unknown';
      return mapPythonTypeToVocab(parts[1].trim());
    });

  const output_type = returnStr ? mapPythonTypeToVocab(returnStr) : 'void';

  return { input_types, output_type };
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log('Loading Neenza dataset...');
  if (!fs.existsSync(NEENZA_FILE) || !fs.existsSync(NEWFACADE_FILE)) {
    console.error("Dataset files not found. Make sure you downloaded them to the 'data/' directory.");
    process.exit(1);
  }

  const neenzaData = JSON.parse(fs.readFileSync(NEENZA_FILE, 'utf-8'));
  const neenzaQuestions = neenzaData.questions || [];

  const neenzaMap = new Map();
  for (const q of neenzaQuestions) {
    if (ALLOWLIST.size > 0 && !ALLOWLIST.has(q.problem_slug)) continue;
    neenzaMap.set(q.problem_slug, q);
  }

  console.log(`Loaded ${neenzaMap.size} relevant problems from Neenza.`);

  console.log('Streaming newfacade dataset...');
  const newfacadeMap = new Map();

  const fileStream = fs.createReadStream(NEWFACADE_FILE);
  const gzipStream = fileStream.pipe(zlib.createGunzip());
  const rl = readline.createInterface({
    input: gzipStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    const slug = record.question || (record.task_id ? record.task_id.replace(/_/g, '-') : '');

    if (slug && neenzaMap.has(slug)) {
      newfacadeMap.set(slug, record);
    }
  }

  console.log(`Matched ${newfacadeMap.size} problems with test cases.`);

  const problemsToInsert = [];
  const testSuitesToInsert = [];

  for (const [slug, neenzaRecord] of neenzaMap.entries()) {
    const newfacadeRecord = newfacadeMap.get(slug);
    if (!newfacadeRecord) {
      console.warn(`[WARN] Skipping ${slug} - no test cases found in newfacade`);
      continue;
    }

    // 1. Process Code & Types
    const py3 = neenzaRecord.code_snippets?.python3 || '';
    const java = neenzaRecord.code_snippets?.java || '';
    const cpp = neenzaRecord.code_snippets?.cpp || '';

    let input_types = ['unknown'];
    let output_type = 'unknown';

    if (TYPE_OVERRIDES[slug]) {
      input_types = TYPE_OVERRIDES[slug].input_types;
      output_type = TYPE_OVERRIDES[slug].output_type;
    } else if (py3) {
      const parsed = parseSignature(py3);
      if (parsed) {
        input_types = parsed.input_types;
        output_type = parsed.output_type;
      }
    }

    // 2. Process Test Cases
    let rawIo;
    if (typeof newfacadeRecord.input_output === 'string') {
      rawIo = JSON.parse(newfacadeRecord.input_output || '{"inputs":[], "outputs":[]}');
    } else if (typeof newfacadeRecord.input_output === 'object' && newfacadeRecord.input_output !== null) {
      rawIo = newfacadeRecord.input_output;
    } else {
      rawIo = { inputs: [], outputs: [] };
    }
    let hiddenCases: any[] = [];
    if (rawIo.inputs && Array.isArray(rawIo.inputs)) {
      hiddenCases = rawIo.inputs.map((inp: string, idx: number) => ({
        input: inp,
        expected: rawIo.outputs[idx]
      }));
    } else {
      hiddenCases = Object.values(rawIo).map((tc: any) => ({
        input: tc.input || '',
        expected: tc.output || ''
      }));
    }

    problemsToInsert.push({
      id: slug,
      title: neenzaRecord.title,
      difficulty: neenzaRecord.difficulty,
      description: neenzaRecord.description,
      patterns: neenzaRecord.topics || [],
      starter_code: {
        python: py3,
        java: java,
        cpp: cpp
      },
      sample_cases: neenzaRecord.examples || [],
      input_types,
      output_type,
      unordered_output: UNORDERED_PROBLEMS.has(slug)
    });

    testSuitesToInsert.push({
      problem_id: slug,
      hidden_cases: hiddenCases
    });
  }

  console.log(`Ready to insert ${problemsToInsert.length} problems into Supabase.`);

  // Batch insert into Supabase
  const BATCH_SIZE = 50;
  for (let i = 0; i < problemsToInsert.length; i += BATCH_SIZE) {
    const pBatch = problemsToInsert.slice(i, i + BATCH_SIZE);
    const tsBatch = testSuitesToInsert.slice(i, i + BATCH_SIZE);

    console.log(`Inserting batch ${i} to ${i + pBatch.length}...`);

    const { error: pErr } = await supabase.from('problems').upsert(pBatch);
    if (pErr) {
      console.error('Error inserting problems:', pErr);
      process.exit(1);
    }

    const { error: tsErr } = await supabase.from('problem_test_suites').upsert(tsBatch);
    if (tsErr) {
      console.error('Error inserting test suites:', tsErr);
      process.exit(1);
    }
  }

  console.log('Seed completed successfully!');
}

main().catch(console.error);
