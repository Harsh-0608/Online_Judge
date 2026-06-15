const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

// Boilerplate template generator helper
function getTemplates(signature, returnType, functionName) {
  const templates = {};

  // 1. JavaScript
  if (signature === 'number') {
    templates.javascript = `function ${functionName}(n) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    console.log(${functionName}(parseInt(input)));\n}`;
  } else if (signature === 'two_numbers') {
    templates.javascript = `function ${functionName}(a, b) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const parts = input.split(/\\s+/).map(Number);\n    console.log(${functionName}(parts[0], parts[1]));\n}`;
  } else if (signature === 'numbers' || signature === 'numbers_to_array') {
    templates.javascript = `function ${functionName}(nums) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const nums = input.split(/\\s+/).map(Number);\n    const res = ${functionName}(nums);\n    console.log(Array.isArray(res) ? res.join(' ') : res);\n}`;
  } else if (signature === 'array_target') {
    templates.javascript = `function ${functionName}(nums, target) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const nums = input[0].split(/\\s+/).map(Number);\n    const target = parseInt(input[1]);\n    const res = ${functionName}(nums, target);\n    console.log(Array.isArray(res) ? res.join(' ') : res);\n}`;
  } else if (signature === 'string') {
    templates.javascript = `function ${functionName}(s) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(${functionName}(input));`;
  } else if (signature === 'two_strings') {
    templates.javascript = `function ${functionName}(s1, s2) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    console.log(${functionName}(input[0].trim(), input[1].trim()));\n}`;
  } else if (signature === 'matrix') {
    templates.javascript = `function ${functionName}(matrix) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const parts = input.split(/\\s+/).map(Number);\n    const r = parts[0];\n    const c = parts[1];\n    const matrix = [];\n    let idx = 2;\n    for (let i = 0; i < r; i++) {\n        matrix.push(parts.slice(idx, idx + c));\n        idx += c;\n    }\n    const res = ${functionName}(matrix);\n    console.log(Array.isArray(res) ? res.join(' ') : res);\n}`;
  } else if (signature === 'triangle') {
    templates.javascript = `function ${functionName}(triangle) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const parts = input.split(/\\s+/).map(Number);\n    const n = parts[0];\n    const triangle = [];\n    let idx = 1;\n    for (let i = 0; i < n; i++) {\n        triangle.push(parts.slice(idx, idx + i + 1));\n        idx += i + 1;\n    }\n    const res = ${functionName}(triangle);\n    console.log(Array.isArray(res) ? res.join(' ') : res);\n}`;
  } else if (signature === 'find_paths') {
    templates.javascript = `function ${functionName}(m, n, maxMove, startRow, startCol) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const parts = input.split(/\\s+/).map(Number);\n    console.log(${functionName}(parts[0], parts[1], parts[2], parts[3], parts[4]));\n}`;
  } else if (signature === 'knight_probability') {
    templates.javascript = `function ${functionName}(N, K, r, c) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const parts = input.split(/\\s+/).map(Number);\n    console.log(${functionName}(parts[0], parts[1], parts[2], parts[3]));\n}`;
  } else if (signature === 'two_arrays') {
    templates.javascript = `function ${functionName}(arr1, arr2) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const arr1 = input[0].trim().split(/\\s+/).map(Number);\n    const arr2 = input[1].trim().split(/\\s+/).map(Number);\n    const res = ${functionName}(arr1, arr2);\n    console.log(Array.isArray(res) ? res.join(' ') : res);\n}`;
  } else if (signature === 'string_array') {
    templates.javascript = `function ${functionName}(s, wordDict) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const s = input[0].trim();\n    const wordDict = input[1].trim().split(/\\s+/);\n    console.log(${functionName}(s, wordDict));\n}`;
  } else if (signature === 'find_max_form') {
    templates.javascript = `function ${functionName}(strs, m, n) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const strs = input[0].trim().split(/\\s+/);\n    const parts = input[1].trim().split(/\\s+/).map(Number);\n    console.log(${functionName}(strs, parts[0], parts[1]));\n}`;
  } else if (signature === 'graph') {
    templates.javascript = `function ${functionName}(n, edges) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const parts = input.split(/\\s+/).map(Number);\n    const n = parts[0];\n    const m = parts[1];\n    const edges = [];\n    for (let i = 0; i < m; i++) {\n        edges.push([parts[2 + 2*i], parts[2 + 2*i + 1]]);\n    }\n    const res = ${functionName}(n, edges);\n    console.log(Array.isArray(res) ? res.join(' ') : res);\n}`;
  } else if (signature === 'weighted_graph') {
    templates.javascript = `function ${functionName}(n, edges) {\n    // Write your code here\n    \n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input.length > 0) {\n    const parts = input.split(/\\s+/).map(Number);\n    const n = parts[0];\n    const m = parts[1];\n    const edges = [];\n    for (let i = 0; i < m; i++) {\n        edges.push([parts[2 + 3*i], parts[2 + 3*i + 1], parts[2 + 3*i + 2]]);\n    }\n    const res = ${functionName}(n, edges);\n    console.log(Array.isArray(res) ? res.join(' ') : res);\n}`;
  }

  // 2. Python
  if (signature === 'number') {
    templates.python = `import sys\n\ndef ${functionName}(n):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    print(${functionName}(int(input_data)))`;
  } else if (signature === 'two_numbers') {
    templates.python = `import sys\n\ndef ${functionName}(a, b):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    parts = list(map(int, input_data.split()))\n    print(${functionName}(parts[0], parts[1]))`;
  } else if (signature === 'numbers' || signature === 'numbers_to_array') {
    templates.python = `import sys\n\ndef ${functionName}(nums):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    nums = list(map(int, input_data.split()))\n    res = ${functionName}(nums)\n    if isinstance(res, list):\n        print(*(res))\n    else:\n        print(res)`;
  } else if (signature === 'array_target') {
    templates.python = `import sys\n\ndef ${functionName}(nums, target):\n    # Write your code here\n    pass\n\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    res = ${functionName}(nums, target)\n    if isinstance(res, list):\n        print(*(res))\n    else:\n        print(res)`;
  } else if (signature === 'string') {
    templates.python = `import sys\n\ndef ${functionName}(s):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nprint(${functionName}(input_data))`;
  } else if (signature === 'two_strings') {
    templates.python = `import sys\n\ndef ${functionName}(s1, s2):\n    # Write your code here\n    pass\n\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    print(${functionName}(lines[0].strip(), lines[1].strip()))`;
  } else if (signature === 'matrix') {
    templates.python = `import sys\n\ndef ${functionName}(matrix):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    parts = list(map(int, input_data.split()))\n    r, c = parts[0], parts[1]\n    matrix = []\n    idx = 2\n    for i in range(r):\n        matrix.append(parts[idx:idx+c])\n        idx += c\n    res = ${functionName}(matrix)\n    if isinstance(res, list):\n        print(*(res))\n    else:\n        print(res)`;
  } else if (signature === 'triangle') {
    templates.python = `import sys\n\ndef ${functionName}(triangle):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    parts = list(map(int, input_data.split()))\n    n = parts[0]\n    triangle = []\n    idx = 1\n    for i in range(n):\n        triangle.append(parts[idx:idx+i+1])\n        idx += i + 1\n    res = ${functionName}(triangle)\n    if isinstance(res, list):\n        print(*(res))\n    else:\n        print(res)`;
  } else if (signature === 'find_paths') {
    templates.python = `import sys\n\ndef ${functionName}(m, n, maxMove, startRow, startCol):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    parts = list(map(int, input_data.split()))\n    print(${functionName}(parts[0], parts[1], parts[2], parts[3], parts[4]))`;
  } else if (signature === 'knight_probability') {
    templates.python = `import sys\n\ndef ${functionName}(N, K, r, c):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    parts = list(map(int, input_data.split()))\n    print(${functionName}(parts[0], parts[1], parts[2], parts[3]))`;
  } else if (signature === 'two_arrays') {
    templates.python = `import sys\n\ndef ${functionName}(arr1, arr2):\n    # Write your code here\n    pass\n\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    arr1 = list(map(int, lines[0].split()))\n    arr2 = list(map(int, lines[1].split()))\n    res = ${functionName}(arr1, arr2)\n    if isinstance(res, list):\n        print(*(res))\n    else:\n        print(res)`;
  } else if (signature === 'string_array') {
    templates.python = `import sys\n\ndef ${functionName}(s, wordDict):\n    # Write your code here\n    pass\n\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    s = lines[0].strip()\n    wordDict = lines[1].strip().split()\n    print(${functionName}(s, wordDict))`;
  } else if (signature === 'find_max_form') {
    templates.python = `import sys\n\ndef ${functionName}(strs, m, n):\n    # Write your code here\n    pass\n\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    strs = lines[0].strip().split()\n    parts = list(map(int, lines[1].split()))\n    print(${functionName}(strs, parts[0], parts[1]))`;
  } else if (signature === 'graph') {
    templates.python = `import sys\n\ndef ${functionName}(n, edges):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    parts = list(map(int, input_data.split()))\n    n = parts[0]\n    m = parts[1]\n    edges = []\n    for i in range(m):\n        edges.append([parts[2 + 2*i], parts[2 + 2*i + 1]])\n    res = ${functionName}(n, edges)\n    if isinstance(res, list):\n        print(*(res))\n    else:\n        print(res)`;
  } else if (signature === 'weighted_graph') {
    templates.python = `import sys\n\ndef ${functionName}(n, edges):\n    # Write your code here\n    pass\n\ninput_data = sys.stdin.read().strip()\nif input_data:\n    parts = list(map(int, input_data.split()))\n    n = parts[0]\n    m = parts[1]\n    edges = []\n    for i in range(m):\n        edges.append([parts[2 + 3*i], parts[2 + 3*i + 1], parts[2 + 3*i + 2]])\n    res = ${functionName}(n, edges)\n    if isinstance(res, list):\n        print(*(res))\n    else:\n        print(res)`;
  }

  // 3. C++
  const cppRet = returnType === 'numbers' ? 'vector<int>' : returnType === 'string' ? 'string' : returnType === 'boolean' ? 'bool' : 'long long';
  const cppHeader = `#include <iostream>\n#include <string>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\n`;

  if (signature === 'number') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(long long n) {\n    // Write your code here\n    \n}\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(n);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(n) ? "true" : "false"` : `${functionName}(n)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'two_numbers') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(int a, int b) {\n    // Write your code here\n    \n}\n\nint main() {\n    int a, b;\n    if (cin >> a >> b) {\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(a, b);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(a, b) ? "true" : "false"` : `${functionName}(a, b)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'numbers' || signature === 'numbers_to_array') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(vector<int>& nums) {\n    // Write your code here\n    \n}\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        stringstream ss(line);\n        vector<int> nums;\n        int val;\n        while (ss >> val) nums.push_back(val);\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(nums);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(nums) ? "true" : "false"` : `${functionName}(nums)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'array_target') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(vector<int>& nums, int target) {\n    // Write your code here\n    \n}\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        stringstream ss(line);\n        vector<int> nums;\n        int val;\n        while (ss >> val) nums.push_back(val);\n        int target;\n        if (cin >> target) {\n            ${returnType === 'numbers' ? `vector<int> res = ${functionName}(nums, target);\n            for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n            cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(nums, target) ? "true" : "false"` : `${functionName}(nums, target)`}) << endl;`}\n        }\n    }\n    return 0;\n}`;
  } else if (signature === 'string') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(string s) {\n    // Write your code here\n    \n}\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(s);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(s) ? "true" : "false"` : `${functionName}(s)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'two_strings') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(string s1, string s2) {\n    // Write your code here\n    \n}\n\nint main() {\n    string s1, s2;\n    if (getline(cin, s1) && getline(cin, s2)) {\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(s1, s2);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(s1, s2) ? "true" : "false"` : `${functionName}(s1, s2)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'matrix') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(vector<vector<int>>& matrix) {\n    // Write your code here\n    \n}\n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<vector<int>> matrix(r, vector<int>(c));\n        for (int i = 0; i < r; i++) {\n            for (int j = 0; j < c; j++) {\n                cin >> matrix[i][j];\n            }\n        }\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(matrix);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(matrix) ? "true" : "false"` : `${functionName}(matrix)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'triangle') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(vector<vector<int>>& triangle) {\n    // Write your code here\n    \n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<vector<int>> triangle(n);\n        for (int i = 0; i < n; i++) {\n            triangle[i].resize(i + 1);\n            for (int j = 0; j <= i; j++) {\n                cin >> triangle[i][j];\n            }\n        }\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(triangle);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(triangle) ? "true" : "false"` : `${functionName}(triangle)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'find_paths') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(int m, int n, int maxMove, int startRow, int startCol) {\n    // Write your code here\n    \n}\n\nint main() {\n    int m, n, maxMove, startRow, startCol;\n    if (cin >> m >> n >> maxMove >> startRow >> startCol) {\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(m, n, maxMove, startRow, startCol);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(m, n, maxMove, startRow, startCol) ? "true" : "false"` : `${functionName}(m, n, maxMove, startRow, startCol)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'knight_probability') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(int N, int K, int r, int c) {\n    // Write your code here\n    \n}\n\nint main() {\n    int N, K, r, c;\n    if (cin >> N >> K >> r >> c) {\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(N, K, r, c);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(N, K, r, c) ? "true" : "false"` : `${functionName}(N, K, r, c)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'two_arrays') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(vector<int>& arr1, vector<int>& arr2) {\n    // Write your code here\n    \n}\n\nint main() {\n    string line1, line2;\n    if (getline(cin, line1) && getline(cin, line2)) {\n        stringstream ss1(line1), ss2(line2);\n        vector<int> arr1, arr2;\n        int val;\n        while (ss1 >> val) arr1.push_back(val);\n        while (ss2 >> val) arr2.push_back(val);\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(arr1, arr2);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(arr1, arr2) ? "true" : "false"` : `${functionName}(arr1, arr2)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'string_array') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(string s, vector<string>& wordDict) {\n    // Write your code here\n    \n}\n\nint main() {\n    string s, line;\n    if (getline(cin, s) && getline(cin, line)) {\n        stringstream ss(line);\n        vector<string> wordDict;\n        string word;\n        while (ss >> word) wordDict.push_back(word);\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(s, wordDict);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(s, wordDict) ? "true" : "false"` : `${functionName}(s, wordDict)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'find_max_form') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(vector<string>& strs, int m, int n) {\n    // Write your code here\n    \n}\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        stringstream ss(line);\n        vector<string> strs;\n        string s;\n        while (ss >> s) strs.push_back(s);\n        int m, n;\n        if (cin >> m >> n) {\n            ${returnType === 'numbers' ? `vector<int> res = ${functionName}(strs, m, n);\n            for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n            cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(strs, m, n) ? "true" : "false"` : `${functionName}(strs, m, n)`}) << endl;`}\n        }\n    }\n    return 0;\n}`;
  } else if (signature === 'graph') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(int n, vector<vector<int>>& edges) {\n    // Write your code here\n    \n}\n\nint main() {\n    int n, m;\n    if (cin >> n >> m) {\n        vector<vector<int>> edges(m, vector<int>(2));\n        for (int i = 0; i < m; i++) {\n            cin >> edges[i][0] >> edges[i][1];\n        }\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(n, edges);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(n, edges) ? "true" : "false"` : `${functionName}(n, edges)`}) << endl;`}\n    }\n    return 0;\n}`;
  } else if (signature === 'weighted_graph') {
    templates.cpp = `${cppHeader}${cppRet} ${functionName}(int n, vector<vector<int>>& edges) {\n    // Write your code here\n    \n}\n\nint main() {\n    int n, m;\n    if (cin >> n >> m) {\n        vector<vector<int>> edges(m, vector<int>(3));\n        for (int i = 0; i < m; i++) {\n            cin >> edges[i][0] >> edges[i][1] >> edges[i][2];\n        }\n        ${returnType === 'numbers' ? `vector<int> res = ${functionName}(n, edges);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n        cout << endl;` : `cout << (${returnType === 'boolean' ? `${functionName}(n, edges) ? "true" : "false"` : `${functionName}(n, edges)`}) << endl;`}\n    }\n    return 0;\n}`;
  }

  // 4. Java
  const javaRet = returnType === 'numbers' ? 'int[]' : returnType === 'string' ? 'String' : returnType === 'boolean' ? 'boolean' : 'long';

  if (signature === 'number') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(long n) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            long n = Long.parseLong(line.trim());\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(n);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(n));`}\n        }\n    }\n}`;
  } else if (signature === 'two_numbers') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int a, int b) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int a = Integer.parseInt(parts[0]);\n            int b = Integer.parseInt(parts[1]);\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(a, b);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(a, b));`}\n        }\n    }\n}`;
  } else if (signature === 'numbers' || signature === 'numbers_to_array') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int[] nums) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) {\n                nums[i] = Integer.parseInt(parts[i]);\n            }\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(nums);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(nums));`}\n        }\n    }\n}`;
  } else if (signature === 'array_target') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int[] nums, int target) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        if (line1 != null) {\n            String[] parts = line1.trim().split("\\\\s+");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) {\n                nums[i] = Integer.parseInt(parts[i]);\n            }\n            String line2 = br.readLine();\n            if (line2 != null) {\n                int target = Integer.parseInt(line2.trim());\n                ${returnType === 'numbers' ? `int[] res = ${functionName}(nums, target);\n                StringBuilder sb = new StringBuilder();\n                for (int i = 0; i < res.length; i++) {\n                    sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n                }\n                System.out.println(sb.toString());` : `System.out.println(${functionName}(nums, target));`}\n            }\n        }\n    }\n}`;
  } else if (signature === 'string') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(String s) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) line = "";\n        ${returnType === 'numbers' ? `int[] res = ${functionName}(line);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < res.length; i++) {\n            sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n        }\n        System.out.println(sb.toString());` : `System.out.println(${functionName}(line));`}\n    }\n}`;
  } else if (signature === 'two_strings') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(String s1, String s2) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        String line2 = br.readLine();\n        if (line1 != null && line2 != null) {\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(line1.trim(), line2.trim());\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(line1.trim(), line2.trim()));`}\n        }\n    }\n}`;
  } else if (signature === 'matrix') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int[][] matrix) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int r = Integer.parseInt(parts[0]);\n            int c = Integer.parseInt(parts[1]);\n            int[][] matrix = new int[r][c];\n            int idx = 2;\n            for (int i = 0; i < r; i++) {\n                for (int j = 0; j < c; j++) {\n                    matrix[i][j] = Integer.parseInt(parts[idx++]);\n                }\n            }\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(matrix);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(matrix));`}\n        }\n    }\n}`;
  } else if (signature === 'triangle') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(List<List<Integer>> triangle) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int n = Integer.parseInt(parts[0]);\n            List<List<Integer>> triangle = new ArrayList<>();\n            int idx = 1;\n            for (int i = 0; i < n; i++) {\n                List<Integer> row = new ArrayList<>();\n                for (int j = 0; j <= i; j++) {\n                    row.add(Integer.parseInt(parts[idx++]));\n                }\n                triangle.add(row);\n            }\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(triangle);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(triangle));`}\n        }\n    }\n}`;
  } else if (signature === 'find_paths') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int m, int n, int maxMove, int startRow, int startCol) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int m = Integer.parseInt(parts[0]);\n            int n = Integer.parseInt(parts[1]);\n            int maxMove = Integer.parseInt(parts[2]);\n            int startRow = Integer.parseInt(parts[3]);\n            int startCol = Integer.parseInt(parts[4]);\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(m, n, maxMove, startRow, startCol);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(m, n, maxMove, startRow, startCol));`}\n        }\n    }\n}`;
  } else if (signature === 'knight_probability') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int N, int K, int r, int c) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int N = Integer.parseInt(parts[0]);\n            int K = Integer.parseInt(parts[1]);\n            int r = Integer.parseInt(parts[2]);\n            int c = Integer.parseInt(parts[3]);\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(N, K, r, c);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(N, K, r, c));`}\n        }\n    }\n}`;
  } else if (signature === 'two_arrays') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int[] arr1, int[] arr2) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        String line2 = br.readLine();\n        if (line1 != null && line2 != null) {\n            String[] parts1 = line1.trim().split("\\\\s+");\n            int[] arr1 = new int[parts1.length];\n            for (int i = 0; i < parts1.length; i++) arr1[i] = Integer.parseInt(parts1[i]);\n            String[] parts2 = line2.trim().split("\\\\s+");\n            int[] arr2 = new int[parts2.length];\n            for (int i = 0; i < parts2.length; i++) arr2[i] = Integer.parseInt(parts2[i]);\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(arr1, arr2);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(arr1, arr2));`}\n        }\n    }\n}`;
  } else if (signature === 'string_array') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(String s, List<String> wordDict) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        String line2 = br.readLine();\n        if (line1 != null && line2 != null) {\n            String s = line1.trim();\n            String[] parts = line2.trim().split("\\\\s+");\n            List<String> wordDict = Arrays.asList(parts);\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(s, wordDict);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(s, wordDict));`}\n        }\n    }\n}`;
  } else if (signature === 'find_max_form') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(String[] strs, int m, int n) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        String line2 = br.readLine();\n        if (line1 != null && line2 != null) {\n            String[] strs = line1.trim().split("\\\\s+");\n            String[] parts2 = line2.trim().split("\\\\s+");\n            int m = Integer.parseInt(parts2[0]);\n            int n = Integer.parseInt(parts2[1]);\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(strs, m, n);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(strs, m, n));`}\n        }\n    }\n}`;
  } else if (signature === 'graph') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int n, int[][] edges) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int n = Integer.parseInt(parts[0]);\n            int m = Integer.parseInt(parts[1]);\n            int[][] edges = new int[m][2];\n            for (int i = 0; i < m; i++) {\n                edges[i][0] = Integer.parseInt(parts[2 + 2*i]);\n                edges[i][1] = Integer.parseInt(parts[2 + 2*i + 1]);\n            }\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(n, edges);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(n, edges));`}\n        }\n    }\n}`;
  } else if (signature === 'weighted_graph') {
    templates.java = `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static ${javaRet} ${functionName}(int n, int[][] edges) {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null) {\n            String[] parts = line.trim().split("\\\\s+");\n            int n = Integer.parseInt(parts[0]);\n            int m = Integer.parseInt(parts[1]);\n            int[][] edges = new int[m][3];\n            for (int i = 0; i < m; i++) {\n                edges[i][0] = Integer.parseInt(parts[2 + 3*i]);\n                edges[i][1] = Integer.parseInt(parts[2 + 3*i + 1]);\n                edges[i][2] = Integer.parseInt(parts[2 + 3*i + 2]);\n            }\n            ${returnType === 'numbers' ? `int[] res = ${functionName}(n, edges);\n            StringBuilder sb = new StringBuilder();\n            for (int i = 0; i < res.length; i++) {\n                sb.append(res[i]).append(i == res.length - 1 ? "" : " ");\n            }\n            System.out.println(sb.toString());` : `System.out.println(${functionName}(n, edges));`}\n        }\n    }\n}`;
  }

  return templates;
}

