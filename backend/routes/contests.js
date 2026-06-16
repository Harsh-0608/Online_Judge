const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const { protect } = require('../middleware/auth');

// @desc    Get global leaderboard rankings based on solved count
// @route   GET /api/contests/leaderboard/global
// @access  Private
router.get('/leaderboard/global', protect, async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ solvedCount: -1 })
      .limit(10)
      .select('username solvedCount role');

    // Build standings
    const standings = topUsers.map((u, index) => {
      const isCurrentUser = u._id.toString() === req.user._id.toString();
      return {
        rank: index + 1,
        username: isCurrentUser ? `${u.username} (You)` : u.username,
        solved: u.solvedCount || 0,
        rating: u.role === 'admin' ? 2200 : 1200 + (u.solvedCount || 0) * 150,
        isCurrentUser
      };
    });

    // If there are less than 4 users, mix in a few mock users to make it look full
    if (standings.length < 4) {
      const mockUsers = [
        { username: 'binary_blitz', solved: 142, rating: 2840 },
        { username: 'algo_master_99', solved: 128, rating: 2610 },
        { username: 'pythonic_spark', solved: 115, rating: 2430 },
        { username: 'cpp_speedrunner', solved: 98, rating: 2110 }
      ];
      
      mockUsers.forEach(mu => {
        if (!standings.some(s => s.username.replace(' (You)', '') === mu.username)) {
          standings.push({
            rank: standings.length + 1,
            username: mu.username,
            solved: mu.solved,
            rating: mu.rating,
            isCurrentUser: false
          });
        }
      });
      
      // Sort again by solved count
      standings.sort((a, b) => b.solved - a.solved);
      // Re-assign ranks
      standings.forEach((s, idx) => s.rank = idx + 1);
    }

    res.json({
      success: true,
      standings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch global leaderboard: ' + error.message
    });
  }
});

// @desc    Get all active, upcoming, and past contests
// @route   GET /api/contests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const contests = await Contest.find({}).populate('problems', 'title slug difficulty');
    
    // Check if the current user is registered for each contest
    const contestsWithRegStatus = contests.map(c => {
      const isRegistered = c.registeredUsers
        ? c.registeredUsers.some(uid => uid.toString() === req.user._id.toString())
        : false;

      return {
        _id: c._id,
        title: c.title,
        description: c.description,
        status: c.status,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        participantsCount: c.participantsCount,
        problems: c.problems,
        isRegistered
      };
    });

    res.json({
      success: true,
      contests: contestsWithRegStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contests: ' + error.message
    });
  }
});

// @desc    Register / Join a contest
// @route   POST /api/contests/:id/register
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Check if already registered
    const isAlreadyRegistered = contest.registeredUsers
      ? contest.registeredUsers.some(uid => uid.toString() === req.user._id.toString())
      : false;

    if (isAlreadyRegistered) {
      return res.status(400).json({ success: false, message: 'You are already registered for this contest' });
    }

    // Register user
    if (!contest.registeredUsers) {
      contest.registeredUsers = [];
    }
    contest.registeredUsers.push(req.user._id);
    contest.participantsCount = contest.registeredUsers.length;
    await contest.save();

    res.json({
      success: true,
      message: 'Successfully joined the contest!',
      participantsCount: contest.participantsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join contest: ' + error.message
    });
  }
});

