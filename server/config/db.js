import mongoose from 'mongoose';

/**
 * Connect to MongoDB with robust error handling and event monitoring
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expenso';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] Could not connect to ${uri}: ${error.message}`);
    console.warn(`[MongoDB Advisory] Ensure your local MongoDB instance is running, or specify a MongoDB Atlas connection string in server/.env (MONGO_URI).`);
    // Do not terminate process immediately so health checks and informational routes still respond
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Error]', err);
});
