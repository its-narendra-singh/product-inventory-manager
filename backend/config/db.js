import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI;
  const conn = await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