// @desc    Get leaderboard rankings for a contest
// @route   GET /api/contests/:id/leaderboard
// @access  Private
router.get('/:id/leaderboard', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems')
      .populate('registeredUsers', 'username role solvedCount');

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    const totalProblems = contest.problems.length || 4;
    const problemIds = contest.problems.map(p => p._id);
    const registeredUsers = contest.registeredUsers || [];

    const realStandingsList = [];

    // Calculate score & penalty time for each real registered user
    for (const rUser of registeredUsers) {
      // Find accepted submissions for this contest's problems
      const subQuery = {
        user: rUser._id,
        problem: { $in: problemIds },
        status: 'Accepted',
        createdAt: { $gte: contest.startTime }
      };

      // If completed, only count submissions before endTime
      if (contest.status === 'Completed' || new Date() > contest.endTime) {
        subQuery.createdAt.$lte = contest.endTime;
      }

      const acceptedSubs = await Submission.find(subQuery).sort({ createdAt: 1 });

      const solvedProblems = new Set();
      let totalPenaltyTime = 0; // in minutes

      for (const sub of acceptedSubs) {
        const problemIdStr = sub.problem.toString();
        if (!solvedProblems.has(problemIdStr)) {
          solvedProblems.add(problemIdStr);

          // Time elapsed from contest start
          const elapsedMs = sub.createdAt.getTime() - contest.startTime.getTime();
          const elapsedMins = Math.max(0, Math.floor(elapsedMs / 1000 / 60));

          // Incorrect attempts prior to the accepted run
          const incorrectAttempts = await Submission.countDocuments({
            user: rUser._id,
            problem: sub.problem,
            status: { $ne: 'Accepted' },
            createdAt: { $gte: contest.startTime, $lt: sub.createdAt }
          });

          totalPenaltyTime += elapsedMins + (incorrectAttempts * 10);
        }
      }

      const solvedCount = solvedProblems.size;
      const points = solvedCount * 100;

      let timeStr = '00:00';
      if (solvedCount > 0) {
        const hrs = Math.floor(totalPenaltyTime / 60);
        const mins = totalPenaltyTime % 60;
        timeStr = hrs > 0
          ? `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
          : `${mins.toString().padStart(2, '0')}:00`;
      }

      realStandingsList.push({
        username: rUser.username,
        solved: solvedCount,
        points,
        time: timeStr,
        penaltyRaw: totalPenaltyTime,
        rating: rUser.role === 'admin' ? 2200 : 1200 + (rUser.solvedCount || 0) * 10,
        isCurrentUser: rUser._id.toString() === req.user._id.toString()
      });
    }

    // Default mock list to populate leaderboard for demo purposes
    const mockParticipants = [
      { username: 'binary_blitz', solved: Math.min(4, totalProblems), points: Math.min(4, totalProblems) * 100, time: '38:14', penaltyRaw: 38, rating: 2840, isCurrentUser: false },
      { username: 'algo_master_99', solved: Math.min(3, totalProblems), points: Math.min(3, totalProblems) * 100, time: '44:50', penaltyRaw: 44, rating: 2610, isCurrentUser: false },
      { username: 'pythonic_spark', solved: Math.max(0, totalProblems - 2), points: Math.max(0, totalProblems - 2) * 100, time: '52:12', penaltyRaw: 52, rating: 2430, isCurrentUser: false },
      { username: 'cpp_speedrunner', solved: Math.max(0, totalProblems - 2), points: Math.max(0, totalProblems - 2) * 100, time: '65:05', penaltyRaw: 65, rating: 2110, isCurrentUser: false },
      { username: 'recursion_ninja', solved: Math.max(0, totalProblems - 3), points: Math.max(0, totalProblems - 3) * 100, time: '45:30', penaltyRaw: 45, rating: 1980, isCurrentUser: false },
      { username: 'stack_overflowed', solved: Math.max(0, totalProblems - 3), points: Math.max(0, totalProblems - 3) * 100, time: '58:40', penaltyRaw: 58, rating: 1840, isCurrentUser: false },
      { username: 'null_pointer_ex', solved: 0, points: 0, time: '00:00', penaltyRaw: 999, rating: 1650, isCurrentUser: false }
    ];

    // Combine real registered users and mock users, removing duplicates
    const combinedList = [...realStandingsList];
    for (const mock of mockParticipants) {
      if (!combinedList.some(r => r.username.replace(' (You)', '') === mock.username)) {
        combinedList.push(mock);
      }
    }

    // Sort by solved count (descending), points (descending), and penalty time (ascending)
    combinedList.sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved;
      if (b.points !== a.points) return b.points - a.points;
      return a.penaltyRaw - b.penaltyRaw;
    });

    // Assign dynamic ranks
    const standings = combinedList.map((item, index) => ({
      rank: index + 1,
      username: item.isCurrentUser ? `${item.username} (You)` : item.username,
      solved: item.solved,
      points: item.points,
      time: item.time,
      rating: item.rating,
      isCurrentUser: item.isCurrentUser
    }));

    res.json({
      success: true,
      standings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard: ' + error.message
    });
  }
});

module.exports = router;
