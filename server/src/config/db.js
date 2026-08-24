import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (!env.MONGODB_URI) {
    console.warn('[DB] No MONGODB_URI provided in environment. Database persistence is running in memory/mock mode.');
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('[DB] MongoDB Connection Error:', error.message);
    return false;
  }
}

export function isDbConnected() {
  return isConnected || mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[DB] MongoDB Disconnected');
  }
}

