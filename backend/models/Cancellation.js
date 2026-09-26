const mongoose = require('mongoose');

const CancellationSchema = new mongoose.Schema({
  ticket_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  passenger_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cancellation_date: { type: Date, default: Date.now },
  refund_amount: { type: Number },
  refund_status: { 
    type: String, 
    enum: ['Pending', 'Processed'], 
    default: 'Pending' 
  },
  reason: { type: String, default: 'Passenger requested cancellation' }
}, { timestamps: true });

module.exports = mongoose.model('Cancellation', CancellationSchema);
