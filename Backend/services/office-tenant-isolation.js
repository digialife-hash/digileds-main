import mongoose from "mongoose";
import { AsyncLocalStorage } from "node:async_hooks";

const tenantStorage = new AsyncLocalStorage();
const installedModels = new Set();

export const OFFICE_MODEL_NAMES = [
  "User", "SocialUser",
  "OfficeUser", "Client", "Employee", "Project", "Team", "Task", "Payroll",
  "Invoice", "Notification", "ClientRequest", "ServiceRequest", "Settings",
  "Counter", "ClientDocument", "EmployeeDocument",
  "AdminSession", "SecurityActivity", "PasswordResetToken",
  "Attendance", "AdminTrustedDevice", "AttendanceSettings", "Holiday", "ReferralPartner",
  "Referral", "Commission", "Certificate", "IDCard", "ReferralActivity",
  "ReferralNotification", "TaskDocument", "PartnerCompanyDocument", "Leave", "Lead",
  "FollowUp", "Quotation", "Income", "Expense", "Announcement", "Meeting",
  "ActivityLog", "CertificateHistory", "CertificateRenewal", "CertificateRevocation",
  "CertificateType", "CertificateVerificationLog", "ClientDocument", "ClientServiceDetail",
  "CommissionActivityLog", "CommissionAdjustment", "CommissionApproval", "CommissionPayment",
  "CommissionRule", "DailyWorkReport", "EmployeeDocument", "Feedback", "FAQ",
  "IDCardHistory", "IDCardRenewal", "IDCardRevocation", "Lead", "NotificationLog",
  "NotificationPreference", "NotificationQueue", "NotificationTemplate", "PartnerCompanyDocument",
  "PaymentProof", "PaymentStatusHistory", "QRVerificationLog", "ReferralActivityLog",
  "ReferralAssignment", "ReferralAttachment", "ReferralComment", "ReferralInternalNote",
  "ReferralStatusHistory", "ReportActivityLog", "ReportHistory", "ScheduledReport",
  "SupportTicket",
];

function tenantIndexName(modelName, keys) {
  return `tenant_${modelName}_${Object.keys(keys).join("_")}`;
}

function convertUniqueIndexesToTenantScope(model) {
  const schema = model.schema;
  const indexes = schema._indexes || [];
  const nextIndexes = [];

  for (const [keys, options] of indexes) {
    if (!options?.unique || Object.prototype.hasOwnProperty.call(keys, "tenantId")) {
      nextIndexes.push([keys, options]);
      continue;
    }

    nextIndexes.push([
      { tenantId: 1, ...keys },
      {
        ...options,
        unique: true,
        name: options.name || tenantIndexName(model.modelName, keys),
        partialFilterExpression: {
          ...(options.partialFilterExpression || {}),
          tenantId: { $exists: true },
        },
      },
    ]);
  }
  schema._indexes = nextIndexes;

  for (const path of Object.values(schema.paths)) {
    if (path.options?.unique) {
      path.options.unique = false;
    }
  }
}

function currentScope() {
  const context = tenantStorage.getStore();
  if (!context?.tenantId || !context.request?.user) {
    return null;
  }

  if (context.request.user.role === "super_admin") {
    return null;
  }

  return { tenantId: context.tenantId };
}

function scopedFilter(filter = {}) {
  const scope = currentScope();
  return scope ? { ...filter, ...scope } : filter;
}

function scopedUpdate(update = {}) {
  const scope = currentScope();
  if (!scope || !update || typeof update !== "object") return update;

  const next = { ...update };
  next.$set = { ...(next.$set || {}), tenantId: scope.tenantId };
  if (next.$unset && Object.prototype.hasOwnProperty.call(next.$unset, "tenantId")) {
    const { tenantId: _tenantId, ...rest } = next.$unset;
    next.$unset = rest;
  }
  next.$setOnInsert = { ...(next.$setOnInsert || {}), tenantId: scope.tenantId };
  return next;
}

function scopedReplacement(replacement = {}) {
  const scope = currentScope();
  if (!scope || !replacement || typeof replacement !== "object") {
    return replacement;
  }
  return { ...replacement, tenantId: replacement.tenantId || scope.tenantId };
}