// Simple JS Primality checker helper
function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Simple GCD helper
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// Main list of specs builder
const problemSpecs = [];

// --- GROUP 1: MATH PROBLEMS (1 to 25) ---
const mathTitles = [
  "Nth Fibonacci Number", "Factorial of N", "Sum of Natural Numbers", "Sum of Squares", 
  "Prime Number Validation", "Count Primes Up to N", "Greatest Common Divisor", "Least Common Multiple",
  "Power of Three Check", "Power of Four Check", "Perfect Number Verification", "Armstrong Number Check",
  "Sum of Digits", "Product of Digits", "Divisors Count", "Count Binary Set Bits",
  "Reverse Integer Digits", "Palindrome Number Check", "Convert to Base Seven", "Happy Number Check",
  "Collatz Sequence Length", "Celsius to Fahrenheit Converter", "Circle Area Calculator", "Sum of Odd Digits",
  "Sum of Even Digits"
];

const mathFunctions = [
  "nthFibonacci", "factorial", "sumOfNatural", "sumOfSquares", 
  "isPrimeNumber", "countPrimes", "findGcd", "findLcm",
  "isPowerOfThree", "isPowerOfFour", "isPerfectNumber", "isArmstrongNumber",
  "sumOfDigits", "productOfDigits", "divisorsCount", "countSetBits",
  "reverseInteger", "isPalindromeNumber", "toBaseSeven", "isHappyNumber",
  "collatzLength", "celsiusToFahrenheit", "circleArea", "sumOfOddDigits",
  "sumOfEvenDigits"
];

const mathTags = [
  ["Math", "Recursion"], ["Math"], ["Math", "Algorithms"], ["Math"],
  ["Math", "Primes"], ["Math", "Algorithms"], ["Math"], ["Math"],
  ["Math"], ["Math"], ["Math"], ["Math"],
  ["Math"], ["Math"], ["Math"], ["Math", "Binary"],
  ["Math"], ["Math"], ["Math"], ["Math"],
  ["Math"], ["Math"], ["Math"], ["Math"],
  ["Math"]
];

const mathReturns = [
  "number", "number", "number", "number", 
  "boolean", "number", "number", "number",
  "boolean", "boolean", "boolean", "boolean",
  "number", "number", "number", "number",
  "number", "boolean", "string", "boolean",
  "number", "number", "number", "number",
  "number"
];

// Populate GROUP 1
const mathDifficulty = [
  "Easy", "Easy", "Easy", "Easy", "Easy", "Medium", "Easy", "Easy",
  "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy",
  "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy",
  "Easy"
];

for (let i = 0; i < 25; i++) {
  const isLcmGcd = (mathFunctions[i] === "findGcd" || mathFunctions[i] === "findLcm");
  problemSpecs.push({
    title: mathTitles[i],
    slug: mathTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    difficulty: mathDifficulty[i],
    tags: mathTags[i],
    description: `Evaluate mathematical functions for given input configurations. For '${mathTitles[i]}', write an algorithm that calculates the expected outcome based on constraints.`,
    inputFormat: isLcmGcd ? "A single line containing two space-separated integers A and B." : "A single line containing an integer N.",
    outputFormat: mathReturns[i] === "boolean" ? "Print 'true' or 'false'." : "Print the computed result.",
    constraints: mathFunctions[i] === "nthFibonacci" ? "• `0 <= N <= 92`" : "• `0 <= N <= 10^5`",
    signature: isLcmGcd ? "numbers" : "number",
    returnType: mathReturns[i],
    functionName: mathFunctions[i],
    generateInput: (idx) => {
      if (isLcmGcd) {
        return `${idx + 10} ${idx + 25}`;
      }
      if (mathFunctions[i] === "nthFibonacci") {
        return `${idx % 93}`;
      }
      return `${idx + 1}`;
    },
    solve: (inputStr) => {
      if (isLcmGcd) {
        const [a, b] = inputStr.split(" ").map(Number);
        if (mathFunctions[i] === "findGcd") return `${gcd(a, b)}`;
        return `${(a * b) / gcd(a, b)}`;
      }
      const n = parseInt(inputStr.trim());
      switch (mathFunctions[i]) {
        case "nthFibonacci":
          let a = 0n, b = 1n;
          for (let k = 0n; k < BigInt(n); k++) {
            let next = a + b;
            a = b;
            b = next;
          }
          return `${a}`;
        case "factorial":
          let fact = 1;
          for (let k = 2; k <= Math.min(n, 20); k++) fact *= k;
          return `${fact}`;
        case "sumOfNatural":
          return `${(n * (n + 1)) / 2}`;
        case "sumOfSquares":
          return `${(n * (n + 1) * (2 * n + 1)) / 6}`;
        case "isPrimeNumber":
          return `${isPrime(n)}`;
        case "countPrimes":
          let count = 0;
          for (let k = 2; k <= n; k++) {
            if (isPrime(k)) count++;
          }
          return `${count}`;
        case "isPowerOfThree":
          let val3 = n;
          while (val3 > 1 && val3 % 3 === 0) val3 /= 3;
          return `${val3 === 1}`;
        case "isPowerOfFour":
          let val4 = n;
          while (val4 > 1 && val4 % 4 === 0) val4 /= 4;
          return `${val4 === 1}`;
        case "isPerfectNumber":
          if (n <= 1) return "false";
          let sum = 1;
          for (let k = 2; k <= Math.sqrt(n); k++) {
            if (n % k === 0) {
              sum += k;
              if (k !== n / k) sum += n / k;
            }
          }
          return `${sum === n}`;
        case "isArmstrongNumber":
          const digits = String(n).split("").map(Number);
          const power = digits.length;
          const armstrongSum = digits.reduce((acc, d) => acc + Math.pow(d, power), 0);
          return `${armstrongSum === n}`;
        case "sumOfDigits":
          return `${String(n).split("").reduce((acc, d) => acc + Number(d), 0)}`;
        case "productOfDigits":
          return `${String(n).split("").reduce((acc, d) => acc * Number(d), 1)}`;
        case "divisorsCount":
          let divCount = 0;
          for (let k = 1; k <= n; k++) {
            if (n % k === 0) divCount++;
          }
          return `${divCount}`;
        case "countSetBits":
          return `${n.toString(2).split("1").length - 1}`;
        case "reverseInteger":
          const rev = parseInt(String(n).split("").reverse().join(""));
          return `${rev}`;
        case "isPalindromeNumber":
          return `${String(n) === String(n).split("").reverse().join("")}`;
        case "toBaseSeven":
          return n.toString(7);
        case "isHappyNumber":
          let slow = n;
          let fast = n;
          const sumSq = (num) => String(num).split("").reduce((acc, d) => acc + Number(d)*Number(d), 0);
          do {
            slow = sumSq(slow);
            fast = sumSq(sumSq(fast));
          } while (slow !== fast);
          return `${slow === 1}`;
        case "collatzLength":
          let val = n;
          let steps = 0;
          while (val > 1) {
            if (val % 2 === 0) val /= 2;
            else val = 3 * val + 1;
            steps++;
          }
          return `${steps}`;
        case "celsiusToFahrenheit":
          return `${Math.round(n * 1.8 + 32)}`;
        case "circleArea":
          return `${Math.round(Math.PI * n * n)}`;
        case "sumOfOddDigits":
          return `${String(n).split("").map(Number).filter(d => d % 2 !== 0).reduce((acc, d) => acc + d, 0)}`;
        case "sumOfEvenDigits":
          return `${String(n).split("").map(Number).filter(d => d % 2 === 0).reduce((acc, d) => acc + d, 0)}`;
        default:
          return "0";
      }
    }
  });
}

// --- GROUP 2: STRING PROBLEMS (26 to 50) ---
const stringTitles = [
  "Reverse Character Sequence", "Vowels Counter", "Consonants Counter", "Remove Vowels",
  "Capitalize String", "IP Address Defanger", "Anagram Validation", "First Unique Character Index",
  "Ransom Note Builder", "Sentence Truncator", "Capital Use Checker", "Halves Alike Checker",
  "Keyboard Single Row Matcher", "Alphanumeric Palindrome Check", "Prefix Word Counter",
  "Replace Digits with Shifted Chars", "Goal Parser Decoder", "String Equivalency Test",
  "Merge Alternately", "Permutation Index Difference", "ASCII Character Distance Score",
  "Sentence Words Reverser", "String Expansion", "Character Frequency Count",
  "Remove Duplicate Characters"
];

const stringFunctions = [
  "reverseString", "countVowels", "countConsonants", "removeVowels",
  "capitalizeString", "defangIp", "isValidAnagram", "firstUniqChar",
  "canConstructRansom", "truncateSentence", "detectCapitalUse", "halvesAreAlike",
  "findWordsSingleRow", "isPalindromeString", "prefixCount",
  "replaceDigits", "goalParser", "arrayStringsAreEqual",
  "mergeAlternately", "permutationDifference", "scoreOfString",
  "reverseWords", "expandString", "frequencyCount",
  "removeDuplicateChars"
];

const stringReturns = [
  "string", "number", "number", "string",
  "string", "string", "boolean", "number",
  "boolean", "string", "boolean", "boolean",
  "string", "boolean", "number",
  "string", "string", "boolean",
  "string", "number", "number",
  "string", "string", "string",
  "string"
];

const stringDifficulty = Array(25).fill("Easy");

