import mongoose from 'mongoose';

const globalWithMongoose = global as typeof globalThis & {
  mongoose: { conn: any; promise: any } | undefined;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      family: 4,
    }).catch(err => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;

    mongoose.connection.on('error', () => {
      cached.conn = null;
      cached.promise = null;
    });

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

export async function connectToDatabase() {
  const mongoose = await dbConnect();
  const db = mongoose.connection.db;
  return { mongoose, db };
}

export default dbConnect;
