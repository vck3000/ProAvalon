import mongoose from 'mongoose';

// SCHEMA SETUP
const savedGameSchema = new mongoose.Schema({
  room: String,
});
// compile schema into a model
const savedGame = mongoose.model('savedGame', savedGameSchema);

export default savedGame;
