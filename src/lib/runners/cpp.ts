/**
 * C++ Harness Generator
 *
 * Generates a complete C++ program that:
 * 1. Reads all test cases from stdin
 * 2. Parses each case's named-parameter input string into C++ values manually (no external deps)
 * 3. Calls the user's Solution method
 * 4. Prints one JSON result line per test case
 */

interface HarnessOptions {
    userCode: string
    functionName: string
    inputTypes: string[]
    outputType: string
}

function getCppType(type: string): string {
    const typeMap: Record<string, string> = {
        'int': 'int',
        'long': 'long long',
        'double': 'double',
        'boolean': 'bool',
        'string': 'string',
        'int[]': 'vector<int>',
        'string[]': 'vector<string>',
        'int[][]': 'vector<vector<int>>',
        'char[][]': 'vector<vector<char>>',
        'string[][]': 'vector<vector<string>>',
        'char[]': 'vector<char>',
        'double[]': 'vector<double>',
        'TreeNode': 'TreeNode*',
        'ListNode': 'ListNode*',
    }
    return typeMap[type] || 'auto'
}

function getCppExtractor(type: string, expr: string): string {
    switch (type) {
        case 'int': return `parseInt(${expr})`;
        case 'long': return `parseLong(${expr})`;
        case 'double': return `parseDouble(${expr})`;
        case 'boolean': return `parseBool(${expr})`;
        case 'string': return `parseString(${expr})`;
        case 'int[]': return `parseIntArray(${expr})`;
        case 'string[]': return `parseStringArray(${expr})`;
        case 'int[][]': return `parseInt2DArray(${expr})`;
        case 'char[][]': return `parseChar2DArray(${expr})`;
        case 'string[][]': return `parseString2DArray(${expr})`;
        case 'char[]': return `parseCharArray(${expr})`;
        case 'double[]': return `parseDoubleArray(${expr})`;
        case 'TreeNode': return `buildTree(parseIntArrayWithNulls(${expr}))`;
        case 'ListNode': return `buildLinkedList(parseIntArray(${expr}))`;
        default: return `${expr}`;
    }
}

function getCppOutputSerializer(outputType: string, varName: string = 'result'): string {
  switch (outputType) {
    case 'int':
    case 'long':
    case 'double':
      return `to_string(${varName})`;
    case 'boolean':
      return `(${varName} ? "true" : "false")`;
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
      return `to_string(${varName})`;
  }
}

