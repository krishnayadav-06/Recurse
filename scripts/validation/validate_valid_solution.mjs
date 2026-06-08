import 'dotenv/config';
const solutions = {
  "two-sum": {
    "python": `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        m = {}\n        for i, n in enumerate(nums):\n            if target - n in m: return [m[target - n], i]\n            m[n] = i\n        return []`,
    "cpp": `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> m;\n        for (int i = 0; i < nums.size(); ++i) {\n            if (m.count(target - nums[i])) return {m[target - nums[i]], i};\n            m[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
    "java": `import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> m = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (m.containsKey(target - nums[i])) return new int[]{m.get(target - nums[i]), i};\n            m.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
  },
  "invert-binary-tree": {
    "python": `class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root: return None\n        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)\n        return root`,
    "cpp": `class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* l = invertTree(root->left);\n        TreeNode* r = invertTree(root->right);\n        root->left = r;\n        root->right = l;\n        return root;\n    }\n};`,
    "java": `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode l = invertTree(root.left);\n        TreeNode r = invertTree(root.right);\n        root.left = r;\n        root.right = l;\n        return root;\n    }\n}`
  },
  "maximum-depth-of-binary-tree": {
    "python": `class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root: return 0\n        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
    "cpp": `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        if (!root) return 0;\n        return 1 + max(maxDepth(root->left), maxDepth(root->right));\n    }\n};`,
    "java": `class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n    }\n}`
  },
  "reverse-linked-list": {
    "python": `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev`,
    "cpp": `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        while (curr) {\n            ListNode* nxt = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n};`,
    "java": `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nxt = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n}`
  },
  "merge-two-sorted-lists": {
    "python": `class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode()\n        tail = dummy\n        while list1 and list2:\n            if list1.val < list2.val:\n                tail.next = list1\n                list1 = list1.next\n            else:\n                tail.next = list2\n                list2 = list2.next\n            tail = tail.next\n        tail.next = list1 or list2\n        return dummy.next`,
    "cpp": `class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        ListNode dummy;\n        ListNode* tail = &dummy;\n        while (list1 && list2) {\n            if (list1->val < list2->val) {\n                tail->next = list1;\n                list1 = list1->next;\n            } else {\n                tail->next = list2;\n                list2 = list2->next;\n            }\n            tail = tail->next;\n        }\n        tail->next = list1 ? list1 : list2;\n        return dummy.next;\n    }\n};`,
    "java": `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        ListNode dummy = new ListNode(-1);\n        ListNode tail = dummy;\n        while (list1 != null && list2 != null) {\n            if (list1.val < list2.val) {\n                tail.next = list1;\n                list1 = list1.next;\n            } else {\n                tail.next = list2;\n                list2 = list2.next;\n            }\n            tail = tail.next;\n        }\n        tail.next = list1 != null ? list1 : list2;\n        return dummy.next;\n    }\n}`
  },
  "number-of-islands": {
    "python": `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        if not grid: return 0\n        rows, cols = len(grid), len(grid[0])\n        def dfs(r, c):\n            if r<0 or c<0 or r>=rows or c>=cols or grid[r][c] == '0': return\n            grid[r][c] = '0'\n            dfs(r+1, c)\n            dfs(r-1, c)\n            dfs(r, c+1)\n            dfs(r, c-1)\n        count = 0\n        for r in range(rows):\n            for c in range(cols):\n                if grid[r][c] == '1':\n                    count += 1\n                    dfs(r, c)\n        return count`,
    "cpp": `class Solution {\npublic:\n    void dfs(vector<vector<char>>& grid, int r, int c) {\n        if (r<0 || c<0 || r>=grid.size() || c>=grid[0].size() || grid[r][c]=='0') return;\n        grid[r][c] = '0';\n        dfs(grid, r+1, c);\n        dfs(grid, r-1, c);\n        dfs(grid, r, c+1);\n        dfs(grid, r, c-1);\n    }\n    int numIslands(vector<vector<char>>& grid) {\n        if (grid.empty()) return 0;\n        int count = 0;\n        for (int r=0; r<grid.size(); ++r) {\n            for (int c=0; c<grid[0].size(); ++c) {\n                if (grid[r][c]=='1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n};`,
    "java": `class Solution {\n    public void dfs(char[][] grid, int r, int c) {\n        if (r<0 || c<0 || r>=grid.length || c>=grid[0].length || grid[r][c]=='0') return;\n        grid[r][c] = '0';\n        dfs(grid, r+1, c);\n        dfs(grid, r-1, c);\n        dfs(grid, r, c+1);\n        dfs(grid, r, c-1);\n    }\n    public int numIslands(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int count = 0;\n        for (int r=0; r<grid.length; r++) {\n            for (int c=0; c<grid[0].length; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n}`
  }
};

async function validate() {
  const tasks = [];
  console.log("🚀 Spawning concurrent workers for validation...");

  for (const [problemId, codes] of Object.entries(solutions)) {
    for (const [lang, code] of Object.entries(codes)) {
      tasks.push(
        fetch('http://localhost:3000/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId, language: lang, action: 'run', code })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error(`❌ [${problemId} | ${lang}] ERROR: ${data.error}`);
          } else if (!data.passed) {
            console.error(`❌ [${problemId} | ${lang}] FAILED: ${data.passedCases}/${data.totalCases} cases`);
          } else {
            console.log(`✅ [${problemId} | ${lang}] SUCCESS: ${data.passedCases}/${data.totalCases} cases (Time: ${data.executionTimeMs}ms)`);
          }
        })
        .catch(err => {
          console.error(`❌ [${problemId} | ${lang}] EXCEPTION: ${err.message}`);
        })
      );
    }
  }

  await Promise.all(tasks);
  console.log("🎉 All 18 workers finished execution!");
}

validate();
