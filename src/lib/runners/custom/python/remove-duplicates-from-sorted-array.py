import sys
import json
import re
import time

def parse_input_string(input_str):
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
    
    values = []
    for part in parts:
        eq_idx = part.index("=")
        val_str = part[eq_idx + 1:].strip()
        val_str = val_str.replace("null", "None").replace("true", "True").replace("false", "False")
        values.append(eval(val_str))
    return values

from typing import List, Optional

${userCode}

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
        if colon_pos == -1: break
            
        quote_start = input_data.find('"', colon_pos)
        if quote_start == -1: break
            
        quote_end = quote_start + 1
        while quote_end < len(input_data):
            if input_data[quote_end] == '"' and input_data[quote_end - 1] != '\\': break
            quote_end += 1
            
        if quote_end >= len(input_data): break
            
        tc_input = input_data[quote_start + 1 : quote_end]
        tc_input = tc_input.replace('\\"', '"')
        
        # Find expected
        exp_search_key = '"expected"'
        exp_pos = input_data.find(exp_search_key, quote_end)
        exp_str = ""
        if exp_pos != -1:
            exp_pos += len(exp_search_key)
            exp_colon_pos = input_data.find(':', exp_pos)
            if exp_colon_pos != -1:
                exp_quote_start = input_data.find('"', exp_colon_pos)
                if exp_quote_start != -1:
                    exp_quote_end = exp_quote_start + 1
                    while exp_quote_end < len(input_data):
                        if input_data[exp_quote_end] == '"' and input_data[exp_quote_end - 1] != '\\': break
                        exp_quote_end += 1
                    if exp_quote_end < len(input_data):
                        exp_str = input_data[exp_quote_start + 1 : exp_quote_end]
                        exp_str = exp_str.replace('\\"', '"').replace('\\n', '\n')

        try:
            parsed_args = parse_input_string(tc_input)
            arg0 = parsed_args[0]
            
            # calculate expected_k
            expected_k = 0
            if len(arg0) > 0:
                expected_k = 1
                for i in range(1, len(arg0)):
                    if arg0[i] != arg0[i-1]:
                        expected_k += 1
            
            orig_size = len(arg0)
            
            start_time = time.perf_counter()
            k = sol.removeDuplicates(arg0)
            end_time = time.perf_counter()
            total_execution_time_ms += (end_time - start_time) * 1000
            
            if total_execution_time_ms > 200000:
                print('{"error":"Time Limit Exceeded"}')
                break
                
            valid = True
            if k != expected_k:
                valid = False
                
            for i in range(1, k):
                if i < len(arg0) and arg0[i] <= arg0[i-1]:
                    valid = False
            
            if valid:
                print(exp_str)
            else:
                formatted = str(k) + ", nums = ["
                for i in range(orig_size):
                    if i < k and i < len(arg0):
                        formatted += str(arg0[i])
                    else:
                        formatted += "_"
                    if i < orig_size - 1:
                        formatted += ","
                formatted += "]"
                print(formatted)
                
        except Exception as e:
            print(json.dumps({"error": str(e)}, separators=(',', ':')))
            
        pos = quote_end + 1
