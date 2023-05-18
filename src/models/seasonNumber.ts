import mongoose from 'mongoose';

// SCHEMA SETUP
const seasonNumberSchema = new mongoose.Schema({
  number: Number,
});

// compile schema into a model
const seasonNumber = mongoose.model('seasonNumber', seasonNumberSchema);

export default seasonNumber;
