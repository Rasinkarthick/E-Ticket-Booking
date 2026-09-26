const express = require('express');
const router = express.Router();
const { getTrains, getTrainById, checkAvailability } = require('../controllers/trainController');

// GET /api/trains?source=X&destination=Y (Activity 2: check train details)
router.get('/', getTrains);

// GET /api/trains/:id/availability (Activity 3: logical check on available seats)
router.get('/:id/availability', checkAvailability);

// GET /api/trains/:id
router.get('/:id', getTrainById);

module.exports = router;
