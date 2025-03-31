import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Singleton instance of the MongoDB server
let mongoServer: MongoMemoryServer;

/**
 * Connect to a new in-memory database before tests run
 */
export const connect = async () => {
  // Create a new MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Connect to the in-memory database
  await mongoose.connect(uri);
};

/**
 * Clear all data from all collections
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Drop the database, close the connection, and stop the MongoDB server
 */
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

/**
 * Remove all the data for all db collections
 */
export const clearCollections = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}; 