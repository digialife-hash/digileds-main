import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import IDCard from "../models/IDCard.js";

dotenv.config();

/**
 * Migration Script: Safely migrate existing Referral Partner ID Cards to the global entity-based schema.
 * Idempotent: Does not overwrite or recreate existing records.
 */
export const migrateExistingIdCards = async () => {
  try {
    console.log("[Migration] Starting ID Card schema migration...");
    const cardsToMigrate = await IDCard.find({
      $or: [
        { entityType: { $exists: false } },
        { entityType: null },
        { verificationToken: { $exists: false } },
        { verificationToken: null },
      ],
    });

    console.log(`[Migration] Found ${cardsToMigrate.length} ID Card records needing migration.`);
    let migratedCount = 0;
    let skippedCount = 0;

    for (const card of cardsToMigrate) {
      let isModified = false;

      if (!card.entityType) {
        card.entityType = "referral_partner";
        card.entityId = card.partnerId || card._id;
        isModified = true;
      }

      if (!card.verificationToken) {
        card.verificationToken = crypto.randomBytes(16).toString("hex");
        isModified = true;
      }

      if (!card.displayId) {
        card.displayId = card.partnerCode || `RP-${card._id.toString().slice(-6)}`;
        isModified = true;
      }

      if (isModified) {
        await card.save();
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`[Migration] Migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    return { migratedCount, skippedCount };
  } catch (error) {
    console.error("[Migration] Error during ID Card migration:", error);
    throw error;
  }
};

// Run standalone if invoked directly
if (process.argv[1]?.includes("migrateIdCards.js")) {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/office-management";
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      await migrateExistingIdCards();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
