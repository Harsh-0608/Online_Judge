const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { executeCode } = require('../utils/sandbox');
const { analyzeComplexity, analyzeComplexityStatic } = require('../utils/complexityAnalyzer');


router.get('/', protect, async (req, res) => {
  try {
    const problems = await Problem.find({}).select('title slug difficulty acceptanceRate tags totalSubmissions acceptedSubmissions createdAt');
    
    const solvedSubmissions = await Submission.find({
      user: req.user._id,
      status: 'Accepted'
    }).select('problem');

    const solvedProblemIds = new Set(
      solvedSubmissions.map(sub => sub.problem.toString())
    );

    const problemsWithStatus = problems.map(problem => ({
      _id: problem._id,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      acceptanceRate: problem.acceptanceRate,
      tags: problem.tags || [],
      totalSubmissions: problem.totalSubmissions || 0,
      acceptedSubmissions: problem.acceptedSubmissions || 0,
      createdAt: problem.createdAt,
      isSolved: solvedProblemIds.has(problem._id.toString())
    }));

    res.json({
      success: true,
      problems: problemsWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems list: ' + error.message
    });
  }
});


router.get('/submissions/recent', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('problem', 'title slug');

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent submissions: ' + error.message
    });
  }
});


router.get('/submissions/all', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('problem', 'title slug');

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all submissions: ' + error.message
    });
  }
});


// @desc    Get user's code efficiency statistics (time & space complexity metrics)
// @route   GET /api/problems/submissions/stats
// @access  Private
router.get('/submissions/stats', protect, async (req, res) => {
  try {
    const acceptedSubmissions = await Submission.find({
      user: req.user._id,
      status: 'Accepted'
    }).populate('problem');

    if (acceptedSubmissions.length === 0) {
      return res.json({
        success: true,
        timeEfficiency: 0,
        spaceEfficiency: 0,
        solvedCount: 0
      });
    }

    // Map to keep only the best submission per problem to avoid duplicate skewing
    const bestPerProblem = {};
    for (const sub of acceptedSubmissions) {
      if (!sub.problem) continue;
      const probId = sub.problem._id.toString();
      
      const timeLimit = sub.problem.timeLimit || 2000;
      const memoryLimit = sub.problem.memoryLimit || 256000;
      
      const timeScore = Math.max(65, Math.round(100 - (sub.executionTime / timeLimit) * 50));
      const spaceScore = Math.max(75, Math.round(100 - (sub.executionMemory / memoryLimit) * 35));

      if (!bestPerProblem[probId] || timeScore > bestPerProblem[probId].timeScore) {
        bestPerProblem[probId] = { timeScore, spaceScore };
      }
    }

    const problemIds = Object.keys(bestPerProblem);
    if (problemIds.length === 0) {
      return res.json({
        success: true,
        timeEfficiency: 0,
        spaceEfficiency: 0,
        solvedCount: 0
      });
    }

    let totalTimeScore = 0;
    let totalSpaceScore = 0;
    for (const probId of problemIds) {
      totalTimeScore += bestPerProblem[probId].timeScore;
      totalSpaceScore += bestPerProblem[probId].spaceScore;
    }

    const timeEfficiency = Math.round(totalTimeScore / problemIds.length);
    const spaceEfficiency = Math.round(totalSpaceScore / problemIds.length);

    res.json({
      success: true,
      timeEfficiency,
      spaceEfficiency,
      solvedCount: problemIds.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate statistics: ' + error.message
    });
  }
});


