import mongoose from "mongoose";

let connectionPromise;
let listenersRegistered = false;

function databaseName() {
  return process.env.DB_NAME?.trim() || "solarious";
}

function registerConnectionListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected", { database: databaseName() });
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected", { database: databaseName() });
  });
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error", {
      database: databaseName(),
      name: error?.name || "Error",
      message: error?.message || "Unknown database error",
    });
  });
}

export function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is required");

  registerConnectionListeners();
  mongoose.set("strictQuery", true);
  connectionPromise = mongoose
    .connect(uri, {
      appName: "solarious-api",
      dbName: databaseName(),
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxIdleTimeMS: 60_000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
    })
    .then(() => mongoose.connection)
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  return connectionPromise;
}

export function databaseStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    state:
      ["disconnected", "connected", "connecting", "disconnecting"][
        mongoose.connection.readyState
      ] || "unknown",
    name: mongoose.connection.name || databaseName(),
  };
}

export async function disconnectDatabase() {
  connectionPromise = undefined;
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

export { mongoose };
