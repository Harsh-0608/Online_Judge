const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');


// Ensure temp_runs root directory exists
const TEMP_ROOT = path.join(__dirname, '..', 'temp_runs');
if (!fs.existsSync(TEMP_ROOT)) {
  fs.mkdirSync(TEMP_ROOT, { recursive: true });
}

/**
 * Runs a single code submission against a set of test cases.
 * 
 * @param {string} code The user's code
 * @param {string} language 'javascript', 'python', or 'cpp'
 * @param {Array} testCases Array of { input: string, output: string, isSample: boolean }
 * @param {number} timeLimit Timeout limit in milliseconds
 * @returns {Promise<Object>} The run result
 */
const executeCodeInternal = (code, language, testCases, timeLimit = 2000) => {
  return new Promise((resolve) => {
    const runId = Math.random().toString(36).substring(2, 15);
    const runDir = path.join(TEMP_ROOT, `run_${runId}`);
    
    // Create run folder
    fs.mkdirSync(runDir, { recursive: true });

    let sourceFile = '';
    let compileCmd = '';
    let runCmd = '';
    let runArgs = [];

    // Setup filenames and commands based on language
    if (language === 'javascript') {
      sourceFile = path.join(runDir, 'solution.js');
      fs.writeFileSync(sourceFile, code);
      runCmd = 'node';
      runArgs = [sourceFile];
    } else if (language === 'python') {
      sourceFile = path.join(runDir, 'solution.py');
      fs.writeFileSync(sourceFile, code);
      runCmd = 'python';
      runArgs = [sourceFile];
    } else if (language === 'cpp') {
      sourceFile = path.join(runDir, 'solution.cpp');
      fs.writeFileSync(sourceFile, code);
      
      const exeFile = path.join(runDir, 'solution.exe');
      // On Windows, compile with g++ to solution.exe
      compileCmd = `g++ -O3 "${sourceFile}" -o "${exeFile}"`;
      runCmd = exeFile;
      runArgs = [];
    } else if (language === 'java') {
      sourceFile = path.join(runDir, 'Solution.java');
      fs.writeFileSync(sourceFile, code);
      compileCmd = `javac "${sourceFile}"`;
      runCmd = 'java';
      runArgs = ['-cp', runDir, 'Solution'];
    }

    // Step 1: Compilation (for C++ and Java)
    if (language === 'cpp' || language === 'java') {
      try {
        execSync(compileCmd, { stdio: 'pipe', timeout: 8000 });
      } catch (compileError) {
        // Cleanup and return compilation error details
        const stderrLog = compileError.stderr ? compileError.stderr.toString() : compileError.message;
        cleanupDir(runDir);
        return resolve({
          status: 'Compile Error',
          errorDetails: stderrLog,
          executionTime: 0,
          executionMemory: 0,
          passedCount: 0,
          totalCount: testCases.length
        });
      }
    }

    // Step 2: Execute against each testcase sequentially
    let currentCaseIndex = 0;
    let maxTimeUsed = 0;
    let maxMemoryUsed = 0;
    const testCaseResults = [];

    const runNextTestCase = () => {
      if (currentCaseIndex >= testCases.length) {
        cleanupDir(runDir);
        
        // Find overall status (first failing status or Accepted if all pass)
        let overallStatus = 'Accepted';
        const failedCase = testCaseResults.find(r => r.status !== 'Accepted');
        if (failedCase) {
          overallStatus = failedCase.status;
        }

        const passedCount = testCaseResults.filter(r => r.status === 'Accepted').length;

        return resolve({
          status: overallStatus,
          executionTime: Math.max(10, Math.round(maxTimeUsed)),
          executionMemory: Math.max(128, Math.round(maxMemoryUsed)),
          passedCount,
          totalCount: testCases.length,
          testCaseResults
        });
      }

      const testCase = testCases[currentCaseIndex];
      const memoryUsed = getRandomMemoryUsage(language);
      maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);

      const startTime = process.hrtime();
      let child;
      try {
        child = spawn(runCmd, runArgs);
      } catch (err) {
        testCaseResults.push({
          status: 'Runtime Error',
          executionTime: 0,
          executionMemory: 0,
          input: testCase.input,
          expected: testCase.output,
          actual: `Failed to spawn runtime: ${err.message}`,
          isSample: !!testCase.isSample,
          isCustom: !!testCase.isCustom
        });
        cleanupDir(runDir);
        return resolve({
          status: 'Runtime Error',
          executionTime: Math.max(10, Math.round(maxTimeUsed)),
          executionMemory: Math.max(128, Math.round(maxMemoryUsed)),
          passedCount: currentCaseIndex,
          totalCount: testCases.length,
          testCaseResults
        });
      }

      let stdoutData = '';
      let stderrData = '';
      let isTimedOut = false;
      let finished = false;

      // Handle process timeout
      const timeoutTimer = setTimeout(() => {
        isTimedOut = true;
        finished = true;
        try {
          child.kill('SIGKILL');
        } catch (e) {}

        const hrDiff = process.hrtime(startTime);
        const timeElapsedMs = Math.round((hrDiff[0] * 1000) + (hrDiff[1] / 1000000));
        maxTimeUsed = Math.max(maxTimeUsed, timeElapsedMs);

        testCaseResults.push({
          status: 'Time Limit Exceeded',
          executionTime: timeElapsedMs,
          executionMemory: memoryUsed,
          input: testCase.input,
          expected: testCase.output,
          actual: 'Time Limit Exceeded',
          isSample: !!testCase.isSample,
          isCustom: !!testCase.isCustom
        });
        cleanupDir(runDir);
        return resolve({
          status: 'Time Limit Exceeded',
          executionTime: Math.max(10, Math.round(maxTimeUsed)),
          executionMemory: Math.max(128, Math.round(maxMemoryUsed)),
          passedCount: currentCaseIndex,
          totalCount: testCases.length,
          testCaseResults
        });
      }, timeLimit);

      // Write test case input to standard input of child
      child.stdin.write(testCase.input);
      child.stdin.end();

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('error', (err) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutTimer);

        const hrDiff = process.hrtime(startTime);
        const timeElapsedMs = Math.round((hrDiff[0] * 1000) + (hrDiff[1] / 1000000));
        maxTimeUsed = Math.max(maxTimeUsed, timeElapsedMs);

        testCaseResults.push({
          status: 'Runtime Error',
          executionTime: timeElapsedMs,
          executionMemory: memoryUsed,
          input: testCase.input,
          expected: testCase.output,
          actual: err.message,
          isSample: !!testCase.isSample,
          isCustom: !!testCase.isCustom
        });
        cleanupDir(runDir);
        return resolve({
          status: 'Runtime Error',
          executionTime: Math.max(10, Math.round(maxTimeUsed)),
          executionMemory: Math.max(128, Math.round(maxMemoryUsed)),
          passedCount: currentCaseIndex,
          totalCount: testCases.length,
          testCaseResults
        });
      });

      child.on('close', (code, signal) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutTimer);

        const hrDiff = process.hrtime(startTime);
        const timeElapsedMs = Math.round((hrDiff[0] * 1000) + (hrDiff[1] / 1000000));
        maxTimeUsed = Math.max(maxTimeUsed, timeElapsedMs);

        // Check for runtime error (stderr has data or process exited with non-zero code)
        if (stderrData.length > 0 || (code !== 0 && signal !== 'SIGKILL' && signal !== null)) {
          testCaseResults.push({
            status: 'Runtime Error',
            executionTime: timeElapsedMs,
            executionMemory: memoryUsed,
            input: testCase.input,
            expected: testCase.output,
            actual: stderrData || `Process exited with code ${code} (signal: ${signal})`,
            isSample: !!testCase.isSample,
            isCustom: !!testCase.isCustom
          });
          cleanupDir(runDir);
          return resolve({
            status: 'Runtime Error',
            executionTime: Math.max(10, Math.round(maxTimeUsed)),
            executionMemory: Math.max(128, Math.round(maxMemoryUsed)),
            passedCount: currentCaseIndex,
            totalCount: testCases.length,
            testCaseResults
          });
        }

        // Validate stdout against expected output (if expected output is available)
        const actualClean = cleanOutput(stdoutData);
        const expectedClean = cleanOutput(testCase.output || '');
        const hasExpected = !testCase.isCustom || !!testCase.hasExpected;

        if (hasExpected && actualClean !== expectedClean) {
          testCaseResults.push({
            status: 'Wrong Answer',
            executionTime: timeElapsedMs,
            executionMemory: memoryUsed,
            input: testCase.input,
            expected: testCase.output,
            actual: stdoutData,
            isSample: !!testCase.isSample,
            isCustom: !!testCase.isCustom,
            hasExpected: true
          });
          cleanupDir(runDir);
          return resolve({
            status: 'Wrong Answer',
            executionTime: Math.max(10, Math.round(maxTimeUsed)),
            executionMemory: Math.max(128, Math.round(maxMemoryUsed)),
            passedCount: currentCaseIndex,
            totalCount: testCases.length,
            testCaseResults
          });
        }

        // Accepted case
        testCaseResults.push({
          status: 'Accepted',
          executionTime: timeElapsedMs,
          executionMemory: memoryUsed,
          input: testCase.input,
          expected: hasExpected ? testCase.output : null,
          actual: stdoutData,
          isSample: !!testCase.isSample,
          isCustom: !!testCase.isCustom,
          hasExpected: hasExpected
        });

        currentCaseIndex++;
        runNextTestCase();
      });
    };

    // Begin execution loop
    runNextTestCase();
  });
};

