import mongoose from 'mongoose';

// SCHEMA SETUP
const seaonNumberSchema = new mongoose.Schema({
  number: Number,
});

// compile schema into a model
const seaonNumber = mongoose.model('seaonNumber', seaonNumberSchema);

export default seaonNumber;
