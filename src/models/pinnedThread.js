import mongoose from 'mongoose';

const pinnedThreadSchema = mongoose.Schema({
  forumThread: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'forumThread',
    },
  },
});

export default mongoose.model('pinnedThread', pinnedThreadSchema);
