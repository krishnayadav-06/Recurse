/**
 * Java Harness Generator
 *
 * Generates a complete Java program that:
 * 1. Reads all test cases from stdin
 * 2. Parses each case's named-parameter input string into Java values manually
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

function getJavaType(type: string): string {
    const typeMap: Record<string, string> = {
        'int': 'int',
        'long': 'long',
        'double': 'double',
        'boolean': 'boolean',
        'string': 'String',
        'int[]': 'int[]',
        'string[]': 'String[]',
        'int[][]': 'int[][]',
        'char[][]': 'char[][]',
        'string[][]': 'String[][]',
        'char[]': 'char[]',
        'double[]': 'double[]',
        'TreeNode': 'TreeNode',
        'ListNode': 'ListNode',
    }
    return typeMap[type] || 'Object'
}

function getJavaParseExpr(type: string, index: number): string {
    switch (type) {
        case 'int': return `parseInt(parsedArgs[${index}])`;
        case 'long': return `parseLong(parsedArgs[${index}])`;
        case 'double': return `parseDouble(parsedArgs[${index}])`;
        case 'boolean': return `parseBoolean(parsedArgs[${index}])`;
        case 'string': return `parseString(parsedArgs[${index}])`;
        case 'int[]': return `parseIntArray(parsedArgs[${index}])`;
        case 'string[]': return `parseStringArray(parsedArgs[${index}])`;
        case 'int[][]': return `parseInt2DArray(parsedArgs[${index}])`;
        case 'char[][]': return `parseChar2DArray(parsedArgs[${index}])`;
        case 'string[][]': return `parseString2DArray(parsedArgs[${index}])`;
        case 'char[]': return `parseCharArray(parsedArgs[${index}])`;
        case 'double[]': return `parseDoubleArray(parsedArgs[${index}])`;
        case 'TreeNode': return `buildTree(parseStringArrayWithNulls(parsedArgs[${index}]))`;
        case 'ListNode': return `buildLinkedList(parseIntArray(parsedArgs[${index}]))`;
        default: return `parsedArgs[${index}]`;
    }
}

function getJavaOutputSerializer(outputType: string, varName: string = 'result'): string {
    switch (outputType) {
        case 'int':
        case 'long':
        case 'double':
        case 'boolean':
            return `String.valueOf(${varName})`;
        case 'string':
            return `"\\"" + ${varName} + "\\""`;
        case 'int[]':
            return `serializeIntArray(${varName})`;
        case 'double[]':
            return `serializeDoubleArray(${varName})`;
        case 'string[]':
            return `serializeStringArray(${varName})`;
        case 'int[][]':
            return `serializeInt2DArray(${varName})`;
        case 'string[][]':
            return `serializeString2DArray(${varName})`;
        case 'char[]':
            return `serializeCharArray(${varName})`;
        case 'char[][]':
            return `serializeChar2DArray(${varName})`;
        case 'TreeNode':
            return `serializeTree(${varName})`;
        case 'ListNode':
            return `serializeLinkedList(${varName})`;
        default:
            return `String.valueOf(${varName})`;
    }
}

export function generateJavaHarness(options: HarnessOptions): string {
    const { userCode, functionName, inputTypes, outputType } = options

    // Extract import statements from the user's code so they can be placed at the top
    const importsRegex = /^\s*import\s+[\w\.\*]+;\s*$/gm;
    const userImports = (userCode.match(importsRegex) || []).join('\n');
    const userCodeWithoutImports = userCode
        .replace(importsRegex, '')
        .replace(/public\s+class\s+Solution/g, 'class Solution');

    const argDeclarations = inputTypes.map((type, i) => {
        return `                ${getJavaType(type)} arg${i} = ${getJavaParseExpr(type, i)};`
    }).join('\n')

    const argsList = inputTypes.map((_, i) => `arg${i}`).join(', ')
    const isVoid = outputType === 'void'
    const targetVar = isVoid ? 'arg0' : 'result'
    const targetType = isVoid ? inputTypes[0] : outputType
    const outputSerializeExpr = getJavaOutputSerializer(targetType, targetVar)

    const execLine = isVoid
        ? `sol.${functionName}(${argsList});`
        : `${getJavaType(outputType)} result = sol.${functionName}(${argsList});`

    return `import java.util.*;
import java.io.*;
import java.util.regex.*;
${userImports}

public class Main {

    // --- Manual Parsers ---
    static int parseInt(String s) {
        s = s.trim();
        if (s.length() == 32) {
            boolean isBinary = true;
            for (char c : s.toCharArray()) {
                if (c != '0' && c != '1') { isBinary = false; break; }
            }
            if (isBinary) return (int) Long.parseLong(s, 2);
        }
        return Integer.parseInt(s);
    }
    static long parseLong(String s) {
        s = s.trim();
        if (s.length() == 32) {
            boolean isBinary = true;
            for (char c : s.toCharArray()) {
                if (c != '0' && c != '1') { isBinary = false; break; }
            }
            if (isBinary) return Long.parseLong(s, 2);
        }
        return Long.parseLong(s);
    }
    static double parseDouble(String s) { return Double.parseDouble(s.trim()); }
    static boolean parseBoolean(String s) { s = s.trim(); return s.equals("true") || s.equals("True") || s.equals("1"); }
    static String parseString(String s) {
        s = s.trim();
        if(s.length() >= 2 && s.startsWith("\\"") && s.endsWith("\\"")) return s.substring(1, s.length()-1);
        if(s.length() >= 2 && s.startsWith("'") && s.endsWith("'")) return s.substring(1, s.length()-1);
        return s;
    }

    static String[] splitArray(String s) {
        s = s.trim();
        if(s.length() >= 2 && s.startsWith("[") && s.endsWith("]")) s = s.substring(1, s.length()-1);
        List<String> res = new ArrayList<>();
        int depth = 0;
        StringBuilder cur = new StringBuilder();
        for(char c : s.toCharArray()) {
            if(c == '[') depth++;
            else if(c == ']') depth--;
            if(c == ',' && depth == 0) {
                res.add(cur.toString());
                cur = new StringBuilder();
            } else {
                cur.append(c);
            }
        }
        if(cur.length() > 0) res.add(cur.toString());
        return res.toArray(new String[0]);
    }

    static int[] parseIntArray(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new int[0];
        int[] res = new int[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = parseInt(parts[i]);
        return res;
    }

    static String[] parseStringArray(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new String[0];
        String[] res = new String[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = parseString(parts[i]);
        return res;
    }

    static int[][] parseInt2DArray(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new int[0][0];
        int[][] res = new int[parts.length][];
        for(int i=0; i<parts.length; i++) res[i] = parseIntArray(parts[i]);
        return res;
    }

    static char[][] parseChar2DArray(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new char[0][0];
        char[][] res = new char[parts.length][];
        for(int i=0; i<parts.length; i++) res[i] = parseCharArray(parts[i]);
        return res;
    }

    static double[] parseDoubleArray(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new double[0];
        double[] res = new double[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = parseDouble(parts[i]);
        return res;
    }

    static String[][] parseString2DArray(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new String[0][0];
        String[][] res = new String[parts.length][];
        for(int i=0; i<parts.length; i++) res[i] = parseStringArray(parts[i]);
        return res;
    }

    static char[] parseCharArray(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new char[0];
        char[] res = new char[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = parseString(parts[i]).charAt(0);
        return res;
    }

    static String[] parseStringArrayWithNulls(String s) {
        String[] parts = splitArray(s);
        if(parts.length == 0 || (parts.length == 1 && parts[0].trim().isEmpty())) return new String[0];
        String[] res = new String[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = parts[i].trim();
        return res;
    }

    static String serializeIntArray(int[] arr) {
        if(arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<arr.length; i++) {
            sb.append(arr[i]);
            if(i < arr.length-1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    static String serializeStringArray(String[] arr) {
        if(arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<arr.length; i++) {
            sb.append("\\"").append(arr[i]).append("\\"");
            if(i < arr.length-1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    static String serializeInt2DArray(int[][] arr) {
        if(arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<arr.length; i++) {
            sb.append(serializeIntArray(arr[i]));
            if(i < arr.length-1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    static String serializeDoubleArray(double[] arr) {
        if(arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<arr.length; i++) {
            sb.append(arr[i]);
            if(i < arr.length-1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    static String serializeString2DArray(String[][] arr) {
        if(arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<arr.length; i++) {
            sb.append(serializeStringArray(arr[i]));
            if(i < arr.length-1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    static String serializeCharArray(char[] arr) {
        if(arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<arr.length; i++) {
            sb.append("\\"").append(arr[i]).append("\\"");
            if(i < arr.length-1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    static String serializeChar2DArray(char[][] arr) {
        if(arr == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<arr.length; i++) {
            sb.append(serializeCharArray(arr[i]));
            if(i < arr.length-1) sb.append(",");
        }
        return sb.append("]").toString();
    }

    static TreeNode buildTree(String[] arr) {
        if (arr.length == 0 || arr[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(arr[0]));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < arr.length) {
            TreeNode node = q.poll();
            if (i < arr.length && !arr[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(arr[i]));
                q.add(node.left);
            }
            i++;
            if (i < arr.length && !arr[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(arr[i]));
                q.add(node.right);
            }
            i++;
        }
        return root;
    }

    static String serializeTree(TreeNode root) {
        if (root == null) return "[]";
        List<String> result = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode node = q.poll();
            if (node != null) {
                result.add(String.valueOf(node.val));
                q.add(node.left);
                q.add(node.right);
            } else {
                result.add("null");
            }
        }
        while (!result.isEmpty() && result.get(result.size()-1).equals("null")) {
            result.remove(result.size()-1);
        }
        return "[" + String.join(",", result) + "]";
    }

    static ListNode buildLinkedList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode current = head;
        for (int i = 1; i < arr.length; i++) {
            current.next = new ListNode(arr[i]);
            current = current.next;
        }
        return head;
    }

    static String serializeLinkedList(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        while (head != null) {
            sb.append(head.val);
            head = head.next;
            if(head != null) sb.append(",");
        }
        return sb.append("]").toString();
    }

    static String[] parseInputString(String input) {
        List<String> result = new ArrayList<>();
        int depth = 0;
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            if (ch == '[' || ch == '(' || ch == '{') depth++;
            else if (ch == ']' || ch == ')' || ch == '}') depth--;
            current.append(ch);
            if ((ch == ',' && depth == 0) || i == input.length() - 1) {
                if (ch == ',') current.deleteCharAt(current.length() - 1);
                String part = current.toString().trim();
                int eq = part.indexOf('=');
                if (eq >= 0) {
                    result.add(part.substring(eq + 1).trim());
                }
                current = new StringBuilder();
            }
        }
        return result.toArray(new String[0]);
    }

    public static void main(String[] args) throws Exception {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String inputData = sb.toString();
        
        long totalTimeMs = 0;
        
        String searchKey = "\\"input\\"";
        int pos = 0;
        while (true) {
            pos = inputData.indexOf(searchKey, pos);
            if (pos == -1) break;
            pos += searchKey.length();
            
            int colonPos = inputData.indexOf(':', pos);
            if (colonPos == -1) break;
            
            int quoteStart = inputData.indexOf('"', colonPos);
            if (quoteStart == -1) break;
            
            int quoteEnd = quoteStart + 1;
            while (quoteEnd < inputData.length()) {
                if (inputData.charAt(quoteEnd) == '"' && inputData.charAt(quoteEnd - 1) != '\\\\') {
                    break;
                }
                quoteEnd++;
            }
            
            if (quoteEnd >= inputData.length()) break;
            
            try {
                String tcInput = inputData.substring(quoteStart + 1, quoteEnd);
                tcInput = tcInput.replace("\\\\\\\"", "\\"");
                
                String[] parsedArgs = parseInputString(tcInput);
${argDeclarations}
                
                Solution sol = new Solution();
                long startTime = System.nanoTime();
                ${execLine}
                long endTime = System.nanoTime();
                totalTimeMs += (endTime - startTime) / 1000000;
                
                if (totalTimeMs > 200000) {
                    System.out.println("{\\"error\\":\\"Time Limit Exceeded\\"}");
                    break;
                }
                
                System.out.println(${outputSerializeExpr});
            } catch (Exception e) {
                System.out.println("{\\"error\\":\\"" + e.getMessage() + "\\"}");
            }
            
            pos = quoteEnd + 1;
        }

        System.out.println("[NATIVE_TIME_MS]=" + totalTimeMs + ".000");
    }
}

// --- Data Structures ---
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

// --- User's Solution Code ---
${userCodeWithoutImports}
`;
}