export function generateCppHarness(options: HarnessOptions): string {
    const { userCode, functionName, inputTypes, outputType } = options

    const argExtractions = inputTypes.map((type, i) => {
        return `            ${getCppType(type)} arg${i} = ${getCppExtractor(type, `parsed_args[${i}]`)};`
    }).join('\n')

    const argsList = inputTypes.map((_, i) => `arg${i}`).join(', ')
    const isVoid = outputType === 'void'
    const targetVar = isVoid ? 'arg0' : 'result'
    const targetType = isVoid ? inputTypes[0] : outputType
    const outputSerializer = getCppOutputSerializer(targetType, targetVar)
  
    const execLine = isVoid 
      ? `sol.${functionName}(${argsList});` 
      : `auto result = sol.${functionName}(${argsList});`

    return `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <sstream>
#include <regex>

using namespace std;

// --- Manual Parsers ---
string trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\r\\n");
    if (start == string::npos) return "";
    return s.substr(start, s.find_last_not_of(" \\t\\r\\n") - start + 1);
}

int parseInt(string s) { return stoi(trim(s)); }
long long parseLong(string s) { return stoll(trim(s)); }
double parseDouble(string s) { return stod(trim(s)); }
bool parseBool(string s) { s = trim(s); return s == "true" || s == "True" || s == "1"; }
string parseString(string s) {
    s = trim(s);
    if(s.size() >= 2 && s.front() == '"' && s.back() == '"') return s.substr(1, s.size()-2);
    if(s.size() >= 2 && s.front() == '\\'' && s.back() == '\\'') return s.substr(1, s.size()-2);
    return s;
}

vector<string> splitArray(string s) {
    vector<string> res;
    s = trim(s);
    if(s.size() >= 2 && s.front() == '[' && s.back() == ']') s = s.substr(1, s.size()-2);
    int depth = 0;
    string cur;
    for(char c : s) {
        if(c == '[') depth++;
        else if(c == ']') depth--;
        if(c == ',' && depth == 0) {
            res.push_back(cur);
            cur = "";
        } else {
            cur += c;
        }
    }
    if(!cur.empty()) res.push_back(cur);
    return res;
}

vector<int> parseIntArray(string s) {
    vector<int> res;
    for(auto& x : splitArray(s)) res.push_back(parseInt(x));
    return res;
}

vector<string> parseStringArray(string s) {
    vector<string> res;
    for(auto& x : splitArray(s)) res.push_back(parseString(x));
    return res;
}

vector<vector<int>> parseInt2DArray(string s) {
    vector<vector<int>> res;
    for(auto& x : splitArray(s)) res.push_back(parseIntArray(x));
    return res;
}

vector<char> parseCharArray(string s) {
    vector<char> res;
    for(auto& x : splitArray(s)) res.push_back(parseString(x)[0]);
    return res;
}

    vector<vector<char>> parseChar2DArray(string s) {
        vector<string> parts = splitArray(s);
        if (parts.empty() || (parts.size() == 1 && trim(parts[0]).empty())) return {};
        vector<vector<char>> res;
        for (const string& p : parts) res.push_back(parseCharArray(p));
        return res;
    }

    vector<double> parseDoubleArray(string s) {
        vector<double> res;
        for(auto& x : splitArray(s)) res.push_back(parseDouble(x));
        return res;
    }

    vector<vector<string>> parseString2DArray(string s) {
        vector<vector<string>> res;
        for(auto& x : splitArray(s)) res.push_back(parseStringArray(x));
        return res;
    }

vector<string> parseIntArrayWithNulls(string s) {
    vector<string> res;
    for(auto& x : splitArray(s)) res.push_back(trim(x));
    return res;
}

string serializeIntArray(const vector<int>& arr) {
    string res = "[";
    for(size_t i=0; i<arr.size(); i++) {
        res += to_string(arr[i]);
        if(i < arr.size()-1) res += ",";
    }
    return res + "]";
}
string serializeCharArray(const vector<char>& arr) {
    string res = "[";
    for(size_t i=0; i<arr.size(); i++) {
        string s(1, arr[i]);
        res += "\\"" + s + "\\"";
        if(i < arr.size()-1) res += ",";
    }
    return res + "]";
}
string serializeStringArray(const vector<string>& arr) {
    string res = "[";
    for(size_t i=0; i<arr.size(); i++) {
        res += "\\"" + arr[i] + "\\"";
        if(i < arr.size()-1) res += ",";
    }
    return res + "]";
}
string serializeInt2DArray(const vector<vector<int>>& arr) {
    string res = "[";
    for(size_t i=0; i<arr.size(); i++) {
        res += serializeIntArray(arr[i]);
        if(i < arr.size()-1) res += ",";
    }
    return res + "]";
}
string serializeChar2DArray(const vector<vector<char>>& arr) {
    string res = "[";
    for(size_t i=0; i<arr.size(); i++) {
        res += serializeCharArray(arr[i]);
        if(i < arr.size()-1) res += ",";
    }
    return res + "]";
}
string serializeDoubleArray(const vector<double>& arr) {
    string res = "[";
    for(size_t i=0; i<arr.size(); i++) {
        res += to_string(arr[i]);
        if(i < arr.size()-1) res += ",";
    }
    return res + "]";
}
string serializeString2DArray(const vector<vector<string>>& arr) {
    string res = "[";
    for(size_t i=0; i<arr.size(); i++) {
        res += serializeStringArray(arr[i]);
        if(i < arr.size()-1) res += ",";
    }
    return res + "]";
}

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& arr) {
    if (arr.empty() || arr[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(arr[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < (int)arr.size()) {
        TreeNode* node = q.front(); q.pop();
        if (i < (int)arr.size() && arr[i] != "null") {
            node->left = new TreeNode(stoi(arr[i]));
            q.push(node->left);
        }
        i++;
        if (i < (int)arr.size() && arr[i] != "null") {
            node->right = new TreeNode(stoi(arr[i]));
            q.push(node->right);
        }
        i++;
    }
    return root;
}

string serializeTree(TreeNode* root) {
    if (!root) return "[]";
    vector<string> result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* node = q.front(); q.pop();
        if (node) {
            result.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            result.push_back("null");
        }
    }
    while (!result.empty() && result.back() == "null") result.pop_back();
    string res = "[";
    for(size_t i=0; i<result.size(); i++) {
        res += result[i];
        if(i < result.size()-1) res += ",";
    }
    return res + "]";
}

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* buildLinkedList(const vector<int>& arr) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* current = head;
    for (size_t i = 1; i < arr.size(); i++) {
        current->next = new ListNode(arr[i]);
        current = current->next;
    }
    return head;
}

string serializeLinkedList(ListNode* head) {
    string res = "[";
    while (head) {
        res += to_string(head->val);
        head = head->next;
        if(head) res += ",";
    }
    return res + "]";
}

vector<string> parseInputString(string input) {
    vector<string> result;
    int depth = 0;
    string current;
    for (size_t i = 0; i < input.size(); i++) {
        char ch = input[i];
        if (ch == '[' || ch == '(' || ch == '{') depth++;
        else if (ch == ']' || ch == ')' || ch == '}') depth--;
        current += ch;
        if ((ch == ',' && depth == 0) || i == input.size() - 1) {
            if (ch == ',') current.pop_back();
            size_t eq = current.find('=');
            if (eq != string::npos) {
                result.push_back(trim(current.substr(eq + 1)));
            }
            current.clear();
        }
    }
    return result;
}

// --- User's Solution Code ---
${userCode}

// --- Main Execution Loop ---
int main() {
    string input_data((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
    
    // Extract each testcase's input field
    regex re("\\"input\\"\\\\s*:\\\\s*\\"((?:\\\\\\\\\\"|[^\\"])*)\\"");
    sregex_iterator next(input_data.begin(), input_data.end(), re);
    sregex_iterator end;
    
    while (next != end) {
        string tc_input = next->str(1);
        tc_input = regex_replace(tc_input, regex("\\\\\\\\\\""), "\\"");
        
        try {
            vector<string> parsed_args = parseInputString(tc_input);
${argExtractions}
            
            Solution sol;
            ${execLine}
            cout << ${outputSerializer} << endl;
        } catch (const exception& e) {
            cout << "{\\"error\\":\\"" << e.what() << "\\"}" << endl;
        }
        next++;
    }
    return 0;
}
`
}
