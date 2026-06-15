const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  isSample: {
    type: Boolean,
    default: false
  }
});

const templatesSchema = new mongoose.Schema({
  javascript: {
    type: String,
    required: true
  },
  python: {
    type: String,
    required: true
  },
  cpp: {
    type: String,
    required: true
  },
  java: {
    type: String,
    required: false
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  acceptanceRate: {
    type: Number,
    default: 50.0
  },
  inputFormat: {
    type: String
  },
  outputFormat: {
    type: String
  },
  constraints: {
    type: String
  },
  testCases: [testCaseSchema],
  templates: {
    type: templatesSchema,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 2000 // 2 seconds
  },
  memoryLimit: {
    type: Number,
    default: 256000 // 256 MB in KB
  },
  tags: {
    type: [String],
    default: []
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Problem', problemSchema);
