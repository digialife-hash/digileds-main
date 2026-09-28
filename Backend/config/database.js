import mongoose from "mongoose";
import { MONGODB_DB, MONGODB_URI } from "./environment.js";
import { models } from "../models/index.js";
import { OFFICE_MODEL_NAMES } from "../services/office-tenant-isolation.js";

let connectionPromise;

async function removeLegacyGlobalIndexes() {
  const legacyIndexes = [
    ["site_settings", "key_name_1"],
    ["subscription_plans", "name_1"],
  ];

  for (const [collectionName, indexName] of legacyIndexes) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      const index = indexes.find((candidate) => candidate.name === indexName);
      if (index?.unique) {
        await collection.dropIndex(indexName);
        console.warn(
          `[DATABASE] Removed legacy global unique index ${collectionName}.${indexName}; tenant-scoped indexes will be created.`,
        );
      }

      for (const modelName of OFFICE_MODEL_NAMES) {
        const model = mongoose.models[modelName];
        if (!model?.schema?.path("tenantId")) continue;
        try {
          const indexes = await model.collection.listIndexes().toArray();
          for (const index of indexes) {
            if (
              index.name === "_id_" ||
              !index.unique ||
              Object.prototype.hasOwnProperty.call(index.key || {}, "tenantId")
            ) {
              continue;
            }
            await model.collection.dropIndex(index.name);
            console.warn(
              `[DATABASE] Removed legacy global unique index ${model.collection.name}.${index.name}; tenant-scoped replacement will be created.`,
            );
          }
        } catch (error) {
          if (error?.codeName !== "NamespaceNotFound") throw error;
        }
      }
    } catch (error) {
      if (error?.codeName !== "NamespaceNotFound") {
        throw error;
      }
    }
  }
}

export function toObjectId(value) {
  if (value instanceof mongoose.Types.ObjectId) return value;
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

export async function connectDatabase() {
  if (!MONGODB_URI || !MONGODB_DB) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI and MONGODB_DB.",
    );
  }
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await mongoose.connect(
          MONGODB_URI,
          MONGODB_DB
            ? {
                dbName: MONGODB_DB,
                autoIndex: MONGODB_DB === "test" ? false : undefined,
              }
            : undefined,
        );
        await removeLegacyGlobalIndexes();
        if (MONGODB_DB !== "test") {
          for (const model of models) {
            try {
              await model.createIndexes();
            } catch (error) {
              if (
                error?.code === 11000 ||
                /E11000|duplicate key/i.test(error?.message || "")
              ) {
                console.warn(
                  `[DATABASE] Skipping conflicting legacy index for ${model.modelName}: ${error.message}`,
                );
                continue;
              }

              throw error;
            }
            for (const modelName of OFFICE_MODEL_NAMES) {
              const model = mongoose.models[modelName];
              if (!model) continue;
              try {
                await model.createIndexes();
              } catch (error) {
                if (
                  error?.code === 11000 ||
                  /E11000|duplicate key/i.test(error?.message || "")
                ) {
                  console.warn(
                    `[DATABASE] Skipping conflicting office index for ${model.modelName}: ${error.message}`,
                  );
                  continue;
                }
                throw error;
              }
            }
          }
        }
        return mongoose.connection;
      } catch (error) {
        connectionPromise = undefined;
        throw new Error(`MongoDB connection failed: ${error.message}`, {
          cause: error,
        });
      }
    })();
  }
  return connectionPromise;
}

export async function disconnectDatabase() {
  connectionPromise = undefined;
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

export const connect = connectDatabase;
export const disconnect = disconnectDatabase;
export const mongooseConnection = mongoose.connection;

export default {
  connectDatabase,
  disconnectDatabase,
  connect,
  disconnect,
  toObjectId,
  mongooseConnection,
};
