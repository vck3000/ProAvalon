import mongoose from 'mongoose';

const avatarRequestSchema = new mongoose.Schema({
  forUsername: String,

  resLink: String,
  spyLink: String,
  avatarSetId: Number,
  msgToMod: String,

  dateRequested: Date,

  dateProcessed: Date,
  modWhoProcessed: String,

  processed: Boolean,

  modComment: String,
  approved: Boolean,
});

export default mongoose.model('AvatarRequest', avatarRequestSchema);
