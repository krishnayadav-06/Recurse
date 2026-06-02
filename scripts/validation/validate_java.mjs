import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://niizdtrtcvwcnebobnss.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runJavaValidation() {
  console.log("Fetching all problems from database...");
  const { data: problems, error } = await supabase.from('problems').select('id, starter_code');
  if (error || !problems) {
    console.error("Failed to fetch problems:", error);
    return;
  }
  
  console.log(`Found ${problems.length} problems. Starting Java-exclusive validation with low concurrency...`);
  
  let successCount = 0;
  let totalExecutions = 0;
  let failures = [];

  // Keep batch size very low (e.g., 2) to prevent WSL2 Docker JVM OOM errors
  const BATCH_SIZE = 2;
  
  for (let i = 0; i < problems.length; i += BATCH_SIZE) {
    const batch = problems.slice(i, i + BATCH_SIZE);
    const tasks = [];
    
    for (const prob of batch) {
      if (!prob.starter_code || !prob.starter_code.java) continue;
      
      const code = prob.starter_code.java;
      totalExecutions++;
      
      tasks.push(
        fetch('http://localhost:3000/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId: prob.id, language: 'java', action: 'run', code })
        })
        .then(res => res.json())
        .then(data => {
          let isParserSuccess = true;
          if (data.error) {
            const errStr = data.error;
            const isStarterCodeErr = errStr.includes('missing return statement') ||
                                     errStr.includes('no return statement') ||
                                     errStr.includes('unreachable statement') ||
                                     errStr.includes('variable') ||
                                     errStr.includes('cannot find symbol') ||
                                     errStr.includes('incompatible types') ||
                                     errStr.includes('No test cases available');
                                     
            if (!isStarterCodeErr) {
               console.error(`\n❌ [${prob.id} | java] SUSPECTED ERROR:`);
               console.error(errStr.split('\n').slice(0, 5).join('\n'));
               isParserSuccess = false;
            }
          }
          if (isParserSuccess) {
            successCount++;
            process.stdout.write('.');
          } else {
            failures.push(`${prob.id}`);
          }
        })
        .catch(e => {
          console.error(`\n❌ [${prob.id} | java] FETCH EXCEPTION: ${e.message}`);
          failures.push(`${prob.id}`);
        })
      );
    }
    
    // Wait for the batch to finish
    await Promise.all(tasks);
  }
  
  console.log(`\n\n✅ Java Validation Complete!`);
  console.log(`Total API Executions: ${totalExecutions}`);
  console.log(`Successful Parser Handlings: ${successCount} (${((successCount/totalExecutions)*100).toFixed(1)}%)`);
  if (failures.length > 0) {
    console.log(`Failures to investigate (${failures.length}):`);
    console.log(failures.join(', '));
  }
}

runJavaValidation();
