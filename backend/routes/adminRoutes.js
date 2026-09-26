const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

// All admin routes require authentication and Administrator role
router.use(authenticate, requireRole('Administrator'));

// Analytics
router.get('/stats', getStats);

// Ticket Management
// GET /api/admin/tickets (Use Case: verify update logic, list all tickets for verification)
router.get('/tickets', getAllTickets);

// PUT /api/admin/tickets/:id/verify (Explicit Verification Use Case)
router.put('/tickets/:id/verify', verifyTicket);

// POST /api/admin/issue (Explicitly derived from Collaboration flow step 12: Admin changes ticket status to 'Issued')
router.post('/issue', issueTicket);

// Train Management
// POST /api/admin/trains (Use Case: update train database/manage train inventory)
router.post('/trains', createTrain);
router.put('/trains/:id', updateTrain);
router.delete('/trains/:id', deleteTrain);

// User Management
router.get('/users', getUsers);

// Cancellations & Refunds
router.get('/cancellations', getCancellations);
router.put('/cancellations/:id/refund', processRefund);

module.exports = router;
