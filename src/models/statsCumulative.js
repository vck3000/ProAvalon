import mongoose from 'mongoose';

// SCHEMA SETUP
const statsCumulativeSchema = new mongoose.Schema({
  data: String,
});
// compile schema into a model
const statsCumulative = mongoose.model(
  'statsCumulative',
  statsCumulativeSchema
);

export default statsCumulative;
