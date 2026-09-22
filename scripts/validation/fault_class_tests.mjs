const EXEC_URL = 'http://localhost:3000/api/execute';
const PROBLEM_ID = 'two-sum';

async function runTest(name, payload) {
    console.log(`\n================================`);
    console.log(`Testing: ${name}`);
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
        
        if (data.error && !data.failedCase) {
            console.log(`Result: CAUGHT GLOBAL ERROR (Time: ${elapsed}ms)`);
            console.log(data.error);
        } else {
            console.log(`Result: PASSED: ${data.passed}, Failed Case: ${data.failedCaseIndex} (Time: ${elapsed}ms)`);
            if (data.failedCase) {
                console.log(`Actual Output: ${data.failedCase.actual.substring(0, 500)}`);
            }
        }
    } catch (err) {
        console.log(`Request Failed: ${err.message}`);
    }
}

async function main() {
    // 1. TLE
    await runTest("1. TLE (Infinite Loop Python)", {
        problemId: PROBLEM_ID,
        language: 'python',
        action: 'submit',
        code: `
class Solution:
    def twoSum(self, nums, target):
        while True:
            pass
`
    });

    // 2. MLE
    await runTest("2. MLE (Massive Array C++)", {
        problemId: PROBLEM_ID,
        language: 'cpp',
        action: 'submit',
        code: `
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> v(2000000000, 1);
        return {0, 1};
    }
};`
    });

    // 3. Float precision Check (powx-n)
    await runTest("3a. Output Comparison (powx-n precision off by 1e-6)", {
        problemId: 'powx-n',
        language: 'cpp',
        action: 'submit',
        code: `
class Solution {
public:
    double myPow(double x, int n) {
        // Purposely return expected + 1e-5 to see if tolerance accepts it
        // The custom validator uses EPS 1e-4 so it should pass if difference is small
        return 1024.00001; // Fake answer for testing sample case 1 (x=2, n=10, expected=1024)
    }
};`
    });

    // 3b. Multiple valid outputs (two-sum-ii)
    await runTest("3b. Output Comparison (two-sum-ii unordered)", {
        problemId: 'two-sum-ii-input-array-is-sorted',
        language: 'python',
        action: 'submit',
        code: `
class Solution:
    def twoSum(self, numbers, target):
        # The expected is [1, 2], return [2, 1] to test unordered comparison
        return [2, 1]
`
    });

    // 4. Sandbox concurrency / File Leak
    // We can just write to /tmp/leak.txt and read it. We simulate it by just reading in one request.
    await runTest("4. File Isolation (Reading /tmp/leak.txt)", {
        problemId: PROBLEM_ID,
        language: 'python',
        action: 'submit',
        code: `
class Solution:
    def twoSum(self, nums, target):
        import os
        try:
            with open('/tmp/leak.txt', 'r') as f:
                print(f.read())
        except Exception as e:
            print("File not found! Sandbox is clean.")
            
        with open('/tmp/leak.txt', 'w') as f:
            f.write("I am leaked!")
        return [0, 1]
`
    });

    // 5. UB differences (ARM vs x86)
    await runTest("5. UB differences (C++ Signed Integer Overflow)", {
        problemId: PROBLEM_ID,
        language: 'cpp',
        action: 'submit',
        code: `
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int arr[10];
        // Read uninitialized memory
        return {arr[5], arr[6]};
    }
};`
    });

    // 6. Segfault
    await runTest("6. Segfault (C++ Null pointer dereference)", {
        problemId: PROBLEM_ID,
        language: 'cpp',
        action: 'submit',
        code: `
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int* p = nullptr;
        *p = 5;
        return {0, 1};
    }
};`
    });
}

main().catch(console.error);
