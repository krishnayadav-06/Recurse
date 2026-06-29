import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const SLUGS = ["add-binary","4sum","assign-cookies","basic-calculator-ii","best-time-to-buy-and-sell-stock","basic-calculator","binary-tree-inorder-traversal","best-time-to-buy-and-sell-stock-with-cooldown","binary-search","burst-balloons","combination-sum-ii","combination-sum","coin-change-ii","construct-binary-tree-from-preorder-and-inorder-traversal","counting-bits","course-schedule-ii","decode-string","decode-ways","distinct-subsequences","evaluate-division","evaluate-reverse-polish-notation","excel-sheet-column-number","find-k-pairs-with-smallest-sums","find-minimum-in-rotated-sorted-array","find-pivot-index","find-unique-binary-string","find-the-duplicate-number","fizz-buzz","generate-parentheses","group-anagrams","gas-station","integer-to-roman","intersection-of-two-arrays-ii","intersection-of-two-linked-lists","jump-game-ii","k-closest-points-to-origin","koko-eating-bananas","last-stone-weight","length-of-last-word","letter-combinations-of-a-phone-number","linked-list-cycle","longest-consecutive-sequence","longest-palindromic-substring","lowest-common-ancestor-of-a-binary-tree","maximum-product-subarray","merge-sorted-array","n-queens","multiply-strings","non-overlapping-intervals","number-of-islands","number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold","number-of-1-bits","pacific-atlantic-water-flow","palindrome-partitioning","path-with-maximum-probability","permutations","powx-n","product-of-array-except-self","reconstruct-itinerary","remove-duplicates-from-sorted-array-ii","reorder-list","reorder-routes-to-make-all-paths-lead-to-the-city-zero","removing-stars-from-a-string","reverse-integer","roman-to-integer","rotate-image","rotate-list","search-in-rotated-sorted-array","search-insert-position","single-number-ii","snakes-and-ladders","sliding-window-median","sort-an-array","spiral-matrix-ii","sqrtx","string-to-integer-atoi","subsets","subarray-product-less-than-k","subsets-ii","sudoku-solver","surrounded-regions","swim-in-rising-water","top-k-frequent-elements","two-sum","triangle","unique-paths","two-sum-ii-input-array-is-sorted","word-break-ii","word-search-ii","word-search","zigzag-conversion"];

function robustParse(str) {
    if (str === null || str === undefined) return null;
    let s = str.trim();
    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
    if (s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1);
    
    let cleanStr = s
        .replace(/\\'/g, "'")
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, 'null')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false');

    try {
        return JSON.parse(cleanStr);
    } catch (e) {
        if (!cleanStr.startsWith('[') && !cleanStr.startsWith('{')) {
            try {
                return JSON.parse(`"${cleanStr}"`);
            } catch (e2) {}
        }
        return null;
    }
}

async function healDatabase() {
    console.log(`Starting formatting heal for ${SLUGS.length} problems...`);
    let patched = 0;
    
    const processCases = (cases) => {
        if (!cases) return { newCases: cases, modified: false };
        let modified = false;
        const newCases = cases.map(tc => {
            const targetKey = tc.expected_output !== undefined ? 'expected_output' : 'expected';
            if (!tc[targetKey]) return tc;
            
            const parsed = robustParse(tc[targetKey]);
            if (parsed !== null) {
                const dense = JSON.stringify(parsed); 
                if (dense !== tc[targetKey]) {
                    modified = true;
                    return { ...tc, [targetKey]: dense };
                }
            }
            return tc;
        });
        return { newCases, modified };
    };

    for (const slug of SLUGS) {
        let problemModified = false;

        // 1. Process sample_cases in `problems` table
        const { data: probData } = await supabase
            .from('problems')
            .select('sample_cases')
            .eq('id', slug)
            .single();

        if (probData && probData.sample_cases) {
            const { newCases, modified } = processCases(probData.sample_cases);
            if (modified) {
                const { error } = await supabase
                    .from('problems')
                    .update({ sample_cases: newCases })
                    .eq('id', slug);
                if (error) console.error(`Failed to update problems for ${slug}:`, error.message);
                else problemModified = true;
            }
        }

        // 2. Process hidden_cases in `problem_test_suites` table
        const { data: suiteData } = await supabase
            .from('problem_test_suites')
            .select('hidden_cases')
            .eq('problem_id', slug)
            .single();

        if (suiteData && suiteData.hidden_cases) {
            const { newCases, modified } = processCases(suiteData.hidden_cases);
            if (modified) {
                const { error } = await supabase
                    .from('problem_test_suites')
                    .update({ hidden_cases: newCases })
                    .eq('problem_id', slug);
                if (error) console.error(`Failed to update problem_test_suites for ${slug}:`, error.message);
                else problemModified = true;
            }
        }

        if (problemModified) {
            console.log(`Patched ${slug}`);
            patched++;
        } else {
            console.log(`Skipped ${slug} (no changes)`);
        }
    }
    
    console.log(`Done! Patched formatting for ${patched} problems.`);
}

healDatabase();
