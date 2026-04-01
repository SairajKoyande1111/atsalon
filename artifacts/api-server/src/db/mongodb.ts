import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI as string);
  isConnected = true;
  console.log("Connected to MongoDB");
}

export default mongoose;
