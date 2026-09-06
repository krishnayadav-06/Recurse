/**
 * Curated problem list constants.
 * Each array contains LeetCode slugs (problem IDs) for that list.
 * Used by the Problems page List dropdown to filter client-side.
 */

export const BLIND_75_SECTIONS = [
  {
    topic: "Arrays & Hashing",
    problems: [
      "contains-duplicate",
      "valid-anagram",
      "two-sum",
      "group-anagrams",
      "top-k-frequent-elements",
      "product-of-array-except-self",
      "longest-consecutive-sequence",
    ]
  },
  {
    topic: "Two Pointers",
    problems: [
      "valid-palindrome",
      "3sum",
      "container-with-most-water",
    ]
  },
  {
    topic: "Sliding Window",
    problems: [
      "best-time-to-buy-and-sell-stock",
      "longest-substring-without-repeating-characters",
      "longest-repeating-character-replacement",
      "minimum-window-substring",
    ]
  },
  {
    topic: "Stack",
    problems: [
      "valid-parentheses",
    ]
  },
  {
    topic: "Binary Search",
    problems: [
      "find-minimum-in-rotated-sorted-array",
      "search-in-rotated-sorted-array",
    ]
  },
  {
    topic: "Linked List",
    problems: [
      "reverse-linked-list",
      "merge-two-sorted-lists",
      "reorder-list",
      "remove-nth-node-from-end-of-list",
      "linked-list-cycle",
      "merge-k-sorted-lists",
    ]
  },
  {
    topic: "Trees",
    problems: [
      "invert-binary-tree",
      "maximum-depth-of-binary-tree",
      "same-tree",
      "subtree-of-another-tree",
      "lowest-common-ancestor-of-a-binary-tree",
      "binary-tree-level-order-traversal",
      "validate-binary-search-tree",
      "kth-smallest-element-in-a-bst",
      "construct-binary-tree-from-preorder-and-inorder-traversal",
      "binary-tree-maximum-path-sum",
    ]
  },
  {
    topic: "Tries",
    problems: [
      "word-search-ii",
    ]
  },
  {
    topic: "Backtracking",
    problems: [
      "combination-sum",
      "word-search",
    ]
  },
  {
    topic: "Graphs",
    problems: [
      "number-of-islands",
      "pacific-atlantic-water-flow",
      "course-schedule",
    ]
  },
  {
    topic: "1-D Dynamic Programming",
    problems: [
      "climbing-stairs",
      "house-robber",
      "house-robber-ii",
      "longest-palindromic-substring",
      "palindromic-substrings",
      "decode-ways",
      "coin-change",
      "maximum-product-subarray",
      "word-break",
      "longest-increasing-subsequence",
    ]
  },
  {
    topic: "2-D Dynamic Programming",
    problems: [
      "unique-paths",
      "longest-common-subsequence",
    ]
  },
  {
    topic: "Greedy",
    problems: [
      "maximum-subarray",
      "jump-game",
    ]
  },
  {
    topic: "Intervals",
    problems: [
      "insert-interval",
      "merge-intervals",
      "non-overlapping-intervals",
    ]
  },
  {
    topic: "Math & Geometry",
    problems: [
      "rotate-image",
      "spiral-matrix",
      "set-matrix-zeroes",
    ]
  },
  {
    topic: "Bit Manipulation",
    problems: [
      "number-of-1-bits",
      "counting-bits",
      "reverse-bits",
      "missing-number",
      "sum-of-two-integers",
    ]
  }
];

export const BLIND_75: ReadonlySet<string> = new Set(BLIND_75_SECTIONS.flatMap(s => s.problems));

