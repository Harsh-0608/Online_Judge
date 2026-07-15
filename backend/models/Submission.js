const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'cpp', 'java']
  },
  status: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Compile Error', 'Runtime Error', 'Time Limit Exceeded']
  },
  executionTime: {
    type: Number,
    default: 0 // in ms
  },
  executionMemory: {
    type: Number,
    default: 0 // in KB
  },
  passedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  errorDetails: {
    type: String
  },
  testCaseResults: {
    type: Array,
    default: []
  },
  approach: {
    type: String
  },
  timeComplexity: {
    type: String
  },
  spaceComplexity: {
    type: String
  },
  complexityInsight: {
    type: String
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
