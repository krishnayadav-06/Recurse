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

async function run() {
    try {
        console.log("Reading healed test suites to determine which problems to backup...");
        const healedDataRaw = fs.readFileSync('scratch/healed_test_suites.json', 'utf8');
        const healedData = JSON.parse(healedDataRaw);
        
        const problemIds = Object.keys(healedData);
        console.log(`Found ${problemIds.length} problems to backup.`);
        
        if (problemIds.length === 0) {
            console.log("No problems found in healed_test_suites.json.");
            return;
        }

        console.log("Fetching original test suites from Supabase...");
        
        // We will fetch them in chunks if there are too many, but 65 should be fine in one query.
        const { data: suites, error } = await supabase
            .from('problem_test_suites')
            .select('problem_id, hidden_cases')
            .in('problem_id', problemIds);
            
        if (error) throw error;
        
        console.log(`Successfully fetched ${suites.length} rows from Supabase.`);
        
        const backupData = {};
        for (const suite of suites) {
            backupData[suite.problem_id] = suite.hidden_cases;
        }
        
        const backupPath = 'scratch/db_hidden_cases_backup.json';
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        
        console.log(`\n✅ Backup successfully written to ${backupPath}`);
        console.log(`You can now safely verify the backup before applying the patch.`);
        
    } catch (e) {
        console.error("Error creating backup:", e);
    }
}

run();
