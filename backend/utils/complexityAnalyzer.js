/**
 * Advanced Static Code Complexity and Approach Analyzer
 * Estimates Approach, Time, and Space Complexity based on language-specific syntax heuristics.
 * Generates highly personalized, code-specific feedback.
 */
function analyzeComplexityStatic(code, language, functionName) {
  if (!code) {
    return {
      approach: 'Direct Evaluation',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      insight: 'The submitted code is empty. No execution loops or state variables were detected, which defaults to constant complexity bounds.'
    };
  }

  // 1. Clean code by removing comments to avoid false matches
  let cleanCode = code;
  if (language === 'python') {
    cleanCode = code.replace(/\"\"\"[\s\S]*?\"\"\"/g, '')
                    .replace(/\'\'\'[\s\S]*?\'\'\'/g, '')
                    .replace(/#.*$/gm, '');
  } else {
    // JS, C++, Java
    cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/\/\/.*$/gm, '');
  }

  // 2. Extract variable declarations
  const declaredVars = new Set();
  const keywords = new Set([
    'const', 'static', 'public', 'private', 'protected', 'class', 'struct', 'void', 'return', 'new', 'final', 
    'import', 'package', 'this', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 
    'throw', 'throws', 'try', 'catch', 'finally', 'true', 'false', 'null', 'int', 'long', 'float', 'double', 
    'char', 'boolean', 'string', 'void', 'auto', 'vector', 'map', 'set', 'list', 'self', 'def', 'elif', 'print',
    'from', 'as', 'None', 'True', 'False', 'and', 'or', 'not', 'in', 'is', 'lambda', 'let', 'var'
  ]);
  let varMatches;
  if (language === 'python') {
    const pyVarRegex = /(?:^|\s)([a-zA-Z_]\w*)\s*=\s*/g;
    while ((varMatches = pyVarRegex.exec(cleanCode)) !== null) {
      const name = varMatches[1];
      if (!keywords.has(name)) {
        declaredVars.add(name);
      }
    }
    const pyForRegex = /\bfor\s+([a-zA-Z_]\w*)\s+in/g;
    while ((varMatches = pyForRegex.exec(cleanCode)) !== null) {
      const name = varMatches[1];
      if (!keywords.has(name)) {
        declaredVars.add(name);
      }
    }
  } else {
    // JS: const/let/var x = ...
    const jsVarRegex = /\b(?:const|let|var)\s+([a-zA-Z_]\w*)\b/g;
    while ((varMatches = jsVarRegex.exec(cleanCode)) !== null) {
      const name = varMatches[1];
      if (!keywords.has(name)) {
        declaredVars.add(name);
      }
    }
    // C++/Java types: declarations, arrays, parameter list items like int[][] edges, int u
    const typedVarRegex = /\b(?:[a-zA-Z_]\w*(?:<[^>]+>)?(?:\s*\[\s*\])*\s*\*?)\s+([a-zA-Z_]\w*)\b/g;
    while ((varMatches = typedVarRegex.exec(cleanCode)) !== null) {
      const name = varMatches[1];
      if (!keywords.has(name)) {
        declaredVars.add(name);
      }
    }
  }

  const userPointers = [];
  const userCollections = [];
  const userDPMemo = [];
  
  for (const v of declaredVars) {
    if (['left', 'right', 'low', 'high', 'mid', 'start', 'end', 'i', 'j', 'k', 'p', 'q', 'ptr', 'idx'].includes(v.toLowerCase())) {
      userPointers.push(v);
    } else if (['seen', 'visited', 'map', 'set', 'dict', 'freq', 'counts', 'hash', 'lookup', 'unique', 'arr', 'nums', 'list', 'list_nodes'].some(k => v.toLowerCase().includes(k))) {
      userCollections.push(v);
    } else if (['dp', 'memo', 'cache', 'table', 'states', 'matrix'].some(k => v.toLowerCase().includes(k))) {
      userDPMemo.push(v);
    }
  }

  // 3. Extract Loop Bodies to perform deep inspection
  const loopBodies = [];
  const codeLength = cleanCode.length;
  
  if (language === 'python') {
    const lines = cleanCode.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(\s*)(for|while)\b/);
      if (match) {
        const baseIndent = match[1].length;
        let bodyLines = [];
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          if (nextLine.trim().length === 0) {
            j++;
            continue;
          }
          const nextIndentMatch = nextLine.match(/^(\s*)/);
          const nextIndent = nextIndentMatch ? nextIndentMatch[1].length : 0;
          if (nextIndent <= baseIndent) {
            break;
          }
          bodyLines.push(nextLine);
          j++;
        }
        if (bodyLines.length > 0) {
          loopBodies.push(bodyLines.join('\n'));
        }
      }
    }
  } else {
    // JS, C++, Java
    let idx = 0;
    while (true) {
      const forIdx = cleanCode.indexOf('for', idx);
      const whileIdx = cleanCode.indexOf('while', idx);
      let loopIdx = -1;
      
      if (forIdx !== -1 && whileIdx !== -1) {
        loopIdx = Math.min(forIdx, whileIdx);
      } else {
        loopIdx = forIdx !== -1 ? forIdx : whileIdx;
      }
      
      if (loopIdx === -1) break;
      
      let openParen = cleanCode.indexOf('(', loopIdx);
      if (openParen !== -1) {
        let parenDepth = 1;
        let scanParen = openParen + 1;
        while (scanParen < codeLength && parenDepth > 0) {
          if (cleanCode[scanParen] === '(') parenDepth++;
          else if (cleanCode[scanParen] === ')') parenDepth--;
          scanParen++;
        }
        let nextCharIdx = scanParen;
        while (nextCharIdx < codeLength && /\s/.test(cleanCode[nextCharIdx])) {
          nextCharIdx++;
        }
        if (cleanCode[nextCharIdx] === '{') {
          let depth = 1;
          let scanBrace = nextCharIdx + 1;
          while (scanBrace < codeLength && depth > 0) {
            if (cleanCode[scanBrace] === '{') depth++;
            else if (cleanCode[scanBrace] === '}') depth--;
            scanBrace++;
          }
          loopBodies.push(cleanCode.substring(nextCharIdx + 1, scanBrace - 1));
          idx = nextCharIdx + 1;
        } else {
          const nextSemi = cleanCode.indexOf(';', nextCharIdx);
          if (nextSemi !== -1) {
            loopBodies.push(cleanCode.substring(nextCharIdx, nextSemi + 1));
            idx = nextSemi + 1;
          } else {
            idx = loopIdx + 5;
          }
        }
      } else {
        idx = loopIdx + 5;
      }
    }
  }

  // 4. Check for nested loops
  let hasNestedLoops = false;
  if (language === 'python') {
    const lines = cleanCode.split('\n');
    let outerLoopIndent = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const loopMatch = line.match(/^(\s*)(for|while)\b/);
      if (loopMatch) {
        const indent = loopMatch[1].length;
        if (outerLoopIndent !== -1 && indent > outerLoopIndent) {
          hasNestedLoops = true;
          break;
        }
        outerLoopIndent = indent;
      } else if (line.trim().length > 0 && !line.match(/^\s*(for|while|if|elif|else)\b/)) {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        if (indent <= outerLoopIndent) {
          outerLoopIndent = -1;
        }
      }
    }
  } else {
    let loopKeywords = [];
    let currentDepth = 0;
    const tokens = cleanCode.split(/(\{|\}|\bfor\b|\bwhile\b)/);
    for (const token of tokens) {
      if (token === 'for' || token === 'while') {
        loopKeywords.push(currentDepth);
        if (loopKeywords.length > 1) {
          hasNestedLoops = true;
        }
      } else if (token === '{') {
        currentDepth++;
      } else if (token === '}') {
        currentDepth--;
        loopKeywords = loopKeywords.filter(depth => depth < currentDepth);
      }
    }
  }

  // 5. Inspect loop bodies for linear time built-in methods (hidden complexity traps)
  const warnings = [];
  const linearMethods = {
    javascript: [
      { pattern: /\.indexOf\(/, name: '.indexOf()' },
      { pattern: /\.lastIndexOf\(/, name: '.lastIndexOf()' },
      { pattern: /\.includes\(/, name: '.includes()' },
      { pattern: /\.slice\(/, name: '.slice()' },
      { pattern: /\.splice\(/, name: '.splice()' },
      { pattern: /\.shift\(/, name: '.shift()' },
      { pattern: /\.unshift\(/, name: '.unshift()' },
      { pattern: /\.split\(/, name: '.split()' }
    ],
    python: [
      { pattern: /\.index\(/, name: '.index()' },
      { pattern: /\.count\(/, name: '.count()' },
      { pattern: /\.pop\(0\)/, name: '.pop(0)' },
      { pattern: /\.split\(/, name: '.split()' },
      { pattern: /[^a-zA-Z0-9_]in\s+[a-zA-Z_]\w*/, name: 'in membership scan' }
    ],
    cpp: [
      { pattern: /\bstd::find\b/, name: 'std::find()' },
      { pattern: /\.find\(/, name: '.find()' },
      { pattern: /\.erase\(/, name: '.erase()' },
      { pattern: /\.insert\(/, name: '.insert()' }
    ],
    java: [
      { pattern: /\.indexOf\(/, name: '.indexOf()' },
      { pattern: /\.contains\(/, name: '.contains()' },
      { pattern: /\.remove\(0\)/, name: '.remove(0)' },
      { pattern: /\.substring\(/, name: '.substring()' }
    ]
  };
  
  const langMethods = linearMethods[language] || [];
  for (const method of langMethods) {
    for (let bIdx = 0; bIdx < loopBodies.length; bIdx++) {
      const body = loopBodies[bIdx];
      if (method.pattern.test(body)) {
        // Exclude self in Python loop definitions
        if (language === 'python' && method.name === 'in membership scan' && body.includes('for ') && body.indexOf('in') < body.indexOf('\n')) {
          continue;
        }
        warnings.push(method.name);
        break; 
      }
    }
  }

  // 6. Detect Recursion
  let isRecursive = false;
  if (functionName) {
    const recursionRegex = new RegExp(`\\b${functionName}\\b`, 'g');
    const occurrences = (cleanCode.match(recursionRegex) || []).length;
    isRecursive = occurrences > 1; // 1 for definition, >1 means recursive call
  }

  // 7. General algorithmic pattern matching
  const hasWhile = cleanCode.includes('while');
  const hasFor = cleanCode.includes('for');
  const hasLowHigh = /\b(low|high)\b/i.test(cleanCode);
  const hasLeftRight = /\b(left|right)\b/i.test(cleanCode);
  const hasMid = /\bmid\b/i.test(cleanCode);
  const updatesMid = /=.*mid/i.test(cleanCode) || /mid.*=/.test(cleanCode) || /\bmid\b/i.test(cleanCode);
  
  // Hashing structure checks
  const usesHashTable = /\b(Map|Set|dict|set|HashMap|HashSet|unordered_map|unordered_set)\b/.test(cleanCode) || 
                       ( /\{\}/.test(cleanCode) && /\b(put|has|get|in)\b/.test(cleanCode) );
                       
  const usesSorting = /\b(sort|sorted)\b/i.test(cleanCode);

  let approach = 'Linear Scan';
  let timeComplexity = 'O(N)';
  let spaceComplexity = 'O(1)';
  let baseInsight = '';

  // Determine approach, complexity and algorithmic brief details
  if (isRecursive) {
    const usesCache = /\b(memo|cache|dp|table|dict)\b/i.test(cleanCode) || /\[\s*(i|n|k|idx)\s*\]\s*=/i.test(cleanCode) || userDPMemo.length > 0;
    if (usesCache) {
      approach = 'Dynamic Programming (Memoization)';
      timeComplexity = 'O(N)';
      spaceComplexity = 'O(N)';
      const cacheVar = userDPMemo[0] || 'memo';
      baseInsight = `We detected Dynamic Programming (Memoization) which caches solved subproblem results to avoid repeating recursive branches. Using the cache \`${cacheVar}\`, it yields O(N) time and O(N) space. Your approach is already optimal.`;
    } else {
      approach = 'Recursive Backtracking / DFS';
      timeComplexity = 'O(2^N)';
      spaceComplexity = 'O(N)';
      baseInsight = `We detected Recursive Backtracking / DFS which uses recursive call frames to traverse search tree combinations or graph paths. Without state caching, this results in an exponential O(2^N) time complexity. To optimize, store completed states in a memoization cache, reducing time complexity to O(N) with O(N) space.`;
    }
  } else if (hasWhile && (hasLowHigh || hasLeftRight) && hasMid && updatesMid) {
    approach = 'Binary Search';
    timeComplexity = 'O(log N)';
    spaceComplexity = 'O(1)';
    const lowVar = userPointers.find(p => ['low', 'left'].includes(p.toLowerCase())) || 'left';
    const highVar = userPointers.find(p => ['high', 'right'].includes(p.toLowerCase())) || 'right';
    baseInsight = `We detected Binary Search which repeatedly divides a sorted search interval in half to locate target values in logarithmic time. Pruning the range between \`${lowVar}\` and \`${highVar}\` using \`mid\` achieves O(log N) runtime and O(1) space. Your approach is already optimal.`;
  } else if (hasNestedLoops) {
    approach = 'Brute Force (Nested Loops)';
    timeComplexity = 'O(N^2)';
    spaceComplexity = 'O(1)';
    if (usesHashTable || userCollections.length > 0) {
      spaceComplexity = 'O(N)';
    }
    const loopsText = loopBodies.length >= 2 ? 'multiple nested loops' : 'nested loops';
    baseInsight = `We detected Brute Force (${loopsText}) which checks all pairs of items using nested iterations to evaluate conditions directly. This results in a quadratic O(N^2) time complexity. To optimize, use a Hash Map or Two Pointers to achieve an optimal time complexity of O(N) or O(N log N) with O(1) or O(N) space.`;
  } else if (usesSorting) {
    approach = 'Sorting & Processing';
    timeComplexity = 'O(N log N)';
    spaceComplexity = 'O(1)';
    if (usesHashTable || userCollections.length > 0) {
      spaceComplexity = 'O(N)';
    }
    baseInsight = `We detected Sorting & Processing which arranges input elements in order first to enable faster linear scans or binary search choices. The runtime is dominated by sorting, resulting in O(N log N) time complexity. If the input is unsorted, this is already optimal. Otherwise, a linear scan of O(N) time with O(1) space is the best approach.`;
  } else if ((hasLeftRight || userPointers.length >= 2) && updatesMid === false && (hasWhile || hasFor)) {
    approach = 'Two Pointers';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(1)';
    const leftP = userPointers.find(p => ['left', 'i', 'start'].includes(p.toLowerCase())) || 'left';
    const rightP = userPointers.find(p => ['right', 'j', 'end'].includes(p.toLowerCase())) || 'right';
    baseInsight = `We detected Two Pointers which scans elements from opposite ends or at different speeds to locate pairs or windows in a single linear pass. Advancing pointers \`${leftP}\` and \`${rightP}\` solves the problem in optimal linear O(N) time with O(1) space. Your approach is already optimal.`;
  } else if (usesHashTable || userCollections.length > 0) {
    approach = 'Hash Map / Set Optimization';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
    const collVar = userCollections[0] || 'seen';
    baseInsight = `We detected Hash Map / Set Optimization which uses hash-based structures to map values to keys for instantaneous O(1) average-case lookups. Accessing \`${collVar}\` achieves optimal linear O(N) time complexity with O(N) space. Your approach is already optimal.`;
  } else if (/\b(queue|q)\b/i.test(cleanCode) && /(shift|pop\(0\)|popleft|poll)/i.test(cleanCode) && hasWhile) {
    approach = 'Breadth-First Search (BFS)';
    timeComplexity = 'O(V + E)';
    spaceComplexity = 'O(V)';
    baseInsight = `We detected Breadth-First Search (BFS) which uses a queue to traverse graph nodes level-by-level, finding shortest paths in unweighted structures. This explores states in optimal linear O(V + E) time with O(V) space. Your approach is already optimal.`;
  } else if (userDPMemo.length > 0 && (hasFor || hasWhile)) {
    approach = 'Dynamic Programming (Tabulation)';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
    const tableVar = userDPMemo[0] || 'dp';
    baseInsight = `We detected Dynamic Programming (Tabulation) which uses a table to solve smaller subproblems iteratively first, building up to the main solution. Evaluating states in table \`${tableVar}\` achieves optimal linear O(N) time and O(N) space. Your approach is already optimal.`;
  } else if (hasFor || hasWhile) {
    approach = 'Linear Scan';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(1)';
    baseInsight = `We detected a Linear Scan which iterates through input elements sequentially one by one from start to finish. This performs a single-loop pass over the input, achieving optimal O(N) time complexity and constant O(1) auxiliary space. Your approach is already optimal.`;
  } else {
    approach = 'Constant Time evaluation';
    timeComplexity = 'O(1)';
    spaceComplexity = 'O(1)';
    baseInsight = `We detected Constant Time evaluation which resolves the solution immediately using direct calculations without loops or recursion. This executes in optimal O(1) time and consumes O(1) space. Your approach is already optimal.`;
  }

  // 8. Stitch customized details based on user's exact variable declarations
  let customAdditions = '';
  if (userPointers.length > 0 && approach !== 'Two Pointers' && approach !== 'Binary Search') {
    customAdditions += ` We noticed you declared pointer/counter variables like \`${userPointers.join(', ')}\`.`;
  }
  if (userCollections.length > 0 && approach !== 'Hash Map / Set Optimization') {
    customAdditions += ` You declared auxiliary collections or arrays like \`${userCollections.join(', ')}\` to track elements.`;
  }
  if (userDPMemo.length > 0 && approach !== 'Dynamic Programming (Tabulation)' && approach !== 'Dynamic Programming (Memoization)') {
    customAdditions += ` State tables like \`${userDPMemo.join(', ')}\` were defined to store intermediate steps.`;
  }

  // 9. Add warning if linear complexity operations are nested in loops
  let warningAddition = '';
  if (warnings.length > 0) {
    const listWarnings = [...new Set(warnings)].join(', ');
    warningAddition = ` WARNING: We detected that you are calling linear-time helper methods (${listWarnings}) inside your loop(s). Even though your loop structure looks linear, nesting O(N) built-in methods inside a loop shifts the actual runtime to O(N^2) (quadratic) complexity! Try to rewrite the search check using a Set look-up to restore optimal performance.`;
    // If warning changes time complexity
    if (timeComplexity === 'O(N)') {
      timeComplexity = 'O(N^2)';
      approach = `${approach} (with nested O(N) calls)`;
    }
  }

  // 10. Generate variable naming suggestions (as requested by user)
  const namingSuggestions = [];
  for (const v of declaredVars) {
    const lower = v.toLowerCase();
    if (['i', 'j', 'k'].includes(lower)) continue; // standard loop counters are okay
    
    if (lower === 'ans' || lower === 'res' || lower === 'result' || lower === 'ret') {
      namingSuggestions.push(`Rename generic \`${v}\` to something more descriptive of its role (e.g. \`maxSetSize\`, \`fibonacciValue\`, or \`hasCycle\`).`);
    } else if (lower === 'adj') {
      namingSuggestions.push(`Rename shorthand \`${v}\` to \`adjacencyMatrix\` or \`adjacencyList\` to clarify the data structure.`);
    } else if (lower === 'e' || lower === 'edge') {
      if (lower === 'e') {
        namingSuggestions.push(`Rename single-letter \`e\` to \`edge\` or \`connection\`.`);
      }
    } else if (lower === 'u' || lower === 'v') {
      namingSuggestions.push(`Rename node shorthand \`${v}\` to \`sourceNode\` or \`targetNode\` / \`fromNode\` or \`toNode\`.`);
    } else if (lower === 'n' || lower === 'm') {
      namingSuggestions.push(`Rename single-letter \`${v}\` to a clear name like \`nodeCount\` or \`arrayLength\`.`);
    } else if (lower === 'dp' || lower === 'memo') {
      namingSuggestions.push(`Rename cache shorthand \`${v}\` to \`memoCache\` or \`dpStatesTable\`.`);
    } else if (lower === 'vis' || lower === 'path') {
      namingSuggestions.push(`Rename short tracking variable \`${v}\` to \`visitedNodes\` or \`recursionPath\`.`);
    } else if (lower === 'temp' || lower === 'tmp' || lower === 'val' || lower === 'value' || lower === 'arr' || lower === 'array') {
      namingSuggestions.push(`Rename generic \`${v}\` to a domain-specific name (e.g., \`currentElement\`, \`numbersList\`).`);
    } else if (v.length === 1) {
      namingSuggestions.push(`Avoid single-letter variable \`${v}\`. Use descriptive and relatable names instead.`);
    }
  }
  
  let namingAddition = '';
  if (namingSuggestions.length > 0) {
    namingAddition = ` Variable Naming Feedback: ${namingSuggestions.join(' ')}`;
  }

  // 11. Generate time and space redundancy feedback (as requested by user)
  const redundancyFeedback = [];
  
  // Space redundancies
  if (isRecursive) {
    redundancyFeedback.push(`Recursive stack frames consume O(N) memory. If stack overflow limits are a concern, an iterative implementation can reduce auxiliary space to O(1).`);
  } else if (spaceComplexity === 'O(N)' && !approach.includes('BFS') && !approach.includes('DFS') && !approach.includes('Dynamic Programming')) {
    redundancyFeedback.push(`Auxiliary memory allocations were detected. Consider modifying inputs in-place or tracking state with simple pointer variables to lower space complexity to O(1).`);
  }
  
  // Time redundancies
  if (warnings.length > 0) {
    redundancyFeedback.push(`Built-in linear scans (like .includes or .indexOf) inside a loop add redundant scans. You can optimize this to O(1) time complexity by caching elements in a Hash Set/Map first.`);
  } else if (hasNestedLoops) {
    redundancyFeedback.push(`Nested loops result in O(N^2) brute-force complexity. Optimize this by keeping a Hash Map of visited values or sorting the array to run a Two-Pointer check in O(N log N) or O(N) time.`);
  }
  
  // Sequential loops check
  const loopsCount = (cleanCode.match(/\b(for|while)\b/g) || []).length;
  if (loopsCount >= 2 && !hasNestedLoops) {
    redundancyFeedback.push(`Multiple sequential loops were found. Consider if the logic can be consolidated into a single pass to eliminate redundant traversal iterations.`);
  }

  let redundancyAddition = '';
  if (redundancyFeedback.length > 0) {
    redundancyAddition = ` Redundancy & Optimization Feedback: ${redundancyFeedback.join(' ')}`;
  }

  const finalInsight = `${baseInsight}${customAdditions}${warningAddition}${namingAddition}${redundancyAddition}`;

  return {
    approach,
    timeComplexity,
    spaceComplexity,
    insight: finalInsight
  };
}

/**
 * Asynchronous AI Code Complexity and Approach Analyzer using Grok API.
 * Falls back to analyzeComplexityStatic if API key is not available or if call fails.
 */
async function analyzeComplexity(code, language, functionName) {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

  if (!apiKey) {
    console.log('[Complexity Analyzer] No XAI_API_KEY or GROK_API_KEY detected in env. Using offline static analyzer.');
    return analyzeComplexityStatic(code, language, functionName);
  }

  // Auto-detect Groq key (gsk_...) vs xAI Grok key
  const isGroq = apiKey.startsWith('gsk_');
  const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
  
  let model = process.env.XAI_MODEL || process.env.GROK_MODEL;
  if (isGroq) {
    if (!model || model.toLowerCase().includes('grok')) {
      model = 'llama-3.3-70b-versatile';
    }
  } else {
    if (!model) {
      model = 'grok-2';
    }
  }

  console.log(`[Complexity Analyzer] Calling AI endpoint: ${endpoint} with model: ${model}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert algorithms instructor and code complexity analyzer. Analyze the user\'s submitted code for a coding problem and return a JSON object with keys: "approach" (e.g., "DFS Cycle Detection"), "timeComplexity" (e.g., "O(N + M)"), "spaceComplexity" (e.g., "O(N + M)"), and "insight". The "insight" field MUST be a concise summary (around 120-180 words max) following these rules:\n' +
                     '1. Describe the user\'s approach and ALWAYS explicitly include a clear, one-sentence brief defining what that algorithm is and does internally (e.g., "Prim\'s algorithm is a greedy method that constructs a minimum spanning tree by repeatedly adding the cheapest edge from visited to unvisited vertices using a priority queue"; or "DFS is a path-search algorithm that explores as deep as possible along each branch before backtracking using a call stack"). You must define the algorithm used.\n' +
                     '2. If the user\'s approach is already optimal, state: "Your approach is already optimal." If NOT optimal, briefly describe a more optimal approach and specify its target time and space complexities.\n' +
                     '3. Always review the variable names used in the code. If there are non-descriptive, single-letter (excluding standard loop iterators like i, j, k), or generic names (like "ans", "res", "temp", "arr", "val", "adj", "e", "u", "v"), you MUST point them out and provide specific suggestions for better, more descriptive/relatable variable names.\n' +
                     '4. Always analyze the code for time and space redundancies. (a) For space: identify any variables, arrays, collections, or recursive call stacks that are redundant, unnecessary, or could be replaced by in-place updates. (b) For time: identify any redundant loops, nested loops that can be optimized (e.g., sliding window, two pointers), or linear-time built-in helper functions (like search/indexOf/includes/contains) that are unnecessary or could be replaced by O(1) lookups or more optimal operations. Provide specific optimization advice for both brute force and optimal solutions.'
          },
          {
            role: 'user',
            content: `Language: ${language}\nFunction Name: ${functionName || 'unknown'}\nCode:\n${code}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI API returned status code ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) {
      throw new Error('AI API returned empty choices or message content.');
    }

    const parsed = JSON.parse(content);
    return {
      approach: parsed.approach || 'Direct Evaluation',
      timeComplexity: parsed.timeComplexity || 'O(1)',
      spaceComplexity: parsed.spaceComplexity || 'O(1)',
      insight: parsed.insight || ''
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[Complexity Analyzer] AI API call failed. Falling back to static analyzer. Error:', err.message);
    return analyzeComplexityStatic(code, language, functionName);
  }
}

module.exports = {
  analyzeComplexity,
  analyzeComplexityStatic
};
