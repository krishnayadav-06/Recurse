export function getPatternStyles(pattern: string): string {
  const p = pattern.toLowerCase();
  if (p.includes("tree") || p.includes("bst") || p.includes("trie")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (p.includes("graph") || p.includes("bfs") || p.includes("dfs") || p.includes("matrix")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-100";
  }
  if (p.includes("dynamic programming") || p.includes("dp") || p.includes("greedy") || p.includes("backtracking")) {
    return "bg-purple-50 text-purple-700 border-purple-100";
  }
  if (p.includes("pointer") || p.includes("binary search") || p.includes("sliding window") || p.includes("search")) {
    return "bg-sky-50 text-sky-700 border-sky-100";
  }
  if (p.includes("math") || p.includes("bit") || p.includes("counting") || p.includes("combinatorics") || p.includes("bitmask")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (
    p.includes("array") ||
    p.includes("hash") ||
    p.includes("string") ||
    p.includes("stack") ||
    p.includes("queue") ||
    p.includes("design") ||
    p.includes("heap") ||
    p.includes("list") ||
    p.includes("interval")
  ) {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  return "bg-gray-50 text-gray-600 border-gray-200";
}
