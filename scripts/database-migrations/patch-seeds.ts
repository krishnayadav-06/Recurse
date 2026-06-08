import fs from 'fs';
import path from 'path';
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

const DATA_DIR = path.join(process.cwd(), 'data');
const OVERRIDES_FILE = path.join(DATA_DIR, 'starter_code_overrides.json');

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
  return map[pyType] || pyType;
}

function parseSignature(python3Code: string) {
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

async function main() {
  if (!fs.existsSync(OVERRIDES_FILE)) {
    console.error("Overrides file not found. Run fetch script first.");
    process.exit(1);
  }

  const overrides = JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf-8'));
  const slugs = Object.keys(overrides);
  console.log(`Found ${slugs.length} overrides to apply.`);

  for (const slug of slugs) {
    const snippets = overrides[slug];
    const py3 = snippets.python || '';
    const cpp = snippets.cpp || '';
    const java = snippets.java || '';

    const parsed = parseSignature(py3);
    if (!parsed) {
      console.warn(`[WARN] Could not parse signature for ${slug}, skipping...`);
      continue;
    }

    const { input_types, output_type } = parsed;

    const starter_code = {
      python: py3,
      cpp: cpp,
      java: java
    };

    console.log(`Updating ${slug}...`);
    const { error } = await supabase
      .from('problems')
      .update({ starter_code, input_types, output_type })
      .eq('id', slug);

    if (error) {
      console.error(`Error updating ${slug}:`, error);
    }
  }

  console.log('Patch completed successfully!');
}

main().catch(console.error);
