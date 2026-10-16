import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI not set. Running with built-in data persistence engine.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] MongoDB connection error (${error.message}). Running with built-in data persistence engine.`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => ({
  isConnected,
  uri: process.env.MONGODB_URI ? 'Configured' : 'Not configured (using robust memory engine)',
});
