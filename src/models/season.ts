import mongoose from 'mongoose';

// SCHEMA SETUP
const seasonSchema = new mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
});

// compile schema into a model
const Season = mongoose.model('season', seasonSchema);

export default Season;
