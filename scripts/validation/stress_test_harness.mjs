
const EXEC_URL = 'http://localhost:3000/api/execute';
const PROBLEM_ID = 'two-sum'; // A simple problem with integer array inputs

async function runTest(name, payload) {
    console.log(`\n================================`);
    console.log(`Running Test: ${name}`);
    console.log(`================================`);
    
    const startTime = Date.now();
    try {
        const response = await fetch(EXEC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        const elapsed = Date.now() - startTime;
        
        console.log(`HTTP Status: ${response.status}`);
        console.log(`Elapsed Time: ${elapsed}ms`);
        
        if (data.error && !data.failedCase) {
            console.log(`Result: CAUGHT GLOBAL ERROR - ${data.error.substring(0, 200)}...`);
        } else {
            console.log(`Result: PASSED: ${data.passed}, Failed Case: ${data.failedCaseIndex}`);
            if (data.failedCase) {
                console.log(`Actual Output: ${data.failedCase.actual.substring(0, 200)}`);
            }
        }
    } catch (err) {
        console.log(`Request Failed: ${err.message}`);
    }
}

async function main() {
    // 1. Output Hijacking (C++)
    // Attempting to print the native time marker to trick the parser
    await runTest("C++ Output Hijacking", {
        problemId: PROBLEM_ID,
        language: 'cpp',
        action: 'submit',
        code: `
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        cout << "[NATIVE_TIME_MS]=1.0" << endl;
        cout << "[1, 2]" << endl;
        return {0, 1};
    }
};`
    });

    // 2. Stdout Flooding (Python)
    // Infinite printing to exhaust buffer or crash json parsing
    await runTest("Python Stdout Flooding", {
        problemId: PROBLEM_ID,
        language: 'python',
        action: 'submit',
        code: `
class Solution:
    def twoSum(self, nums, target):
        for i in range(100000):
            print("A" * 1000)
        return [0, 1]
`
    });

    // 3. Memory Exhaustion (Java)
    // OOM testing
    await runTest("Java Memory Exhaustion", {
        problemId: PROBLEM_ID,
        language: 'java',
        action: 'submit',
        code: `
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int[] huge = new int[100000000]; // Should OOM
        return new int[]{0, 1};
    }
}`
    });

    // 4. System Command Execution (Python)
    await runTest("Python System Execution", {
        problemId: PROBLEM_ID,
        language: 'python',
        action: 'submit',
        code: `
class Solution:
    def twoSum(self, nums, target):
        import os
        os.system('cat /etc/passwd')
        return [0, 1]
`
    });

    // 5. Harness Timeout Circumvention (C++)
    await runTest("C++ Native Sleep Timeout", {
        problemId: PROBLEM_ID,
        language: 'cpp',
        action: 'submit',
        code: `
#include <unistd.h>
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        sleep(15); // Wait longer than piston timeout (10s)
        return {0, 1};
    }
};`
    });
}

main().catch(console.error);
