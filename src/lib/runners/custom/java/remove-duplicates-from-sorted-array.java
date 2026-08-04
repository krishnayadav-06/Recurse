import java.util.*;
import java.io.*;
import java.util.regex.*;

${userCode}

public class Main {
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
        
        String searchKey = "\"input\"";
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
                if (inputData.charAt(quoteEnd) == '"' && inputData.charAt(quoteEnd - 1) != '\\') {
                    break;
                }
                quoteEnd++;
            }
            
            if (quoteEnd >= inputData.length()) break;
            
            String tcInput = inputData.substring(quoteStart + 1, quoteEnd);
            tcInput = tcInput.replace("\\\"", "\"");
            
            String expSearchKey = "\"expected\"";
            int expPos = inputData.indexOf(expSearchKey, quoteEnd);
            String expStr = "";
            if (expPos != -1) {
                expPos += expSearchKey.length();
                int expColonPos = inputData.indexOf(':', expPos);
                int expQuoteStart = inputData.indexOf('"', expColonPos);
                int expQuoteEnd = expQuoteStart + 1;
                while (expQuoteEnd < inputData.length()) {
                    if (inputData.charAt(expQuoteEnd) == '"' && inputData.charAt(expQuoteEnd - 1) != '\\') break;
                    expQuoteEnd++;
                }
                expStr = inputData.substring(expQuoteStart + 1, expQuoteEnd);
                expStr = expStr.replace("\\\"", "\"").replace("\\n", "\n");
            }
            
            try {
                String[] parsedArgs = parseInputString(tcInput);
                int[] arg0 = parseIntArray(parsedArgs[0]);
                
                int origSize = arg0.length;
                
                List<Integer> expectedArr = new ArrayList<>();
                if (origSize > 0) {
                    expectedArr.add(arg0[0]);
                    for (int i = 1; i < origSize; i++) {
                        if (arg0[i] != arg0[i-1]) expectedArr.add(arg0[i]);
                    }
                }
                int expectedK = expectedArr.size();
                
                Solution sol = new Solution();
                long startTime = System.nanoTime();
                int k = sol.removeDuplicates(arg0);
                long endTime = System.nanoTime();
                totalTimeMs += (endTime - startTime) / 1000000;
                
                if (totalTimeMs > 200000) {
                    System.out.println("{\"error\":\"Time Limit Exceeded\"}");
                    break;
                }
                
                boolean valid = true;
                if (k != expectedK) valid = false;
                for (int i = 0; i < k && valid; i++) {
                    if (i >= expectedArr.size() || arg0[i] != expectedArr.get(i)) valid = false;
                }
                
                if (valid) {
                    System.out.println(expStr);
                } else {
                    StringBuilder out = new StringBuilder();
                    out.append(k).append(", nums = [");
                    for(int i=0; i<origSize; i++) {
                        if (i < k) out.append(arg0[i]);
                        else out.append("_");
                        if (i < origSize - 1) out.append(",");
                    }
                    out.append("]");
                    System.out.println(out.toString());
                }
            } catch (Exception e) {
                System.out.println("{\"error\":\"" + e.getMessage() + "\"}");
            }
            
            pos = quoteEnd + 1;
        }

        System.out.println("[NATIVE_TIME_MS]=" + totalTimeMs + ".000");
    }
}
