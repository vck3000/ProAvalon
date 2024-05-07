import mongoose from 'mongoose';

// SCHEMA SETUP
const patreonRecordSchema = new mongoose.Schema({
  patreonUserId: String,
  patreonUsersName: String,
  proavalonUsernameLower: String,
  userAccessToken: String,
  userAccessTokenExpiry: Date,
  userRefreshToken: String,
  amountCents: Number,
  currentPledgeExpiryDate: Date,
});
// compile schema into a model
const patreonRecord = mongoose.model('patreonRecord', patreonRecordSchema);

export default patreonRecord;
