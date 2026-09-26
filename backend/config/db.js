const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eticket_db';

  try {
    // Attempt local or provided MongoDB with 2000ms server selection timeout
    console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[DB] Successfully connected to MongoDB: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[DB] Standard MongoDB connection failed (${err.message}). Initializing embedded MongoMemoryServer fallback...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      console.log(`[DB] In-Memory MongoDB Server started at: ${memoryUri}`);

      await mongoose.connect(memoryUri);
      console.log(`[DB] Successfully connected to In-Memory MongoDB database.`);
    } catch (memErr) {
      console.error('[DB] Failed to initialize MongoMemoryServer:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[DB] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[DB] Error during disconnection:', err);
  }
};

module.exports = { connectDB, disconnectDB };
