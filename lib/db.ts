import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectDb(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }
  if (!global.mongooseConn) {
    global.mongooseConn = mongoose.connect(MONGODB_URI);
  }
  return global.mongooseConn;
}
