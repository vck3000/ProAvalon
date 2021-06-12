import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  text: String,
  oldText: String,

  disabled: Boolean,

  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: String,
  },

  timeCreated: Date,
  timeLastEdit: Date,
  likes: Number,
  whoLikedId: [],
  edited: Boolean,

  replyingUsername: String,

  seenUsers: [String],
});

export default mongoose.model('ForumThreadCommentReply', replySchema);
