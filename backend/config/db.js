import mongoose from 'mongoose';

let isConnected = false;

export const getMongoConnectionStatus = () => isConnected;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000, // Timeout fast if local mongo is offline
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (err) {
    console.warn(`[DATABASE] MongoDB connection failed: ${err.message}. Falling back to local JSON database mode!`);
    isConnected = false;
  }
};

export default connectDB;
// Reload trigger: Restored JWT secret connection
