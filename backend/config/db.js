import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI;

  if (!uri) {
    // eslint-disable-next-line no-console
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);

    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection failed');
    // eslint-disable-next-line no-console
    console.error(`Reason: ${error.message}`);

    // eslint-disable-next-line no-console
    console.error(`
👉 Possible fixes:
- Ensure MongoDB is running
- If using Docker: docker run -d -p 27017:27017 mongo
- Check your MONGO_URI in .env
    `);

    process.exit(1); // fail fast (important)
  }
};

export default connectDB;
