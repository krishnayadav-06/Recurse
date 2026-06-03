import fs from 'fs';
import path from 'path';

const SLUGS = [
  'string-to-integer-atoi',
  'integer-to-roman',
  'combination-sum-ii',
  'reverse-string',
  'move-zeroes',
  'evaluate-division',
  'rotate-image',
  'sudoku-solver',
  'sort-colors',
  'set-matrix-zeroes',
  'minimum-window-substring',
  'merge-sorted-array',
  'surrounded-regions',
  'rotate-array',
  'flatten-binary-tree-to-linked-list',
  'reorder-list',
  'two-sum',
  'intersection-of-two-linked-lists',
  'lowest-common-ancestor-of-a-binary-tree',
  'diameter-of-binary-tree',
  'subtree-of-another-tree',
  'construct-string-from-binary-tree',
  'middle-of-the-linked-list',
  'count-good-nodes-in-binary-tree',
  'palindrome-linked-list',
  'merge-k-sorted-lists',
  'reverse-linked-list-ii',
  'same-tree',
  'binary-tree-inorder-traversal',
  'validate-binary-search-tree',
  'symmetric-tree',
  'binary-tree-zigzag-level-order-traversal',
  'binary-tree-level-order-traversal',
  'balanced-binary-tree',
  'construct-binary-tree-from-preorder-and-inorder-traversal',
  'path-sum',
  'minimum-depth-of-binary-tree',
  'binary-tree-maximum-path-sum',
  'sum-root-to-leaf-numbers',
  'binary-tree-preorder-traversal',
  'binary-tree-postorder-traversal',
  'sort-list',
  'binary-tree-right-side-view',
  'kth-smallest-element-in-a-bst',
  'matchsticks-to-square'
];

const DATA_DIR = path.join(process.cwd(), 'data');
const OUT_FILE = path.join(DATA_DIR, 'starter_code_overrides.json');

const GRAPHQL_URL = 'https://leetcode.com/graphql';

const QUERY = `
query questionEditorData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    codeSnippets {
      lang
      langSlug
      code
    }
  }
}
`;

async function fetchSnippet(slug: string) {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { titleSlug: slug },
        operationName: 'questionEditorData'
      })
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch ${slug}: ${res.statusText}`);
      return null;
    }

    const data = (await res.json()) as any;
    if (!data.data || !data.data.question || !data.data.question.codeSnippets) {
      console.warn(`No snippets found for ${slug}`);
      return null;
    }

    const snippets = data.data.question.codeSnippets;
    const result: any = {};
    for (const snippet of snippets) {
      if (snippet.langSlug === 'python3') result.python = snippet.code;
      if (snippet.langSlug === 'cpp') result.cpp = snippet.code;
      if (snippet.langSlug === 'java') result.java = snippet.code;
    }
    return result;
  } catch (error) {
    console.error(`Error fetching ${slug}:`, error);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const overrides: Record<string, any> = {};

  console.log(`Fetching snippets for ${SLUGS.length} problems...`);

  for (let i = 0; i < SLUGS.length; i++) {
    const slug = SLUGS[i];
    console.log(`[${i+1}/${SLUGS.length}] Fetching ${slug}...`);
    const snippets = await fetchSnippet(slug);
    if (snippets) {
      overrides[slug] = snippets;
    }
    // Sleep to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(overrides, null, 2));
  console.log(`Successfully wrote overrides to ${OUT_FILE}`);
}

main().catch(console.error);
