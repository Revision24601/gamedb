import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

// Initialize the global mongoose object if it doesn't exist
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null } as MongooseConnection;
}

async function dbConnect() {
  try {
    if (global.mongoose.conn) {
      console.log('Using existing MongoDB connection');
      return global.mongoose.conn;
    }

    if (!global.mongoose.promise) {
      const opts = {
        bufferCommands: false,
      };

      global.mongoose.promise = mongoose.connect(MONGODB_URI!, opts);
    }

    global.mongoose.conn = await global.mongoose.promise;
    console.log('MongoDB connected successfully');
    return global.mongoose.conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    global.mongoose.promise = null;
    throw error;
  }
}

export default dbConnect; 