for (let i = 0; i < 25; i++) {
  const isTwoStr = ["isValidAnagram", "canConstructRansom", "arrayStringsAreEqual", "mergeAlternately"].includes(stringFunctions[i]);
  problemSpecs.push({
    title: stringTitles[i],
    slug: stringTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    difficulty: stringDifficulty[i],
    tags: ["String", ["isValidAnagram", "canConstructRansom"].includes(stringFunctions[i]) ? "Hash Table" : "Simulation"],
    description: `Perform text formatting, scanning, and decoding operations on inputs. For '${stringTitles[i]}', write a string manipulation algorithm.`,
    inputFormat: isTwoStr ? "Line 1: String A.\nLine 2: String B." : "A single line containing the input text.",
    outputFormat: stringReturns[i] === "boolean" ? "Print 'true' or 'false'." : "Print the processed text or index count.",
    constraints: "• `1 <= s.length <= 10^3`",
    signature: isTwoStr ? "two_strings" : "string",
    returnType: stringReturns[i],
    functionName: stringFunctions[i],
    generateInput: (idx) => {
      if (isTwoStr) {
        if (stringFunctions[i] === "isValidAnagram") return `listen\nsilent`;
        if (stringFunctions[i] === "canConstructRansom") return `a\naab`;
        return `abc\ndef`;
      }
      if (stringFunctions[i] === "defangIp") return `192.168.1.${idx}`;
      return `CodeplexTestingString${idx}`;
    },
    solve: (inputStr) => {
      if (isTwoStr) {
        const lines = inputStr.trim().split("\n");
        const s1 = lines[0] ? lines[0].trim() : "";
        const s2 = lines[1] ? lines[1].trim() : "";
        if (stringFunctions[i] === "isValidAnagram") {
          return `${s1.split("").sort().join("") === s2.split("").sort().join("")}`;
        }
        if (stringFunctions[i] === "canConstructRansom") {
          const map = {};
          for (const char of s2) map[char] = (map[char] || 0) + 1;
          for (const char of s1) {
            if (!map[char]) return "false";
            map[char]--;
          }
          return "true";
        }
        if (stringFunctions[i] === "arrayStringsAreEqual") {
          return `${s1 === s2}`;
        }
        if (stringFunctions[i] === "mergeAlternately") {
          let res = "";
          for (let k = 0; k < Math.max(s1.length, s2.length); k++) {
            if (k < s1.length) res += s1[k];
            if (k < s2.length) res += s2[k];
          }
          return res;
        }
      }
      const s = inputStr.trim();
      const vowels = new Set(["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]);
      switch (stringFunctions[i]) {
        case "reverseString":
          return s.split("").reverse().join("");
        case "countVowels":
          return `${s.split("").filter(c => vowels.has(c)).length}`;
        case "countConsonants":
          return `${s.split("").filter(c => !vowels.has(c) && /[a-zA-Z]/.test(c)).length}`;
        case "removeVowels":
          return s.split("").filter(c => !vowels.has(c)).join("");
        case "capitalizeString":
          return s.toUpperCase();
        case "defangIp":
          return s.split(".").join("[.]");
        case "firstUniqChar":
          const counts = {};
          for (const c of s) counts[c] = (counts[c] || 0) + 1;
          for (let k = 0; k < s.length; k++) {
            if (counts[s[k]] === 1) return `${k}`;
          }
          return "-1";
        case "truncateSentence":
          return s.split(" ").slice(0, 3).join(" ");
        case "detectCapitalUse":
          return `${s === s.toUpperCase() || s === s.toLowerCase() || (s[0] === s[0].toUpperCase() && s.slice(1) === s.slice(1).toLowerCase())}`;
        case "halvesAreAlike":
          const half = s.length / 2;
          const a = s.slice(0, half).split("").filter(c => vowels.has(c)).length;
          const b = s.slice(half).split("").filter(c => vowels.has(c)).length;
          return `${a === b}`;
        case "findWordsSingleRow":
          return s.toLowerCase();
        case "isPalindromeString":
          const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
          return `${clean === clean.split("").reverse().join("")}`;
        case "prefixCount":
          return `${s.startsWith("Code") ? 1 : 0}`;
        case "replaceDigits":
          return s.replace(/\d/g, "x");
        case "goalParser":
          return s.replace(/\(\)/g, "o").replace(/\(al\)/g, "al");
        case "permutationDifference":
          return "0";
        case "scoreOfString":
          let score = 0;
          for (let k = 0; k < s.length - 1; k++) {
            score += Math.abs(s.charCodeAt(k) - s.charCodeAt(k + 1));
          }
          return `${score}`;
        case "reverseWords":
          return s.split(" ").map(w => w.split("").reverse().join("")).join(" ");
        case "expandString":
          return s + s;
        case "frequencyCount":
          return `${s.length}`;
        case "removeDuplicateChars":
          return Array.from(new Set(s.split(""))).join("");
        default:
          return s;
      }
    }
  });
}

// --- GROUP 3: ARRAY PROBLEMS (51 to 75) ---
const arrayTitles = [
  "Running Sum of Array", "Move Zeroes to End", "Array Contains Duplicate", "Majority Element Finder",
  "Third Maximum Distinct Value", "Squares of Sorted Array", "Kids Candies Tracker", "Richest Customer Wealth",
  "Shuffle Array Indexes", "Count Good Pairs", "Decompress Encoded List", "Smaller Numbers Count",
  "Array Concatenator", "Odd Length Subarrays Sum", "Array Pivot Index Finder", "Max Element Product",
  "Parity Sorter", "Max Subarray Sum", "Array Elements Intersection", "Array Union Builder",
  "Distribute Candies Maximum", "Array Monotonic Test", "Find Missing Number", "Mountain Peak Index Finder",
  "Find All Duplicate Elements"
];

const arrayFunctions = [
  "runningSum", "moveZeroes", "containsDuplicate", "majorityElement",
  "thirdMax", "sortedSquares", "kidsWithCandies", "maximumWealth",
  "shuffleArray", "numIdenticalPairs", "decompressRleList", "smallerNumbersThanCurrent",
  "getConcatenation", "sumOddLengthSubarrays", "pivotIndex", "maxProduct",
  "sortArrayByParity", "maxSubArray", "intersection", "unionArrays",
  "distributeCandies", "isMonotonic", "missingNumber", "peakIndexInMountainArray",
  "findDuplicates"
];

const arrayReturns = [
  "numbers", "numbers", "boolean", "number",
  "number", "numbers", "numbers", "number",
  "numbers", "number", "numbers", "numbers",
  "numbers", "number", "number", "number",
  "numbers", "number", "numbers", "numbers",
  "number", "boolean", "number", "number",
  "numbers"
];

const arrayDifficulty = [
  "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy",
  "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy",
  "Easy", "Medium", "Easy", "Easy", "Easy", "Easy", "Easy", "Easy",
  "Medium"
];

for (let i = 0; i < 25; i++) {
  problemSpecs.push({
    title: arrayTitles[i],
    slug: arrayTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    difficulty: arrayDifficulty[i],
    tags: ["Array", ["containsDuplicate", "majorityElement", "intersection", "unionArrays"].includes(arrayFunctions[i]) ? "Hash Table" : "Simulation"],
    description: `Evaluate standard array manipulations, searches, and accumulation functions. For '${arrayTitles[i]}', implement the target logic.`,
    inputFormat: "A single line containing space-separated integers representing the array nums.",
    outputFormat: arrayReturns[i] === "numbers" ? "Space-separated values." : arrayReturns[i] === "boolean" ? "Print 'true' or 'false'." : "Print the computed result.",
    constraints: "• `1 <= nums.length <= 10^3`",
    signature: "numbers",
    returnType: arrayReturns[i],
    functionName: arrayFunctions[i],
    generateInput: (idx) => {
      if (arrayFunctions[i] === "missingNumber") {
        return Array.from({ length: idx + 5 }, (_, k) => k).filter(x => x !== 3).join(" ");
      }
      if (arrayFunctions[i] === "containsDuplicate" && idx % 2 === 0) {
        return `${idx} ${idx} ${idx + 1}`;
      }
      return Array.from({ length: 5 + idx % 10 }, (_, k) => k + 1).join(" ");
    },
    solve: (inputStr) => {
      const nums = inputStr.split(/\s+/).map(Number);
      switch (arrayFunctions[i]) {
        case "runningSum":
          let sum = 0;
          return nums.map(x => sum += x).join(" ");
        case "moveZeroes":
          const nonZero = nums.filter(x => x !== 0);
          const zeroes = nums.filter(x => x === 0);
          return [...nonZero, ...zeroes].join(" ");
        case "containsDuplicate":
          return `${new Set(nums).size !== nums.length}`;
        case "majorityElement":
          const counts = {};
          for (const x of nums) {
            counts[x] = (counts[x] || 0) + 1;
            if (counts[x] > nums.length / 2) return `${x}`;
          }
          return `${nums[0]}`;
        case "thirdMax":
          const uniq = Array.from(new Set(nums)).sort((a, b) => b - a);
          return `${uniq.length >= 3 ? uniq[2] : uniq[0]}`;
        case "sortedSquares":
          return nums.map(x => x * x).sort((a, b) => a - b).join(" ");
        case "kidsWithCandies":
          const maxVal = Math.max(...nums);
          return nums.map(x => (x + 3 >= maxVal ? 1 : 0)).join(" ");
        case "maximumWealth":
          return `${Math.max(...nums)}`;
        case "shuffleArray":
          return nums.join(" ");
        case "numIdenticalPairs":
          let pairs = 0;
          for (let a = 0; a < nums.length; a++) {
            for (let b = a + 1; b < nums.length; b++) {
              if (nums[a] === nums[b]) pairs++;
            }
          }
          return `${pairs}`;
        case "decompressRleList":
          const rleRes = [];
          for (let k = 0; k < nums.length; k += 2) {
            const freq = nums[k];
            const val = nums[k + 1] !== undefined ? nums[k + 1] : 1;
            for (let f = 0; f < Math.min(freq, 20); f++) rleRes.push(val);
          }
          return rleRes.join(" ");
        case "smallerNumbersThanCurrent":
          return nums.map(x => nums.filter(y => y < x).length).join(" ");
        case "getConcatenation":
          return [...nums, ...nums].join(" ");
        case "sumOddLengthSubarrays":
          let oddSum = 0;
          for (let len = 1; len <= nums.length; len += 2) {
            for (let start = 0; start <= nums.length - len; start++) {
              for (let k = start; k < start + len; k++) oddSum += nums[k];
            }
          }
          return `${oddSum}`;
        case "pivotIndex":
          let total = nums.reduce((a, b) => a + b, 0);
          let leftSum = 0;
          for (let k = 0; k < nums.length; k++) {
            if (leftSum === total - leftSum - nums[k]) return `${k}`;
            leftSum += nums[k];
          }
          return "-1";
        case "maxProduct":
          const sorted = [...nums].sort((a, b) => b - a);
          return `${(sorted[0] - 1) * (sorted[1] - 1)}`;
        case "sortArrayByParity":
          const evens = nums.filter(x => x % 2 === 0);
          const odds = nums.filter(x => x % 2 !== 0);
          return [...evens, ...odds].join(" ");
        case "maxSubArray":
          let maxSoFar = nums[0];
          let currMax = nums[0];
          for (let k = 1; k < nums.length; k++) {
            currMax = Math.max(nums[k], currMax + nums[k]);
            maxSoFar = Math.max(maxSoFar, currMax);
          }
          return `${maxSoFar}`;
        case "intersection":
          return Array.from(new Set(nums)).join(" ");
        case "unionArrays":
          return Array.from(new Set([...nums])).join(" ");
        case "distributeCandies":
          return `${Math.min(new Set(nums).size, nums.length / 2)}`;
        case "isMonotonic":
          let inc = true, dec = true;
          for (let k = 0; k < nums.length - 1; k++) {
            if (nums[k] > nums[k + 1]) inc = false;
            if (nums[k] < nums[k + 1]) dec = false;
          }
          return `${inc || dec}`;
        case "missingNumber":
          const n = nums.length + 1;
          const expectedSum = (n * (n + 1)) / 2;
          const actualSum = nums.reduce((a, b) => a + b, 0);
          return `${expectedSum - actualSum}`;
        case "peakIndexInMountainArray":
          return `${nums.indexOf(Math.max(...nums))}`;
        case "findDuplicates":
          const seen = new Set();
          const dups = new Set();
          for (const x of nums) {
            if (seen.has(x)) dups.add(x);
            seen.add(x);
          }
          return Array.from(dups).join(" ");
        default:
          return nums.join(" ");
      }
    }
  });
}

// --- GROUP 4: LOGIC AND COMPLEX PROBLEMS (76 to 100) ---
const logicTitles = [
  "Two Sum Sorted Target", "Brackets Structure Validation", "Stair Climbing Permutations", "Leap Year Calculator",
  "Triangle Type Checker", "Product Sign Evaluator", "Reduction Steps Count", "Fizz Buzz List Classic",
  "Divisibility Sum Difference", "Sum of Digits in Base K", "Binary String Adder", "Array Element Single Match",
  "Minimum Split Digits Sum", "Truncate Words Sentence", "Defuse Circular Bomb", "Max Sentence Word Count",
  "Self Dividing Range Values", "Single Keyboard Row Finder", "Sorted Array Merge", "Increment Number Digits",
  "Parity Indexes Matcher", "Filter Array Element Out", "Excel Columns Title Finder", "Excel Column String Index",
  "Fibonacci Terms List"
];

const logicFunctions = [
  "twoSumSorted", "isValidBrackets", "climbStairs", "isLeapYear",
  "checkTriangleType", "arraySign", "numberOfSteps", "fizzBuzzClassic",
  "differenceOfSums", "sumBaseDigits", "addBinary", "singleNumberMatch",
  "minimumSum", "truncateSentenceString", "defuseBomb", "mostWordsFound",
  "selfDividingRange", "findRowWords", "mergeSortedArrays", "plusOneDigits",
  "parityMatcher", "removeElementValue", "convertToTitle", "titleToNumber",
  "fibonacciList"
];

const logicReturns = [
  "numbers", "boolean", "number", "boolean",
  "string", "number", "number", "numbers",
  "number", "number", "string", "number",
  "number", "string", "numbers", "number",
  "numbers", "numbers", "numbers", "numbers",
  "numbers", "number", "string", "number",
  "numbers"
];

const logicSignatures = [
  "array_target", "string", "number", "number",
  "numbers", "numbers", "number", "number",
  "two_numbers", "two_numbers", "two_strings", "numbers",
  "number", "string", "array_target", "string",
  "two_numbers", "string", "numbers", "numbers",
  "numbers", "array_target", "number", "string",
  "number"
];

const logicDifficulty = Array(25).fill("Easy");

for (let i = 0; i < 25; i++) {
  problemSpecs.push({
    title: logicTitles[i],
    slug: logicTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    difficulty: logicDifficulty[i],
    tags: [
      "Algorithms", 
      logicFunctions[i] === "isValidBrackets" ? "Stack" : 
      logicFunctions[i] === "climbStairs" ? "Dynamic Programming" : 
      logicFunctions[i] === "twoSumSorted" ? "Two Pointers" : 
      "Logic"
    ],
    description: `Evaluate general algorithmic constraints and conditions. For '${logicTitles[i]}', follow instructions in description.`,
    inputFormat: logicSignatures[i] === "array_target" ? "Line 1: space-separated integers.\nLine 2: Target integer." : logicSignatures[i] === "two_strings" ? "Line 1: Binary A.\nLine 2: Binary B." : "A single line input format.",
    outputFormat: logicReturns[i] === "numbers" ? "Space-separated values." : logicReturns[i] === "boolean" ? "Print 'true' or 'false'." : "Print result string or value.",
    constraints: "• `0 <= input <= 10^4`",
    signature: logicSignatures[i],
    returnType: logicReturns[i],
    functionName: logicFunctions[i],
    generateInput: (idx) => {
      const sig = logicSignatures[i];
      if (sig === "array_target") {
        if (logicFunctions[i] === "twoSumSorted") return `1 2 3 4 5\n5`;
        if (logicFunctions[i] === "defuseBomb") return `1 2 3 4\n2`;
        if (logicFunctions[i] === "removeElementValue") return `1 2 3 4\n2`;
        return `1 2 3 4\n2`;
      }
      if (sig === "two_strings") return `1010\n1011`;
      if (sig === "numbers") {
        if (logicFunctions[i] === "parityMatcher") return `4 2 5 7`;
        return `2 3 5 7`;
      }
      if (sig === "two_numbers") {
        if (logicFunctions[i] === "differenceOfSums") return `${(idx % 3) + 2} ${(idx % 10) + 10}`;
        if (logicFunctions[i] === "sumBaseDigits") return `${(idx % 100) + 10} ${(idx % 5) + 2}`;
        if (logicFunctions[i] === "selfDividingRange") return `${idx + 1} ${idx + 20}`;
        return `${idx + 10} ${idx + 20}`;
      }
      if (logicFunctions[i] === "isValidBrackets") return "()[]{}";
      if (logicFunctions[i] === "minimumSum") return `${(idx * 17) % 9000 + 1000}`;
      if (logicFunctions[i] === "truncateSentenceString") return "hello world this is a test sentence";
      if (logicFunctions[i] === "mostWordsFound") return "Alice and Bob love LeetCode\nI think so too\nthis is great thanks very much";
      if (logicFunctions[i] === "findRowWords") return "Hello Alaska Dad Peace";
      return `${idx + 10}`;
    },
    solve: (inputStr) => {
      const sig = logicSignatures[i];
      if (sig === "array_target") {
        const lines = inputStr.trim().split("\n");
        const nums = lines[0].split(/\s+/).map(Number);
        const target = parseInt(lines[1]);
        if (logicFunctions[i] === "twoSumSorted") {
          let left = 0, right = nums.length - 1;
          while (left < right) {
            const sum = nums[left] + nums[right];
            if (sum === target) return `${left + 1} ${right + 1}`;
            else if (sum < target) left++;
            else right--;
          }
          return "1 2";
        }
        return `${nums.filter(x => x !== target).length}`;
      }
      if (sig === "two_strings") {
        const lines = inputStr.trim().split("\n");
        const a = lines[0].trim();
        const b = lines[1].trim();
        return `${(parseInt(a, 2) + parseInt(b, 2)).toString(2)}`;
      }
      
      const n = parseInt(inputStr.trim());
      switch (logicFunctions[i]) {
        case "isValidBrackets":
          const stack = [];
          const map = { ')': '(', '}': '{', ']': '[' };
          for (const char of inputStr.trim()) {
            if (["(", "{", "["].includes(char)) stack.push(char);
            else if (stack.pop() !== map[char]) return "false";
          }
          return `${stack.length === 0}`;
        case "climbStairs":
          let ways = [1, 1, 2];
          for (let k = 3; k <= Math.min(n, 40); k++) ways[k] = ways[k - 1] + ways[k - 2];
          return `${ways[Math.min(n, 40)]}`;
        case "isLeapYear":
          return `${(n % 4 === 0 && n % 100 !== 0) || (n % 400 === 0)}`;
        case "checkTriangleType":
          const sides = inputStr.trim().split(/\s+/).map(Number);
          if (sides.length < 3) return "Invalid";
          const [s1, s2, s3] = sides.sort((x, y) => x - y);
          if (s1 + s2 <= s3) return "Invalid";
          if (s1 === s2 && s2 === s3) return "Equilateral";
          if (s1 === s2 || s2 === s3) return "Isosceles";
          return "Scalene";
        case "arraySign":
          const prodNums = inputStr.trim().split(/\s+/).map(Number);
          let negs = 0;
          for (const x of prodNums) {
            if (x === 0) return "0";
            if (x < 0) negs++;
          }
          return `${negs % 2 === 0 ? 1 : -1}`;
        case "numberOfSteps":
          let steps = 0;
          let val = n;
          while (val > 0) {
            if (val % 2 === 0) val /= 2;
            else val -= 1;
            steps++;
          }
          return `${steps}`;
        case "fizzBuzzClassic":
          const fb = [];
          for (let k = 1; k <= n; k++) {
            if (k % 15 === 0) fb.push("FizzBuzz");
            else if (k % 3 === 0) fb.push("Fizz");
            else if (k % 5 === 0) fb.push("Buzz");
            else fb.push(String(k));
          }
          return fb.join(" ");
        case "differenceOfSums":
          const params = inputStr.trim().split(/\s+/).map(Number);
          const divisor = params[0] || 3;
          const limit = params[1] || 10;
          let divSum = 0, nonDivSum = 0;
          for (let k = 1; k <= limit; k++) {
            if (k % divisor === 0) divSum += k;
            else nonDivSum += k;
          }
          return `${nonDivSum - divSum}`;
        case "sumBaseDigits":
          const numsBase = inputStr.trim().split(/\s+/).map(Number);
          const num = numsBase[0] || 10;
          const base = numsBase[1] || 2;
          return `${num.toString(base).split("").reduce((acc, d) => acc + parseInt(d, 36), 0)}`;
        case "singleNumberMatch":
          const singNums = inputStr.trim().split(/\s+/).map(Number);
          let xor = 0;
          for (const x of singNums) xor ^= x;
          return `${xor}`;
        case "minimumSum":
          return `${n}`;
        case "truncateSentenceString":
          return inputStr.trim();
        case "defuseBomb":
          return "1 2 3";
        case "mostWordsFound":
          return "3";
        case "minimumSum": {
          const digits = String(n).split("").map(Number).sort((a, b) => a - b);
          return `${(digits[0] * 10 + digits[2]) + (digits[1] * 10 + digits[3])}`;
        }
        case "truncateSentenceString":
          return inputStr.trim().split(/\s+/).slice(0, 3).join(" ");
        case "defuseBomb": {
          const lines = inputStr.trim().split("\n");
          const nums = lines[0].split(/\s+/).map(Number);
          const k = parseInt(lines[1]);
          const nLength = nums.length;
          const r = Array(nLength).fill(0);
          if (k === 0) return r.join(" ");
          for (let i = 0; i < nLength; i++) {
            let sum = 0;
            if (k > 0) {
              for (let j = 1; j <= k; j++) sum += nums[(i + j) % nLength];
            } else {
              for (let j = 1; j <= -k; j++) sum += nums[(i - j + nLength) % nLength];
            }
            r[i] = sum;
          }
          return r.join(" ");
        }
        case "mostWordsFound": {
          const sentences = inputStr.trim().split("\n");
          let maxWords = 0;
          for (const s of sentences) {
            maxWords = Math.max(maxWords, s.split(/\s+/).length);
          }
          return `${maxWords}`;
        }
        case "selfDividingRange": {
          const params = inputStr.trim().split(/\s+/).map(Number);
          const left = params[0] || 1;
          const right = params[1] || 22;
          const res = [];
          for (let val = left; val <= right; val++) {
            let temp = val;
            let selfDiv = true;
            while (temp > 0) {
              const d = temp % 10;
              if (d === 0 || val % d !== 0) { selfDiv = false; break; }
              temp = Math.floor(temp / 10);
            }
            if (selfDiv) res.push(val);
          }
          return res.join(" ");
        }
        case "findRowWords": {
          const words = inputStr.trim().split(/\s+/);
          const keyboardRows = [
            new Set("qwertyuiopQWERTYUIOP"),
            new Set("asdfghjklASDFGHJKL"),
            new Set("zxcvbnmZXCVBNM")
          ];
          const res = words.filter(word => {
            return keyboardRows.some(rowSet => {
              return word.split("").every(c => rowSet.has(c));
            });
          });
          return res.join(" ");
        }
        case "mergeSortedArrays":
          const toMerge = inputStr.trim().split(/\s+/).map(Number);
          return toMerge.sort((x, y) => x - y).join(" ");
        case "plusOneDigits": {
          const digitsList = inputStr.trim().split(/\s+/).map(Number);
          let carryVal = 1;
          for (let k = digitsList.length - 1; k >= 0; k--) {
            const sumVal = digitsList[k] + carryVal;
            digitsList[k] = sumVal % 10;
            carryVal = Math.floor(sumVal / 10);
          }
          if (carryVal > 0) digitsList.unshift(carryVal);
          return digitsList.join(" ");
        }
        case "parityMatcher": {
          const numsList = inputStr.trim().split(/\s+/).map(Number);
          const evens = numsList.filter(x => x % 2 === 0);
          const odds = numsList.filter(x => x % 2 !== 0);
          const resList = [];
          for (let k = 0; k < evens.length; k++) {
            resList.push(evens[k]);
            resList.push(odds[k]);
          }
          return resList.join(" ");
        }
        case "removeElementValue": {
          const lines = inputStr.trim().split("\n");
          const nums = lines[0].split(/\s+/).map(Number);
          const val = parseInt(lines[1]);
          const filtered = nums.filter(x => x !== val);
          return `${filtered.length}`;
        }
        case "convertToTitle":
          let col = n;
          let title = "";
          while (col > 0) {
            let rem = (col - 1) % 26;
            title = String.fromCharCode(65 + rem) + title;
            col = Math.floor((col - rem) / 26);
          }
          return title;
        case "titleToNumber":
          return `${inputStr.trim().split("").reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0)}`;
        case "fibonacciList":
          const fibs = [0, 1];
          for (let k = 2; k < Math.min(n, 20); k++) {
            fibs[k] = fibs[k - 1] + fibs[k - 2];
          }
          return fibs.slice(0, n).join(" ");
        default:
          return "0";
      }
    }
  });
}

// --- GROUP 5: DYNAMIC PROGRAMMING PROBLEMS (101 to 150) ---
const dpTitles = [
  "Min Cost Climbing Stairs", "House Robber Max Loot", "House Robber II Circular", "N-th Tribonacci Number",
  "Divisor Game Strategy", "Climbing Stairs Ways", "Unique Paths Grid", "Unique Paths II Obstacles",
  "Minimum Path Sum", "Triangle Minimum Path", "Decode Ways Count", "Perfect Squares Sum",
  "Coin Change Minimum", "Coin Change II Combinations", "Longest Increasing Subsequence", "Longest Common Subsequence Length",
  "Edit Distance Steps", "Word Break Segmentation", "Maximal Square Area", "Partition Equal Subset Sum",
  "Jump Game I Reachability", "Jump Game II Min Jumps", "Best Time to Buy Sell Stock I", "Best Time to Buy Sell Stock II",
  "Best Time to Buy Sell Stock III", "Best Time to Buy Sell Stock IV", "Best Time to Buy Sell Stock with Cooldown", "Best Time to Buy Sell Stock with Fee",
  "Pascals Triangle Row", "Is Subsequence Match", "Delete and Earn Points", "Integer Break Max Product",
  "Combinations Sum IV", "Out of Boundary Paths", "Knight Probability in Chessboard", "Arithmetic Slices Count",
  "Target Sum Ways", "Ones and Zeroes Max Subset", "Predict the Winner Game", "Minimum Falling Path Sum",
  "Max Length of Repeated Subarray", "Longest Palindromic Subsequence", "Minimum Cost For Tickets", "Last Stone Weight II DP",
  "Domino and Tromino Tiling", "Largest Divisible Subset", "Count Substrings Palindromic", "Ugly Number II Finder",
  "Super Ugly Number", "Wiggle Subsequence Max Length"
];

const dpFunctions = [
  "minCostClimbingStairs", "houseRobber", "houseRobberII", "tribonacci",
  "divisorGame", "climbStairsWays", "uniquePaths", "uniquePathsWithObstacles",
  "minPathSum", "minimumTotal", "numDecodings", "numSquares",
  "coinChange", "changeCombinations", "lengthOfLIS", "longestCommonSubsequence",
  "minDistance", "wordBreak", "maximalSquare", "canPartition",
  "canJump", "jumpGameII", "maxProfitI", "maxProfitII",
  "maxProfitIII", "maxProfitIV", "maxProfitWithCooldown", "maxProfitWithFee",
  "getRow", "isSubsequence", "deleteAndEarn", "integerBreak",
  "combinationSum4", "findPaths", "knightProbability", "numberOfArithmeticSlices",
  "findTargetSumWays", "findMaxForm", "PredictTheWinner", "minFallingPathSum",
  "findLengthRepeatedSubarray", "longestPalindromeSubseq", "mincostTickets", "lastStoneWeightII",
  "numTilings", "largestDivisibleSubset", "countSubstringsPalindromic", "nthUglyNumber",
  "nthSuperUglyNumber", "wiggleMaxLength"
];

const dpDifficulty = [
  "Easy", "Medium", "Medium", "Easy",
  "Easy", "Easy", "Medium", "Medium",
  "Medium", "Medium", "Medium", "Medium",
  "Medium", "Medium", "Medium", "Medium",
  "Hard", "Medium", "Medium", "Medium",
  "Medium", "Hard", "Easy", "Medium",
  "Hard", "Hard", "Medium", "Medium",
  "Easy", "Easy", "Medium", "Medium",
  "Medium", "Hard", "Medium", "Medium",
  "Medium", "Medium", "Medium", "Medium",
  "Medium", "Medium", "Medium", "Medium",
  "Medium", "Medium", "Medium", "Medium",
  "Medium", "Medium"
];

const dpReturns = [
  "number", "number", "number", "number",
  "boolean", "number", "number", "number",
  "number", "number", "number", "number",
  "number", "number", "number", "number",
  "number", "boolean", "number", "boolean",
  "boolean", "number", "number", "number",
  "number", "number", "number", "number",
  "numbers", "boolean", "number", "number",
  "number", "number", "number", "number",
  "number", "number", "boolean", "number",
  "number", "number", "number", "number",
  "number", "numbers", "number", "number",
  "number", "number"
];

const dpSignatures = [
  "numbers", "numbers", "numbers", "number",
  "number", "number", "two_numbers", "matrix",
  "matrix", "triangle", "string", "number",
  "array_target", "array_target", "numbers", "two_strings",
  "two_strings", "string_array", "matrix", "numbers",
  "numbers", "numbers", "numbers", "numbers",
  "numbers", "array_target", "numbers", "array_target",
  "number", "two_strings", "numbers", "number",
  "array_target", "find_paths", "knight_probability", "numbers",
  "array_target", "find_max_form", "numbers", "matrix",
  "two_arrays", "string", "two_arrays", "numbers",
  "number", "numbers", "string", "number",
  "array_target", "numbers"
];

for (let i = 0; i < 50; i++) {
  problemSpecs.push({
    title: dpTitles[i],
    slug: dpTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    difficulty: dpDifficulty[i],
    tags: ["Dynamic Programming"],
    description: `Solve the dynamic programming challenge: ${dpTitles[i]}. Optimize time and space complexities to pass the rigorous test cases.`,
    inputFormat: dpSignatures[i] === "array_target" ? "Line 1: space-separated integers.\nLine 2: Target integer." : dpSignatures[i] === "two_strings" ? "Line 1: String A.\nLine 2: String B." : "Single/multi-line formatting depending on input constraints.",
    outputFormat: dpReturns[i] === "boolean" ? "Print 'true' or 'false'." : "Print the computed optimal result.",
    constraints: "• `0 <= N <= 10^4`",
    signature: dpSignatures[i],
    returnType: dpReturns[i],
    functionName: dpFunctions[i],
    generateInput: (t) => {
      const signature = dpSignatures[i];
      const functionName = dpFunctions[i];
      
      // Special functions
      if (functionName === 'uniquePaths') {
        const m = (t % 5) + 3;
        const n = (t % 5) + 3;
        return `${m} ${n}`;
      }
      if (['uniquePathsWithObstacles', 'minPathSum', 'maximalSquare', 'minFallingPathSum'].includes(functionName)) {
        const r = (t % 3) + 3; // 3 to 5
        const c = (t % 3) + 3; // 3 to 5
        const size = r * c;
        const gridVals = Array.from({ length: size }, (_, k) => {
          if (functionName === 'uniquePathsWithObstacles') {
            return (k + t) % 6 === 0 ? 1 : 0;
          }
          if (functionName === 'maximalSquare') {
            return (k + t) % 4 === 0 ? 0 : 1;
          }
          return (k + t) % 10 + 1;
        });
        return `${r} ${c} ` + gridVals.join(" ");
      }
      if (functionName === 'minimumTotal') {
        const n = (t % 3) + 3; // 3 to 5
        const totalElements = (n * (n + 1)) / 2;
        const vals = Array.from({ length: totalElements }, (_, k) => (k + t) % 9 + 1);
        return `${n} ` + vals.join(" ");
      }
      if (functionName === 'findPaths') {
        const m = (t % 2) + 3; // 3 to 4
        const n = (t % 2) + 3; // 3 to 4
        const maxMove = (t % 3) + 2;
        const startRow = t % m;
        const startCol = t % n;
        return `${m} ${n} ${maxMove} ${startRow} ${startCol}`;
      }
      if (functionName === 'knightProbability') {
        const N = (t % 2) + 4; // 4 to 5
        const K = (t % 2) + 1; // 1 to 2
        const r = t % N;
        const c = t % N;
        return `${N} ${K} ${r} ${c}`;
      }
      if (functionName === 'getRow') {
        return `${t % 15}`;
      }
      if (functionName === 'numDecodings') {
        return Array.from({ length: (t % 5) + 4 }, (_, k) => String((k + t) % 9 + 1)).join("");
      }
      if (functionName === 'nthSuperUglyNumber') {
        const primes = [2, 3, 5, 7, 11].slice(0, (t % 3) + 2);
        return `${primes.join(" ")}\n${(t % 10) + 5}`;
      }
      if (functionName === 'mincostTickets') {
        const days = Array.from({ length: (t % 5) + 3 }, (_, k) => (k * 5 + t % 5) + 1).sort((a,b) => a-b);
        const costs = [2, 7, 15];
        return `${days.join(" ")}\n${costs.join(" ")}`;
      }
      if (functionName === 'wordBreak') {
        const s = "leet" + "code".repeat((t % 2) + 1);
        const dict = "leet code leets coder";
        return `${s}\n${dict}`;
      }
      if (functionName === 'findMaxForm') {
        const binaryStrs = Array.from({ length: (t % 4) + 3 }, () => 
          Array.from({ length: (t % 3) + 2 }, (_, k) => (k % 2 === 0 ? '0' : '1')).join("")
        ).join(" ");
        const m = (t % 4) + 2;
        const n = (t % 4) + 2;
        return `${binaryStrs}\n${m} ${n}`;
      }

      // Standard types
      if (signature === 'number') {
        return `${(t % 20) + 5}`;
      } else if (signature === 'string') {
        return Array.from({ length: (t % 10) + 5 }, (_, k) => String.fromCharCode(97 + (k + t) % 3)).join("");
      } else if (signature === 'numbers') {
        const len = (t % 10) + 5;
        return Array.from({ length: len }, (_, k) => (k + t) % 15 + 1).join(" ");
      } else if (signature === 'two_strings') {
        const s1 = Array.from({ length: (t % 6) + 4 }, (_, k) => String.fromCharCode(97 + (k + t) % 3)).join("");
        const s2 = Array.from({ length: (t % 6) + 4 }, (_, k) => String.fromCharCode(97 + (k + t * 2) % 3)).join("");
        return `${s1}\n${s2}`;
      } else if (signature === 'array_target') {
        const len = (t % 6) + 4;
        const arr = Array.from({ length: len }, (_, k) => (k + t) % 10 + 1).join(" ");
        const target = (t % 10) + 3;
        return `${arr}\n${target}`;
      } else if (signature === 'two_arrays') {
        const len1 = (t % 6) + 4;
        const len2 = (t % 6) + 4;
        const arr1 = Array.from({ length: len1 }, (_, k) => (k + t) % 10 + 1).join(" ");
        const arr2 = Array.from({ length: len2 }, (_, k) => (k + t * 2) % 10 + 1).join(" ");
        return `${arr1}\n${arr2}`;
      }
      return `${t}`;
    },
    solve: (inputStr) => {
      const nums = inputStr.trim().split(/\s+/).map(Number);
      switch (dpFunctions[i]) {
        case "minCostClimbingStairs": {
          const cost = nums;
          const n = cost.length;
          if (n === 0) return "0";
          if (n === 1) return `${cost[0]}`;
          const dp = [0, 0];
          for (let k = 2; k <= n; k++) {
            dp[k] = Math.min(dp[k-1] + cost[k-1], dp[k-2] + cost[k-2]);
          }
          return `${dp[n]}`;
        }
        case "houseRobber": {
          if (nums.length === 0) return "0";
          if (nums.length === 1) return `${nums[0]}`;
          const dp = [nums[0], Math.max(nums[0], nums[1])];
          for (let k = 2; k < nums.length; k++) {
            dp[k] = Math.max(dp[k-1], dp[k-2] + nums[k]);
          }
          return `${dp[nums.length - 1]}`;
        }
        case "houseRobberII": {
          if (nums.length === 0) return "0";
          if (nums.length === 1) return `${nums[0]}`;
          const rob = (arr) => {
            let p1 = 0, p2 = 0;
            for (const x of arr) {
              const tmp = p1;
              p1 = Math.max(p1, p2 + x);
              p2 = tmp;
            }
            return p1;
          };
          return `${Math.max(rob(nums.slice(0, -1)), rob(nums.slice(1)))}`;
        }
        case "tribonacci": {
          const val = parseInt(inputStr.trim());
          if (val === 0) return "0";
          if (val === 1 || val === 2) return "1";
          let a = 0, b = 1, c = 1;
          for (let k = 3; k <= val; k++) {
            const d = a + b + c;
            a = b; b = c; c = d;
          }
          return `${c}`;
        }
        case "divisorGame": {
          const val = parseInt(inputStr.trim());
          return `${val % 2 === 0}`;
        }
        case "climbStairsWays": {
          const val = parseInt(inputStr.trim());
          let dp = [1, 1, 2];
          for (let k = 3; k <= val; k++) dp[k] = dp[k-1] + dp[k-2];
          return `${dp[val] || 1}`;
        }
        case "uniquePaths": {
          const [m, n] = nums;
          const dp = Array(n).fill(1);
          for (let r = 1; r < m; r++) {
            for (let c = 1; c < n; c++) {
              dp[c] += dp[c-1];
            }
          }
          return `${dp[n-1] || 1}`;
        }
        case "uniquePathsWithObstacles": {
          const r = nums[0];
          const c = nums[1];
          const grid = [];
          let idx = 2;
          for (let i = 0; i < r; i++) {
            grid.push(nums.slice(idx, idx + c));
            idx += c;
          }
          if (!grid[0] || grid[0][0] === 1) return "0";
          const dp = Array(c).fill(0);
          dp[0] = 1;
          for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
              if (grid[i][j] === 1) dp[j] = 0;
              else if (j > 0) dp[j] += dp[j-1];
            }
          }
          return `${dp[c-1]}`;
        }
        case "minPathSum": {
          const r = nums[0];
          const c = nums[1];
          const grid = [];
          let idx = 2;
          for (let i = 0; i < r; i++) {
            grid.push(nums.slice(idx, idx + c));
            idx += c;
          }
          for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
              if (i === 0 && j === 0) continue;
              else if (i === 0) grid[i][j] += grid[i][j-1];
              else if (j === 0) grid[i][j] += grid[i-1][j];
              else grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
            }
          }
          return `${grid[r-1] ? grid[r-1][c-1] || 0 : 0}`;
        }
        case "minimumTotal": {
          const n = nums[0];
          const triangle = [];
          let idx = 1;
          for (let i = 0; i < n; i++) {
            triangle.push(nums.slice(idx, idx + i + 1));
            idx += i + 1;
          }
          for (let i = n - 2; i >= 0; i--) {
            for (let j = 0; j <= i; j++) {
              triangle[i][j] += Math.min(triangle[i+1][j], triangle[i+1][j+1]);
            }
          }
          return `${triangle[0] ? triangle[0][0] || 0 : 0}`;
        }
        case "numDecodings": {
          const s = inputStr.trim();
          if (!s || s[0] === '0') return "0";
          let dp = [1, 1];
          for (let k = 2; k <= s.length; k++) {
            let ways = 0;
            if (s[k-1] !== '0') ways += dp[k-1];
            const two = parseInt(s.slice(k-2, k));
            if (two >= 10 && two <= 26) ways += dp[k-2];
            dp[k] = ways;
          }
          return `${dp[s.length]}`;
        }
        case "numSquares": {
          const val = parseInt(inputStr.trim());
          const dp = Array(val + 1).fill(Infinity);
          dp[0] = 0;
          for (let i = 1; i <= val; i++) {
            for (let j = 1; j * j <= i; j++) {
              dp[i] = Math.min(dp[i], dp[i - j*j] + 1);
            }
          }
          return `${dp[val]}`;
        }
        case "coinChange": {
          const lines = inputStr.trim().split("\n");
          const coins = lines[0].split(/\s+/).map(Number);
          const amount = parseInt(lines[1]);
          const dp = Array(amount + 1).fill(Infinity);
          dp[0] = 0;
          for (const coin of coins) {
            for (let i = coin; i <= amount; i++) {
              dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
          }
          return `${dp[amount] === Infinity ? -1 : dp[amount]}`;
        }
        case "changeCombinations": {
          const lines = inputStr.trim().split("\n");
          const coins = lines[0].split(/\s+/).map(Number);
          const amount = parseInt(lines[1]);
          const dp = Array(amount + 1).fill(0);
          dp[0] = 1;
          for (const coin of coins) {
            for (let i = coin; i <= amount; i++) {
              dp[i] += dp[i - coin];
            }
          }
          return `${dp[amount]}`;
        }
        case "lengthOfLIS": {
          if (nums.length === 0) return "0";
          const dp = Array(nums.length).fill(1);
          for (let i = 1; i < nums.length; i++) {
            for (let j = 0; j < i; j++) {
              if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
              }
            }
          }
          return `${Math.max(...dp)}`;
        }
        case "longestCommonSubsequence": {
          const lines = inputStr.trim().split("\n");
          const s1 = lines[0] ? lines[0].trim() : "";
          const s2 = lines[1] ? lines[1].trim() : "";
          const dp = Array(s1.length + 1).fill(0).map(() => Array(s2.length + 1).fill(0));
          for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
              if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
              else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
          }
          return `${dp[s1.length][s2.length]}`;
        }
        case "minDistance": {
          const lines = inputStr.trim().split("\n");
          const s1 = lines[0] ? lines[0].trim() : "";
          const s2 = lines[1] ? lines[1].trim() : "";
          const dp = Array(s1.length + 1).fill(0).map(() => Array(s2.length + 1).fill(0));
          for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
          for (let j = 0; j <= s2.length; j++) dp[0][j] = j;
          for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
              if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1];
              else dp[i][j] = Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1;
            }
          }
          return `${dp[s1.length][s2.length]}`;
        }
        case "wordBreak": {
          const lines = inputStr.trim().split("\n");
          const s = lines[0] ? lines[0].trim() : "";
          const dict = lines[1] ? lines[1].split(/\s+/) : [];
          const wordSet = new Set(dict);
          const dp = Array(s.length + 1).fill(false);
          dp[0] = true;
          for (let i = 1; i <= s.length; i++) {
            for (let j = 0; j < i; j++) {
              if (dp[j] && wordSet.has(s.slice(j, i))) {
                dp[i] = true;
                break;
              }
            }
          }
          return `${dp[s.length]}`;
        }
        case "maximalSquare": {
          const r = nums[0];
          const c = nums[1];
          const grid = [];
          let idx = 2;
          for (let i = 0; i < r; i++) {
            grid.push(nums.slice(idx, idx + c));
            idx += c;
          }
          const dp = Array(r).fill(0).map(() => Array(c).fill(0));
          let maxSide = 0;
          for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
              if (grid[i][j] === 1) {
                if (i === 0 || j === 0) dp[i][j] = 1;
                else dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
                maxSide = Math.max(maxSide, dp[i][j]);
              }
            }
          }
          return `${maxSide * maxSide}`;
        }
        case "canPartition": {
          const sum = nums.reduce((a, b) => a + b, 0);
          if (sum % 2 !== 0) return "false";
          const target = sum / 2;
          const dp = Array(target + 1).fill(false);
          dp[0] = true;
          for (const num of nums) {
            for (let i = target; i >= num; i--) {
              dp[i] = dp[i] || dp[i - num];
            }
          }
          return `${dp[target]}`;
        }
        case "canJump": {
          let maxReach = 0;
          for (let i = 0; i < nums.length; i++) {
            if (i > maxReach) return "false";
            maxReach = Math.max(maxReach, i + nums[i]);
          }
          return "true";
        }
        case "jumpGameII": {
          let jumps = 0, currEnd = 0, currFarthest = 0;
          for (let i = 0; i < nums.length - 1; i++) {
            currFarthest = Math.max(currFarthest, i + nums[i]);
            if (i === currEnd) {
              jumps++;
              currEnd = currFarthest;
            }
          }
          return `${jumps}`;
        }
        case "maxProfitI": {
          let minPrice = Infinity, maxProf = 0;
          for (const p of nums) {
            minPrice = Math.min(minPrice, p);
            maxProf = Math.max(maxProf, p - minPrice);
          }
          return `${maxProf}`;
        }
        case "maxProfitII": {
          let maxProf = 0;
          for (let i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i-1]) maxProf += nums[i] - nums[i-1];
          }
          return `${maxProf}`;
        }
        case "maxProfitIII": {
          let buy1 = -Infinity, sell1 = 0, buy2 = -Infinity, sell2 = 0;
          for (const p of nums) {
            buy1 = Math.max(buy1, -p);
            sell1 = Math.max(sell1, buy1 + p);
            buy2 = Math.max(buy2, sell1 - p);
            sell2 = Math.max(sell2, buy2 + p);
          }
          return `${sell2}`;
        }
        case "maxProfitIV": {
          const lines = inputStr.trim().split("\n");
          const k = parseInt(lines[1]);
          const prices = lines[0].split(/\s+/).map(Number);
          if (prices.length === 0) return "0";
          const buy = Array(k + 1).fill(-Infinity);
          const sell = Array(k + 1).fill(0);
          for (const p of prices) {
            for (let j = 1; j <= k; j++) {
              buy[j] = Math.max(buy[j], sell[j-1] - p);
              sell[j] = Math.max(sell[j], buy[j] + p);
            }
          }
          return `${sell[k]}`;
        }
        case "maxProfitWithCooldown": {
          let buy = -Infinity, sell = 0, cooldown = 0;
          for (const p of nums) {
            const prevSell = sell;
            sell = Math.max(sell, buy + p);
            buy = Math.max(buy, cooldown - p);
            cooldown = prevSell;
          }
          return `${sell}`;
        }
        case "maxProfitWithFee": {
          const lines = inputStr.trim().split("\n");
          const fee = parseInt(lines[1]);
          const prices = lines[0].split(/\s+/).map(Number);
          let buy = -prices[0], sell = 0;
          for (let i = 1; i < prices.length; i++) {
            sell = Math.max(sell, buy + prices[i] - fee);
            buy = Math.max(buy, sell - prices[i]);
          }
          return `${sell}`;
        }
        case "getRow": {
          const rowIndex = parseInt(inputStr.trim());
          const row = [1];
          for (let i = 1; i <= rowIndex; i++) {
            for (let j = i - 1; j > 0; j--) {
              row[j] += row[j-1];
            }
            row.push(1);
          }
          return row.join(" ");
        }
        case "isSubsequence": {
          const lines = inputStr.trim().split("\n");
          const s1 = lines[0] ? lines[0].trim() : "";
          const s2 = lines[1] ? lines[1].trim() : "";
          let i = 0, j = 0;
          while (i < s1.length && j < s2.length) {
            if (s1[i] === s2[j]) i++;
            j++;
          }
          return `${i === s1.length}`;
        }
        case "deleteAndEarn": {
          if (nums.length === 0) return "0";
          const maxVal = Math.max(...nums);
          const sum = Array(maxVal + 1).fill(0);
          for (const x of nums) sum[x] += x;
          let prev1 = 0, prev2 = 0;
          for (const x of sum) {
            const tmp = prev1;
            prev1 = Math.max(prev1, prev2 + x);
            prev2 = tmp;
          }
          return `${prev1}`;
        }
        case "integerBreak": {
          const val = parseInt(inputStr.trim());
          if (val === 2) return "1";
          if (val === 3) return "2";
          let count3 = Math.floor(val / 3);
          let rem = val % 3;
          if (rem === 1) {
            count3--;
            return `${Math.pow(3, count3) * 4}`;
          } else if (rem === 2) {
            return `${Math.pow(3, count3) * 2}`;
          }
          return `${Math.pow(3, count3)}`;
        }
        case "combinationSum4": {
          const lines = inputStr.trim().split("\n");
          const candidates = lines[0].split(/\s+/).map(Number);
          const target = parseInt(lines[1]);
          const dp = Array(target + 1).fill(0);
          dp[0] = 1;
          for (let i = 1; i <= target; i++) {
            for (const num of candidates) {
              if (i >= num) dp[i] += dp[i - num];
            }
          }
          return `${dp[target]}`;
        }
        case "findPaths": {
          const [m, n, maxMove, startRow, startCol] = nums;
          let count = 0;
          const dp = Array(m).fill(0).map(() => Array(n).fill(0));
          dp[startRow][startCol] = 1;
          const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
          for (let step = 0; step < maxMove; step++) {
            const next = Array(m).fill(0).map(() => Array(n).fill(0));
            for (let r = 0; r < m; r++) {
              for (let c = 0; c < n; c++) {
                if (dp[r][c] > 0) {
                  for (const [dr, dc] of dirs) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) {
                      count = (count + dp[r][c]) % 1000000007;
                    } else {
                      next[nr][nc] = (next[nr][nc] + dp[r][c]) % 1000000007;
                    }
                  }
                }
              }
            }
            for (let r = 0; r < m; r++) {
              for (let c = 0; c < n; c++) dp[r][c] = next[r][c];
            }
          }
          return `${count}`;
        }
        case "knightProbability": {
          const [N, K, r, c] = nums;
          const dirs = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
          let dp = Array(N).fill(0).map(() => Array(N).fill(0));
          dp[r][c] = 1;
          for (let step = 0; step < K; step++) {
            const next = Array(N).fill(0).map(() => Array(N).fill(0));
            for (let i = 0; i < N; i++) {
              for (let j = 0; j < N; j++) {
                if (dp[i][j] > 0) {
                  for (const [di, dj] of dirs) {
                    const ni = i + di;
                    const nj = j + dj;
                    if (ni >= 0 && ni < N && nj >= 0 && nj < N) {
                      next[ni][nj] += dp[i][j] / 8.0;
                    }
                  }
                }
              }
            }
            dp = next;
          }
          let sum = 0;
          for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) sum += dp[i][j];
          }
          return `${Math.round(sum * 100)}`;
        }
        case "numberOfArithmeticSlices": {
          let count = 0, curr = 0;
          for (let i = 2; i < nums.length; i++) {
            if (nums[i] - nums[i-1] === nums[i-1] - nums[i-2]) {
              curr++;
              count += curr;
            } else {
              curr = 0;
            }
          }
          return `${count}`;
        }
        case "findTargetSumWays": {
          const lines = inputStr.trim().split("\n");
          const target = parseInt(lines[1]);
          const elements = lines[0].split(/\s+/).map(Number);
          const sum = elements.reduce((a, b) => a + b, 0);
          if (Math.abs(target) > sum || (sum + target) % 2 !== 0) return "0";
          const s = (sum + target) / 2;
          const dp = Array(s + 1).fill(0);
          dp[0] = 1;
          for (const num of elements) {
            for (let i = s; i >= num; i--) {
              dp[i] += dp[i - num];
            }
          }
          return `${dp[s]}`;
        }
        case "findMaxForm": {
          const lines = inputStr.trim().split("\n");
          const strs = lines[0] ? lines[0].split(/\s+/) : [];
          const [m, n] = lines[1] ? lines[1].split(/\s+/).map(Number) : [0, 0];
          const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
          for (const s of strs) {
            let zeros = 0, ones = 0;
            for (const char of s) {
              if (char === '0') zeros++;
              else if (char === '1') ones++;
            }
            for (let i = m; i >= zeros; i--) {
              for (let j = n; j >= ones; j--) {
                dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
              }
            }
          }
          return `${dp[m][n]}`;
        }
        case "PredictTheWinner": {
          const dp = [...nums];
          for (let i = nums.length - 2; i >= 0; i--) {
            for (let j = i + 1; j < nums.length; j++) {
              dp[j] = Math.max(nums[i] - dp[j], nums[j] - dp[j-1]);
            }
          }
          return `${dp[nums.length - 1] >= 0}`;
        }
        case "minFallingPathSum": {
          const r = nums[0];
          const c = nums[1];
          const grid = [];
          let idx = 2;
          for (let i = 0; i < r; i++) {
            grid.push(nums.slice(idx, idx + c));
            idx += c;
          }
          for (let i = 1; i < r; i++) {
            for (let j = 0; j < c; j++) {
              let best = grid[i-1][j];
              if (j > 0) best = Math.min(best, grid[i-1][j-1]);
              if (j < c - 1) best = Math.min(best, grid[i-1][j+1]);
              grid[i][j] += best;
            }
          }
          return `${Math.min(...grid[r-1])}`;
        }
        case "findLengthRepeatedSubarray": {
          const lines = inputStr.trim().split("\n");
          const a1 = lines[0].split(/\s+/).map(Number);
          const a2 = lines[1].split(/\s+/).map(Number);
          const dp = Array(a1.length + 1).fill(0).map(() => Array(a2.length + 1).fill(0));
          let maxLen = 0;
          for (let i = 1; i <= a1.length; i++) {
            for (let j = 1; j <= a2.length; j++) {
              if (a1[i-1] === a2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
                maxLen = Math.max(maxLen, dp[i][j]);
              }
            }
          }
          return `${maxLen}`;
        }
        case "longestPalindromeSubseq": {
          const s = inputStr.trim();
          const n = s.length;
          const dp = Array(n).fill(0).map(() => Array(n).fill(0));
          for (let i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (let j = i + 1; j < n; j++) {
              if (s[i] === s[j]) dp[i][j] = dp[i+1][j-1] + 2;
              else dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
            }
          }
          return `${dp[0][n-1] || 0}`;
        }
        case "mincostTickets": {
          const lines = inputStr.trim().split("\n");
          const days = lines[0].split(/\s+/).map(Number);
          const costs = lines[1].split(/\s+/).map(Number);
          const dp = Array(366).fill(0);
          const daySet = new Set(days);
          for (let i = 1; i <= 365; i++) {
            if (!daySet.has(i)) {
              dp[i] = dp[i-1];
            } else {
              dp[i] = Math.min(
                dp[i-1] + costs[0],
                dp[Math.max(0, i-7)] + costs[1],
                dp[Math.max(0, i-30)] + costs[2]
              );
            }
          }
          return `${dp[days[days.length - 1]]}`;
        }
        case "lastStoneWeightII": {
          const sum = nums.reduce((a, b) => a + b, 0);
          const target = Math.floor(sum / 2);
          const dp = Array(target + 1).fill(false);
          dp[0] = true;
          for (const w of nums) {
            for (let i = target; i >= w; i--) {
              dp[i] = dp[i] || dp[i-w];
            }
          }
          let s = 0;
          for (let i = target; i >= 0; i--) {
            if (dp[i]) { s = i; break; }
          }
          return `${sum - 2*s}`;
        }
        case "numTilings": {
          const val = parseInt(inputStr.trim());
          if (val <= 2) return `${val}`;
          const dp = [0, 1, 2, 5];
          for (let i = 4; i <= val; i++) {
            dp[i] = (2 * dp[i-1] + dp[i-3]) % 1000000007;
          }
          return `${dp[val]}`;
        }
        case "largestDivisibleSubset": {
          if (nums.length === 0) return "0";
          nums.sort((a, b) => a - b);
          const dp = Array(nums.length).fill(1);
          for (let i = 1; i < nums.length; i++) {
            for (let j = 0; j < i; j++) {
              if (nums[i] % nums[j] === 0) dp[i] = Math.max(dp[i], dp[j] + 1);
            }
          }
          return `${Math.max(...dp)}`;
        }
        case "countSubstringsPalindromic": {
          const s = inputStr.trim();
          let count = 0;
          for (let i = 0; i < s.length; i++) {
            let l = i, r = i;
            while (l >= 0 && r < s.length && s[l] === s[r]) { count++; l--; r++; }
            l = i; r = i + 1;
            while (l >= 0 && r < s.length && s[l] === s[r]) { count++; l--; r++; }
          }
          return `${count}`;
        }
        case "nthUglyNumber": {
          const val = parseInt(inputStr.trim());
          const dp = [1];
          let i2 = 0, i3 = 0, i5 = 0;
          for (let i = 1; i < val; i++) {
            const next = Math.min(dp[i2]*2, dp[i3]*3, dp[i5]*5);
            dp.push(next);
            if (next === dp[i2]*2) i2++;
            if (next === dp[i3]*3) i3++;
            if (next === dp[i5]*5) i5++;
          }
          return `${dp[val-1]}`;
        }
        case "nthSuperUglyNumber": {
          const lines = inputStr.trim().split("\n");
          const primes = lines[0].split(/\s+/).map(Number);
          const val = parseInt(lines[1]);
          const dp = [1];
          const ptrs = Array(primes.length).fill(0);
          for (let i = 1; i < val; i++) {
            let minVal = Infinity;
            for (let j = 0; j < primes.length; j++) {
              minVal = Math.min(minVal, dp[ptrs[j]] * primes[j]);
            }
            dp.push(minVal);
            for (let j = 0; j < primes.length; j++) {
              if (minVal === dp[ptrs[j]] * primes[j]) ptrs[j]++;
            }
          }
          return `${dp[val-1]}`;
        }
        case "wiggleMaxLength": {
          if (nums.length < 2) return `${nums.length}`;
          let up = 1, down = 1;
          for (let i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i-1]) up = down + 1;
            else if (nums[i] < nums[i-1]) down = up + 1;
          }
          return `${Math.max(up, down)}`;
        }
        default:
          return "0";
      }
    }
  });
}

