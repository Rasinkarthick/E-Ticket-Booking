const express = require('express');
const router = express.Router();
const { bookTicket, cancelTicket, getPassengerTickets, getPassengerCancellations } = require('../controllers/passengerController');
const { authenticate } = require('../middleware/auth');

// All passenger routes require authentication
router.use(authenticate);

// POST /api/passenger/book (Activity 4, Sequence 5-11. Passenger requests booking, system performs logical checks, database updates)
router.post('/book', bookTicket);

// POST /api/passenger/cancel (Use Case, Collaboration diagram logic: creates Cancellation record, updates Ticket status)
router.post('/cancel', cancelTicket);

// GET /api/passenger/tickets
router.get('/tickets', getPassengerTickets);

// GET /api/passenger/cancellations
router.get('/cancellations', getPassengerCancellations);

module.exports = router;
