import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import Certificate from "../models/Certificate.js";

dotenv.config();

/**
 * Migration Script: Safely migrate existing Referral Partner Certificates to the global entity-based schema.
 */
export const migrateExistingCertificates = async () => {
  try {
    console.log("[Migration] Starting Certificate schema migration...");
    const certsToMigrate = await Certificate.find({
      $or: [
        { entityType: { $exists: false } },
        { entityType: null },
        { verificationToken: { $exists: false } },
        { verificationToken: null },
      ],
    });

    console.log(`[Migration] Found ${certsToMigrate.length} Certificate records needing migration.`);
    let migratedCount = 0;
    let skippedCount = 0;

    for (const cert of certsToMigrate) {
      let isModified = false;

      if (!cert.entityType) {
        cert.entityType = "referral_partner";
        cert.entityId = cert.partnerId || cert._id;
        isModified = true;
      }

      if (!cert.verificationToken) {
        cert.verificationToken = crypto.randomBytes(16).toString("hex");
        isModified = true;
      }

      if (!cert.displayId) {
        cert.displayId = cert.partnerCode || `RP-${cert._id.toString().slice(-6)}`;
        isModified = true;
      }

      if (isModified) {
        await cert.save();
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`[Migration] Certificate Migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    return { migratedCount, skippedCount };
  } catch (error) {
    console.error("[Migration] Error during Certificate migration:", error);
    throw error;
  }
};

if (process.argv[1]?.includes("migrateCertificates.js")) {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/office-management";
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      await migrateExistingCertificates();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