export const NEETCODE_150_SECTIONS = [
  {
    topic: "Arrays & Hashing",
    problems: [
      "contains-duplicate",
      "valid-anagram",
      "two-sum",
      "group-anagrams",
      "top-k-frequent-elements",
      "product-of-array-except-self",
      "valid-sudoku",
      "longest-consecutive-sequence",
    ]
  },
  {
    topic: "Two Pointers",
    problems: [
      "valid-palindrome",
      "two-sum-ii-input-array-is-sorted",
      "3sum",
      "container-with-most-water",
      "trapping-rain-water",
    ]
  },
  {
    topic: "Sliding Window",
    problems: [
      "best-time-to-buy-and-sell-stock",
      "longest-substring-without-repeating-characters",
      "longest-repeating-character-replacement",
      "permutation-in-string",
      "minimum-window-substring",
      "sliding-window-maximum",
    ]
  },
  {
    topic: "Stack",
    problems: [
      "valid-parentheses",
      "evaluate-reverse-polish-notation",
      "generate-parentheses",
      "daily-temperatures",
      "car-fleet",
      "largest-rectangle-in-histogram",
    ]
  },
  {
    topic: "Binary Search",
    problems: [
      "binary-search",
      "search-a-2d-matrix",
      "koko-eating-bananas",
      "find-minimum-in-rotated-sorted-array",
      "search-in-rotated-sorted-array",
      "median-of-two-sorted-arrays",
    ]
  },
  {
    topic: "Linked List",
    problems: [
      "reverse-linked-list",
      "merge-two-sorted-lists",
      "reorder-list",
      "remove-nth-node-from-end-of-list",
      "add-two-numbers",
      "linked-list-cycle",
      "find-the-duplicate-number",
      "merge-k-sorted-lists",
      "reverse-nodes-in-k-group",
    ]
  },
  {
    topic: "Trees",
    problems: [
      "invert-binary-tree",
      "maximum-depth-of-binary-tree",
      "diameter-of-binary-tree",
      "balanced-binary-tree",
      "same-tree",
      "subtree-of-another-tree",
      "lowest-common-ancestor-of-a-binary-tree",
      "binary-tree-level-order-traversal",
      "binary-tree-right-side-view",
      "count-good-nodes-in-binary-tree",
      "validate-binary-search-tree",
      "kth-smallest-element-in-a-bst",
      "construct-binary-tree-from-preorder-and-inorder-traversal",
      "binary-tree-maximum-path-sum",
    ]
  },
  {
    topic: "Tries",
    problems: [
      "word-search-ii",
    ]
  },
  {
    topic: "Heap / Priority Queue",
    problems: [
      "last-stone-weight",
      "k-closest-points-to-origin",
      "kth-largest-element-in-an-array",
      "task-scheduler",
    ]
  },
  {
    topic: "Backtracking",
    problems: [
      "subsets",
      "combination-sum",
      "permutations",
      "subsets-ii",
      "combination-sum-ii",
      "word-search",
      "palindrome-partitioning",
      "letter-combinations-of-a-phone-number",
      "n-queens",
    ]
  },
  {
    topic: "Graphs",
    problems: [
      "number-of-islands",
      "max-area-of-island",
      "rotting-oranges",
      "pacific-atlantic-water-flow",
      "surrounded-regions",
      "course-schedule",
      "course-schedule-ii",
      "redundant-connection",
      "word-ladder",
    ]
  },
  {
    topic: "Advanced Graphs",
    problems: [
      "reconstruct-itinerary",
      "min-cost-to-connect-all-points",
      "network-delay-time",
      "swim-in-rising-water",
      "cheapest-flights-within-k-stops",
    ]
  },
  {
    topic: "1-D Dynamic Programming",
    problems: [
      "climbing-stairs",
      "min-cost-climbing-stairs",
      "house-robber",
      "house-robber-ii",
      "longest-palindromic-substring",
      "palindromic-substrings",
      "decode-ways",
      "coin-change",
      "maximum-product-subarray",
      "word-break",
      "longest-increasing-subsequence",
      "partition-equal-subset-sum",
    ]
  },
  {
    topic: "2-D Dynamic Programming",
    problems: [
      "unique-paths",
      "longest-common-subsequence",
      "best-time-to-buy-and-sell-stock-with-cooldown",
      "coin-change-ii",
      "target-sum",
      "interleaving-string",
      "longest-increasing-path-in-a-matrix",
      "distinct-subsequences",
      "edit-distance",
      "burst-balloons",
      "regular-expression-matching",
    ]
  },
  {
    topic: "Greedy",
    problems: [
      "maximum-subarray",
      "jump-game",
      "jump-game-ii",
      "gas-station",
      "hand-of-straights",
      "merge-triplets-to-form-target-triplet",
      "partition-labels",
      "valid-parenthesis-string",
    ]
  },
  {
    topic: "Intervals",
    problems: [
      "insert-interval",
      "merge-intervals",
      "non-overlapping-intervals",
      "minimum-interval-to-include-each-query",
    ]
  },
  {
    topic: "Math & Geometry",
    problems: [
      "rotate-image",
      "spiral-matrix",
      "set-matrix-zeroes",
      "happy-number",
      "plus-one",
      "powx-n",
      "multiply-strings",
    ]
  },
  {
    topic: "Bit Manipulation",
    problems: [
      "single-number",
      "number-of-1-bits",
      "counting-bits",
      "reverse-bits",
      "missing-number",
      "sum-of-two-integers",
      "reverse-integer",
    ]
  }
];

