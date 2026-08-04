import java.util.*;
import java.io.*;
import java.util.regex.*;

class VersionControl {
    static int GLOBAL_BAD_VERSION = 0;
    boolean isBadVersion(int version) {
        return version >= GLOBAL_BAD_VERSION;
    }
}

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
            
            try {
                String tcInput = inputData.substring(quoteStart + 1, quoteEnd);
                tcInput = tcInput.replace("\\\"", "\"");
                
                String[] parsedArgs = parseInputString(tcInput);
                int n = parseInt(parsedArgs[0]);
                VersionControl.GLOBAL_BAD_VERSION = parseInt(parsedArgs[1]);
                
                Solution sol = new Solution();
                long startTime = System.nanoTime();
                int result = sol.firstBadVersion(n);
                long endTime = System.nanoTime();
                totalTimeMs += (endTime - startTime) / 1000000;
                
                if (totalTimeMs > 200000) {
                    System.out.println("{\"error\":\"Time Limit Exceeded\"}");
                    break;
                }
                
                System.out.println(String.valueOf(result));
            } catch (Exception e) {
                System.out.println("{\"error\":\"" + e.getMessage() + "\"}");
            }
            
            pos = quoteEnd + 1;
        }

        System.out.println("[NATIVE_TIME_MS]=" + totalTimeMs + ".000");
    }
}