function installModel(model) {
  if (!model || installedModels.has(model.modelName)) return;
  installedModels.add(model.modelName);

  if (!model.schema.path("tenantId")) {
    model.schema.add({
      tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        index: true,
      },
    });
  }
  convertUniqueIndexesToTenantScope(model);

  for (const method of [
    "find",
    "findOne",
    "findOneAndUpdate",
    "findOneAndDelete",
    "findOneAndReplace",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
    "countDocuments",
    "exists",
  ]) {
    const original = model[method];
    if (typeof original !== "function") continue;
    model[method] = function tenantScopedMethod(filter, ...args) {
      const nextFilter = scopedFilter(filter);
      if (method === "findOneAndReplace") {
        return original.call(
          this,
          nextFilter,
          scopedReplacement(args[0]),
          ...args.slice(1),
        );
      }
      if (method === "findOneAndUpdate") {
        return original.call(this, nextFilter, scopedUpdate(args[0]), ...args.slice(1));
      }
      if (
        method === "updateOne" ||
        method === "updateMany"
      ) {
        return original.call(this, nextFilter, scopedUpdate(args[0]), ...args.slice(1));
      }
      return original.call(this, nextFilter, ...args);
    };
  }

  for (const method of ["findByIdAndUpdate", "findByIdAndDelete"]) {
    const original = model[method];
    if (typeof original !== "function") continue;
    model[method] = function tenantScopedByIdMethod(id, update, ...args) {
      const scope = currentScope();
      if (!scope) return original.call(this, id, update, ...args);
      return method === "findByIdAndUpdate"
        ? model.findOneAndUpdate({ _id: id, ...scope }, scopedUpdate(update), ...args)
        : original.call(this, id, ...args);
    };
  }

  const originalDistinct = model.distinct;
  if (typeof originalDistinct === "function") {
    model.distinct = function tenantScopedDistinct(field, filter, ...args) {
      return originalDistinct.call(this, field, scopedFilter(filter), ...args);
    };
  }

  const originalFindById = model.findById;
  if (typeof originalFindById === "function") {
    model.findById = function tenantScopedFindById(id, ...args) {
      const scope = currentScope();
      return scope
        ? model.findOne({ _id: id, ...scope }, ...args)
        : originalFindById.call(this, id, ...args);
    };
  }

  const originalCreate = model.create;
  if (typeof originalCreate === "function") {
    model.create = function tenantScopedCreate(documents, ...args) {
      const scope = currentScope();
      if (!scope) return originalCreate.call(this, documents, ...args);
      const apply = (document) =>
        document && typeof document === "object"
          ? { ...document, tenantId: document.tenantId || scope.tenantId }
          : document;
      return originalCreate.call(
        this,
        Array.isArray(documents) ? documents.map(apply) : apply(documents),
        ...args,
      );
    };
  }

  const originalInsertMany = model.insertMany;
  if (typeof originalInsertMany === "function") {
    model.insertMany = function tenantScopedInsertMany(documents, ...args) {
      const scope = currentScope();
      if (!scope) return originalInsertMany.call(this, documents, ...args);
      const scopedDocuments = documents.map((document) => ({
        ...document,
        tenantId: document.tenantId || scope.tenantId,
      }));
      return originalInsertMany.call(this, scopedDocuments, ...args);
    };
  }

  const originalAggregate = model.aggregate;
  if (typeof originalAggregate === "function") {
    model.aggregate = function tenantScopedAggregate(pipeline = [], ...args) {
      const scope = currentScope();
      const nextPipeline = scope
        ? [{ $match: scope }, ...pipeline]
        : pipeline;
      return originalAggregate.call(this, nextPipeline, ...args);
    };
  }
}

export function runWithTenantContext(request, callback) {
  return tenantStorage.run({ request, tenantId: request.tenantId }, callback);
}

export function installOfficeTenantIsolation() {
  for (const modelName of OFFICE_MODEL_NAMES) {
    installModel(mongoose.models[modelName]);
  }
}
