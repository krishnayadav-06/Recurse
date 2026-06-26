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

GLOBAL_BAD_VERSION = 0

def isBadVersion(version: int) -> bool:
    global GLOBAL_BAD_VERSION
    return version >= GLOBAL_BAD_VERSION

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
        if colon_pos == -1:
            break
            
        quote_start = input_data.find('"', colon_pos)
        if quote_start == -1:
            break
            
        quote_end = quote_start + 1
        while quote_end < len(input_data):
            if input_data[quote_end] == '"' and input_data[quote_end - 1] != '\\':
                break
            quote_end += 1
            
        if quote_end >= len(input_data):
            break
            
        try:
            tc_input = input_data[quote_start + 1 : quote_end]
            tc_input = tc_input.replace('\\"', '"')
            
            parsed_args = parse_input_string(tc_input)
            
            # For first-bad-version:
            # parsed_args[0] is n
            # parsed_args[1] is bad (the bad version to set)
            arg0 = parsed_args[0]
            GLOBAL_BAD_VERSION = parsed_args[1]
            
            start_time = time.perf_counter()
            result = sol.firstBadVersion(arg0)
            end_time = time.perf_counter()
            total_execution_time_ms += (end_time - start_time) * 1000
            
            if total_execution_time_ms > 200000:
                print('{"error":"Time Limit Exceeded"}')
                break
                
            print(json.dumps(result, separators=(',', ':')))
        except Exception as e:
            print(json.dumps({"error": str(e)}, separators=(',', ':')))
            
        pos = quote_end + 1
