export function checkAnswer(problemId: string, input: any, actualStr: string, expectedStr: string): boolean {
  if (actualStr === expectedStr) return true;
  
  try {
    const actual = JSON.parse(actualStr);
    const expected = JSON.parse(expectedStr);

    if (problemId === 'two-sum-ii-input-array-is-sorted') {
      // Input format: "numbers = [0, 0, ...], target = 0"
      if (!Array.isArray(actual) || actual.length !== 2) return false;
      
      const numbersMatch = input.match(/numbers\s*=\s*\[(.*?)\]/);
      const targetMatch = input.match(/target\s*=\s*(-?\d+)/);
      if (!numbersMatch || !targetMatch) return false;
      
      const numbersStr = numbersMatch[1];
      const numbers = JSON.parse(`[${numbersStr}]`);
      const target = parseInt(targetMatch[1], 10);
      
      const idx1 = actual[0] - 1;
      const idx2 = actual[1] - 1;
      
      if (idx1 >= 0 && idx2 >= 0 && idx1 < numbers.length && idx2 < numbers.length && idx1 !== idx2) {
        return numbers[idx1] + numbers[idx2] === target;
      }
      return false;
    }
    
    // Fallback to unordered deep equal
    return deepEqualUnordered(actual, expected);
  } catch (err) {
    return false;
  }
}

export function deepEqualUnordered(a: any, b: any): boolean {
  if (a === b) return true
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    
    const freqA = new Map<string, number>()
    const freqB = new Map<string, number>()
    
    for (const item of a) {
      const key = JSON.stringify(sortForHashing(item))
      freqA.set(key, (freqA.get(key) || 0) + 1)
    }
    
    for (const item of b) {
      const key = JSON.stringify(sortForHashing(item))
      freqB.set(key, (freqB.get(key) || 0) + 1)
    }
    
    if (freqA.size !== freqB.size) return false
    
    for (const [key, count] of freqA) {
      if (freqB.get(key) !== count) return false
    }
    return true
  }
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (const key of keysA) {
      if (!deepEqualUnordered(a[key], b[key])) return false
    }
    return true
  }
  
  return false
}

function sortForHashing(item: any): any {
  if (Array.isArray(item)) {
    const sorted = item.map(sortForHashing)
    return sorted.sort((a, b) => {
      const strA = JSON.stringify(a)
      const strB = JSON.stringify(b)
      return strA.localeCompare(strB)
    })
  }
  return item
}
