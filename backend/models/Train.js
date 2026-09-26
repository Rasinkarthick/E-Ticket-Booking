const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
  train_name: { type: String, required: true },
  train_number: { type: String, default: () => 'EXP-' + Math.floor(1000 + Math.random() * 9000) },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departure_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  total_seats: { type: Number, required: true },
  available_seats: { type: Number, required: true },
  fare: { type: Number, default: 45 }
}, { timestamps: true });

module.exports = mongoose.model('Train', TrainSchema);
