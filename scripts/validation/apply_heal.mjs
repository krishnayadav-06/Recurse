import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function isCorrupted(c) {
    if (typeof c.expected === 'string') {
        if (c.expected.includes('Error:')) return true;
        if (c.expected === '[["["]]') return true;
    }
    // Handle binary-search ellipsis corruption
    if (typeof c.input === 'string' && c.input.includes('...')) {
        return true;
    }
    return false;
}

async function run() {
    try {
        console.log("Reading healed test suites...");
        const healedDataRaw = fs.readFileSync('scratch/healed_test_suites.json', 'utf8');
        const healedData = JSON.parse(healedDataRaw);
        
        const problemIds = Object.keys(healedData);
        if (problemIds.length === 0) {
            console.log("No problems found to patch.");
            return;
        }

        console.log(`Applying patch to ${problemIds.length} problems...`);
        let droppedCount = 0;
        let patchedProblemsCount = 0;

        for (const problemId of problemIds) {
            const rawCases = healedData[problemId];
            const cleanCases = rawCases.filter(c => {
                if (isCorrupted(c)) {
                    droppedCount++;
                    return false;
                }
                return true;
            });

            // Patch Supabase row
            const { error } = await supabase
                .from('problem_test_suites')
                .update({ hidden_cases: cleanCases })
                .eq('problem_id', problemId);

            if (error) {
                console.error(`Failed to patch ${problemId}:`, error);
            } else {
                patchedProblemsCount++;
            }
        }
        
        console.log(`\n✅ Database perfectly patched!`);
        console.log(`Updated ${patchedProblemsCount} rows.`);
        console.log(`Safely dropped ${droppedCount} hopelessly corrupted test cases.`);
        
    } catch (e) {
        console.error("Error applying patch:", e);
    }
}

run();
