const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

/**
 * Calculates a user's contest rating based on their submission performance in completed contests.
 * Every user starts at a baseline of 1500.
 */
async function getUserContestRating(userId) {
  let rating = 1500;

  try {
    // Find all completed contests where the user was registered
    const contests = await Contest.find({
      registeredUsers: userId,
      status: 'Completed'
    }).populate('problems');

    for (const contest of contests) {
      const problemIds = contest.problems.map(p => p._id);

      // Find unique problems solved by this user during the contest duration
      const acceptedSubs = await Submission.find({
        user: userId,
        problem: { $in: problemIds },
        status: 'Accepted',
        createdAt: { $gte: contest.startTime, $lte: contest.endTime }
      }).sort({ createdAt: 1 });

      const solvedProblems = new Set();
      let incorrectPenalty = 0;

      for (const sub of acceptedSubs) {
        const problemIdStr = sub.problem.toString();
        if (!solvedProblems.has(problemIdStr)) {
          solvedProblems.add(problemIdStr);

          // Count incorrect attempts before the first accepted run for this problem
          const incorrectAttempts = await Submission.countDocuments({
            user: userId,
            problem: sub.problem,
            status: { $ne: 'Accepted' },
            createdAt: { $gte: contest.startTime, $lt: sub.createdAt }
          });
          incorrectPenalty += incorrectAttempts * 5;
        }
      }

      const solvedCount = solvedProblems.size;

      if (solvedCount === 0) {
        // Registered but did not solve anything: -50 penalty
        rating -= 50;
      } else {
        // Gain points per solved problem: +80 per solve
        rating += solvedCount * 80;
        
        // Deduct for incorrect runs
        rating -= incorrectPenalty;

        // Extra rank bonus if they participated and performed well.
        const standings = [];
        for (const regUser of contest.registeredUsers) {
          const userSubs = await Submission.find({
            user: regUser,
            problem: { $in: problemIds },
            status: 'Accepted',
            createdAt: { $gte: contest.startTime, $lte: contest.endTime }
          }).sort({ createdAt: 1 });

          const userSolved = new Set();
          let userRawPenalty = 0;

          for (const sub of userSubs) {
            const pStr = sub.problem.toString();
            if (!userSolved.has(pStr)) {
              userSolved.add(pStr);
              const elapsedMins = Math.max(0, Math.floor((sub.createdAt.getTime() - contest.startTime.getTime()) / 1000 / 60));
              const wrongCount = await Submission.countDocuments({
                user: regUser,
                problem: sub.problem,
                status: { $ne: 'Accepted' },
                createdAt: { $gte: contest.startTime, $lt: sub.createdAt }
              });
              userRawPenalty += elapsedMins + wrongCount * 10;
            }
          }

          standings.push({
            userId: regUser.toString(),
            solved: userSolved.size,
            penalty: userRawPenalty
          });
        }

        // Sort standings
        standings.sort((a, b) => {
          if (b.solved !== a.solved) return b.solved - a.solved;
          return a.penalty - b.penalty;
        });

        // Find user's rank
        const rank = standings.findIndex(item => item.userId === userId.toString()) + 1;
        if (rank === 1) {
          rating += 150; // #1 Winner bonus
        } else if (rank === 2) {
          rating += 100; // #2 Runner up bonus
        } else if (rank === 3) {
          rating += 75; // #3 Bronze bonus
        } else if (rank <= 5) {
          rating += 40; // Top 5 bonus
        }
      }
    }

    // Practice bonus based on all unique problems solved outside or inside contests
    const userSubs = await Submission.find({
      user: userId,
      status: 'Accepted'
    }).populate('problem');

    const solvedProblemsUnique = new Map();
    for (const sub of userSubs) {
      if (sub.problem && !solvedProblemsUnique.has(sub.problem._id.toString())) {
        solvedProblemsUnique.set(sub.problem._id.toString(), sub.problem);
      }
    }

    let practiceBonus = 0;
    for (const problem of solvedProblemsUnique.values()) {
      if (problem.difficulty === 'Easy') {
        practiceBonus += 20;
      } else if (problem.difficulty === 'Medium') {
        practiceBonus += 50;
      } else if (problem.difficulty === 'Hard') {
        practiceBonus += 100;
      } else {
        practiceBonus += 20;
      }
    }
    
    rating += practiceBonus;

  } catch (err) {
    console.error('Error calculating rating for user:', userId, err.message);
  }

  // Baseline rating floor is 1000, ceiling is 3000
  return Math.max(1000, Math.min(3000, rating));
}

module.exports = { getUserContestRating };
