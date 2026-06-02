/**
 * Python Harness Generator
 * 
 * Generates a complete Python script that:
 * 1. Reads all test cases from stdin as JSON
 * 2. Parses each case's named-parameter input string into Python values
 * 3. Calls the user's Solution method
 * 4. Prints one JSON result line per test case
 */

interface HarnessOptions {
  userCode: string
  functionName: string
  inputTypes: string[]
  outputType: string
}

/**
 * Maps our type vocabulary to Python type-parsing expressions.
 * The hidden_cases input format is: "nums = [3,3], target = 6"
 * We parse each named parameter and eval() it into native Python values.
 */
function getPythonTypeHelper(type: string): string {
  // Python's eval() handles most literal types natively:
  // [1,2,3] -> list, 6 -> int, "hello" -> str, True -> bool
  // Complex types need special deserialization.
  switch (type) {
    case 'TreeNode':
      return 'build_tree'
    case 'ListNode':
      return 'build_linked_list'
    default:
      return 'eval'
  }
}

function needsTreeNode(inputTypes: string[], outputType: string): boolean {
  return inputTypes.includes('TreeNode') || outputType === 'TreeNode'
}

function needsListNode(inputTypes: string[], outputType: string): boolean {
  return inputTypes.includes('ListNode') || outputType === 'ListNode'
}

export function generatePythonHarness(options: HarnessOptions): string {
  const { userCode, functionName, inputTypes, outputType } = options

  // Build the helpers section
  let helpers = ''

  if (needsTreeNode(inputTypes, outputType)) {
    helpers += `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def serialize_tree(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result
`
  }

  if (needsListNode(inputTypes, outputType)) {
    helpers += `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_linked_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def serialize_linked_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result
`
  }

  // Build the argument parsing lines
  // Input format: "nums = [3,3], target = 6"
  // We need to split by top-level commas (not inside brackets) and eval each value
  const argParsers = inputTypes.map((type, i) => {
    const converter = getPythonTypeHelper(type)
    if (converter === 'eval') {
      return `            arg${i} = parsed_args[${i}]`
    }
    return `            arg${i} = ${converter}(parsed_args[${i}])`
  }).join('\n')

  const argsList = inputTypes.map((_, i) => `arg${i}`).join(', ')

  // Build the output serializer
  const isVoid = outputType === 'void'
  const targetVar = isVoid ? 'arg0' : 'result'
  const targetType = isVoid ? inputTypes[0] : outputType
  
  let outputSerializer = targetVar
  if (targetType === 'TreeNode') {
    outputSerializer = `serialize_tree(${targetVar})`
  } else if (targetType === 'ListNode') {
    outputSerializer = `serialize_linked_list(${targetVar})`
  }

  const execLine = isVoid
    ? `sol.${functionName}(${argsList})`
    : `result = sol.${functionName}(${argsList})`

  return `import sys
import json
import re

${helpers}

# --- Helpers for parsing named-parameter input strings ---
def parse_input_string(input_str):
    """
    Parses 'nums = [3,3], target = 6' into a list of Python values.
    Splits on top-level comma+space separating 'name = value' pairs,
    then evals each value.
    """
    # Split on top-level ', ' that separates named params
    # We track bracket/paren depth to avoid splitting inside arrays
    parts = []
    depth = 0
    current = ""
    for ch in input_str:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        current += ch
        if ch == "," and depth == 0:
            parts.append(current[:-1].strip())
            current = ""
    if current.strip():
        parts.append(current.strip())
    
    # Extract the value from each "name = value" pair
    values = []
    for part in parts:
        eq_idx = part.index("=")
        val_str = part[eq_idx + 1:].strip()
        # Replace 'null' with None, 'true'/'false' with Python booleans
        val_str = val_str.replace("null", "None").replace("true", "True").replace("false", "False")
        values.append(eval(val_str))
    return values

# --- User's Solution Code ---
from typing import List, Optional

${userCode}

# --- Main Execution Loop ---
if __name__ == "__main__":
    test_cases = json.loads(sys.stdin.read())
    sol = Solution()

    for tc in test_cases:
        try:
            parsed_args = parse_input_string(tc["input"])
${argParsers}
            ${execLine}
            output = ${outputSerializer}
            print(json.dumps(output))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
`
}