// Helper to generate graphs programmatically
function generateGraphInput(t, isTree, isDirected, isWeighted, weightFormulaType) {
  const n = (t % 12) + 4; // 4 to 15 nodes
  const edges = [];
  if (isTree) {
    for (let i = 2; i <= n; i++) {
      const parent = ((t + i) % (i - 1)) + 1;
      edges.push({ u: parent, v: i });
    }
  } else {
    const maxEdges = Math.floor(n * 1.5);
    const adj = new Set();
    const edgeList = [];
    // Connect path 1->2->3...->N to ensure connectivity
    for (let i = 1; i < n; i++) {
      const u = i;
      const v = i + 1;
      const edgeStr = isDirected ? `${u} ${v}` : (u < v ? `${u} ${v}` : `${v} ${u}`);
      adj.add(edgeStr);
      edgeList.push({ u, v });
    }
    // Add additional random edges
    let attempts = 0;
    while (adj.size < maxEdges && attempts < 100) {
      attempts++;
      const u = ((t * 3 + adj.size) % n) + 1;
      const v = ((t * 7 + adj.size * 2) % n) + 1;
      if (u !== v) {
        const edgeStr = isDirected ? `${u} ${v}` : (u < v ? `${u} ${v}` : `${v} ${u}`);
        if (!adj.has(edgeStr)) {
          adj.add(edgeStr);
          edgeList.push({ u, v });
        }
      }
    }
    for (const e of edgeList) {
      edges.push(e);
    }
  }

  // Format edges string
  const formattedEdges = edges.map(e => {
    if (isWeighted) {
      let w = 1;
      if (weightFormulaType === 'bellmanFord') {
        w = ((e.u + e.v) % 3) - 1;
      } else {
        w = ((e.u + e.v) % 5) + 1;
      }
      return `${e.u} ${e.v} ${w}`;
    }
    return `${e.u} ${e.v}`;
  });

  return `${n} ${formattedEdges.length} ` + formattedEdges.join(" ");
}

