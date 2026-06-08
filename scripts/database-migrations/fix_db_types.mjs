import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function mapJavaType(javaType) {
  // Maps java types to our canonical types
  if (javaType === 'int') return 'int';
  if (javaType === 'long') return 'long';
  if (javaType === 'double') return 'double';
  if (javaType === 'boolean') return 'boolean';
  if (javaType === 'String') return 'string';
  if (javaType === 'int[]') return 'int[]';
  if (javaType === 'String[]') return 'string[]';
  if (javaType === 'int[][]') return 'int[][]';
  if (javaType === 'char[][]') return 'char[][]';
  if (javaType === 'String[][]') return 'string[][]';
  if (javaType === 'char[]') return 'char[]';
  if (javaType === 'double[]') return 'double[]';
  if (javaType === 'TreeNode') return 'TreeNode';
  if (javaType === 'ListNode') return 'ListNode';
  if (javaType === 'ListNode[]') return 'ListNode[]';
  if (javaType.startsWith('List<List<Integer>>')) return 'int[][]';
  if (javaType.startsWith('List<Integer>')) return 'int[]';
  if (javaType.startsWith('List<String>')) return 'string[]';
  if (javaType.startsWith('List<List<String>>')) return 'string[][]';
  return javaType;
}

async function run() {
  const { data: problems } = await supabase.from('problems').select('id, starter_code, input_types, output_type');

  let updatedCount = 0;
  for (const prob of problems) {
    if (!prob.starter_code || !prob.starter_code.java) continue;

    const javaCode = prob.starter_code.java;
    // extract public ReturnType methodName(Type arg1, Type arg2)
    const match = javaCode.match(/public\s+([\w\[\]<>]+)\s+(\w+)\s*\((.*?)\)/);
    if (!match) {
      console.log(`Could not parse java signature for ${prob.id}`);
      continue;
    }

    const outTypeRaw = match[1];
    const argsStr = match[3];

    let args = [];
    if (argsStr.trim()) {
      args = argsStr.split(',').map(s => s.trim().split(/\s+/)[0]);
    }

    const mappedOutput = mapJavaType(outTypeRaw);
    const mappedInputs = args.map(mapJavaType);

    console.log(`Fixing ${prob.id}: inputs = ${JSON.stringify(mappedInputs)}, output = ${mappedOutput}`);

    const { error } = await supabase.from('problems').update({
      input_types: mappedInputs,
      output_type: mappedOutput
    }).eq('id', prob.id);

    if (error) {
      console.error(`Failed to update ${prob.id}: ${error.message}`);
    } else {
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} problems.`);
}

run();
