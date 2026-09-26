const Ticket = require('../models/Ticket');
const Train = require('../models/Train');
const User = require('../models/User');
const Cancellation = require('../models/Cancellation');

// GET /api/admin/tickets
// (Use Case: verify update logic, list all tickets for verification)
const getAllTickets = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await Ticket.find(filter)
      .populate('passenger_id', 'name email age gender address')
      .populate('train_id')
      .sort({ booking_date: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    res.status(500).json({ success: false, message: 'Error retrieving tickets', error: error.message });
  }
};

// PUT /api/admin/tickets/:id/verify
// (Explicit Verification Use Case)
const verifyTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId)
      .populate('passenger_id', 'name email')
      .populate('train_id');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot verify a cancelled ticket.' });
    }

    ticket.is_verified = true;
    if (ticket.status === 'Reserved') {
      ticket.status = 'Booked'; // Mark as Booked/Verified awaiting final issuance
    }
    await ticket.save();

    res.json({
      success: true,
      message: `Ticket ${ticket.pnr} verified successfully by Administrator.`,
      ticket
    });
  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({ success: false, message: 'Error verifying ticket', error: error.message });
  }
};

// POST /api/admin/issue
// (Explicitly derived from Collaboration flow step 12: Admin changes ticket status to 'Issued')
const issueTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;
    if (!ticket_id) {
      return res.status(400).json({ success: false, message: 'Ticket ID is required to issue ticket.' });
    }

    const ticket = await Ticket.findById(ticket_id)
      .populate('passenger_id', 'name email')
      .populate('train_id');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot issue a cancelled ticket.' });
    }

    if (ticket.status === 'Issued') {
      return res.status(400).json({ success: false, message: 'Ticket has already been issued.' });
    }

    // Step 12: Admin changes ticket status to 'Issued'
    ticket.status = 'Issued';
    ticket.is_verified = true;
    await ticket.save();

    res.json({
      success: true,
      message: `Official e-ticket ${ticket.pnr} successfully issued by Administrator!`,
      ticket
    });
  } catch (error) {
    console.error('Issue ticket error:', error);
    res.status(500).json({ success: false, message: 'Error issuing ticket', error: error.message });
  }
};

// POST /api/admin/trains
// (Use Case: update train database/manage train inventory)
const createTrain = async (req, res) => {
  try {
    const { train_name, train_number, source, destination, departure_time, arrival_time, total_seats, fare } = req.body;

    if (!train_name || !source || !destination || !departure_time || !arrival_time || !total_seats) {
      return res.status(400).json({ success: false, message: 'Please provide all required train details.' });
    }

    const totalSeatsNum = Number(total_seats);
    if (isNaN(totalSeatsNum) || totalSeatsNum <= 0) {
      return res.status(400).json({ success: false, message: 'Total seats must be a positive number.' });
    }

    const newTrain = new Train({
      train_name,
      train_number: train_number || ('EXP-' + Math.floor(1000 + Math.random() * 9000)),
      source,
      destination,
      departure_time: new Date(departure_time),
      arrival_time: new Date(arrival_time),
      total_seats: totalSeatsNum,
      available_seats: totalSeatsNum,
      fare: fare ? Number(fare) : 45
    });

    await newTrain.save();

    res.status(201).json({
      success: true,
      message: 'New train added to database successfully',
      train: newTrain
    });
  } catch (error) {
    console.error('Create train error:', error);
    res.status(500).json({ success: false, message: 'Error creating train', error: error.message });
  }
};

// PUT /api/admin/trains/:id
const updateTrain = async (req, res) => {
  try {
    const trainId = req.params.id;
    const updates = req.body;

    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    if (updates.train_name) train.train_name = updates.train_name;
    if (updates.train_number) train.train_number = updates.train_number;
    if (updates.source) train.source = updates.source;
    if (updates.destination) train.destination = updates.destination;
    if (updates.departure_time) train.departure_time = new Date(updates.departure_time);
    if (updates.arrival_time) train.arrival_time = new Date(updates.arrival_time);
    if (updates.fare !== undefined) train.fare = Number(updates.fare);
    if (updates.total_seats !== undefined) {
      const diff = Number(updates.total_seats) - train.total_seats;
      train.total_seats = Number(updates.total_seats);
      train.available_seats = Math.max(0, train.available_seats + diff);
    }
    if (updates.available_seats !== undefined) {
      train.available_seats = Number(updates.available_seats);
    }

    await train.save();

    res.json({
      success: true,
      message: 'Train updated successfully',
      train
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating train', error: error.message });
  }
};

// DELETE /api/admin/trains/:id
const deleteTrain = async (req, res) => {
  try {
    const trainId = req.params.id;
    
    // Check if there are active tickets
    const activeTickets = await Ticket.find({
      train_id: trainId,
      status: { $in: ['Reserved', 'Booked', 'Issued'] }
    });

    if (activeTickets.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete train: There are ${activeTickets.length} active tickets booked for this train.` 
      });
    }

    await Train.findByIdAndDelete(trainId);
    res.json({ success: true, message: 'Train removed from database' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting train', error: error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

// GET /api/admin/cancellations
const getCancellations = async (req, res) => {
  try {
    const cancellations = await Cancellation.find()
      .populate('passenger_id', 'name email')
      .populate({
        path: 'ticket_id',
        populate: { path: 'train_id', select: 'train_name source destination' }
      })
      .sort({ cancellation_date: -1 });

    res.json({ success: true, cancellations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cancellations', error: error.message });
  }
};

// PUT /api/admin/cancellations/:id/refund
const processRefund = async (req, res) => {
  try {
    const cancellation = await Cancellation.findById(req.params.id);
    if (!cancellation) {
      return res.status(404).json({ success: false, message: 'Cancellation record not found' });
    }

    cancellation.refund_status = 'Processed';
    await cancellation.save();

    res.json({
      success: true,
      message: 'Refund marked as Processed.',
      cancellation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing refund', error: error.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalTrains = await Train.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const reservedCount = await Ticket.countDocuments({ status: 'Reserved' });
    const bookedCount = await Ticket.countDocuments({ status: 'Booked' });
    const issuedCount = await Ticket.countDocuments({ status: 'Issued' });
    const cancelledCount = await Ticket.countDocuments({ status: 'Cancelled' });
    const pendingRefunds = await Cancellation.countDocuments({ refund_status: 'Pending' });

    res.json({
      success: true,
      stats: {
        totalTrains,
        totalUsers,
        totalTickets,
        reservedCount,
        bookedCount,
        issuedCount,
        cancelledCount,
        pendingRefunds
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
  }
};

module.exports = {
  getAllTickets,
  verifyTicket,
  issueTicket,
  createTrain,
  updateTrain,
  deleteTrain,
  getUsers,
  getCancellations,
  processRefund,
  getStats
};
