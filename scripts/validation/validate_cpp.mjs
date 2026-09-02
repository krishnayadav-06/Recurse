import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SOLUTIONS_DIR = path.join(process.cwd(), 'data', 'solutions');
const API_BASE = 'http://localhost:3000/api';
const BATCH_SIZE = 10;
const TARGET_LANG = 'cpp';
const PREFIX = 'cpp_';

const ADMIN_USER_ID = process.env.DEV_USER_ID;

if (!ADMIN_USER_ID) {
  console.error('DEV_USER_ID not set in .env.local');
  process.exit(1);
}

async function main() {
  const problemDirs = fs.readdirSync(SOLUTIONS_DIR).filter(f => {
    return fs.statSync(path.join(SOLUTIONS_DIR, f)).isDirectory();
  });

  console.log(`Found ${problemDirs.length} solution directories.`);
  console.log(`Validating ${TARGET_LANG} solutions...\n`);

  let successCount = 0;
  let failCount = 0;
  const failures = [];

  const jobs = [];
  for (const problemId of problemDirs) {
    const solDir = path.join(SOLUTIONS_DIR, problemId);
    const files = fs.readdirSync(solDir);

    const solFile = files.find(f => f.startsWith(PREFIX));
    if (!solFile) continue;
    
    const code = fs.readFileSync(path.join(solDir, solFile), 'utf-8');
    jobs.push({ problemId, language: TARGET_LANG, code });
  }

  console.log(`Total jobs: ${jobs.length}\n`);

  const resultsMap = {};

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const tasks = batch.map(async ({ problemId, language, code }) => {
      try {
        const execRes = await fetch(`${API_BASE}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId, code, language, action: 'submit' }),
        });
        const execData = await execRes.json();

        if (execRes.status === 401) {
          console.error(`\nAuth failed — is DEV_USER_ID set and dev server running?`);
          process.exit(1);
        }

        const passed = execData.passed === true || (execData.passedCases === execData.totalCases && execData.totalCases > 0);
        
        resultsMap[problemId] = { passed, submit: execData };

        if (passed) {
          successCount++;
          process.stdout.write('.');
        } else {
          failCount++;
          failures.push(`${problemId} (${language}): Test failed or error occurred.`);
          process.stdout.write('x');
        }
      } catch (err) {
        failCount++;
        failures.push(`${problemId} (${language}): ${err.message}`);
        process.stdout.write('x');
        resultsMap[problemId] = { passed: false, error: err.message };
      }
    });

    await Promise.all(tasks);
    fs.writeFileSync(path.join(process.cwd(), `scratch/validation_results_${TARGET_LANG}.json`), JSON.stringify(resultsMap, null, 2));
  }

  console.log(`\n\nDone validating ${TARGET_LANG}!`);
  console.log(`Success: ${successCount} | Failed: ${failCount}`);
  if (failures.length > 0) {
    console.log(`\nFailures:`);
    failures.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);
