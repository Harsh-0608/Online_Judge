const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Upcoming', 'Completed'],
    default: 'Upcoming'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true 
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  participantsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contest', contestSchema);
