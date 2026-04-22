import mongoose from 'mongoose';

// SCHEMA SETUP
const modOrgSchema = new mongoose.Schema({
  role: String,
  username: String,
  usernameLower: String
});
// compile schema into a model
const modOrg = mongoose.model('modOrg', modOrgSchema);

export default modOrg;