// --- GROUP 6: GRAPH PROBLEMS (151 to 200) ---
const graphTitles = [
  "Graph Vertex Count", "Graph Edge Count", "Graph Vertex Degree Count", "Graph Is Path Graph",
  "Graph Is Cycle Graph", "Find Connected Components Count", "Graph Cycle Detection Undirected", "Graph Cycle Detection Directed",
  "Shortest Path BFS Distance", "DFS Path Reachability", "Graph Bipartite Check", "Topological Sort Order",
  "Kruskals MST Weight", "Prims MST Total Weight", "Dijkstra Single Source Shortest Path", "Bellman Ford Negative Cycle",
  "Floyd Warshall Max Distance", "Graph Vertex Coloring", "Eulerian Path Verification", "Eulerian Circuit Check",
  "Graph Hamilton Path Verification", "Strongly Connected Components Count", "Graph Vertex Out-Degree", "Graph Is Tournament Graph",
  "Graph Vertex In-Degree", "Graph Is Tree Validation", "Minimum Spanning Tree Edge Count", "Bridges in Graph Count",
  "Articulation Points Count", "Transitive Closure Graph", "All Pairs Reachability Count", "Graph Is Complete Validation",
  "Graph Is Regular Check", "Graph Maximum Clique Size", "Graph Maximum Independent Set Size", "Graph Vertex Cover Size",
  "Graph Edge Cover Size", "Graph Matchings Maximum Count", "Graph Diameter Calculation", "Graph Radius Calculation",
  "Graph Central Vertices Count", "Graph Eccentricity of Vertex", "Find Source Vertices in DAG", "Find Sink Vertices in DAG",
  "Graph Self Loops Count", "Graph Multiple Edges Count", "Graph Transpose Edge Count", "Graph Density Percentage",
  "Is Graph Planar Check", "Max Flow Value Edmonds Karp"
];

const graphFunctions = [
  "graphVertexCount", "graphEdgeCount", "graphVertexDegreeCount", "graphIsPathGraph",
  "graphIsCycleGraph", "findConnectedComponents", "graphCycleDetectionUndirected", "graphCycleDetectionDirected",
  "shortestPathBFS", "dfsPathReachability", "graphBipartiteCheck", "topologicalSort",
  "kruskalsMST", "primsMST", "dijkstraShortestPath", "bellmanFord",
  "floydWarshall", "graphVertexColoring", "eulerianPath", "eulerianCircuit",
  "graphHamiltonPath", "stronglyConnectedComponents", "graphVertexOutDegree", "graphIsTournament",
  "graphVertexInDegree", "graphIsTree", "minSpanningTreeEdges", "bridgesCount",
  "articulationPoints", "transitiveClosure", "allPairsReachability", "graphIsComplete",
  "graphIsRegular", "maxCliqueSize", "maxIndependentSet", "minVertexCover",
  "minEdgeCover", "maxMatchings", "graphDiameter", "graphRadius",
  "centralVerticesCount", "vertexEccentricity", "dagSourceVertices", "dagSinkVertices",
  "selfLoops", "multipleEdges", "transposeEdges", "graphDensity",
  "isPlanar", "maxFlowEdmondsKarp"
];

const graphDifficulty = [
  "Easy", "Easy", "Easy", "Easy",
  "Easy", "Medium", "Medium", "Hard",
  "Medium", "Easy", "Medium", "Hard",
  "Hard", "Hard", "Hard", "Hard",
  "Hard", "Medium", "Hard", "Medium",
  "Hard", "Hard", "Easy", "Medium",
  "Easy", "Medium", "Easy", "Hard",
  "Hard", "Medium", "Medium", "Easy",
  "Medium", "Hard", "Hard", "Hard",
  "Medium", "Hard", "Hard", "Hard",
  "Medium", "Medium", "Easy", "Easy",
  "Easy", "Easy", "Easy", "Easy",
  "Hard", "Hard"
];

const graphReturns = [
  "number", "number", "number", "boolean",
  "boolean", "number", "boolean", "boolean",
  "number", "boolean", "boolean", "numbers",
  "number", "number", "number", "boolean",
  "number", "number", "boolean", "boolean",
  "boolean", "number", "number", "boolean",
  "number", "boolean", "number", "number",
  "number", "number", "number", "boolean",
  "boolean", "number", "number", "number",
  "number", "number", "number", "number",
  "number", "number", "numbers", "numbers",
  "number", "number", "number", "number",
  "boolean", "number"
];

for (let i = 0; i < 50; i++) {
  problemSpecs.push({
    title: graphTitles[i],
    slug: graphTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    difficulty: graphDifficulty[i],
    tags: ["Graphs"],
    description: `Solve the graph analysis challenge: ${graphTitles[i]}. You are given the number of vertices n and a list of edges representing the graph. Each edge is a pair [u, v] (or [u, v, w] for weighted graphs). Implement the function to compute the required result.`,
    inputFormat: "n: integer — number of vertices. edges: array of pairs [u, v] (or [u, v, w] for weighted graphs) representing the edges.",
    outputFormat: graphReturns[i] === "boolean" ? "Print 'true' or 'false'." : "Print the computed result.",
    constraints: "• `1 <= N <= 20`\n• `0 <= M <= 50`",
    signature: ["kruskalsMST", "primsMST", "dijkstraShortestPath", "bellmanFord", "floydWarshall", "maxFlowEdmondsKarp"].includes(graphFunctions[i]) ? "weighted_graph" : "graph",
    returnType: graphReturns[i],
    functionName: graphFunctions[i],
    generateInput: (t) => {
      const isTree = ["graphIsTree", "minSpanningTreeEdges"].includes(graphFunctions[i]);
      const isDirected = ["graphCycleDetectionDirected", "topologicalSort", "stronglyConnectedComponents", "graphVertexOutDegree", "graphIsTournament", "graphVertexInDegree", "dagSourceVertices", "dagSinkVertices", "transposeEdges"].includes(graphFunctions[i]);
      const isWeighted = ["kruskalsMST", "primsMST", "dijkstraShortestPath", "bellmanFord", "floydWarshall", "maxFlowEdmondsKarp"].includes(graphFunctions[i]);
      const weightFormulaType = graphFunctions[i] === "bellmanFord" ? "bellmanFord" : "default";
      return generateGraphInput(t, isTree, isDirected, isWeighted, weightFormulaType);
    },
    solve: (inputStr) => {
      const parts = inputStr.trim().split(/\s+/).map(Number);
      const gN = parts[0] || 0;
      const gM = parts[1] || 0;
      const adjList = Array(gN + 1).fill(0).map(() => []);
      const undirectedAdj = Array(gN + 1).fill(0).map(() => []);
      const gEdges = [];
      const isWeighted = ["kruskalsMST", "primsMST", "dijkstraShortestPath", "bellmanFord", "floydWarshall", "maxFlowEdmondsKarp"].includes(graphFunctions[i]);

      for (let k = 0; k < gM; k++) {
        if (isWeighted) {
          const u = parts[2 + 3*k];
          const v = parts[2 + 3*k + 1];
          const w = parts[2 + 3*k + 2];
          if (u !== undefined && v !== undefined && w !== undefined) {
            gEdges.push({ u, v, w });
            adjList[u].push({ node: v, weight: w });
            undirectedAdj[u].push({ node: v, weight: w });
            undirectedAdj[v].push({ node: u, weight: w });
          }
        } else {
          const u = parts[2 + 2*k];
          const v = parts[2 + 2*k + 1];
          if (u !== undefined && v !== undefined) {
            gEdges.push({ u, v });
            adjList[u].push(v);
            undirectedAdj[u].push(v);
            undirectedAdj[v].push(u);
          }
        }
      }

      switch (graphFunctions[i]) {
        case "graphVertexCount": return `${gN}`;
        case "graphEdgeCount": return `${gM}`;
        case "graphVertexDegreeCount": return `${undirectedAdj[1] ? undirectedAdj[1].length : 0}`;
        case "graphIsPathGraph": {
          if (gN === 1) return `${gM === 0}`;
          let deg1 = 0, deg2 = 0;
          for (let k = 1; k <= gN; k++) {
            if (undirectedAdj[k].length === 1) deg1++;
            else if (undirectedAdj[k].length === 2) deg2++;
            else return "false";
          }
          const visited = new Set();
          const dfs = (node) => {
            visited.add(node);
            for (const next of undirectedAdj[node]) {
              if (!visited.has(next)) dfs(next);
            }
          };
          dfs(1);
          return `${deg1 === 2 && deg2 === gN - 2 && visited.size === gN}`;
        }
        case "graphIsCycleGraph": {
          for (let k = 1; k <= gN; k++) {
            if (undirectedAdj[k].length !== 2) return "false";
          }
          const visited = new Set();
          const dfs = (node) => {
            visited.add(node);
            for (const next of undirectedAdj[node]) {
              if (!visited.has(next)) dfs(next);
            }
          };
          dfs(1);
          return `${visited.size === gN}`;
        }
        case "findConnectedComponents": {
          const visited = new Set();
          let components = 0;
          const dfs = (node) => {
            visited.add(node);
            for (const next of undirectedAdj[node]) {
              if (!visited.has(next)) dfs(next);
            }
          };
          for (let k = 1; k <= gN; k++) {
            if (!visited.has(k)) {
              components++;
              dfs(k);
            }
          }
          return `${components}`;
        }
        case "graphCycleDetectionUndirected": {
          const visited = new Set();
          let hasCycle = false;
          const dfs = (node, parent) => {
            visited.add(node);
            for (const next of undirectedAdj[node]) {
              if (!visited.has(next)) {
                if (dfs(next, node)) return true;
              } else if (next !== parent) {
                return true;
              }
            }
            return false;
          };
          for (let k = 1; k <= gN; k++) {
            if (!visited.has(k)) {
              if (dfs(k, 0)) { hasCycle = true; break; }
            }
          }
          return `${hasCycle}`;
        }
        case "graphCycleDetectionDirected": {
          const visited = new Set();
          const recStack = new Set();
          let hasCycle = false;
          const dfs = (node) => {
            visited.add(node);
            recStack.add(node);
            for (const next of adjList[node]) {
              if (!visited.has(next)) {
                if (dfs(next)) return true;
              } else if (recStack.has(next)) {
                return true;
              }
            }
            recStack.delete(node);
            return false;
          };
          for (let k = 1; k <= gN; k++) {
            if (!visited.has(k)) {
              if (dfs(k)) { hasCycle = true; break; }
            }
          }
          return `${hasCycle}`;
        }
        case "shortestPathBFS": {
          if (gN <= 1) return "0";
          const q = [1];
          const dist = Array(gN + 1).fill(-1);
          dist[1] = 0;
          while (q.length > 0) {
            const curr = q.shift();
            if (curr === gN) return `${dist[curr]}`;
            for (const next of undirectedAdj[curr]) {
              if (dist[next] === -1) {
                dist[next] = dist[curr] + 1;
                q.push(next);
              }
            }
          }
          return "-1";
        }
        case "dfsPathReachability": {
          const visited = new Set();
          const dfs = (node) => {
            visited.add(node);
            if (node === gN) return true;
            for (const next of undirectedAdj[node]) {
              if (!visited.has(next)) {
                if (dfs(next)) return true;
              }
            }
            return false;
          };
          return `${dfs(1)}`;
        }
        case "graphBipartiteCheck": {
          const color = Array(gN + 1).fill(-1);
          let isBipartite = true;
          for (let k = 1; k <= gN; k++) {
            if (color[k] === -1) {
              const q = [k];
              color[k] = 0;
              while (q.length > 0) {
                const curr = q.shift();
                for (const next of undirectedAdj[curr]) {
                  if (color[next] === -1) {
                    color[next] = 1 - color[curr];
                    q.push(next);
                  } else if (color[next] === color[curr]) {
                    isBipartite = false;
                    break;
                  }
                }
              }
            }
          }
          return `${isBipartite}`;
        }
        case "topologicalSort": {
          const inDegree = Array(gN + 1).fill(0);
          for (let u = 1; u <= gN; u++) {
            for (const v of adjList[u]) inDegree[v]++;
          }
          const q = [];
          for (let k = 1; k <= gN; k++) {
            if (inDegree[k] === 0) q.push(k);
          }
          const order = [];
          while (q.length > 0) {
            const curr = q.shift();
            order.push(curr);
            for (const next of adjList[curr]) {
              inDegree[next]--;
              if (inDegree[next] === 0) q.push(next);
            }
          }
          return order.length === gN ? order.join(" ") : "-1";
        }
        case "kruskalsMST": {
          const sorted = [...gEdges].sort((a, b) => a.w - b.w);
          const parent = Array(gN + 1).fill(0).map((_, i) => i);
          const find = (i) => {
            if (parent[i] === i) return i;
            return parent[i] = find(parent[i]);
          };
          const union = (i, j) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) { parent[rootI] = rootJ; return true; }
            return false;
          };
          let mstWeight = 0, count = 0;
          for (const e of sorted) {
            if (union(e.u, e.v)) {
              mstWeight += e.w;
              count++;
            }
          }
          return `${count === gN - 1 ? mstWeight : -1}`;
        }
        case "primsMST": {
          const sorted = [...gEdges].sort((a, b) => a.w - b.w);
          const parent = Array(gN + 1).fill(0).map((_, i) => i);
          const find = (i) => parent[i] === i ? i : parent[i] = find(parent[i]);
          const union = (i, j) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) { parent[rootI] = rootJ; return true; }
            return false;
          };
          let mstWeight = 0, count = 0;
          for (const e of sorted) {
            if (union(e.u, e.v)) { mstWeight += e.w; count++; }
          }
          return `${count === gN - 1 ? mstWeight : -1}`;
        }
        case "dijkstraShortestPath": {
          const dist = Array(gN + 1).fill(Infinity);
          dist[1] = 0;
          const visited = new Set();
          for (let step = 0; step < gN; step++) {
            let u = -1;
            for (let k = 1; k <= gN; k++) {
              if (!visited.has(k) && (u === -1 || dist[k] < dist[u])) u = k;
            }
            if (u === -1 || dist[u] === Infinity) break;
            visited.add(u);
            for (const edge of undirectedAdj[u]) {
              const next = edge.node;
              const w = edge.weight;
              if (dist[u] + w < dist[next]) {
                dist[next] = dist[u] + w;
              }
            }
          }
          return `${dist[gN] === Infinity ? -1 : dist[gN]}`;
        }
        case "bellmanFord": {
          const dist = Array(gN + 1).fill(Infinity);
          dist[1] = 0;
          const edgesWithW = gEdges;
          for (let step = 0; step < gN - 1; step++) {
            for (const e of edgesWithW) {
              if (dist[e.u] !== Infinity && dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
              }
            }
          }
          let hasNegCycle = false;
          for (const e of edgesWithW) {
            if (dist[e.u] !== Infinity && dist[e.u] + e.w < dist[e.v]) {
              hasNegCycle = true; break;
            }
          }
          return `${hasNegCycle}`;
        }
        case "floydWarshall": {
          const dist = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(Infinity));
          for (let k = 1; k <= gN; k++) dist[k][k] = 0;
          for (const e of gEdges) {
            dist[e.u][e.v] = Math.min(dist[e.u][e.v], e.w);
            dist[e.v][e.u] = Math.min(dist[e.v][e.u], e.w);
          }
          for (let k = 1; k <= gN; k++) {
            for (let i = 1; i <= gN; i++) {
              for (let j = 1; j <= gN; j++) {
                dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
              }
            }
          }
          let maxDist = 0;
          for (let i = 1; i <= gN; i++) {
            for (let j = 1; j <= gN; j++) {
              if (dist[i][j] !== Infinity && dist[i][j] > maxDist) maxDist = dist[i][j];
            }
          }
          return `${maxDist}`;
        }
        case "graphVertexColoring": {
          const resultColor = Array(gN + 1).fill(-1);
          resultColor[1] = 0;
          for (let u = 2; u <= gN; u++) {
            const available = Array(gN).fill(true);
            for (const next of undirectedAdj[u]) {
              if (resultColor[next] !== -1) {
                available[resultColor[next]] = false;
              }
            }
            let cr;
            for (cr = 0; cr < gN; cr++) {
              if (available[cr]) break;
            }
            resultColor[u] = cr;
          }
          return `${Math.max(...resultColor) + 1}`;
        }
        case "eulerianPath": {
          let oddDegrees = 0;
          for (let k = 1; k <= gN; k++) {
            if (undirectedAdj[k].length % 2 !== 0) oddDegrees++;
          }
          return `${oddDegrees === 0 || oddDegrees === 2}`;
        }
        case "eulerianCircuit": {
          let oddDegrees = 0;
          for (let k = 1; k <= gN; k++) {
            if (undirectedAdj[k].length % 2 !== 0) oddDegrees++;
          }
          return `${oddDegrees === 0}`;
        }
        case "graphHamiltonPath": {
          let pathExists = false;
          const visited = new Set();
          const dfs = (node) => {
            visited.add(node);
            if (visited.size === gN) return true;
            for (const next of undirectedAdj[node]) {
              if (!visited.has(next)) {
                if (dfs(next)) return true;
              }
            }
            visited.delete(node);
            return false;
          };
          for (let k = 1; k <= gN; k++) {
            if (dfs(k)) { pathExists = true; break; }
          }
          return `${pathExists}`;
        }
        case "stronglyConnectedComponents": {
          let index = 0, count = 0;
          const indices = Array(gN + 1).fill(-1);
          const lowlink = Array(gN + 1).fill(-1);
          const stack = [];
          const onStack = new Set();
          const strongConnect = (v) => {
            indices[v] = index;
            lowlink[v] = index;
            index++;
            stack.push(v);
            onStack.add(v);
            for (const w of adjList[v]) {
              if (indices[w] === -1) {
                strongConnect(w);
                lowlink[v] = Math.min(lowlink[v], lowlink[w]);
              } else if (onStack.has(w)) {
                lowlink[v] = Math.min(lowlink[v], indices[w]);
              }
            }
            if (lowlink[v] === indices[v]) {
              count++;
              while (true) {
                const w = stack.pop();
                onStack.delete(w);
                if (w === v) break;
              }
            }
          };
          for (let k = 1; k <= gN; k++) {
            if (indices[k] === -1) strongConnect(k);
          }
          return `${count}`;
        }
        case "graphVertexOutDegree": return `${adjList[1] ? adjList[1].length : 0}`;
        case "graphIsTournament": {
          const matrix = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(false));
          for (const e of gEdges) matrix[e.u][e.v] = true;
          for (let i = 1; i <= gN; i++) {
            for (let j = i + 1; j <= gN; j++) {
              if ((matrix[i][j] && matrix[j][i]) || (!matrix[i][j] && !matrix[j][i])) return "false";
            }
          }
          return "true";
        }
        case "graphVertexInDegree": {
          let count = 0;
          for (const e of gEdges) { if (e.v === 1) count++; }
          return `${count}`;
        }
        case "graphIsTree": {
          if (gM !== gN - 1) return "false";
          const visited = new Set();
          const dfs = (node) => {
            visited.add(node);
            for (const next of undirectedAdj[node]) {
              if (!visited.has(next)) dfs(next);
            }
          };
          if (gN > 0) dfs(1);
          return `${visited.size === gN}`;
        }
        case "minSpanningTreeEdges": return `${gN > 1 ? gN - 1 : 0}`;
        case "bridgesCount": {
          let index = 0, count = 0;
          const ids = Array(gN + 1).fill(-1);
          const low = Array(gN + 1).fill(-1);
          const dfs = (at, parent) => {
            ids[at] = low[at] = index++;
            for (const to of undirectedAdj[at]) {
              if (to === parent) continue;
              if (ids[to] === -1) {
                dfs(to, at);
                low[at] = Math.min(low[at], low[to]);
                if (ids[at] < low[to]) count++;
              } else {
                low[at] = Math.min(low[at], ids[to]);
              }
            }
          };
          for (let k = 1; k <= gN; k++) {
            if (ids[k] === -1) dfs(k, -1);
          }
          return `${count}`;
        }
        case "articulationPoints": {
          let index = 0;
          const ids = Array(gN + 1).fill(-1);
          const low = Array(gN + 1).fill(-1);
          const isArt = new Set();
          const dfs = (root, at, parent) => {
            let children = 0;
            ids[at] = low[at] = index++;
            for (const to of undirectedAdj[at]) {
              if (to === parent) continue;
              if (ids[to] === -1) {
                children++;
                dfs(root, to, at);
                low[at] = Math.min(low[at], low[to]);
                if (at !== root && ids[at] <= low[to]) isArt.add(at);
              } else {
                low[at] = Math.min(low[at], ids[to]);
              }
            }
            if (at === root && children > 1) isArt.add(at);
          };
          for (let k = 1; k <= gN; k++) {
            if (ids[k] === -1) dfs(k, k, -1);
          }
          return `${isArt.size}`;
        }
        case "transitiveClosure": {
          const reach = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(false));
          for (let k = 1; k <= gN; k++) reach[k][k] = true;
          for (const e of gEdges) reach[e.u][e.v] = true;
          for (let k = 1; k <= gN; k++) {
            for (let i = 1; i <= gN; i++) {
              for (let j = 1; j <= gN; j++) {
                reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]);
              }
            }
          }
          let count = 0;
          for (let i = 1; i <= gN; i++) {
            for (let j = 1; j <= gN; j++) {
              if (reach[i][j]) count++;
            }
          }
          return `${count}`;
        }
        case "allPairsReachability": {
          const reach = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(false));
          for (let k = 1; k <= gN; k++) reach[k][k] = true;
          for (const e of gEdges) reach[e.u][e.v] = true;
          for (let k = 1; k <= gN; k++) {
            for (let i = 1; i <= gN; i++) {
              for (let j = 1; j <= gN; j++) {
                reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]);
              }
            }
          }
          let count = 0;
          for (let i = 1; i <= gN; i++) {
            for (let j = 1; j <= gN; j++) {
              if (reach[i][j]) count++;
            }
          }
          return `${count}`;
        }
        case "graphIsComplete": return `${gM === (gN * (gN - 1)) / 2}`;
        case "graphIsRegular": {
          if (gN === 0) return "true";
          const deg = undirectedAdj[1].length;
          for (let k = 2; k <= gN; k++) {
            if (undirectedAdj[k].length !== deg) return "false";
          }
          return "true";
        }
        case "maxCliqueSize": {
          let maxClique = 0;
          const matrix = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(false));
          for (const e of gEdges) { matrix[e.u][e.v] = true; matrix[e.v][e.u] = true; }
          const solve = (v, currentClique) => {
            maxClique = Math.max(maxClique, currentClique.length);
            for (let i = v; i <= gN; i++) {
              let canAdd = true;
              for (const u of currentClique) {
                if (!matrix[u][i]) { canAdd = false; break; }
              }
              if (canAdd) {
                currentClique.push(i);
                solve(i + 1, currentClique);
                currentClique.pop();
              }
            }
          };
          solve(1, []);
          return `${maxClique}`;
        }
        case "maxIndependentSet": {
          let maxSet = 0;
          const matrix = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(false));
          for (const e of gEdges) { matrix[e.u][e.v] = true; matrix[e.v][e.u] = true; }
          const solve = (v, currentSet) => {
            maxSet = Math.max(maxSet, currentSet.length);
            for (let i = v; i <= gN; i++) {
              let canAdd = true;
              for (const u of currentSet) {
                if (matrix[u][i]) { canAdd = false; break; }
              }
              if (canAdd) {
                currentSet.push(i);
                solve(i + 1, currentSet);
                currentSet.pop();
              }
            }
          };
          solve(1, []);
          return `${maxSet}`;
        }
        case "minVertexCover": {
          let minCover = gN;
          const solve = (v, cover) => {
            let isCover = true;
            for (const e of gEdges) {
              if (!cover.has(e.u) && !cover.has(e.v)) { isCover = false; break; }
            }
            if (isCover) { minCover = Math.min(minCover, cover.size); return; }
            for (let i = v; i <= gN; i++) {
              cover.add(i);
              solve(i + 1, cover);
              cover.delete(i);
            }
          };
          solve(1, new Set());
          return `${minCover}`;
        }
        case "minEdgeCover": {
          let edgesCount = 0;
          const covered = new Set();
          for (const e of gEdges) {
            if (!covered.has(e.u) || !covered.has(e.v)) {
              covered.add(e.u); covered.add(e.v); edgesCount++;
            }
          }
          const uncovered = gN - covered.size;
          return `${edgesCount + uncovered}`;
        }
        case "maxMatchings": {
          let count = 0;
          const covered = new Set();
          for (const e of gEdges) {
            if (!covered.has(e.u) && !covered.has(e.v)) {
              covered.add(e.u); covered.add(e.v); count++;
            }
          }
          return `${count}`;
        }
        case "graphDiameter": {
          const dist = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(Infinity));
          for (let k = 1; k <= gN; k++) dist[k][k] = 0;
          for (const e of gEdges) { dist[e.u][e.v] = 1; dist[e.v][e.u] = 1; }
          for (let k = 1; k <= gN; k++) {
            for (let i = 1; i <= gN; i++) {
              for (let j = 1; j <= gN; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
            }
          }
          let diam = 0;
          for (let i = 1; i <= gN; i++) {
            for (let j = 1; j <= gN; j++) {
              if (dist[i][j] !== Infinity && dist[i][j] > diam) diam = dist[i][j];
            }
          }
          return `${diam}`;
        }
        case "graphRadius": {
          const dist = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(Infinity));
          for (let k = 1; k <= gN; k++) dist[k][k] = 0;
          for (const e of gEdges) { dist[e.u][e.v] = 1; dist[e.v][e.u] = 1; }
          for (let k = 1; k <= gN; k++) {
            for (let i = 1; i <= gN; i++) {
              for (let j = 1; j <= gN; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
            }
          }
          let rad = Infinity;
          for (let i = 1; i <= gN; i++) {
            let ecc = 0;
            for (let j = 1; j <= gN; j++) {
              if (dist[i][j] !== Infinity && dist[i][j] > ecc) ecc = dist[i][j];
            }
            if (ecc > 0 && ecc < rad) rad = ecc;
          }
          return `${rad === Infinity ? 0 : rad}`;
        }
        case "centralVerticesCount": {
          const dist = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(Infinity));
          for (let k = 1; k <= gN; k++) dist[k][k] = 0;
          for (const e of gEdges) { dist[e.u][e.v] = 1; dist[e.v][e.u] = 1; }
          for (let k = 1; k <= gN; k++) {
            for (let i = 1; i <= gN; i++) {
              for (let j = 1; j <= gN; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
            }
          }
          let rad = Infinity;
          const eccs = Array(gN + 1).fill(0);
          for (let i = 1; i <= gN; i++) {
            let ecc = 0;
            for (let j = 1; j <= gN; j++) {
              if (dist[i][j] !== Infinity && dist[i][j] > ecc) ecc = dist[i][j];
            }
            eccs[i] = ecc;
            if (ecc > 0 && ecc < rad) rad = ecc;
          }
          let count = 0;
          for (let i = 1; i <= gN; i++) {
            if (eccs[i] === rad) count++;
          }
          return `${count}`;
        }
        case "vertexEccentricity": {
          const dist = Array(gN + 1).fill(Infinity);
          dist[1] = 0;
          const q = [1];
          while (q.length > 0) {
            const curr = q.shift();
            for (const next of undirectedAdj[curr]) {
              if (dist[next] === Infinity) { dist[next] = dist[curr] + 1; q.push(next); }
            }
          }
          let maxDist = 0;
          for (let k = 1; k <= gN; k++) {
            if (dist[k] !== Infinity && dist[k] > maxDist) maxDist = dist[k];
          }
          return `${maxDist}`;
        }
        case "dagSourceVertices": {
          const inDeg = Array(gN + 1).fill(0);
          for (const e of gEdges) inDeg[e.v]++;
          const sources = [];
          for (let k = 1; k <= gN; k++) {
            if (inDeg[k] === 0) sources.push(k);
          }
          return sources.join(" ") || "0";
        }
        case "dagSinkVertices": {
          const outDeg = Array(gN + 1).fill(0);
          for (const e of gEdges) outDeg[e.u]++;
          const sinks = [];
          for (let k = 1; k <= gN; k++) {
            if (outDeg[k] === 0) sinks.push(k);
          }
          return sinks.join(" ") || "0";
        }
        case "selfLoops": {
          let count = 0;
          for (const e of gEdges) { if (e.u === e.v) count++; }
          return `${count}`;
        }
        case "multipleEdges": {
          const seen = new Set();
          let count = 0;
          for (const e of gEdges) {
            const key = `${e.u}-${e.v}`;
            if (seen.has(key)) count++;
            seen.add(key);
          }
          return `${count}`;
        }
        case "transposeEdges": return `${gM}`;
        case "graphDensity": {
          if (gN <= 1) return "0";
          return `${Math.round((2 * gM) / (gN * (gN - 1)) * 100)}`;
        }
        case "isPlanar": {
          if (gN <= 2) return "true";
          return `${gM <= 3 * gN - 6}`;
        }
        case "maxFlowEdmondsKarp": {
          const capacity = Array(gN + 1).fill(0).map(() => Array(gN + 1).fill(0));
          for (const e of gEdges) {
            capacity[e.u][e.v] = e.w;
          }
          let maxFlow = 0;
          const parent = Array(gN + 1);
          const bfs = (s, t) => {
            parent.fill(-1);
            parent[s] = -2;
            const q = [[s, Infinity]];
            while (q.length > 0) {
              const [curr, flow] = q.shift();
              for (const edge of undirectedAdj[curr]) {
                const next = edge.node;
                if (parent[next] === -1 && capacity[curr][next] > 0) {
                  parent[next] = curr;
                  const newFlow = Math.min(flow, capacity[curr][next]);
                  if (next === t) return newFlow;
                  q.push([next, newFlow]);
                }
              }
            }
            return 0;
          };
          let flow;
          while ((flow = bfs(1, gN)) > 0) {
            maxFlow += flow;
            let curr = gN;
            while (curr !== 1) {
              const prev = parent[curr];
              capacity[prev][curr] -= flow;
              capacity[curr][prev] += flow;
              curr = prev;
            }
          }
          return `${maxFlow}`;
        }
        default:
          return "0";
      }
    }
  });
}

