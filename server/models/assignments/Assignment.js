const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const AssignmentSchema = new mongoose.Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  type: { // MCQ, Quiz, Code
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
  },
  resourcesUrl: {
    type: String
  },
  duration: {
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  submissions: {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submissionUrl: {
      type: String,
      required: true
    },
    marksObtained: {
      type: Number,
      default: 0
    }
  },
  POC: { // Point Of Contact
    type: Schema.Types.ObjectId,
    ref: 'Professor',
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);