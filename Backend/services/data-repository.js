import bcrypt from "bcrypt";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { AuditLog, Demo, User } from "../models/index.js";
import OfficeUser from "../office-management/models/User.js";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "../config/environment.js";

function publicDocument(document) {
  if (!document) return null;
  const plain =
    typeof document.toObject === "function"
      ? document.toObject()
      : { ...document };
  const { _id, ...rest } = plain;
  return _id === undefined ? rest : { id: String(_id), ...rest };
}

let adminSeedPromise;

async function seedAdmin() {
  if (!adminSeedPromise) {
    adminSeedPromise = (async () => {
      const superAdminEmail = String(process.env.SUPER_ADMIN_EMAIL || "")
        .trim()
        .toLowerCase();
      const superAdminPassword = String(process.env.SUPER_ADMIN_PASSWORD || "");
      const superAdminName =
        String(process.env.SUPER_ADMIN_NAME || "Digital Alife Super Admin").trim();

      if (superAdminEmail && superAdminPassword) {
        const existingSuperAdmin = await OfficeUser.findOne({
          email: superAdminEmail,
        })
          .select("+password")
          .lean();

        if (!existingSuperAdmin) {
          const superAdminAlreadyExists = await OfficeUser.exists({
            role: "super_admin",
          });

          if (!superAdminAlreadyExists) {
            await OfficeUser.create({
              name: superAdminName,
              email: superAdminEmail,
              password: superAdminPassword,
              role: "super_admin",
              status: "active",
              emailVerified: true,
              emailVerifiedAt: new Date(),
            });
          } else {
            console.warn(
              `[DATABASE] Skipping super-admin seed for ${superAdminEmail}; ` +
                "a different super-admin already exists.",
            );
          }
        } else if (
          !(await bcrypt.compare(
            superAdminPassword,
            existingSuperAdmin.password || "",
          ))
        ) {
          const anotherSuperAdmin = await OfficeUser.exists({
            _id: { $ne: existingSuperAdmin._id },
            role: "super_admin",
          });

          await OfficeUser.updateOne(
            { _id: existingSuperAdmin._id },
            {
              $set: {
                name: superAdminName,
                password: bcrypt.hashSync(superAdminPassword, 12),
                ...(anotherSuperAdmin &&
                existingSuperAdmin.role !== "super_admin"
                  ? { role: "admin" }
                  : { role: "super_admin" }),
                status: "active",
              },
            },
          );
        }
      }

      if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return;

      const username = String(ADMIN_USERNAME).trim();
      const usernameLower = username.toLowerCase();

      // The office login checks OfficeUser before the legacy User collection.
      // Seed the configured email there as well so a fresh production database
      // accepts the same ADMIN_* credentials as local development.
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
        const officeUser = await OfficeUser.findOne({
          email: usernameLower,
        }).select("+password").lean();

        if (!officeUser) {
          const officeRole = (await OfficeUser.exists({ role: "super_admin" }))
            ? "admin"
            : "super_admin";

          await OfficeUser.create({
            name: "Administrator",
            email: usernameLower,
            password: bcrypt.hashSync(ADMIN_PASSWORD, 12),
            role: officeRole,
            status: "active",
            emailVerified: true,
            emailVerifiedAt: new Date(),
          });
        } else if (
          officeUser.role !== "super_admin" &&
          !(await bcrypt.compare(ADMIN_PASSWORD, officeUser.password || ""))
        ) {
          const anotherSuperAdmin = await OfficeUser.exists({
            _id: { $ne: officeUser._id },
            role: "super_admin",
          });

          await OfficeUser.updateOne(
            { _id: officeUser._id },
            {
              $set: {
                password: bcrypt.hashSync(ADMIN_PASSWORD, 12),
                status: "active",
                role:
                  officeUser.role === "super_admin" || !anotherSuperAdmin
                    ? "super_admin"
                    : "admin",
              },
            },
          );
        }
      }

      const existing = await User.findOne({ usernameLower }).lean();
      if (!existing) {
        const now = Date.now();
        await User.create({
          name: "Administrator",
          username,
          usernameLower,
          email: `${username}@local.invalid`,
          emailLower: `${username}@local.invalid`.toLowerCase(),
          mobile: "",
          passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 12),
          role: "admin",
          isActive: 1,
          createdAt: now,
          updatedAt: now,
        });
      } else if (
        !(await bcrypt.compare(ADMIN_PASSWORD, existing.passwordHash || ""))
      ) {
        await User.updateOne(
          { _id: existing._id },
          {
            $set: {
              passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 12),
              role: "admin",
              isActive: 1,
              updatedAt: Date.now(),
            },
          },
        );
      }
    })();
  }
  await adminSeedPromise;
}

