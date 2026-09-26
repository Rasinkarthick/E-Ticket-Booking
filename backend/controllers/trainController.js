const Train = require('../models/Train');
const Ticket = require('../models/Ticket');

// GET /api/trains?source=X&destination=Y
// Activity 2: check train details
const getTrains = async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    const filter = {};

    if (source && source.trim()) {
      filter.source = { $regex: source.trim(), $options: 'i' };
    }
    if (destination && destination.trim()) {
      filter.destination = { $regex: destination.trim(), $options: 'i' };
    }
    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
        filter.departure_time = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const trains = await Train.find(filter).sort({ departure_time: 1 });
    res.json({
      success: true,
      count: trains.length,
      trains
    });
  } catch (error) {
    console.error('Error fetching trains:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching trains', error: error.message });
  }
};

// GET /api/trains/:id
const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }
    res.json({ success: true, train });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/trains/:id/availability
// Activity 3: logical check on available seats
const checkAvailability = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    // Find all active booked/reserved/issued tickets for this train to get taken seat numbers
    const activeTickets = await Ticket.find({
      train_id: train._id,
      status: { $in: ['Reserved', 'Booked', 'Issued'] }
    }).select('seat_number status');

    const bookedSeats = activeTickets.map(t => t.seat_number);

    // Compute logical availability
    const calculatedAvailableSeats = Math.max(0, train.total_seats - bookedSeats.length);

    res.json({
      success: true,
      train_id: train._id,
      train_name: train.train_name,
      total_seats: train.total_seats,
      available_seats: train.available_seats,
      calculated_available_seats: calculatedAvailableSeats,
      booked_seat_numbers: bookedSeats,
      is_available: train.available_seats > 0
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ success: false, message: 'Error checking seat availability', error: error.message });
  }
};

module.exports = { getTrains, getTrainById, checkAvailability };