export const NEETCODE_150: ReadonlySet<string> = new Set(NEETCODE_150_SECTIONS.flatMap(s => s.problems));

export const GRIND_75: ReadonlySet<string> = new Set([
  "two-sum",
  "valid-parentheses",
  "merge-two-sorted-lists",
  "best-time-to-buy-and-sell-stock",
  "valid-palindrome",
  "invert-binary-tree",
  "valid-anagram",
  "binary-search",
  "linked-list-cycle",
  "maximum-depth-of-binary-tree",
  "contains-duplicate",
  "maximum-subarray",
  "climbing-stairs",
  "longest-palindromic-substring",
  "reverse-linked-list",
  "majority-element",
  "add-binary",
  "diameter-of-binary-tree",
  "middle-of-the-linked-list",
  "balanced-binary-tree",
  "first-bad-version",
  "same-tree",
  "subtree-of-another-tree",
  "lowest-common-ancestor-of-a-binary-tree",
  "insert-interval",
  "3sum",
  "binary-tree-level-order-traversal",
  "evaluate-reverse-polish-notation",
  "product-of-array-except-self",
  "course-schedule",
  "validate-binary-search-tree",
  "number-of-islands",
  "rotting-oranges",
  "search-in-rotated-sorted-array",
  "coin-change",
  "longest-substring-without-repeating-characters",
  "longest-repeating-character-replacement",
  "combination-sum",
  "permutations",
  "merge-intervals",
  "sort-colors",
  "container-with-most-water",
  "kth-smallest-element-in-a-bst",
  "minimum-window-substring",
  "word-break",
  "longest-increasing-subsequence",
  "unique-paths",
  "jump-game",
  "binary-tree-right-side-view",
  "construct-binary-tree-from-preorder-and-inorder-traversal",
  "top-k-frequent-elements",
  "task-scheduler",
  "k-closest-points-to-origin",
  "word-search",
  "merge-k-sorted-lists",
  "largest-rectangle-in-histogram",
  "trapping-rain-water",
  "binary-tree-maximum-path-sum",
  "maximum-product-subarray",
  "find-minimum-in-rotated-sorted-array",
  "decode-ways",
  "partition-equal-subset-sum",
  "house-robber",
  "house-robber-ii",
  "longest-common-subsequence",
  "spiral-matrix",
  "subsets",
  "non-overlapping-intervals",
  "pacific-atlantic-water-flow",
  "kth-largest-element-in-an-array",
  "daily-temperatures",
  "sliding-window-maximum",
  "generate-parentheses",
  "set-matrix-zeroes",
  "rotate-image",
]);

export type CuratedListKey = "all" | "neetcode-150" | "blind-75" | "grind-75";

export const CURATED_LISTS: Record<Exclude<CuratedListKey, "all">, ReadonlySet<string>> = {
  "neetcode-150": NEETCODE_150,
  "blind-75": BLIND_75,
  "grind-75": GRIND_75,
};

export const CURATED_LIST_LABELS: Record<CuratedListKey, string> = {
  "all": "All",
  "neetcode-150": "NeetCode 150",
  "blind-75": "Blind 75",
  "grind-75": "Grind 75",
};

export const LISTS_WITH_SECTIONS: CuratedListKey[] = ["neetcode-150", "blind-75"];
