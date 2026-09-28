import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { ensureDefaultTenant } from "../services/tenant-context.js";
import OfficeUser from "../office-management/models/User.js";
import "../office-management/app.js";
import { OFFICE_MODEL_NAMES } from "../services/office-tenant-isolation.js";

const apply = process.argv.includes("--apply");

async function run() {
  await connectDatabase();
  const tenant = await ensureDefaultTenant();
  const tenantId = tenant._id;

  const collections = [
    "users",
    "products",
    "portfolio_items",
    "team_members",
    "contact_enquiries",
    "lead_applications",
    "career_openings",
    "career_applications",
    "demos",
    "social_posts",
    "visitor_activities",
    "site_settings",
    "subscription_plans",
    "subscription_orders",
    "admin_sessions",
    "security_activity",
    "audit_logs",
    "password_reset_tokens",
  ];

  console.log(
    `${apply ? "Applying" : "Dry-run"} default tenant migration for ${tenant.slug} (${tenantId}).`,
  );

  const migratedCollections = new Set();
  for (const collectionName of collections) {
    migratedCollections.add(collectionName);
    const collection = mongoose.connection.collection(collectionName);
    const filter =
      collectionName === "users"
        ? { tenantId: { $exists: false }, role: { $ne: "super_admin" } }
        : { tenantId: { $exists: false } };
    const count = await collection.countDocuments(filter);
    console.log(`${collectionName}: ${count} records`);
    if (apply && count > 0) {
      await collection.updateMany(filter, { $set: { tenantId } });
    }

  }

  for (const modelName of OFFICE_MODEL_NAMES) {
    const model = mongoose.models[modelName];
    if (!model) continue;
    const collectionName = model.collection.name;
    if (migratedCollections.has(collectionName)) continue;
    migratedCollections.add(collectionName);
    const collection = mongoose.connection.collection(collectionName);
    const filter = { tenantId: { $exists: false } };
    const count = await collection.countDocuments(filter);
    console.log(`office:${modelName}/${collectionName}: ${count} records`);
    if (apply && count > 0) {
      await collection.updateMany(filter, { $set: { tenantId } });
    }
  }

  const officeUsers = await OfficeUser.countDocuments({
    tenantId: { $exists: false },
    role: { $ne: "super_admin" },
  });
  console.log(`office_users: ${officeUsers} records`);
  if (apply && officeUsers > 0) {
    await OfficeUser.updateMany(
      { tenantId: { $exists: false }, role: { $ne: "super_admin" } },
      { $set: { tenantId } },
    );
  }
}

run()
  .catch((error) => {
    console.error("Tenant migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
