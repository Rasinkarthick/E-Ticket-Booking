const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  address: { type: String },
  role: {
    type: String,
    enum: ['Passenger', 'Administrator'],
    default: 'Passenger'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
