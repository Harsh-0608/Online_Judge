const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const problemsRoutes = require('./routes/problems');
const contestsRoutes = require('./routes/contests');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default base route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Online Judge API Gateway!'
  });
});

// Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/contests', contestsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server!'
  });
});

// Database connection & Server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online-judge';

console.log('Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Database.');

    // Recalculate and synchronize user solved counts on startup
    try {
      const User = require('./models/User');
      const Submission = require('./models/Submission');
      const users = await User.find({});
      for (const user of users) {
        const uniqueSolved = await Submission.distinct('problem', { user: user._id, status: 'Accepted' });
        if (user.solvedCount !== uniqueSolved.length) {
          user.solvedCount = uniqueSolved.length;
          await user.save();
          console.log(`[Migration] Synced solvedCount for user '${user.username}' to ${uniqueSolved.length}`);
        }
      }
    } catch (migError) {
      console.error('Failed to synchronize user solved counts on startup:', migError.message);
    }

    app.listen(PORT, () => {
      console.log(`Backend server is running in development mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database Connection Error:', error.message);
    process.exit(1);
  });