async function ready() {
  await connectDatabase();
  await seedAdmin();
}

export async function connect() {
  await ready();
}

export async function insertDemo(record) {
  await Demo.create({
    ...record,
    mongoContainer: record.mongoContainer ?? null,
    networkName: record.networkName ?? null,
    accessUsername: record.accessUsername ?? null,
    accessPasswordHash: record.accessPasswordHash ?? null,
    accessPasswordSalt: record.accessPasswordSalt ?? null,
    credentialVersion: record.credentialVersion || 1,
    status: "active",
  });
}

function tenantFilter(tenantId) {
  return tenantId ? { tenantId } : {};
}

export async function getActiveDemo(demoId, tenantId) {
  return publicDocument(
    await Demo.findOne({
      ...tenantFilter(tenantId),
      demoId: String(demoId),
      status: "active",
    }).lean(),
  );
}

export async function getActiveDemoCredentials(demoId, tenantId) {
  return publicDocument(
    await Demo.findOne({
      ...tenantFilter(tenantId),
      demoId: String(demoId),
      status: "active",
    })
      .select("+accessPasswordEncrypted")
      .lean(),
  );
}

export async function listActiveDemos(tenantId) {
  return (
    await Demo.find({ ...tenantFilter(tenantId), status: "active" }).sort({ createdAt: -1 }).lean()
  ).map(publicDocument);
}

export async function getLatestActiveDemo(projectId, tenantId) {
  return publicDocument(
    await Demo.findOne({
      ...tenantFilter(tenantId),
      projectId: String(projectId),
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean(),
  );
}

export async function listExpiredDemos(now = Date.now()) {
  return (
    await Demo.find({
      status: "active",
      expiresAt: { $lte: now },
    }).lean()
  ).map(publicDocument);
}

export async function markDestroyed(demoId) {
  await Demo.updateOne(
    { demoId: String(demoId), status: "active" },
    { $set: { status: "destroyed" } },
  );
}

export async function deleteDemoRecord(demoId) {
  await Demo.deleteOne({ demoId: String(demoId) });
}

export async function deleteDemoRecordsForProject(projectId) {
  const result = await Demo.deleteMany({ projectId: String(projectId) });
  return result.deletedCount || 0;
}

export async function updateDemoExpiry(demoId, expiresAt, durationMinutes, tenantId) {
  const updated = await Demo.findOneAndUpdate(
    { ...tenantFilter(tenantId), demoId: String(demoId), status: "active" },
    { $set: { expiresAt, durationMinutes } },
    { new: true },
  ).lean();
  return publicDocument(updated);
}

export async function updateCredentials(demoId, credentials, tenantId) {
  const updated = await Demo.findOneAndUpdate(
    { ...tenantFilter(tenantId), demoId: String(demoId), status: "active" },
    {
      $set: {
        accessUsername: credentials.username,
        accessPasswordHash: credentials.passwordHash,
        accessPasswordSalt: credentials.passwordSalt,
        accessPasswordEncrypted: credentials.passwordEncrypted,
      },
      $inc: { credentialVersion: 1 },
    },
    { new: true },
  ).lean();
  return publicDocument(updated);
}

export async function audit(event, details = {}) {
  await AuditLog.create({
    tenantId: details.tenantId ?? null,
    event,
    demoId: details.demoId ?? null,
    projectId: details.projectId ?? null,
    requestId: details.requestId ?? null,
    metadata: JSON.stringify(details.metadata ?? {}),
    createdAt: Date.now(),
  });
}

export async function listAuditLogs(limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
  return (
    await AuditLog.find({}).sort({ createdAt: -1 }).limit(safeLimit).lean()
  ).map(publicDocument);
}

export async function getUsedPorts() {
  const rows = await Demo.find(
    { status: "active" },
    { _id: 0, hostPort: 1 },
  ).lean();
  return rows.map((row) => row.hostPort);
}

export async function close() {
  await disconnectDatabase();
}

export default {
  connect,
  insertDemo,
  getActiveDemo,
  listActiveDemos,
  getLatestActiveDemo,
  listExpiredDemos,
  markDestroyed,
  updateDemoExpiry,
  updateCredentials,
  audit,
  listAuditLogs,
  getUsedPorts,
  close,
};
