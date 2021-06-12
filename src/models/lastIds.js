import mongoose from 'mongoose';

// SCHEMA SETUP
const lastIdsSchema = new mongoose.Schema({
  number: Number,
});

// compile schema into a model
const lastIds = mongoose.model('lastIds', lastIdsSchema);

export default lastIds;
