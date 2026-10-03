const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seed/seeder');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow requests from any frontend port/origin
  credentials: true
}));
app.use(express.json());

// Serverless DB connection middleware (ensures DB is ready on Vercel)
let dbPromise = null;
app.use(async (req, res, next) => {
  if (!dbPromise) {
    dbPromise = connectDB()
      .then(() => seedDatabase())
      .catch(err => {
        dbPromise = null;
        throw err;
      });
  }
  try {
    await dbPromise;
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database initialization error',
      error: err.message 
    });
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/admin', adminRoutes);

// Health check & API Root
app.get(['/', '/api', '/api/health'], (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'E-Ticket Booking REST API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize DB and start server locally
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 E-Ticket Booking Server listening on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
