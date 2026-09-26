const Ticket = require('../models/Ticket');
const Train = require('../models/Train');
const Cancellation = require('../models/Cancellation');

// POST /api/passenger/book
// (Activity 4, Sequence 5-11. Passenger requests booking, system performs logical checks (sequence 10-11), database updates (sequence 9))
const bookTicket = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { train_id, seat_number, fare } = req.body;

    if (!train_id || !seat_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'Train ID and Seat Number are required.' 
      });
    }

    // Sequence 10: Logical check - Train existence and seat availability
    const train = await Train.findById(train_id);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found.' });
    }

    if (train.available_seats <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No available seats on this train.' 
      });
    }

    // Sequence 11: Logical check - Ensure specific seat is not already booked/reserved
    const existingActiveTicket = await Ticket.findOne({
      train_id: train._id,
      seat_number: seat_number.toUpperCase().trim(),
      status: { $in: ['Reserved', 'Booked', 'Issued'] }
    });

    if (existingActiveTicket) {
      return res.status(409).json({ 
        success: false, 
        message: `Seat ${seat_number} is already occupied. Please select another seat.` 
      });
    }

    // Sequence 9: Database updates
    // Decrement available seats
    train.available_seats = Math.max(0, train.available_seats - 1);
    await train.save();

    // Create Ticket record with default status 'Reserved'
    const newTicket = new Ticket({
      passenger_id: passengerId,
      train_id: train._id,
      seat_number: seat_number.toUpperCase().trim(),
      booking_date: new Date(),
      status: 'Reserved',
      fare: fare || train.fare || 45,
      is_verified: false
    });

    await newTicket.save();

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('passenger_id', 'name email age gender address')
      .populate('train_id', 'train_name train_number source destination departure_time arrival_time');

    res.status(201).json({
      success: true,
      message: 'Ticket reserved successfully! Awaiting administrator verification and issuance.',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Book ticket error:', error);
    res.status(500).json({ success: false, message: 'Error processing booking', error: error.message });
  }
};

// POST /api/passenger/cancel
// (Use Case, Collaboration diagram logic: creates Cancellation record, updates Ticket status)
const cancelTicket = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { ticket_id, reason } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ success: false, message: 'Ticket ID is required.' });
    }

    const ticket = await Ticket.findById(ticket_id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    // Check ownership if not Administrator
    if (req.user.role !== 'Administrator' && ticket.passenger_id.toString() !== passengerId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this ticket.' });
    }

    if (ticket.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Ticket is already cancelled.' });
    }

    // Update Ticket status
    const previousStatus = ticket.status;
    ticket.status = 'Cancelled';
    await ticket.save();

    // Restore train seat
    const train = await Train.findById(ticket.train_id);
    if (train) {
      train.available_seats = Math.min(train.total_seats, train.available_seats + 1);
      await train.save();
    }

    // Calculate refund amount: 85% of fare (or full fare if reserved)
    const refundPercentage = previousStatus === 'Issued' ? 0.85 : 0.95;
    const calculatedRefund = Number((ticket.fare * refundPercentage).toFixed(2));

    // Collaboration diagram: Create Cancellation record
    const cancellation = new Cancellation({
      ticket_id: ticket._id,
      passenger_id: ticket.passenger_id,
      cancellation_date: new Date(),
      refund_amount: calculatedRefund,
      refund_status: 'Pending',
      reason: reason || 'Passenger requested cancellation'
    });

    await cancellation.save();

    res.json({
      success: true,
      message: 'Ticket cancelled successfully. Refund initiated.',
      ticket,
      cancellation
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({ success: false, message: 'Error cancelling ticket', error: error.message });
  }
};

// GET /api/passenger/tickets
const getPassengerTickets = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const tickets = await Ticket.find({ passenger_id: passengerId })
      .populate('train_id')
      .populate('passenger_id', 'name email')
      .sort({ booking_date: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching passenger tickets', error: error.message });
  }
};

// GET /api/passenger/cancellations
const getPassengerCancellations = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const cancellations = await Cancellation.find({ passenger_id: passengerId })
      .populate('ticket_id')
      .sort({ cancellation_date: -1 });

    res.json({
      success: true,
      cancellations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cancellations', error: error.message });
  }
};

module.exports = { bookTicket, cancelTicket, getPassengerTickets, getPassengerCancellations };
