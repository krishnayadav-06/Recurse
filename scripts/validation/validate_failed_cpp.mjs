import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOLUTIONS_DIR = path.resolve(__dirname, '../../data/solutions');
const OUTPUT_FILE = path.resolve(__dirname, '../../scratch/validation_results_cpp_healed.json');

const CONCURRENCY_LIMIT = 3; // Number of parallel requests

async function executeCode(problemId, language, action, code) {
  try {
    const res = await fetch('http://localhost:3000/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, language, action, code })
    });
    
    let text = '';
    try {
      text = await res.text();
      return JSON.parse(text);
    } catch (e) {
      return { error: `Failed to parse response. Status: ${res.status}. Body: ${text.slice(0, 200)}` };
    }
  } catch (err) {
    return { error: `Fetch Exception: ${err.message}` };
  }
}

async function validateSolutions() {
  console.log(`Reading solutions from ${SOLUTIONS_DIR}`);
  const resultsJson = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf8'));
  const problemDirs = Object.keys(resultsJson).filter(k => true);
  const tasks = [];
  
  for (const problemId of problemDirs) {
    const problemPath = path.join(SOLUTIONS_DIR, problemId);
    const stat = await fs.stat(problemPath);
    if (!stat.isDirectory()) continue;
    
    const files = await fs.readdir(problemPath);
    const cppFile = files.find(f => f.startsWith('cpp_') && f.endsWith('.cpp'));
    
    if (cppFile) {
      const codePath = path.join(problemPath, cppFile);
      const code = await fs.readFile(codePath, 'utf8');
      tasks.push({ problemId, code });
    }
  }

  console.log(`Found ${tasks.length} C++ solutions. Starting validation...`);
  
  const results = {};
  
  // Simple concurrency control using batches
  for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
    const batch = tasks.slice(i, i + CONCURRENCY_LIMIT);
    console.log(`Executing batch ${i / CONCURRENCY_LIMIT + 1} of ${Math.ceil(tasks.length / CONCURRENCY_LIMIT)}...`);
    
    await Promise.all(batch.map(async (task) => {
      const runOutcome = await executeCode(task.problemId, 'cpp', 'run', task.code);
      const submitOutcome = await executeCode(task.problemId, 'cpp', 'submit', task.code);
      
      results[task.problemId] = {
        run: runOutcome,
        submit: submitOutcome
      };
      
      const isRunOk = runOutcome.passed || (runOutcome.passedCases === runOutcome.totalCases && runOutcome.totalCases > 0);
      const isSubmitOk = submitOutcome.passed || (submitOutcome.passedCases === submitOutcome.totalCases && submitOutcome.totalCases > 0);
      
      let customRunnerNeeded = false;
      let notes = [];
      
      if (!isRunOk || !isSubmitOk) {
        notes.push("Failed tests or execution error.");
        if (runOutcome.error) notes.push(`Run Error: ${String(runOutcome.error).slice(0, 100)}...`);
        if (submitOutcome.error) notes.push(`Submit Error: ${String(submitOutcome.error).slice(0, 100)}...`);
        
        customRunnerNeeded = true; 
      }
      
      results[task.problemId].passed = isRunOk && isSubmitOk;
      results[task.problemId].customRunnerNeeded = customRunnerNeeded;
      results[task.problemId].notes = notes.length > 0 ? notes : "Passed";
    }));
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2));
  }
  
  console.log(`Validation complete. Writing results to ${OUTPUT_FILE}`);
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log('Done!');
}

validateSolutions().catch(console.error);