router.get('/submissions/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title slug constraints timeLimit memoryLimit functionName');
      
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

  
    if (submission.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this submission' });
    }

    const subObj = submission.toObject();
    if (subObj.problem) {
      subObj.complexityAnalysis = {
        approach: submission.approach || analyzeComplexityStatic(subObj.code, subObj.language, subObj.problem.functionName).approach,
        timeComplexity: submission.timeComplexity || analyzeComplexityStatic(subObj.code, subObj.language, subObj.problem.functionName).timeComplexity,
        spaceComplexity: submission.spaceComplexity || analyzeComplexityStatic(subObj.code, subObj.language, subObj.problem.functionName).spaceComplexity,
        insight: submission.complexityInsight || analyzeComplexityStatic(subObj.code, subObj.language, subObj.problem.functionName).insight
      };
    }
    if (subObj.testCaseResults && subObj.testCaseResults.length > 0) {
      subObj.testCaseResults = subObj.testCaseResults.map(tc => {
        if (!tc.isSample && tc.status === 'Accepted') {
          return {
            ...tc,
            input: null,
            expected: null,
            actual: null
          };
        }
        return tc;
      });
    }

    res.json({
      success: true,
      submission: subObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission details: ' + error.message
    });
  }
});


router.get('/:slug', protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    } 
    const sampleCases = problem.testCases
      .filter(tc => tc.isSample)
      .map(tc => ({
        input: tc.input,
        output: tc.output,
        isSample: true,
        _id: tc._id
      }));

    const isSolved = await Submission.exists({
      user: req.user._id,
      problem: problem._id,
      status: 'Accepted'
    });

    res.json({
      success: true,
      problem: {
        _id: problem._id,
        title: problem.title,
        slug: problem.slug,
        description: problem.description,
        difficulty: problem.difficulty,
        acceptanceRate: problem.acceptanceRate,
        tags: problem.tags || [],
        totalSubmissions: problem.totalSubmissions || 0,
        acceptedSubmissions: problem.acceptedSubmissions || 0,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        templates: problem.templates,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        sampleTestCases: sampleCases,
        isSolved: !!isSolved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem: ' + error.message
    });
  }
});


router.get('/:slug/submissions', protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug }).select('_id');
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const submissions = await Submission.find({
      user: req.user._id,
      problem: problem._id
    })
    .sort({ createdAt: -1 })
    .select('status language executionTime executionMemory errorDetails createdAt');

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions: ' + error.message
    });
  }
});


router.post('/:slug/run', protect, async (req, res) => {
  const { code, language, customInput } = req.body;
  if (!code || !language) {
    return res.status(400).json({ success: false, message: 'Code and language are required fields' });
  }

  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Run sample test cases
    const testCasesToRun = problem.testCases
      .filter(tc => tc.isSample)
      .map(tc => ({
        input: tc.input,
        output: tc.output,
        isSample: true,
        isCustom: false
      }));

    // Run custom input if provided
    if (customInput !== undefined && customInput !== null && customInput.trim().length > 0) {
      // Check if custom input matches a database testcase for validation
      const matchingTestCase = problem.testCases.find(
        tc => tc.input.trim() === customInput.trim()
      );
      
      testCasesToRun.push({
        input: customInput,
        output: matchingTestCase ? matchingTestCase.output : '',
        isSample: false,
        isCustom: true,
        hasExpected: !!matchingTestCase
      });
    }
    
    const result = await executeCode(code, language, testCasesToRun, problem.timeLimit);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Dry run failed: ' + error.message
    });
  }
});


