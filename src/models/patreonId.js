import mongoose from 'mongoose';

// SCHEMA SETUP
const patreonIdSchema = new mongoose.Schema({
  userId: String,
  inGameUsernameLower: String,
  userAccessToken: String,
  userRefreshToken: String,
  userAccessTokenExpiry: Date,
  amountCents: Number,
  pledgeExpiryDate: Date,
});
// compile schema into a model
const patreonId = mongoose.model('patreonId', patreonIdSchema);

export default patreonId;