function getEnrichmentParagraph(functionName, tags) {
  const isGraph = tags.includes("Graph") || tags.includes("Trees") || functionName.toLowerCase().includes("graph") || functionName.toLowerCase().includes("tree") || functionName.toLowerCase().includes("path") || functionName.toLowerCase().includes("mst") || functionName.toLowerCase().includes("flow");
  const isDP = tags.includes("Dynamic Programming") || tags.includes("DP");
  const isMath = tags.includes("Math") || tags.includes("Mathematical") || functionName.toLowerCase().includes("prime") || functionName.toLowerCase().includes("fibonacci") || functionName.toLowerCase().includes("factorial") || functionName.toLowerCase().includes("sum");
  const isString = tags.includes("String") || tags.includes("Strings");
  const isArray = tags.includes("Array") || tags.includes("Arrays") || tags.includes("Matrix") || tags.includes("Matrices");

  if (isGraph) {
    return "\n\nGraphs and trees represent networks of nodes connected by edges. Many classic computing challenges, such as finding shortest paths, checking for cycles, and computing spanning trees, are modeled using these structures. For this problem, you should construct the adjacency structure, traverse the nodes using standard algorithms (like Depth First Search or Breadth First Search), and handle connectivity rules carefully.";
  }
  if (isDP) {
    return "\n\nDynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler subproblems. It is applicable when subproblems overlap and have optimal substructure. To solve this efficiently, you should define the DP state transitions, decide on a top-down memoized or bottom-up iterative table approach, and optimize space complexity where possible.";
  }
  if (isMath) {
    return "\n\nMathematical and numerical algorithms form the bedrock of computation. In these challenges, pay special attention to arithmetic overflow, division rules, and time constraints. Aim to solve the problem using optimal algebraic formulas, iterative loops, or bitwise operations to minimize the execution steps.";
  }
  if (isString) {
    return "\n\nStrings are sequences of characters representing text. String processing challenges often involve searching patterns, comparing sequences, manipulating cases, or parsing tokens. Ensure you handle edge cases such as empty strings, special characters, and optimize your algorithm to scan the text in linear time.";
  }
  if (isArray) {
    return "\n\nArrays and matrices are contiguous memory structures storing sequences of elements. Processing arrays efficiently is key to passing large test constraints. Optimize your search using techniques like the two-pointer approach, sliding window, prefix sums, or binary search to avoid nested loops.";
  }
  return "\n\nThis challenge tests your ability to design correct and efficient algorithms. Analyze the constraints, consider edge cases (such as zero, negative, or empty bounds), and ensure your solution operates within the standard time and memory limits.";
}

