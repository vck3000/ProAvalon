import mongoose, { mongo } from 'mongoose';

const ReportSchema = new mongoose.Schema({
  reportedPlayer: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: String,
  },

  playerWhoReported: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: String,
  },

  date: Date,

  reason: String,

  description: String,

  resolved: {
    type: Boolean,
    default: false,
  },

  modComment: String,

  modWhoResolved: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: String,
  },
});

const Report = mongoose.model('Report', ReportSchema);

export default Report;
