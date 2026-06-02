import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://niizdtrtcvwcnebobnss.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PROBLEMS = [
  'two-sum',
  'invert-binary-tree',
  'maximum-depth-of-binary-tree',
  'reverse-linked-list',
  'merge-two-sorted-lists',
  'number-of-islands'
];

const LANGUAGES = ['python', 'cpp', 'java'];

async function runTest() {
  console.log("Starting Pipeline Validation...");
  let allPassed = true;
  
  for (const problemId of PROBLEMS) {
    console.log(`\n--- Fetching problem: ${problemId} ---`);
    const { data: problem, error } = await supabase
      .from('problems')
      .select('id, starter_code')
      .eq('id', problemId)
      .single();
      
    if (error || !problem) {
      console.error(`Error fetching ${problemId}:`, error?.message || 'Not found');
      continue;
    }
    
    // Convert DB JSON into our expected structure if needed, but starter_code should already have language keys
    const starterCode = problem.starter_code;
    
    for (const lang of LANGUAGES) {
      const code = starterCode[lang];
      if (!code) {
        console.warn(`[${problemId}] No starter code for ${lang}, skipping.`);
        continue;
      }
      
      console.log(`[${problemId} | ${lang}] Ping API...`);
      try {
        const res = await fetch('http://localhost:3000/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId,
            language: lang,
            action: 'run',
            code
          })
        });
        
        const data = await res.json();
        if (data.error) {
          console.error(`[${problemId} | ${lang}] ❌ ERROR:`, data.error);
          allPassed = false;
        } else {
          console.log(`[${problemId} | ${lang}] ✅ Success: Passed ${data.passedCases}/${data.totalCases} cases (Time: ${data.executionTimeMs}ms)`);
        }
      } catch (err) {
        console.error(`[${problemId} | ${lang}] ❌ Exception:`, err.message);
        allPassed = false;
      }
    }
  }
  
  console.log(`\nValidation complete! Overall status: ${allPassed ? '✅ ALL PIPELINES OK' : '❌ SOME FAILURES'}`);
}

runTest();