// Description generator to create high-quality LeetCode-like problem descriptions
function generateDetailedDescription(title, tags, functionName, spec) {
  const descriptionMap = {
  "nthFibonacci": "The Fibonacci numbers are a sequence of integers starting with 0 and 1, where each subsequent number is the sum of the two preceding ones. Given an integer n, calculate the n-th Fibonacci number. The input is a single integer n. The function should return the n-th Fibonacci number as an integer.",
  "factorial": "The factorial of a non-negative integer n is the product of all positive integers less than or equal to n. By definition, the factorial of 0 is 1. Given an integer n, calculate and return its factorial. The input is a single integer n. The function should return the factorial value as an integer.",
  "sumOfNatural": "Calculate the sum of all positive integers from 1 up to a given integer n. This can be calculated using the mathematical formula n times n plus one divided by two. The input is a single integer n. The function should return the sum of the first n natural numbers as an integer.",
  "sumOfSquares": "Compute the sum of the squares of the first n natural numbers, which is 1 squared plus 2 squared plus 3 squared up to n squared. Given an integer n, calculate this sum. The input is a single integer n. The function should return the computed sum of squares as an integer.",
  "isPrimeNumber": "A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. Given an integer n, determine if it is a prime number. The input is a single integer n. The function should return true if the number is prime, and false otherwise.",
  "countPrimes": "Count the number of prime numbers strictly less than or equal to a given non-negative integer n. A prime number is a natural number greater than 1 with no divisors other than 1 and itself. The input is a single integer n. The function should return the total count of prime numbers up to n as an integer.",
  "findGcd": "Given two positive integers A and B, find their Greatest Common Divisor (GCD). The GCD is the largest positive integer that divides both numbers without leaving a remainder. The input consists of two space-separated integers A and B. The function should return the greatest common divisor as an integer.",
  "findLcm": "Given two positive integers A and B, calculate their Least Common Multiple (LCM). The LCM is the smallest positive integer that is divisible by both A and B. The input consists of two space-separated integers A and B. The function should return the least common multiple as an integer.",
  "isPowerOfThree": "An integer n is a power of three if there exists an integer x such that n equals 3 raised to the power of x. Given an integer n, determine whether it is a power of three. The input is a single integer n. The function should return true if n is a power of three, and false otherwise.",
  "isPowerOfFour": "An integer n is a power of four if there exists an integer x such that n equals 4 raised to the power of x. Given an integer n, determine whether it is a power of four. The input is a single integer n. The function should return true if n is a power of four, and false otherwise.",
  "isPerfectNumber": "A perfect number is a positive integer that is equal to the sum of its positive divisors, excluding the number itself. For example, 6 is a perfect number because its divisors are 1, 2, and 3, and their sum is 6. Given an integer n, check if it is a perfect number. The input is a single integer n. The function should return true if n is a perfect number, and false otherwise.",
  "isArmstrongNumber": "An Armstrong number is an integer that is equal to the sum of its own digits each raised to the power of the number of digits. For example, 371 is an Armstrong number because 3 cubed plus 7 cubed plus 1 cubed equals 371. Given an integer n, check if it is an Armstrong number. The input is a single integer n. The function should return true if n is an Armstrong number, and false otherwise.",
  "sumOfDigits": "Given a positive integer n, calculate the sum of all its individual digits. For example, for the input 123, the sum of digits is 1 + 2 + 3 = 6. The input is a single integer n. The function should return the sum of the digits as an integer.",
  "productOfDigits": "Given a positive integer n, calculate the product of all its individual digits. For example, for the input 234, the product of digits is 2 * 3 * 4 = 24. The input is a single integer n. The function should return the product of the digits as an integer.",
  "divisorsCount": "Given an integer n, find the total count of positive divisors of n. For example, the divisors of 6 are 1, 2, 3, and 6, so the count is 4. The input is a single integer n. The function should return the count of positive divisors as an integer.",
  "countSetBits": "Count the number of set bits (1s) in the binary representation of a given integer n. This is also referred to as the Hamming weight or population count. The input is a single integer n. The function should return the number of set bits as an integer.",
  "reverseInteger": "Given an integer n, reverse its digits. If the input is negative, the negative sign should remain at the front of the reversed integer. For example, reversing 123 yields 321, and reversing -456 yields -654. The input is a single integer n. The function should return the reversed integer.",
  "isPalindromeNumber": "An integer is a palindrome if it reads the same backward as forward. For example, 121 is a palindrome, while 123 is not. Negative numbers are not palindromes because of the negative sign. Given an integer n, check if it is a palindrome. The input is a single integer n. The function should return true if n is a palindrome, and false otherwise.",
  "toBaseSeven": "Given an integer n, convert it to its representation in base 7 as a string. For example, the number 100 in base 10 is represented as 202 in base 7. The input is a single integer n. The function should return the base 7 representation of n as a string.",
  "isHappyNumber": "A happy number is defined by a process where you replace the number with the sum of the squares of its digits, and repeat the process until the number equals 1, or it loops endlessly in a cycle. Numbers that end in 1 are happy. Given an integer n, check if it is a happy number. The input is a single integer n. The function should return true if n is a happy number, and false otherwise.",
  "collatzLength": "The Collatz sequence is generated by starting with a positive integer n. In each step, if the current number is even, divide it by two. If it is odd, multiply it by three and add one. The sequence ends when it reaches 1. Find the total number of steps required to reach 1 starting from n. The input is a single integer n. The function should return the length of the sequence as an integer.",
  "celsiusToFahrenheit": "Convert a given temperature in Celsius to Fahrenheit. The formula for conversion is Fahrenheit equals Celsius multiplied by nine-fifths, plus thirty-two. The input is a single temperature value in Celsius. The function should return the converted temperature in Fahrenheit.",
  "circleArea": "Calculate the area of a circle given its radius r. The area is computed as pi times the radius squared. For this calculation, use 3.14159 as the value of pi. The input is a single integer representing the radius of the circle. The function should return the computed area of the circle as a float or rounded value.",
  "sumOfOddDigits": "Given a positive integer n, calculate the sum of all its digits that are odd numbers. For example, if the input is 12345, the odd digits are 1, 3, and 5, and their sum is 9. The input is a single integer n. The function should return the sum of the odd digits as an integer.",
  "sumOfEvenDigits": "Given a positive integer n, calculate the sum of all its digits that are even numbers. For example, if the input is 12345, the even digits are 2 and 4, and their sum is 6. The input is a single integer n. The function should return the sum of the even digits as an integer.",
  "reverseString": "Given a string s, write a function that reverses the character sequence and returns the result. For example, reversing 'hello' yields 'olleh'. The input is a single string s. The function should return the reversed string.",
  "countVowels": "Given a string s, count the total number of vowels (a, e, i, o, u, both uppercase and lowercase) present in the string. The input is a single string s. The function should return the count of vowels as an integer.",
  "countConsonants": "Given a string s, count the total number of consonants (alphabetic characters that are not vowels, both uppercase and lowercase) present in the string. The input is a single string s. The function should return the count of consonants as an integer.",
  "removeVowels": "Given a string s, remove all vowels (a, e, i, o, u, both uppercase and lowercase) from it and return the modified string. The input is a single string s. The function should return the string with all vowels removed.",
  "capitalizeString": "Given a string s consisting of words separated by spaces, capitalize the first letter of each word and convert the other letters to lowercase. The input is a single string s. The function should return the capitalized string.",
  "defangIp": "Defanging an IP address replaces every period '.' in the address with '[.]'. This is commonly done in security tools to prevent users from accidentally clicking on live links. Given a valid IP address string, return its defanged version. The input is a string representing an IP address. The function should return the defanged IP address as a string.",
  "isValidAnagram": "Given two strings s1 and s2, determine if s2 is an anagram of s1. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once. The input consists of two strings, s1 and s2, on separate lines. The function should return true if s2 is an anagram of s1, and false otherwise.",
  "firstUniqChar": "Given a string s, find the first non-repeating character in it and return its 0-based index. If it does not exist, return -1. The input is a single string s. The function should return the index of the first unique character, or -1 if no unique character is found.",
  "canConstructRansom": "Given two strings representing a ransom note and a magazine, determine if the ransom note can be constructed using the letters from the magazine. Each letter in the magazine can only be used once in the ransom note. The input consists of two strings, the ransom note and the magazine, on separate lines. The function should return true if it can be constructed, and false otherwise.",
  "truncateSentence": "A sentence is a list of words that are separated by a single space with no leading or trailing spaces. You are given a sentence string s and an integer k. You want to truncate the sentence such that it contains only the first k words. The input consists of the sentence s on the first line and the integer k on the second line. The function should return the truncated sentence.",
  "detectCapitalUse": "We define the usage of capitals in a word to be right when: 1. All letters in this word are capitals, like 'USA'. 2. All letters in this word are not capitals, like 'leetcode'. 3. Only the first letter in this word is capital, like 'Google'. Given a string s, check if the usage of capitals in it is correct. The input is a single string s. The function should return true if capital usage is correct, and false otherwise.",
  "halvesAreAlike": "You are given a string s of even length. Split this string into two halves of equal length, and let a be the first half and b be the second half. Two strings are alike if they have the same number of vowels (a, e, i, o, u, uppercase and lowercase). Return true if a and b are alike, and false otherwise. The input is a single string s. The function should return true if the halves are alike, and false otherwise.",
  "findWordsSingleRow": "Given an array of strings words, return the words that can be typed using letters of only one row of American keyboard. The keyboard rows are: first row 'qwertyuiop', second row 'asdfghjkl', and third row 'zxcvbnm'. The input is a space-separated list of words. The function should return the words that satisfy the condition, joined by spaces.",
  "isPalindromeString": "A string is a palindrome if it reads the same backward as forward, ignoring case and non-alphanumeric characters. Given a string s, determine if it is a palindrome. The input is a single string s. The function should return true if s is a palindrome, and false otherwise.",
  "prefixCount": "You are given an array of strings words and a string pref. Return the number of strings in words that contain pref as a prefix. A prefix of a string s is any leading contiguous substring of s. The input consists of words on the first line and pref on the second line. The function should return the count of words that start with pref.",
  "replaceDigits": "You are given a 0-indexed string s that has lowercase English letters in its even indices and digits in its odd indices. There is a function shift(c, x) where c is a character and x is a digit, that returns the x-th character after c. For every odd index i, replace the digit s[i] with shift(s[i-1], s[i]). Return the modified string. The input is a single string s. The function should return the modified string.",
  "goalParser": "You are designing a Goal Parser that can interpret a string s representing commands. The command 'G' is parsed as the string 'G', the command '()' is parsed as the string 'o', and the command '(al)' is parsed as the string 'al'. The parser should interpret all commands in the input string in order and return the concatenated resulting string. The input is a single string s. The function should return the parsed string.",
  "arrayStringsAreEqual": "Given two string arrays word1 and word2, return true if the two arrays represent the same string, and false otherwise. A string is represented by an array if the array elements concatenated in order form the string. The input consists of word1 elements on the first line and word2 elements on the second line. The function should return true if they are equal, and false otherwise.",
  "mergeAlternately": "You are given two strings word1 and word2. Merge the strings by adding letters in alternating order, starting with word1. If a string is longer than the other, append the additional letters onto the end of the merged string. Return the merged string. The input consists of word1 on the first line and word2 on the second line. The function should return the merged string.",
  "permutationDifference": "You are given two strings s and t such that t is an anagram of s. The permutation difference between s and t is defined as the sum of the absolute differences between the index of the occurrence of each character in s and its index in t. Return the permutation difference. The input consists of s on the first line and t on the second line. The function should return the difference as an integer.",
  "scoreOfString": "You are given a string s. The score of a string is defined as the sum of the absolute differences between the ASCII values of adjacent characters. Return the score of s. The input is a single string s. The function should return the score as an integer.",
  "reverseWords": "Given a character array representing a sentence s, reverse the order of the words in the sentence. A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space. Return the reversed sentence. The input is a single string s. The function should return the sentence with its words reversed.",
  "expandString": "Given a compressed string s where characters are followed by a digit representing their frequency (for example, 'a3b2'), expand it to its full representation ('aaabb'). The input is a single compressed string s. The function should return the expanded string.",
  "frequencyCount": "Given a string s, count the frequency of each character in the string. Return a string representing the counts of each character in alphabetical order (for example, 'a:3, b:2'). The input is a single string s. The function should return the sorted frequency string.",
  "removeDuplicateChars": "Given a string s, remove all duplicate characters from it, keeping only the first occurrence of each character. The input is a single string s. The function should return the string with duplicates removed.",
  "runningSum": "Given an array of integers nums, calculate the running sum of the array. The running sum of an array at index i is defined as the sum of all elements from index 0 up to index i inclusive. The input is a space-separated list of integers representing the array. The function should return a new array containing these cumulative sums.",
  "moveZeroes": "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements. Note that you must do this in-place without making a copy of the array. The input is a space-separated list of integers representing the array. The function should return the modified array with zeroes shifted.",
  "containsDuplicate": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct. The input is a space-separated list of integers representing the array. The function should return true if duplicates exist, and false otherwise.",
  "majorityElement": "Given an array nums of size n, return the majority element. The majority element is the element that appears more than floor(n / 2) times. You may assume that the majority element always exists in the array. The input is a space-separated list of integers. The function should return the majority element as an integer.",
  "thirdMax": "Given an integer array nums, return the third distinct maximum number in this array. If the third maximum does not exist, return the maximum number. The input is a space-separated list of integers. The function should return the third maximum or maximum value.",
  "sortedSquares": "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order. The input is a space-separated list of integers. The function should return the sorted squared array.",
  "kidsWithCandies": "There are n kids with candies. You are given an integer array candies, where candies[i] represents the number of candies the i-th kid has, and an integer extraCandies, denoting the number of extra candies that you have. Return a boolean array result of length n, where result[i] is true if, after giving the i-th kid all the extraCandies, they will have the greatest number of candies among all the kids, or false otherwise. The input consists of candies on the first line and extraCandies on the second line. The function should return the boolean list.",
  "maximumWealth": "You are given an m x n integer grid accounts where accounts[i][j] is the amount of money the i-th customer has in the j-th bank. Return the wealth that the richest customer has. A customer's wealth is the sum of the money they have in all their bank accounts. The input is a matrix where the first two integers are rows and columns, followed by the elements. The function should return the maximum wealth.",
  "shuffleArray": "Given the array nums consisting of 2n elements in the form [x1, x2, ..., xn, y1, y2, ..., yn], shuffle the array into [x1, y1, x2, y2, ..., xn, yn]. The input consists of the array on the first line and the integer n on the second line. The function should return the shuffled array.",
  "numIdenticalPairs": "Given an array of integers nums, return the number of good pairs. A pair (i, j) is called good if nums[i] == nums[j] and i < j. The input is a space-separated list of integers. The function should return the count of good pairs as an integer.",
  "decompressRleList": "We are given a list nums of integers representing a list compressed with run-length encoding. Consider each adjacent pair of elements [freq, val] = [nums[2*i], nums[2*i+1]] (with i >= 0). For each such pair, there are freq elements with value val concatenated in a sublist. Concatenate all the sublists from left to right to generate the decompressed list. Return the decompressed list. The input is a space-separated list of integers. The function should return the decompressed array.",
  "smallerNumbersThanCurrent": "Given the array nums, for each nums[i] find out how many numbers in the array are smaller than it. That is, for each nums[i] you have to count the number of valid j's such that j != i and nums[j] < nums[i]. Return the answer in an array. The input is a space-separated list of integers. The function should return the count array.",
  "getConcatenation": "Given an integer array nums of length n, you want to create an array ans of length 2n where ans[i] == nums[i] and ans[i + n] == nums[i] for 0 <= i < n (0-indexed). Specifically, ans is the concatenation of two nums arrays. Return the array ans. The input is a space-separated list of integers. The function should return the concatenated array.",
  "sumOddLengthSubarrays": "Given an array of positive integers arr, return the sum of all possible odd-length subarrays of arr. A subarray is a contiguous subsequence of the array. The input is a space-separated list of integers. The function should return the sum as an integer.",
  "pivotIndex": "Given an array of integers nums, calculate the pivot index of this array. The pivot index is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the right of the index. If no such index exists, return -1. The input is a space-separated list of integers. The function should return the pivot index.",
  "maxProduct": "Given the array of integers nums, select two distinct indices i and j of that array. Return the maximum value of (nums[i]-1)*(nums[j]-1). The input is a space-separated list of integers. The function should return the maximum product as an integer.",
  "sortArrayByParity": "Given an integer array nums, move all the even integers to the beginning of the array followed by all the odd integers. Return any array that satisfies this condition. The input is a space-separated list of integers. The function should return the parity-sorted array.",
  "maxSubArray": "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. The input is a space-separated list of integers. The function should return the maximum subarray sum.",
  "intersection": "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique and you may return the result in any order. The input consists of nums1 on the first line and nums2 on the second line. The function should return the intersection array.",
  "unionArrays": "Given two integer arrays nums1 and nums2, return a sorted array representing the union of the two arrays. The union contains all distinct elements present in either array, sorted in ascending order. The input consists of nums1 on the first line and nums2 on the second line. The function should return the sorted union array.",
  "distributeCandies": "Alice has n candies, where the i-th candy is of type candyType[i]. Alice noticed that she started to gain weight, so she visited a doctor. The doctor advised Alice to only eat n / 2 of the candies she has (n is always even). Alice likes her candies very much, and she wants to eat the maximum number of different types of candies while still following the doctor's advice. Given the integer array candyType, return the maximum number of different types of candies she can eat if she only eats n / 2 of them. The input is a space-separated list of integers. The function should return the type count.",
  "isMonotonic": "An array is monotonic if it is either monotone increasing or monotone decreasing. An array nums is monotone increasing if for all i <= j, nums[i] <= nums[j]. An array nums is monotone decreasing if for all i <= j, nums[i] >= nums[j]. Given an integer array nums, return true if the given array is monotonic, or false otherwise. The input is a space-separated list of integers. The function should return true or false.",
  "missingNumber": "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array. The input is a space-separated list of integers. The function should return the missing number as an integer.",
  "peakIndexInMountainArray": "An array arr is a mountain array if it increases to a peak element and then decreases. Given a mountain array arr, return the index i such that arr[0] < arr[1] < ... < arr[i - 1] < arr[i] > arr[i + 1] > ... > arr[arr.length - 1]. The input is a space-separated list of integers. The function should return the peak index as an integer.",
  "findDuplicates": "Given an integer array nums of length n where all the integers of nums are in the range [1, n] and each integer appears once or twice, return an array of all the integers that appear twice. The input is a space-separated list of integers. The function should return the duplicates array.",
  "twoSumSorted": "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Let these two numbers be numbers[index1] and numbers[index2] where 1 <= index1 < index2 <= numbers.length. Return the indices index1 and index2 as space-separated integers. The input consists of the sorted numbers on the first line and the target integer on the second line.",
  "isValidBrackets": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1. Open brackets must be closed by the same type of brackets. 2. Open brackets must be closed in the correct order. 3. Every close bracket has a corresponding open type. The input is a single string s. The function should return true if the string is valid, and false otherwise.",
  "climbStairs": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top? Given an integer n, calculate this value. The input is a single integer n. The function should return the total number of ways to climb.",
  "isLeapYear": "Given a year, determine whether it is a leap year. A leap year is exactly divisible by 4, except for century years (years ending with 00). The century year is a leap year only if it is perfectly divisible by 400. The input is a single integer representing the year. The function should return true if it is a leap year, and false otherwise.",
  "checkTriangleType": "Given three integers representing the side lengths of a triangle, determine its type. Return 'Equilateral' if all sides are equal, 'Isosceles' if two sides are equal, 'Scalene' if all sides are different, or 'Invalid' if the sides cannot form a valid triangle. The input consists of three space-separated integers.",
  "arraySign": "There is a function signFunc(x) that returns: 1 if x is positive, -1 if x is negative, and 0 if x is equal to 0. You are given an integer array nums. Let product be the product of all values in the array nums. Return signFunc(product). The input is a space-separated list of integers. The function should return 1, -1, or 0.",
  "numberOfSteps": "Given an integer num, return the number of steps to reduce it to zero. In one step, if the current number is even, you have to divide it by 2; otherwise, you have to subtract 1 from it. The input is a single integer num. The function should return the step count as an integer.",
  "fizzBuzzClassic": "Given an integer n, return a list of strings representing the numbers from 1 to n. For multiples of three, append 'Fizz' instead of the number, and for multiples of five, append 'Buzz'. For numbers which are multiples of both three and five, append 'FizzBuzz'. Otherwise, append the number itself. The input is a single integer n. The function should return the space-separated list of values.",
  "differenceOfSums": "Given two positive integers n and m, find the difference between the sum of all integers in the range [1, n] that are not divisible by m, and the sum of all integers in the range [1, n] that are divisible by m. Return this difference. The input consists of n and m as space-separated integers.",
  "sumBaseDigits": "Given an integer n in base 10 and a base k, return the sum of the digits of n after converting n from base 10 to base k. The input consists of two space-separated integers n and k. The function should return the digit sum.",
  "addBinary": "Given two binary strings a and b, return their sum as a binary string. The input consists of binary string a on the first line and binary string b on the second line. The function should return the binary sum string.",
  "singleNumberMatch": "Given a non-empty array of integers nums, every element appears twice except for one. Find that single occurrence and return it. The input is a space-separated list of integers. The function should return the single number.",
  "minimumSum": "Given a four-digit positive integer num, split it into two new integers new1 and new2 by using the digits found in num. Leading zeros are allowed in new1 and new2, and all the digits found in num must be used. Return the minimum possible sum of new1 and new2. The input is a single integer num. The function should return the minimum sum.",
  "truncateSentenceString": "Given a sentence string s and an integer k, truncate the sentence so that it contains only the first k words. A word is a sequence of characters separated by single spaces. The input consists of the sentence on the first line and the integer k on the second line. The function should return the truncated sentence.",
  "defuseBomb": "You have a bomb to defuse, and your time is running out! Your helper writes a circular array code of length n and a key k. If k > 0, replace the i-th number with the sum of the next k numbers. If k < 0, replace the i-th number with the sum of the previous |k| numbers. If k == 0, replace the i-th number with 0. Since the array is circular, the next element of array[n-1] is array[0], and the previous element of array[0] is array[n-1]. Return the defused array. The input consists of the array on the first line and k on the second line.",
  "mostWordsFound": "A sentence is a list of words that are separated by a single space with no leading or trailing spaces. You are given an array of strings sentences where each sentences[i] represents a single sentence. Return the maximum number of words that appear in a single sentence. The input is a list of sentences separated by newlines. The function should return the max word count as an integer.",
  "selfDividingRange": "A self-dividing number is a number that is divisible by every digit it contains. For example, 128 is self-dividing because 128 % 1 == 0, 128 % 2 == 0, and 128 % 8 == 0. A self-dividing number is not allowed to contain the digit zero. Given a lower and upper number bound, return a list of all self-dividing numbers in the range, inclusive. The input consists of two space-separated integers representing the left and right bounds. The function should return the space-separated list.",
  "findRowWords": "Given an array of strings words, return the words that can be typed using letters of only one row of the keyboard. Row 1 is 'qwertyuiop', Row 2 is 'asdfghjkl', and Row 3 is 'zxcvbnm'. The input is a space-separated list of words. The function should return the words satisfying this condition joined by spaces.",
  "mergeSortedArrays": "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums1 and nums2 into a single array sorted in non-decreasing order. The input consists of nums1 on the first line and nums2 on the second line. The function should return the merged sorted array.",
  "plusOneDigits": "You are given a large integer represented as an integer array digits, where each digits[i] is the i-th digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's. Increment the large integer by one and return the resulting array of digits. The input is a space-separated list of digits. The function should return the updated digits.",
  "parityMatcher": "Given an array of integers nums, rearrange the array such that all even integers are followed by odd integers, while keeping their original relative order if possible, or alternating parity based on indices. Specifically, match each even element with an odd element at adjacent slots. The input is a space-separated list of integers. The function should return the rearranged array.",
  "removeElementValue": "Given an integer array nums and an integer val, remove all occurrences of val in nums in-place. The order of the elements may be changed. Then return the number of elements in nums which are not equal to val. The input consists of the array on the first line and the element val on the second line. The function should return the count of remaining elements.",
  "convertToTitle": "Given an integer columnNumber, return its corresponding column title as it appears in an Excel sheet. For example, 1 maps to A, 2 to B, 26 to Z, 27 to AA, and 28 to AB. The input is a single integer. The function should return the Excel title string.",
  "titleToNumber": "Given a string columnTitle that represents the column title as appears in an Excel sheet, return its corresponding column number. For example, A maps to 1, B to 2, Z to 26, AA to 27, and AB to 28. The input is a single string. The function should return the column number as an integer.",
  "fibonacciList": "Given an integer n, generate a list containing the first n Fibonacci numbers. Recall that the Fibonacci sequence begins with 0 and 1, and each subsequent number is the sum of the two preceding ones. The input is a single integer n. The function should return the space-separated list of Fibonacci numbers.",
  "minCostClimbingStairs": "You are given an integer array cost where cost[i] is the cost of i-th step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from the step with index 0, or the step with index 1. Return the minimum cost to reach the top of the floor. The input is a space-separated list of step costs. The function should return the minimum cost as an integer.",
  "houseRobber": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. The only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses are broken into on the same night. Given an integer array representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police. The input is a space-separated list of integers. The function should return the max money.",
  "houseRobberII": "You are a professional robber planning to rob houses along a street. Each house has a stashed amount of money. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Meanwhile, adjacent houses have a security system connected, and it will automatically contact the police if two adjacent houses are broken into on the same night. Given an integer array representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police. The input is a space-separated list of integers.",
  "tribonacci": "The Tribonacci sequence Tn is defined as follows: T0 = 0, T1 = 1, T2 = 1, and Tn = Tn-1 + Tn-2 + Tn-3 for n >= 3. Given an integer n, return the value of Tn. The input is a single integer n. The function should return the n-th Tribonacci number as an integer.",
  "divisorGame": "Alice and Bob take turns playing a game on a chalkboard, with Alice starting first. Initially, there is a starting integer number n written on the chalkboard. On each player's turn, that player must choose a positive integer x such that 0 < x < n and n is exactly divisible by x (n % x == 0), and then they replace the number n on the chalkboard with n - x. If a player cannot make a valid move because no such x exists, they lose the game. Your task is to determine if Alice can win the game when both players play optimally. The input is a single integer n. The function should return true if Alice wins, and false otherwise.",
  "climbStairsWays": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top? Given an integer n, calculate the number of unique combinations. The input is a single integer n. The function should return the total ways as an integer.",
  "uniquePaths": "There is a robot on an m x n grid. The robot is initially located at the top-left corner (grid[0][0]). The robot tries to move to the bottom-right corner (grid[m-1][n-1]). The robot can only move either down or right at any point in time. Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner. The input consists of two space-separated integers m and n. The function should return the unique paths count.",
  "uniquePathsWithObstacles": "You are given an m x n integer matrix grid where an obstacle is marked as 1 and a free space is marked as 0. The robot is initially located at the top-left corner (grid[0][0]) and tries to move to the bottom-right corner (grid[m-1][n-1]). The robot can only move down or right. A path cannot pass through any obstacle. Return the number of unique paths. The input is a grid representation with row count, column count, and elements. The function should return the path count.",
  "minPathSum": "Given a m x n grid filled with non-negative numbers, find a path from top-left to bottom-right, which minimizes the sum of all numbers along its path. You can only move either down or right at any point in time. The input consists of row and column dimensions on the first line, followed by the grid values. The function should return the minimum path sum as an integer.",
  "minimumTotal": "Given a triangle array, return the minimum path sum from top to bottom. For each step, you may move to adjacent numbers on the row below. That is, if you are on index i on the current row, you may move to either index i or i + 1 on the next row. The input format begins with the number of rows n, followed by the triangle elements. The function should return the minimum path sum.",
  "numDecodings": "A message containing letters from A-Z can be encoded into numbers using the mapping: 'A' -> '1', 'B' -> '2', ..., 'Z' -> '26'. To decode an encoded message, all the digits must be grouped then mapped back into letters. Given a string s containing only digits, return the number of ways to decode it. The input is a single string of digits. The function should return the number of valid decodings as an integer.",
  "numSquares": "Given an integer n, return the least number of perfect square numbers that sum to n. A perfect square is an integer that is the square of an integer; in other words, it is the product of some integer with itself (e.g. 1, 4, 9, 16). The input is a single integer n. The function should return the minimum count of perfect squares.",
  "coinChange": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1. You may assume that you have an infinite number of each kind of coin. The input consists of the coins array on the first line and the target amount on the second line.",
  "changeCombinations": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return 0. You may assume that you have an infinite number of each kind of coin. The input consists of the coins array on the first line and the target amount on the second line.",
  "lengthOfLIS": "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements. The input is a space-separated list of integers. The function should return the length of the longest increasing subsequence.",
  "longestCommonSubsequence": "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters. The input consists of text1 on the first line and text2 on the second line. The function should return the length.",
  "minDistance": "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: 1. Insert a character, 2. Delete a character, 3. Replace a character. The input consists of word1 on the first line and word2 on the second line. The function should return the minimum edit distance as an integer.",
  "wordBreak": "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words. Note that the same word in the dictionary may be reused multiple times in the segmentation. The input consists of s on the first line and space-separated dictionary words on the second line. The function should return true or false.",
  "maximalSquare": "Given an m x n binary matrix filled with 0's and 1's, find the largest square containing only 1's and return its area. The input consists of the row count, column count, and matrix elements. The function should return the area of the largest square as an integer.",
  "canPartition": "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of elements in both subsets is equal, or false otherwise. The input is a space-separated list of integers. The function should return true if partitioning is possible, and false otherwise.",
  "canJump": "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise. The input is a space-separated list of integers. The function should return true or false.",
  "jumpGameII": "You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. In other words, if you are at nums[i], you can jump to any nums[i + j] where 0 <= j <= nums[i] and i + j < n. Return the minimum number of jumps to reach nums[n - 1]. The input is a space-separated list of integers.",
  "maxProfitI": "You are given an array prices where prices[i] is the price of a given stock on the i-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0. The input is a space-separated list of stock prices.",
  "maxProfitII": "You are given an integer array prices where prices[i] is the price of a given stock on the i-th day. On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it then immediately sell it on the same day. Find and return the maximum profit you can achieve. The input is a space-separated list of stock prices.",
  "maxProfitIII": "You are given an array prices where prices[i] is the price of a given stock on the i-th day. Find the maximum profit you can achieve. You may complete at most two transactions. Note that you may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again). The input is a space-separated list of stock prices.",
  "maxProfitIV": "You are given an integer array prices where prices[i] is the price of a given stock on the i-th day and an integer k. Find the maximum profit you can achieve. You may complete at most k transactions. Note that you must sell the stock before you buy again. The input consists of prices on the first line and k on the second line.",
  "maxProfitWithCooldown": "You are given an array prices where prices[i] is the price of a given stock on the i-th day. Find the maximum profit you can achieve. You may complete as many transactions as you like (i.e., buy one and sell one share of the stock multiple times) with the following constraints: after you sell your stock, you cannot buy stock on the next day (i.e., a cooldown period of one day). The input is a space-separated list of prices.",
  "maxProfitWithFee": "You are given an array prices where prices[i] is the price of a given stock on the i-th day, and an integer fee representing a transaction fee. Find the maximum profit you can achieve. You may complete as many transactions as you like, but you need to pay the transaction fee for each transaction. The input consists of prices on the first line and the transaction fee on the second line.",
  "getRow": "Given an integer rowIndex, return the rowIndex-th (0-indexed) row of the Pascal's triangle. In Pascal's triangle, each number is the sum of the two numbers directly above it. The input is a single integer representing the row index. The function should return the Pascal's triangle row as space-separated integers.",
  "isSubsequence": "Given two strings s and t, return true if s is a subsequence of t, or false otherwise. A subsequence of a string is a new string that is formed from the original string by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters (e.g., 'ace' is a subsequence of 'abcde' while 'aec' is not). The input consists of s on the first line and t on the second line.",
  "deleteAndEarn": "You are given an integer array nums. You want to maximize the number of points you get by performing the following operation any number of times: Pick any nums[i] and delete it to earn nums[i] points. Afterwards, you must delete every element equal to nums[i] - 1 and every element equal to nums[i] + 1. Return the maximum points you can earn. The input is a space-separated list of integers.",
  "integerBreak": "Given an integer n, break it into the sum of k positive integers, where k >= 2, and maximize the product of those integers. Return the maximum product you can get. For example, for n = 10, the maximum product is 36 (3 + 3 + 4 = 10, 3 * 3 * 4 = 36). The input is a single integer n. The function should return the maximum product.",
  "combinationSum4": "Given an array of distinct integers nums and a target integer target, return the number of possible combinations that add up to target. Note that different sequences are counted as different combinations. The input consists of the distinct nums array on the first line and the target integer on the second line.",
  "findPaths": "There is an m x n grid with a ball. The ball is initially at the position [startRow, startCol]. You can move the ball to one of the four adjacent cells in the grid. You can apply at most maxMove moves to the ball. Given the five integers m, n, maxMove, startRow, and startCol, return the number of paths to move the ball out of the grid boundary. The input is m, n, maxMove, startRow, and startCol as space-separated integers.",
  "knightProbability": "On an n x n chessboard, a knight starts at cell [r, c] and attempts to make k moves. The knight can move to 8 possible cells. If the knight moves off the board, it stops. Return the probability that the knight remains on the chessboard after making k moves. The input consists of chessboard size N, move count K, start row r, and start column c as space-separated integers.",
  "numberOfArithmeticSlices": "An integer array is called arithmetic if it consists of at least three elements and if the difference between any two consecutive elements is the same. Given an integer array nums, return the number of arithmetic subarrays of nums. A subarray is a contiguous subsequence of the array. The input is a space-separated list of integers.",
  "findTargetSumWays": "You are given an integer array nums and an integer target. You want to build an expression out of nums by adding one of the symbols '+' and '-' before each integer in nums and then concatenating all the integers. Return the number of different expressions that you can build, which evaluate to target. The input consists of the array on the first line and the target integer on the second line.",
  "findMaxForm": "You are given an array of binary strings strs and two integers m and n. Return the size of the largest subset of strs such that there are at most m 0's and n 1's in the subset. A subset of strs is a collection of strings from strs. The input consists of space-separated binary strings on the first line, and m and n on the second line.",
  "PredictTheWinner": "You are given an integer array nums. Two players are playing a game with this array: player 1 and player 2. Player 1 and player 2 take turns, with player 1 starting first. Both players start with a score of 0. At each turn, the player takes one of the numbers from either end of the array (i.e., nums[0] or nums[nums.length - 1]) which reduces the size of the array by 1. The number chosen is added to their score. The game ends when there are no more elements in the array. Return true if Player 1 can win the game, assuming both play optimally. The input is a space-separated list of integers.",
  "minFallingPathSum": "Given an n x n array of integers matrix, return the minimum sum of a falling path through matrix. A falling path starts at any element in the first row and chooses the element in the next row that is either directly below or diagonally left/right. The input consists of row and column dimensions, followed by matrix elements.",
  "findLengthRepeatedSubarray": "Given two integer arrays nums1 and nums2, return the maximum length of a subarray that appears in both arrays. A subarray is a contiguous part of an array. The input consists of nums1 on the first line and nums2 on the second line. The function should return the length of the longest repeated subarray.",
  "longestPalindromeSubseq": "Given a string s, find the longest palindromic subsequence's length in s. A subsequence is a sequence that can be derived from another string by deleting some or no characters without changing the order of the remaining characters. The input is a single string s. The function should return the length of the subsequence.",
  "mincostTickets": "You have planned some train traveling one year in advance. The days of the year in which you will travel are given as an integer array days. You are also given a costs array of length 3 representing the cost of 1-day, 7-day, and 30-day passes. Return the minimum number of dollars you need to travel every day in the given list of days. The input consists of travel days on the first line and costs on the second line.",
  "lastStoneWeightII": "You are given an array of integers stones where stones[i] is the weight of the i-th stone. We are playing a game with the stones. On each turn, we choose any two stones and smash them together. Suppose the stones have weights x and y with x <= y. The result of this smash is: If x == y, both stones are destroyed, and if x != y, the stone of weight x is destroyed, and the stone of weight y has new weight y - x. At the end of the game, there is at most one stone left. Return the smallest possible weight of the left stone. The input is a space-separated list of stone weights.",
  "numTilings": "You have two types of tiles: a 2 x 1 domino shape and a tromino shape. You may rotate these shapes. Given an integer n, return the number of ways to tile a 2 x n board. Since the answer may be very large, return it modulo 10^9 + 7. The input is a single integer n. The function should return the number of ways as an integer.",
  "largestDivisibleSubset": "Given a set of distinct positive integers nums, find the largest subset such that every pair (u, v) in this subset satisfies: u % v == 0 or v % u == 0. Return the subset as space-separated integers. The input is a space-separated list of integers.",
  "countSubstringsPalindromic": "Given a string s, return the number of palindromic substrings in it. A string is a palindrome when it reads the same backward as forward. A substring is a contiguous sequence of characters within the string. The input is a single string s. The function should return the count of palindromic substrings.",
  "nthUglyNumber": "An ugly number is a positive integer whose prime factors are limited to 2, 3, and 5. Given an integer n, return the n-th ugly number. By definition, 1 is the first ugly number. The input is a single integer n. The function should return the n-th ugly number as an integer.",
  "nthSuperUglyNumber": "A super ugly number is a positive integer whose prime factors are in the given array primes. Given an integer n and an array of primes, return the n-th super ugly number. The input consists of the primes array on the first line and n on the second line.",
  "wiggleMaxLength": "A wiggle sequence is a sequence where the differences between successive numbers strictly alternate between positive and negative. Given an integer array nums, return the length of the longest wiggle subsequence of nums. The input is a space-separated list of integers. The function should return the length of the sequence.",
  "graphVertexCount": "Given a graph represented by n vertices and a list of undirected edges, determine the total number of vertices in the graph. You are given n (the number of vertices) and edges (a list of [u, v] pairs). Return the vertex count as an integer.",
  "graphEdgeCount": "Given a graph represented by n vertices and a list of undirected edges, determine the total number of edges in the graph. You are given n (the number of vertices) and edges (a list of [u, v] pairs). Return the total edge count as an integer.",
  "graphVertexDegreeCount": "Given an undirected graph, calculate the degree of vertex 1. The degree of a vertex is the number of edges incident to it. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the degree of vertex 1 as an integer.",
  "graphIsPathGraph": "Check if the given undirected graph is a path graph. A path graph is a graph whose vertices can be listed in the order v1, v2, ..., vn such that the edges are exactly {vi, vi+1} for 1 <= i < n. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if the graph is a path graph, and false otherwise.",
  "graphIsCycleGraph": "Check if the given undirected graph is a cycle graph. A cycle graph of size n consists of a single cycle of length n, where each vertex has a degree of exactly 2. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if the graph is a cycle graph, and false otherwise.",
  "findConnectedComponents": "Given an undirected graph, determine the total number of connected components in it. A connected component is a maximal set of vertices such that there is a path between any two vertices in the set. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the count of connected components.",
  "graphCycleDetectionUndirected": "Given an undirected graph, check if it contains at least one cycle. A cycle is a path of edges and vertices wherein a vertex is reachable from itself. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if a cycle is detected, and false otherwise.",
  "graphCycleDetectionDirected": "Given a directed graph, check if it contains at least one directed cycle. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return true if a directed cycle exists, and false otherwise.",
  "shortestPathBFS": "Given an unweighted undirected graph, find the shortest path length from vertex 1 to vertex n using Breadth First Search (BFS). If vertex n is unreachable from vertex 1, return -1. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the shortest path length as an integer.",
  "dfsPathReachability": "Given a directed graph, determine if there exists a directed path from vertex 1 to vertex n using Depth First Search (DFS). You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return true if vertex n is reachable from vertex 1, and false otherwise.",
  "graphBipartiteCheck": "Check if the given undirected graph is bipartite. A graph is bipartite if its vertices can be partitioned into two independent sets such that every edge connects a vertex in one set to a vertex in the other. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if the graph is bipartite, and false otherwise.",
  "topologicalSort": "Find a valid topological sort order of the directed acyclic graph (DAG). A topological sort is a linear ordering of vertices such that for every directed edge u -> v, vertex u comes before v in the ordering. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the sorted vertices as space-separated integers, or -1 if the graph contains a cycle.",
  "kruskalsMST": "Find the total weight of the Minimum Spanning Tree (MST) of a connected undirected weighted graph using Kruskal's algorithm. You are given n (number of vertices) and edges (a list of [u, v, w] triples representing edges with weights). Return the total weight of the MST as an integer, or -1 if no spanning tree exists.",
  "primsMST": "Find the total weight of the Minimum Spanning Tree (MST) of a connected undirected weighted graph using Prim's algorithm. You are given n (number of vertices) and edges (a list of [u, v, w] triples representing edges with weights). Return the total weight of the MST as an integer, or -1 if no spanning tree exists.",
  "dijkstraShortestPath": "Find the shortest path distance from vertex 1 to vertex n in a weighted graph with non-negative edge weights using Dijkstra's algorithm. You are given n (number of vertices) and edges (a list of [u, v, w] triples). Return the shortest path distance as an integer, or -1 if vertex n is unreachable.",
  "bellmanFord": "Detect if a weighted directed graph contains a negative weight cycle reachable from vertex 1 using the Bellman-Ford algorithm. You are given n (number of vertices) and edges (a list of [u, v, w] directed triples). Return true if a negative cycle exists, and false otherwise.",
  "floydWarshall": "Calculate the maximum shortest path distance between any pair of reachable vertices in a weighted graph using the Floyd-Warshall algorithm. You are given n (number of vertices) and edges (a list of [u, v, w] triples). Return the maximum shortest path distance as an integer.",
  "graphVertexColoring": "Determine the chromatic number of the graph. The chromatic number is the minimum number of colors needed to color the vertices such that no two adjacent vertices share the same color. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the chromatic number as an integer.",
  "eulerianPath": "Verify if the graph contains an Eulerian Path. An Eulerian Path is a path in a finite graph that visits every edge exactly once. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if an Eulerian Path exists, and false otherwise.",
  "eulerianCircuit": "Verify if the graph contains an Eulerian Circuit. An Eulerian Circuit is an Eulerian Path that starts and ends at the same vertex. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if an Eulerian Circuit exists, and false otherwise.",
  "graphHamiltonPath": "Check if the graph contains a Hamiltonian Path. A Hamiltonian Path is a path in an undirected or directed graph that visits each vertex exactly once. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if a Hamiltonian Path exists, and false otherwise.",
  "stronglyConnectedComponents": "Count the number of strongly connected components (SCCs) in the directed graph using Tarjan's or Kosaraju's algorithm. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the count of SCCs as an integer.",
  "graphVertexOutDegree": "Determine the out-degree of vertex 1 in the directed graph. The out-degree of a vertex is the number of directed edges starting from that vertex. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the out-degree of vertex 1 as an integer.",
  "graphIsTournament": "Check if the directed graph is a tournament. A tournament is a directed graph in which every pair of distinct vertices is connected by a single directed edge in one direction. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return true if it is a tournament, and false otherwise.",
  "graphVertexInDegree": "Determine the in-degree of vertex 1 in the directed graph. The in-degree of a vertex is the number of directed edges ending at that vertex. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the in-degree of vertex 1 as an integer.",
  "graphIsTree": "Validate if the undirected graph is a tree. A tree is a connected acyclic undirected graph with exactly n-1 edges. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if the graph is a tree, and false otherwise.",
  "minSpanningTreeEdges": "Determine the count of edges in the Minimum Spanning Tree (MST) of the graph. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the count of edges in the MST as an integer, or -1 if no spanning tree exists.",
  "bridgesCount": "Count the number of bridges in the graph. A bridge is an edge whose removal increases the number of connected components. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the count of bridges as an integer.",
  "articulationPoints": "Count the number of articulation points (cut vertices) in the graph. An articulation point is a vertex whose removal increases the number of connected components. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the count of articulation points as an integer.",
  "transitiveClosure": "Find the count of reachable pairs in the transitive closure of the directed graph. A vertex v is in the transitive closure of u if there is a directed path from u to v. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the total count of reachable (u, v) pairs.",
  "allPairsReachability": "Find the total count of reachable vertex pairs in the undirected graph. A pair (u, v) is reachable if there is a path between u and v. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the total count of reachable pairs as an integer.",
  "graphIsComplete": "Validate if the graph is a complete graph. A complete graph is one where every pair of distinct vertices is connected by a unique edge. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if the graph is complete, and false otherwise.",
  "graphIsRegular": "Check if the graph is a regular graph. A regular graph is one where every vertex has the same degree. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if the graph is regular, and false otherwise.",
  "maxCliqueSize": "Find the size of the maximum clique in the graph. A clique is a subset of vertices such that every two distinct vertices in the subset are adjacent to each other. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the size of the maximum clique as an integer.",
  "maxIndependentSet": "Find the size of the maximum independent set in the graph. An independent set is a subset of vertices such that no two vertices in the subset share an edge. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the size of the maximum independent set as an integer.",
  "minVertexCover": "Find the size of the minimum vertex cover in the graph. A vertex cover is a set of vertices such that every edge has at least one endpoint in the set. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the size of the minimum vertex cover as an integer.",
  "minEdgeCover": "Find the size of the minimum edge cover in the graph. An edge cover is a set of edges such that every vertex is incident to at least one edge in the set. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the size of the minimum edge cover as an integer.",
  "maxMatchings": "Find the maximum matching size in the graph. A matching is a set of pairwise non-adjacent edges such that no two edges share a common vertex. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the maximum matching size as an integer.",
  "graphDiameter": "Calculate the diameter of the graph. The diameter is the maximum shortest path distance between any pair of vertices. You are given n (number of vertices) and edges (a list of [u, v, w] weighted triples). Return the diameter of the graph as an integer.",
  "graphRadius": "Calculate the radius of the graph. The radius is the minimum eccentricity among all vertices. You are given n (number of vertices) and edges (a list of [u, v, w] weighted triples). Return the radius of the graph as an integer.",
  "centralVerticesCount": "Count the number of central vertices in the graph. A central vertex is a vertex whose eccentricity equals the radius of the graph. You are given n (number of vertices) and edges (a list of [u, v, w] weighted triples). Return the count of central vertices as an integer.",
  "vertexEccentricity": "Calculate the eccentricity of vertex 1 in the graph. The eccentricity of a vertex is the maximum shortest distance from that vertex to any other vertex. You are given n (number of vertices) and edges (a list of [u, v, w] weighted triples). Return the eccentricity of vertex 1 as an integer.",
  "dagSourceVertices": "Find all source vertices in the directed acyclic graph (DAG). A source vertex has an in-degree of 0, meaning no edges point to it. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the source vertices as space-separated integers sorted in ascending order.",
  "dagSinkVertices": "Find all sink vertices in the directed acyclic graph (DAG). A sink vertex has an out-degree of 0, meaning no edges start from it. You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the sink vertices as space-separated integers sorted in ascending order.",
  "selfLoops": "Count the total number of self-loops in the graph. A self-loop is an edge that connects a vertex to itself, i.e., an edge of the form [u, u]. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the count of self-loops as an integer.",
  "multipleEdges": "Count the total number of multiple edges (parallel edges) in the graph. Multiple edges are two or more edges that connect the same pair of vertices. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the count of multiple edge pairs as an integer.",
  "transposeEdges": "Determine the edge count of the transposed directed graph. Transposing a directed graph reverses the direction of all its edges (each [u, v] becomes [v, u]). You are given n (number of vertices) and edges (a list of [u, v] directed pairs). Return the edge count of the transposed graph as an integer.",
  "graphDensity": "Calculate the density of the graph as a percentage. Graph density is the ratio of the actual number of edges to the maximum possible number of edges. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return the density as a percentage rounded to the nearest integer.",
  "isPlanar": "Check if the graph is planar. A planar graph is one that can be drawn on a flat plane without any edges crossing each other. You are given n (number of vertices) and edges (a list of [u, v] pairs). Return true if the graph is planar, and false otherwise.",
  "maxFlowEdmondsKarp": "Calculate the maximum flow value from source vertex 1 to sink vertex n in a flow network using the Edmonds-Karp algorithm. You are given n (number of vertices) and edges (a list of [u, v, w] directed triples where w is the edge capacity). Return the maximum flow value as an integer."
};

  let baseDesc = descriptionMap[functionName] || `Solve the challenge: ${title}. Implement the function ${functionName} according to the specified input and output formats.`;
  
  // Clean all LaTeX math delimiters and backticks
  baseDesc = baseDesc.replace(/\$/g, '').replace(/`/g, '');

  if (!spec) {
    return baseDesc;
  }

  // Generate Examples dynamically from the solver and input generator
  let examplesText = '';
  try {
    const example1Input = spec.generateInput(0);
    const example1Output = spec.solve(example1Input);
    const example2Input = spec.generateInput(1);
    const example2Output = spec.solve(example2Input);

    const formatInput = (sig, rawInp) => {
      const parts = rawInp.trim().split(/\s+/);
      if (parts.length === 0 || rawInp.trim() === "") return "";
      switch (sig) {
        case "number":
          return `n = ${parts[0]}`;
        case "two_numbers":
          return `a = ${parts[0]}, b = ${parts[1]}`;
        case "numbers":
        case "numbers_to_array":
          return `nums = [${parts.join(", ")}]`;
        case "array_target": {
          const lines = rawInp.trim().split("\n");
          const nums = lines[0] ? lines[0].trim().split(/\s+/).join(", ") : "";
          const target = lines[1] ? lines[1].trim() : "";
          return `nums = [${nums}], target = ${target}`;
        }
        case "string":
          return `s = "${rawInp.trim()}"`;
        case "two_strings": {
          const lines = rawInp.trim().split("\n");
          const s1 = lines[0] ? lines[0].trim() : "";
          const s2 = lines[1] ? lines[1].trim() : "";
          return `s1 = "${s1}", s2 = "${s2}"`;
        }
        case "matrix": {
          const r = parseInt(parts[0]);
          const c = parseInt(parts[1]);
          const rows = [];
          let idx = 2;
          for (let i = 0; i < r; i++) {
            rows.push("[" + parts.slice(idx, idx + c).join(", ") + "]");
            idx += c;
          }
          return `matrix = [${rows.join(", ")}]`;
        }
        case "triangle": {
          const nVal = parseInt(parts[0]);
          const rows = [];
          let idx = 1;
          for (let i = 0; i < nVal; i++) {
            rows.push("[" + parts.slice(idx, idx + i + 1).join(", ") + "]");
            idx += i + 1;
          }
          return `triangle = [${rows.join(", ")}]`;
        }
        case "find_paths":
          return `m = ${parts[0]}, n = ${parts[1]}, maxMove = ${parts[2]}, startRow = ${parts[3]}, startCol = ${parts[4]}`;
        case "knight_probability":
          return `N = ${parts[0]}, K = ${parts[1]}, r = ${parts[2]}, c = ${parts[3]}`;
        case "two_arrays": {
          const lines = rawInp.trim().split("\n");
          const arr1 = lines[0] ? lines[0].trim().split(/\s+/).join(", ") : "";
          const arr2 = lines[1] ? lines[1].trim().split(/\s+/).join(", ") : "";
          return `arr1 = [${arr1}], arr2 = [${arr2}]`;
        }
        case "string_array": {
          const lines = rawInp.trim().split("\n");
          const sVal = lines[0] ? lines[0].trim() : "";
          const wordDict = lines[1] ? lines[1].trim().split(/\s+/).map(w => `"${w}"`).join(", ") : "";
          return `s = "${sVal}", wordDict = [${wordDict}]`;
        }
        case "find_max_form": {
          const lines = rawInp.trim().split("\n");
          const strs = lines[0] ? lines[0].trim().split(/\s+/).map(w => `"${w}"`).join(", ") : "";
          const innerParts = lines[1] ? lines[1].trim().split(/\s+/) : [];
          return `strs = [${strs}], m = ${innerParts[0] || 0}, n = ${innerParts[1] || 0}`;
        }
        case "graph": {
          const nVal = parseInt(parts[0]);
          const mVal = parseInt(parts[1]);
          const edges = [];
          for (let i = 0; i < mVal; i++) {
            edges.push(`[${parts[2 + 2*i]}, ${parts[2 + 2*i + 1]}]`);
          }
          return `n = ${nVal}, edges = [${edges.join(", ")}]`;
        }
        case "weighted_graph": {
          const nVal = parseInt(parts[0]);
          const mVal = parseInt(parts[1]);
          const edges = [];
          for (let i = 0; i < mVal; i++) {
            edges.push(`[${parts[2 + 3*i]}, ${parts[2 + 3*i + 1]}, ${parts[2 + 3*i + 2]}]`);
          }
          return `n = ${nVal}, edges = [${edges.join(", ")}]`;
        }
        default:
          return rawInp.trim();
      }
    };

    const formatOutput = (ret, rawOut) => {
      const clean = rawOut.trim();
      if (ret === "numbers") {
        const parts = clean.split(/\s+/);
        if (parts.length > 1) {
          return `[${parts.join(", ")}]`;
        }
        return clean;
      }
      if (ret === "boolean") {
        return clean === "true" ? "true" : "false";
      }
      if (ret === "string") {
        return `"${clean}"`;
      }
      return clean;
    };

    examplesText = `\n\nExample 1:\nInput: ${formatInput(spec.signature, example1Input)}\nOutput: ${formatOutput(spec.returnType, example1Output)}\n\nExample 2:\nInput: ${formatInput(spec.signature, example2Input)}\nOutput: ${formatOutput(spec.returnType, example2Output)}`;
  } catch (e) {
    // Skip examples if any error occurs
  }

  const cleanInput = spec.inputFormat ? spec.inputFormat.replace(/`/g, '') : '';
  const cleanOutput = spec.outputFormat ? spec.outputFormat.replace(/`/g, '') : '';
  
  let ioText = '';
  if (cleanInput) {
    ioText += `\n\nInput\n${cleanInput}`;
  }
  if (cleanOutput) {
    ioText += `\n\nOutput\n${cleanOutput}`;
  }

  return baseDesc + examplesText;
}

// Map the templates for all 200 problems programmatically
const finalProblems = problemSpecs.map(spec => {
  const templates = getTemplates(spec.signature, spec.returnType, spec.functionName);
  
  // Set testcase counts: Easy = 100, Medium = 500, Hard = 1000
  const testCasesCount = spec.difficulty === "Easy" ? 100 : spec.difficulty === "Medium" ? 500 : 1000;
  const testCases = [];
  
  for (let t = 0; t < testCasesCount; t++) {
    const rawInput = spec.generateInput(t);
    let rawOutput = spec.solve(rawInput);
    if (rawOutput === undefined || rawOutput === null || rawOutput === "") {
      rawOutput = "0";
    }
    testCases.push({
      input: rawInput,
      output: String(rawOutput),
      isSample: t < 2 // first 2 are sample cases
    });
  }

  return {
    title: spec.title,
    slug: spec.slug,
    difficulty: spec.difficulty,
    tags: spec.tags,
    description: generateDetailedDescription(spec.title, spec.tags, spec.functionName, spec),
    inputFormat: spec.inputFormat,
    outputFormat: spec.outputFormat,
    constraints: spec.constraints,
    templates,
    testCases,
    timeLimit: spec.difficulty === "Easy" ? 1000 : spec.difficulty === "Medium" ? 1500 : 2500,
    memoryLimit: 256000
  };
});

// Seed to DB connector
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online-judge';

console.log(`Connecting to ${MONGO_URI} to upsert ${finalProblems.length} problems...`);
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Preserving existing user and submission collections.');
    
    console.log(`Upserting ${finalProblems.length} problems into DB...`);
    const seeded = [];
    for (const prob of finalProblems) {
      const p = await Problem.findOneAndUpdate(
        { slug: prob.slug },
        prob,
        { upsert: true, new: true }
      );
      seeded.push(p);
    }
    console.log(`Successfully seeded/updated ${seeded.length} problems in the Database.`);
    
    // Select problems to link to initial Contests
    const twoSum = seeded.find(p => p.slug === 'two-sum-sorted-target')?._id || seeded[0]._id;
    const fibNum = seeded.find(p => p.slug === 'nth-fibonacci-number')?._id || seeded[1]._id;
    const brackets = seeded.find(p => p.slug === 'brackets-structure-validation')?._id || seeded[2]._id;
    const arraySum = seeded.find(p => p.slug === 'running-sum-of-array')?._id || seeded[3]._id;
    
    const now = new Date();
    
    const contests = [
      {
        title: 'CodePlex Grand Weekly Challenge #14',
        description: 'Test your algorithmic agility. 4 challenges, 90 minutes. Ratings will be updated upon completion.',
        status: 'Active',
        startTime: new Date(now.getTime() - 30 * 60 * 1000), // started 30 mins ago
        endTime: new Date(now.getTime() + 60 * 60 * 1000),   // ends in 1 hr
        duration: '90 Mins',
        participantsCount: 1420,
        problems: [twoSum, fibNum, brackets, arraySum]
      },
      {
        title: 'CodePlex Spring Hackathon 2026',
        description: 'Our flagship spring tournament. High-difficulty questions, big prizes, and global bragging rights.',
        status: 'Upcoming',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // starts in 2 days
        endTime: new Date(now.getTime() + (2 * 24 + 3) * 60 * 60 * 1000),
        duration: '3 Hours',
        participantsCount: 3850,
        problems: [twoSum, brackets]
      },
      {
        title: 'CodePlex Biweekly Sprint #7',
        description: 'Short speed coding round. 3 problems, 60 minutes. Great for beginners to practice syntax.',
        status: 'Upcoming',
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // starts in 5 days
        endTime: new Date(now.getTime() + (5 * 24 + 1) * 60 * 60 * 1000),
        duration: '60 Mins',
        participantsCount: 890,
        problems: [fibNum, arraySum]
      },
      {
        title: 'CodePlex Inaugural Cup (Warmup)',
        description: 'First warmup battle to test sandbox compile latencies and interface widgets.',
        status: 'Completed',
        startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endTime: new Date(now.getTime() - (5 * 24 - 2) * 60 * 60 * 1000),
        duration: '2 Hours',
        participantsCount: 940,
        problems: [twoSum, fibNum]
      }
    ];

    const seededContests = [];
    for (const contest of contests) {
      const c = await Contest.findOneAndUpdate(
        { title: contest.title },
        contest,
        { upsert: true, new: true }
      );
      seededContests.push(c);
    }
    console.log(`Successfully seeded/updated ${seededContests.length} contests.`);
    
    mongoose.connection.close();
    console.log('Database Seeding/Updating Complete. Connection Closed.');
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
