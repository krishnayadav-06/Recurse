import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase env vars');
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching corrupted test suites...');
    const { data: suites, error } = await supabase.from('problem_test_suites').select('problem_id, hidden_cases');
    if (error) throw error;
    
    // Find all problems that have at least one 'Error:', 'None', 'True', or 'False' in hidden_cases expected output
    const corruptedSuites = suites.filter(s => 
        s.hidden_cases && s.hidden_cases.some(c => typeof c.expected === 'string' && 
            (c.expected.includes('Error:') || c.expected === 'None' || c.expected === 'True' || c.expected === 'False'))
    );
    
    console.log(`Found ${corruptedSuites.length} corrupted problems. Healing...`);
    
    const healedData = {};
    
    for (const suite of corruptedSuites) {
        const problemId = suite.problem_id;
        console.log(`[${problemId}] Processing...`);
        
        // Read local C++ solution
        const solutionDir = path.join(process.cwd(), 'data', 'solutions', problemId);
        if (!fs.existsSync(solutionDir)) {
            console.error(`  -> Missing local solution directory for ${problemId}`);
            continue;
        }
        
        const files = fs.readdirSync(solutionDir);
        const cppFile = files.find(f => f.startsWith('cpp_'));
        if (!cppFile) {
            console.error(`  -> Missing local cpp solution for ${problemId}`);
            continue;
        }
        
        const cppCode = fs.readFileSync(path.join(solutionDir, cppFile), 'utf-8');
        
        // Fetch problem to count sample cases so we know the offset
        const { data: problem, error: pError } = await supabase.from('problems').select('sample_cases').eq('id', problemId).single();
        if (pError || !problem) {
            console.error(`  -> Could not fetch problem row for ${problemId}`);
            continue;
        }
        
        let sampleCasesCount = 0;
        if (problem.sample_cases && Array.isArray(problem.sample_cases)) {
            for (const sc of problem.sample_cases) {
                if (sc.example_text) sampleCasesCount++; // parseSampleCase will successfully parse this many
            }
        }
        
        // Execute via our API endpoint
        const payload = {
            problemId,
            code: cppCode,
            language: 'cpp',
            action: 'generate_expected'
        };
        
        const res = await fetch('http://localhost:3000/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const err = await res.text();
            console.error(`  -> API execution failed: ${err}`);
            continue;
        }
        
        const result = await res.json();
        if (result.error) {
            console.error(`  -> Harness error: ${result.error}`);
            continue;
        }
        
        const outputs = result.outputs;
        if (!outputs || outputs.length < sampleCasesCount + suite.hidden_cases.length) {
            console.error(`  -> Missing outputs (got ${outputs?.length}, expected ${sampleCasesCount + suite.hidden_cases.length})`);
            continue;
        }
        
        // Patch the hidden_cases
        const newHiddenCases = JSON.parse(JSON.stringify(suite.hidden_cases)); // deep copy
        let repairedCount = 0;
        
        for (let i = 0; i < newHiddenCases.length; i++) {
            const c = newHiddenCases[i];
            if (typeof c.expected === 'string' && 
                (c.expected.includes('Error:') || c.expected === 'None' || c.expected === 'True' || c.expected === 'False')) {
                // The actual output index is offset by sample cases
                const correctOutput = outputs[sampleCasesCount + i];
                if (correctOutput !== undefined) {
                    c.expected = correctOutput;
                    repairedCount++;
                }
            }
        }
        
        console.log(`  -> Repaired ${repairedCount} corrupted test cases!`);
        healedData[problemId] = newHiddenCases;
    }
    
    // Write out the payload
    fs.writeFileSync(path.join(process.cwd(), 'scratch', 'healed_test_suites.json'), JSON.stringify(healedData, null, 2));
    console.log(`\nSuccessfully wrote repaired hidden_cases to scratch/healed_test_suites.json!`);
}

main().catch(console.error);