router.post('/:slug/submit', protect, async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({ success: false, message: 'Code and language are required fields' });
  }

  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const originalCount = problem.testCases.length;
    let testCasesToRun = problem.testCases;

    if (originalCount > 50) {
      const sampled = [];
      const usedIndexes = new Set();

      // Include samples
      if (originalCount > 0) { sampled.push(problem.testCases[0]); usedIndexes.add(0); }
      if (originalCount > 1) { sampled.push(problem.testCases[1]); usedIndexes.add(1); }

      // Check last case
      const lastIdx = originalCount - 1;
      let lastCaseAdded = false;
      if (!usedIndexes.has(lastIdx)) {
        lastCaseAdded = true;
      }

      // Sample secret cases evenly
      const startIdx = 2;
      const endIdx = lastIdx - (lastCaseAdded ? 1 : 0);
      const remainingToPick = 50 - sampled.length - (lastCaseAdded ? 1 : 0);

      if (endIdx >= startIdx && remainingToPick > 0) {
        const step = (endIdx - startIdx) / remainingToPick;
        for (let k = 0; k < remainingToPick; k++) {
          const idx = Math.min(endIdx, Math.round(startIdx + k * step));
          if (!usedIndexes.has(idx)) {
            sampled.push(problem.testCases[idx]);
            usedIndexes.add(idx);
          }
        }
      }

      if (lastCaseAdded) {
        sampled.push(problem.testCases[lastIdx]);
      }

      // Sort by original index
      const indexedCases = sampled.map(tc => {
        const originalIndex = problem.testCases.findIndex(orig => orig._id.toString() === tc._id.toString());
        return { tc, originalIndex };
      });
      indexedCases.sort((a, b) => a.originalIndex - b.originalIndex);
      testCasesToRun = indexedCases.map(item => item.tc);
    }

    const result = await executeCode(code, language, testCasesToRun, problem.timeLimit);
    
    // Scale passed cases
    let finalPassedCount = result.passedCount !== undefined ? result.passedCount : 0;
    let finalTotalCount = originalCount;

    // Override TLE for Easy/Medium problems to "Accepted"
    let wasTleOverridden = false;
    if ((problem.difficulty === 'Easy' || problem.difficulty === 'Medium') && result.status === 'Time Limit Exceeded') {
      result.status = 'Accepted';
      finalPassedCount = originalCount;
      wasTleOverridden = true;

      // Update test case results to reflect overridden Accepted status
      if (result.testCaseResults && result.testCaseResults.length > 0) {
        result.testCaseResults = result.testCaseResults.map(tc => {
          if (tc.status === 'Time Limit Exceeded') {
            return {
              ...tc,
              status: 'Accepted',
              actual: tc.actual === 'Time Limit Exceeded' ? 'Success (TLE Overridden for Easy/Medium)' : tc.actual
            };
          }
          return tc;
        });
      }
    }

    if (result.status === 'Accepted') {
      finalPassedCount = originalCount;
    } else if (result.passedCount !== undefined && result.totalCount !== undefined && result.totalCount > 0) {
      finalPassedCount = Math.min(originalCount - 1, Math.floor((result.passedCount / result.totalCount) * originalCount));
    }

    // Analyze complexity
    let complexity = { approach: 'Direct Evaluation', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', insight: '' };
    try {
      complexity = await analyzeComplexity(code, language, problem.functionName);
    } catch (analysisErr) {
      console.error('Complexity analyzer execution failed:', analysisErr.message);
    }

    if (wasTleOverridden) {
      complexity.insight = `[LIMIT NOTICE] Your solution was accepted, but it timed out on larger test cases (exceeded ${problem.timeLimit}ms limit) because it uses a sub-optimal approach. We've accepted it since it is an Easy/Medium difficulty problem, but you should optimize it!\n\n` + complexity.insight;
    }

    const submission = new Submission({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      status: result.status,
      executionTime: result.executionTime,
      executionMemory: result.executionMemory,
      passedCount: finalPassedCount,
      totalCount: finalTotalCount,
      errorDetails: result.status !== 'Accepted' ? (result.errorDetails || result.status) : '',
      testCaseResults: result.testCaseResults || [],
      approach: complexity.approach,
      timeComplexity: complexity.timeComplexity,
      spaceComplexity: complexity.spaceComplexity,
      complexityInsight: complexity.insight
    });

    await submission.save();

    problem.totalSubmissions = (problem.totalSubmissions || 0) + 1;
    if (result.status === 'Accepted') {
      problem.acceptedSubmissions = (problem.acceptedSubmissions || 0) + 1;
    }
    problem.acceptanceRate = Math.round(((problem.acceptedSubmissions || 0) / (problem.totalSubmissions || 1)) * 10000) / 100;
    await problem.save();

    if (result.status === 'Accepted') {
      const alreadySolved = await Submission.exists({
        user: req.user._id,
        problem: problem._id,
        status: 'Accepted',
        _id: { $ne: submission._id } 
      });
      if (!alreadySolved) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { solvedCount: 1 } });
      }
    }

    res.json({
      success: true,
      submissionId: submission._id,
      result: {
        ...result,
        passedCount: finalPassedCount,
        totalCount: finalTotalCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Submission failed: ' + error.message
    });
  }
});

module.exports = router;
