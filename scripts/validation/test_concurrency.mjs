import fs from 'fs';

const EXEC_URL = 'http://localhost:3000/api/execute';
const PROBLEM_ID = 'two-sum';

const writerCode = `
class Solution:
    def twoSum(self, nums, target):
        import time
        with open('/tmp/leak.txt', 'w') as f:
            f.write("CONTAMINATED")
        # Hold the file open for a while so readers can catch it
        time.sleep(3)
        return [0, 1]
`;

const readerCode = `
class Solution:
    def twoSum(self, nums, target):
        import time, os
        # Poll for 3 seconds trying to read the leaked file
        start = time.time()
        while time.time() - start < 3:
            if os.path.exists('/tmp/leak.txt'):
                with open('/tmp/leak.txt', 'r') as f:
                    return [999, 999] # File found! Sandbox is not isolated!
            time.sleep(0.1)
        return [0, 1] # Safe, file not found
`;

async function runTest(role, code) {
    try {
        const response = await fetch(EXEC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                problemId: PROBLEM_ID,
                language: 'python',
                action: 'submit',
                code: code
            })
        });
        const data = await response.json();
        
        if (role === 'Reader') {
            // We expect the reader to NOT find the file and return [0, 1] which fails case 0 gracefully or something.
            // If it returns [999, 999], it means it found the file!
            if (data.failedCase && data.failedCase.actual === '[999,999]') {
                console.error('CROSS CONTAMINATION DETECTED');
                return false;
            } else {
                console.log('Reader found no leaked files.');
                return true;
            }
        } else {
            console.log('Writer finished.');
            return true;
        }
    } catch (err) {
        console.error(`Request Failed: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log("Starting Sandbox Concurrency Test...");
    console.log("Launching 5 Writers and 5 Readers concurrently...");
    
    const tasks = [];
    for (let i = 0; i < 5; i++) {
        tasks.push(runTest('Writer', writerCode));
        tasks.push(runTest('Reader', readerCode));
    }
    
    const results = await Promise.all(tasks);
    
    const allSafe = results.every(r => r === true);
    if (allSafe) {
        console.log("SUCCESS: All 10 concurrent sandboxes remained perfectly isolated.");
    } else {
        console.error("FAILURE: Sandbox isolation was breached!");
    }
}

main().catch(console.error);