/**
 * Standardize outputs by removing carriage returns and trimming whitespaces.
 */
function cleanOutput(str) {
  return str
    .toString()
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

function cleanupDir(dirPath, retries = 5) {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(dirPath, file));
        } catch (unlinkErr) {
          if (retries > 0) {
            setTimeout(() => cleanupDir(dirPath, retries - 1), 200);
            return;
          }
        }
      }
      fs.rmdirSync(dirPath);
    }
  } catch (err) {
    if (retries > 0) {
      setTimeout(() => cleanupDir(dirPath, retries - 1), 200);
    } else {
      console.error(`Cleanup failed: ${dirPath}`, err);
    }
  }
}

function getRandomMemoryUsage(language) {
  if (language === 'cpp') {
    return Math.floor(1200 + Math.random() * 400);
  } else if (language === 'python') {
    return Math.floor(4500 + Math.random() * 1500);
  } else if (language === 'java') {
    return Math.floor(25000 + Math.random() * 5000);
  } else {
    return Math.floor(18000 + Math.random() * 4000);
  }
}

const queue = [];
let activeCount = 0;
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_RUNS) || Math.max(1, Math.min(4, os.cpus().length - 1));

function processQueue() {
  if (queue.length === 0 || activeCount >= MAX_CONCURRENT) {
    return;
  }

  activeCount++;
  const { fn, resolve } = queue.shift();

  fn()
    .then((result) => {
      activeCount--;
      resolve(result);
      processQueue();
    })
    .catch((error) => {
      activeCount--;
      resolve({
        status: 'Runtime Error',
        errorDetails: error.message || 'Execution failed',
        executionTime: 0,
        executionMemory: 0,
        passedCount: 0,
        totalCount: 0
      });
      processQueue();
    });
}

const executeCode = (code, language, testCases, timeLimit = 2000) => {
  return new Promise((resolve) => {
    queue.push({
      fn: () => executeCodeInternal(code, language, testCases, timeLimit),
      resolve
    });
    processQueue();
  });
};

module.exports = {
  executeCode
};
