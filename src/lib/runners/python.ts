import fs from 'fs'
import path from 'path'

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
  problemId?: string
  userCode: string
  functionName: string
  inputTypes: string[]
  outputType: string
  inPlace?: boolean
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
  const { problemId, userCode, functionName, inputTypes, outputType } = options

  if (problemId) {
    const customRunnerPath = path.join(process.cwd(), 'src', 'lib', 'runners', 'custom', 'python', `${problemId}.py`);
    if (fs.existsSync(customRunnerPath)) {
      const customTemplate = fs.readFileSync(customRunnerPath, 'utf-8');
      return customTemplate.replace('${userCode}', userCode);
    }
  }

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
import time
import collections
from collections import deque, defaultdict, Counter
import heapq
from heapq import heappush, heappop, heapify
import math
from math import sqrt, floor, ceil, log, log2, gcd, inf
import bisect
import itertools
import functools

${helpers}

# --- Helpers for parsing named-parameter input strings ---
def safe_eval(val_str):
    # Use json.loads for quoted strings to handle backslashes, newlines, special chars
    stripped = val_str.strip()
    # Strip spurious trailing quote that can appear in char[][] test cases
    if stripped and stripped[-1] == '"' and (not stripped.startswith('"') or stripped.count('"') % 2 != 0):
        stripped = stripped[:-1].rstrip()
    if len(stripped) >= 2 and stripped[0] == '"' and stripped[-1] == '"':
        try:
            return json.loads(stripped)
        except Exception:
            pass
    # Replace JSON booleans/null with Python equivalents before eval
    py_str = stripped.replace("null", "None").replace("true", "True").replace("false", "False")
    try:
        return eval(py_str)
    except Exception:
        # Last resort: try json.loads on the original (handles arrays of strings like [["1","0"]])
        try:
            return json.loads(stripped)
        except Exception:
            pass
    return eval(py_str)

def parse_input_string(input_str):
    """
    Parses 'nums = [3,3], target = 6' into a list of Python values.
    Splits on top-level comma+space separating 'name = value' pairs,
    then safe_eval()s each value.
    """
    # Split on top-level ',' that separates named params
    # Track bracket depth and quoted string state
    parts = []
    depth = 0
    in_string = False
    current = ""
    prev_ch = ""
    for ch in input_str:
        if ch == '"' and prev_ch != chr(92):
            in_string = not in_string
        if not in_string:
            if ch in "([{":
                depth += 1
            elif ch in ")]}":
                depth -= 1
        current += ch
        if ch == "," and depth == 0 and not in_string:
            parts.append(current[:-1].strip())
            current = ""
        prev_ch = ch
    if current.strip():
        parts.append(current.strip())
    
    # Extract the value from each "name = value" pair
    values = []
    for part in parts:
        eq_idx = part.index("=")
        val_str = part[eq_idx + 1:].strip()
        
        ${problemId === 'reverse-bits' ? `
        # Check for 32-bit binary string (reverse-bits edge case)
        stripped_quotes = val_str.strip('"').strip("'")
        if len(stripped_quotes) == 32 and all(c in '01' for c in stripped_quotes):
            val = int(stripped_quotes, 2)
            # Cast to signed 32-bit integer
            val = (val & 0xffffffff) - 0x100000000 if val & 0x80000000 else val
            values.append(val)
            continue
        ` : ''}

        values.append(safe_eval(val_str))
    return values

# --- User's Solution Code ---
from typing import List, Optional

${userCode}

# --- Main Execution Loop ---
if __name__ == "__main__":
    input_data = sys.stdin.read()
    sol = Solution()
    total_execution_time_ms = 0

    search_key = '"input"'
    pos = 0
    while True:
        pos = input_data.find(search_key, pos)
        if pos == -1:
            break
        pos += len(search_key)
        
        colon_pos = input_data.find(':', pos)
        if colon_pos == -1:
            break
            
        quote_start = input_data.find('"', colon_pos)
        if quote_start == -1:
            break
            
        quote_end = quote_start + 1
        while quote_end < len(input_data):
            if input_data[quote_end] == '"' and input_data[quote_end - 1] != '\\\\':
                break
            quote_end += 1
            
        if quote_end >= len(input_data):
            break
            
        try:
            tc_input = input_data[quote_start + 1 : quote_end]
            # Unescape quotes and newlines by parsing it as a JSON string
            tc_input_json_str = '"' + tc_input + '"'
            tc_input = json.loads(tc_input_json_str)
            
            parsed_args = parse_input_string(tc_input)
${argParsers}
            start_time = time.perf_counter()
            ${execLine}
            end_time = time.perf_counter()
            total_execution_time_ms += (end_time - start_time) * 1000
            
            if total_execution_time_ms > 200000:
                print('{"error":"Time Limit Exceeded"}')
                break
                
            output = ${outputSerializer}
            print(json.dumps(output, separators=(',', ':')))
        except Exception as e:
            print(json.dumps({"error": str(e)}, separators=(',', ':')))
            
        pos = quote_end + 1

    print(f'[NATIVE_TIME_MS]={total_execution_time_ms:.3f}')
`
}
