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

async function main() {
  const overrides = {
    'reverse-string': { input_types: ['char[]'] },
    'sudoku-solver': { input_types: ['char[][]'] },
    'surrounded-regions': { input_types: ['char[][]'] }
  };

  console.log(`Found ${Object.keys(overrides).length} manual type overrides to apply.`);

  for (const [slug, { input_types }] of Object.entries(overrides)) {
    console.log(`Updating ${slug} with input_types = ${JSON.stringify(input_types)}...`);
    const { error } = await supabase
      .from('problems')
      .update({ input_types })
      .eq('id', slug);

    if (error) {
      console.error(`Error updating ${slug}:`, error);
    }
  }

  console.log('Type Patch completed successfully!');
}

main().catch(console.error);
