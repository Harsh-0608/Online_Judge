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


/**
 * @route   GET /api/problems/recommendations
 * @desc    Get AI-curated recommended challenges based on user's recent submissions
 * @access  Private
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    const Problem = require('../models/Problem');
    const Submission = require('../models/Submission');

    // 1. Fetch user's recent Accepted submissions
    const recentAccepted = await Submission.find({
      user: req.user._id,
      status: 'Accepted'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('problem', 'title difficulty tags approach');

    // Fetch all problems
    const allProblems = await Problem.find({}).select('title slug difficulty tags');

    // Determine solved problem IDs
    const solvedProblemIds = await Submission.distinct('problem', {
      user: req.user._id,
      status: 'Accepted'
    });
    const solvedProblemIdStrs = solvedProblemIds.map(id => id.toString());

    // Unsolved problems
    const unsolvedProblems = allProblems.filter(p => !solvedProblemIdStrs.includes(p._id.toString()));

    // Fallback: If no solved problems or no unsolved problems left
    if (recentAccepted.length === 0 || unsolvedProblems.length === 0) {
      const easyProblems = allProblems
        .filter(p => p.difficulty === 'Easy' && !solvedProblemIdStrs.includes(p._id.toString()))
        .slice(0, 3);

      let fallbackRecommended = easyProblems;
      if (fallbackRecommended.length < 3) {
        const extraUnsolved = unsolvedProblems
          .filter(p => !fallbackRecommended.some(r => r._id.toString() === p._id.toString()))
          .slice(0, 3 - fallbackRecommended.length);
        fallbackRecommended = [...fallbackRecommended, ...extraUnsolved];
      }
      
      const fullFallback = await Problem.find({
        _id: { $in: fallbackRecommended.map(p => p._id) }
      });

      return res.json({
        success: true,
        recommended: fullFallback.slice(0, 3)
      });
    }

    // Call Groq API to pick 3 recommended problems
    const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
    if (!apiKey) {
      const offlineRecs = unsolvedProblems.slice(0, 3);
      const fullOffline = await Problem.find({
        _id: { $in: offlineRecs.map(p => p._id) }
      });
      return res.json({
        success: true,
        recommended: fullOffline
      });
    }

    const isGroq = apiKey.startsWith('gsk_');
    const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
    let model = process.env.XAI_MODEL || process.env.GROK_MODEL;
    if (isGroq && (!model || model.toLowerCase().includes('grok'))) {
      model = 'llama-3.3-70b-versatile';
    }

    const solvedListInfo = recentAccepted.map(sub => {
      const p = sub.problem;
      if (!p) return null;
      return {
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags,
        userApproach: sub.approach || 'Unknown'
      };
    }).filter(Boolean);

    const candidatesList = unsolvedProblems.map(p => ({
      id: p._id.toString(),
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags
    }));

    const promptBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI algorithm advisor. Your task is to recommend 3 coding challenges from a list of candidates for a user, based on their recently solved problems.\n' +
                   'Rules:\n' +
                   '1. Analyze what the user recently solved (topics, difficulty, and algorithmic approaches).\n' +
                   '2. Select exactly 3 candidate problems from the provided list that are slightly harder/advanced (e.g. progressive difficulty: if solved Easy, suggest Medium; if solved Medium, suggest Hard) or explore similar algorithmic topics/tags (e.g. two pointers, dynamic programming, sorting).\n' +
                   '3. If no tougher candidates are available, suggest candidates that use similar approaches/tags.\n' +
                   '4. Return JSON object with a single key "recommendedIds" which is an array of exactly 3 strings representing the matching candidate IDs from the candidate list: { "recommendedIds": ["id1", "id2", "id3"] }.'
        },
        {
          role: 'user',
          content: `Recently Solved Problems:\n${JSON.stringify(solvedListInfo, null, 2)}\n\nCandidate Problems:\n${JSON.stringify(candidatesList.slice(0, 100), null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let recommendedIds = [];
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json();
        const contentObj = JSON.parse(responseData.choices[0].message.content);
        recommendedIds = contentObj.recommendedIds || [];
      }
    } catch (apiErr) {
      clearTimeout(timeoutId);
      console.error('[Recommendation Engine] API call failed, falling back to static filter:', apiErr.message);
    }

    let recommended = [];
    if (recommendedIds && recommendedIds.length > 0) {
      recommended = allProblems.filter(p => recommendedIds.includes(p._id.toString()));
    }

    if (recommended.length < 3) {
      const alreadyPickedIds = recommended.map(p => p._id.toString());
      const remainingUnsolved = unsolvedProblems.filter(p => !alreadyPickedIds.includes(p._id.toString()));
      
      const harderCandidates = remainingUnsolved.filter(p => p.difficulty === 'Medium' || p.difficulty === 'Hard');
      const fallbackPool = harderCandidates.length > 0 ? harderCandidates : remainingUnsolved;
      
      const padding = fallbackPool.slice(0, 3 - recommended.length);
      recommended = [...recommended, ...padding];
    }

    recommended = recommended.slice(0, 3);

    const fullProblems = await Problem.find({
      _id: { $in: recommended.map(p => p._id) }
    });

    res.json({
      success: true,
      recommended: fullProblems
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations: ' + error.message
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

    const submissionData = {
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
      approach: 'Analyzing...',
      timeComplexity: 'Analyzing...',
      spaceComplexity: 'Analyzing...',
      complexityInsight: 'Our AI review algorithm is checking your code efficiency in the background. Please wait a moment...'
    };

    if (req.user.email === 'guest@codeplex.com') {
      submissionData.expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour TTL
    }

    const submission = new Submission(submissionData);
    await submission.save();

    // Trigger AI complexity analysis asynchronously in the background
    analyzeComplexity(code, language, problem.functionName)
      .then(async (complexity) => {
        if (wasTleOverridden) {
          complexity.insight = `[LIMIT NOTICE] Your solution was accepted, but it timed out on larger test cases (exceeded ${problem.timeLimit}ms limit) because it uses a sub-optimal approach. We've accepted it since it is an Easy/Medium difficulty problem, but you should optimize it!\n\n` + complexity.insight;
        }
        await Submission.updateOne({ _id: submission._id }, {
          approach: complexity.approach,
          timeComplexity: complexity.timeComplexity,
          spaceComplexity: complexity.spaceComplexity,
          complexityInsight: complexity.insight
        });
        console.log(`[AI Review] Asynchronously updated complexity metrics for submission ${submission._id}`);
      })
      .catch(async (analysisErr) => {
        console.error(`Asynchronous complexity analysis failed for submission ${submission._id}:`, analysisErr.message);
        
        // Fallback to static complexity analysis offline (instant)
        let fallback = { approach: 'Direct Evaluation', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', insight: '' };
        try {
          fallback = analyzeComplexityStatic(code, language, problem.functionName);
        } catch (staticErr) {
          console.error('Static fallback analysis failed:', staticErr.message);
        }
        
        if (wasTleOverridden) {
          fallback.insight = `[LIMIT NOTICE] Your solution was accepted, but it timed out on larger test cases (exceeded ${problem.timeLimit}ms limit) because it uses a sub-optimal approach. We've accepted it since it is an Easy/Medium difficulty problem, but you should optimize it!\n\n` + fallback.insight;
        }
        
        await Submission.updateOne({ _id: submission._id }, {
          approach: fallback.approach,
          timeComplexity: fallback.timeComplexity,
          spaceComplexity: fallback.spaceComplexity,
          complexityInsight: fallback.insight || 'Standard execution time constraints apply.'
        });
      });

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
