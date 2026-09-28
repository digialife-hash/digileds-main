import mongoose from "mongoose";

const isSrvDnsFailure = (error) => {
  const message = String(error?.message || "");
  return (
    ["ESERVFAIL", "ENOTFOUND", "ETIMEOUT", "EREFUSED"].includes(error?.code) ||
    /querySrv|mongodb\._tcp|ESERVFAIL|ENOTFOUND|ETIMEOUT/i.test(message)
  );
};

const connectWithTimeout = async (uri, timeoutMs) => {
  let timeoutId;

  try {
    const conn = await Promise.race([
      mongoose.connect(uri, {
        serverSelectionTimeoutMS: timeoutMs,
      }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`MongoDB connection timed out after ${timeoutMs}ms`)),
          timeoutMs + 1000
        );
      }),
    ]);

    if (timeoutId) clearTimeout(timeoutId);
    return conn;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
};

const connectDB = async () => {
  const timeoutMs = Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000);
  const primaryUri = process.env.MONGO_URI;
  const standardUri = process.env.MONGO_URI_STANDARD;

  try {
    let conn;

    try {
      conn = await connectWithTimeout(primaryUri, timeoutMs);
    } catch (error) {
      if (
        primaryUri?.startsWith("mongodb+srv://") &&
        standardUri &&
        isSrvDnsFailure(error)
      ) {
        console.warn(
          "MongoDB SRV DNS lookup failed. Retrying with MONGO_URI_STANDARD fallback."
        );
        await mongoose.disconnect().catch(() => {});
        conn = await connectWithTimeout(standardUri, timeoutMs);
      } else {
        throw error;
      }
    }

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
