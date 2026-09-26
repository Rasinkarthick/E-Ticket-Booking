const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  passenger_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  train_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  seat_number: { type: String, required: true },
  booking_date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Reserved', 'Booked', 'Issued', 'Cancelled'], 
    default: 'Reserved' 
  },
  pnr: { 
    type: String, 
    unique: true, 
    default: () => 'PNR-' + Math.random().toString(36).substring(2, 8).toUpperCase() 
  },
  fare: { type: Number, default: 45 },
  is_verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
