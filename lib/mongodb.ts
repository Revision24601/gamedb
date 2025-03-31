import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Connect to MongoDB using a connection pool and cache the connection
 */
async function dbConnect() {
  if (cached.conn) {
    console.log('🟢 Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log('🔄 Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(mongoose => {
      return mongoose;
    }).catch(err => {
      console.error('❌ MongoDB connection error:', err);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('🟢 MongoDB connected successfully');
    
    // Add connection error handler
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
      cached.conn = null;
      cached.promise = null;
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', closeConnection);
    process.on('SIGTERM', closeConnection);
    
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

/**
 * Close the MongoDB connection when the Node process exits
 */
async function closeConnection() {
  console.log('🔄 Closing MongoDB connection...');
  if (cached.conn) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('🟢 MongoDB connection closed');
  }
  process.exit(0);
}

/**
 * Compatibility function for code that needs direct database access
 * Returns both the mongoose instance and the native driver db
 */
export async function connectToDatabase() {
  const mongoose = await dbConnect();
  const db = mongoose.connection.db;
  return { mongoose, db };
}

export default dbConnect; 