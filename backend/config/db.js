const mongoose = require('mongoose');

let mongoMemoryServer = null;

const DEFAULT_CLOUD_URI = 'mongodb+srv://rasinkarthicksubramanian_db_user:1qR2z7gv4PraAnps@cluster0.jatylq0.mongodb.net/eticket_db?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  let uri = (process.env.MONGODB_URI || DEFAULT_CLOUD_URI).trim();

  // Strip accidental quotes that might have been copied from .env
  uri = uri.replace(/^["']|["']$/g, '').trim();

  // Normalize Atlas URI: ensure /eticket_db database name is present
  if (uri.includes('.mongodb.net/?')) {
    uri = uri.replace('.mongodb.net/?', '.mongodb.net/eticket_db?');
  } else if (uri.startsWith('mongodb+srv://') && !uri.includes('.mongodb.net/')) {
    uri = uri.replace('.mongodb.net', '.mongodb.net/eticket_db?retryWrites=true&w=majority&appName=Cluster0');
  } else if (uri.endsWith('.mongodb.net/')) {
    uri = uri + 'eticket_db?retryWrites=true&w=majority&appName=Cluster0';
  }

  const isRemote = uri.includes('mongodb+srv://') || process.env.VERCEL;
  // Use 8000ms on Vercel so it fails before Vercel's 10-15s function timeout limit
  const timeoutMs = isRemote ? 8000 : 2500;

  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs
    });
    console.log(`[DB] Successfully connected to MongoDB: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (err) {
    if (process.env.VERCEL) {
      console.error(`[DB] Cloud MongoDB connection failed: ${err.message}`);
      throw err;
    }

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
