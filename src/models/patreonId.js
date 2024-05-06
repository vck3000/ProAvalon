import mongoose from 'mongoose';

// SCHEMA SETUP
const patreonIdSchema = new mongoose.Schema({
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
const patreonId = mongoose.model('patreonId', patreonIdSchema);

export default patreonId;
