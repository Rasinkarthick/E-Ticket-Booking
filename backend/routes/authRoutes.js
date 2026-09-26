const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register (Activity flow 1-2: submits details)
router.post('/register', register);

// POST /api/auth/login (Uses credentials, database verification)
router.post('/login', login);

// GET /api/auth/me
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
