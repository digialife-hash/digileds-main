// import mongoose from "mongoose";
// export const invoicePaymentModes = ["offline", "online"];
// export const invoicePaymentStatuses = [
//   "pending",
//   "partially_paid",
//   "paid",
//   "overdue",
// ];

// const invoiceItemSchema = new mongoose.Schema(
//   {
//     description: {
//       type: String,
//       required: [true, "Item description is required"],
//       trim: true,
//       maxlength: [300, "Item description cannot exceed 300 characters"],
//     },
//     amount: {
//       type: Number,
//       required: [true, "Item amount is required"],
//       min: [0, "Item amount cannot be negative"],
//     },
//   },
//   {
//     _id: true,
//   },
// );

// const invoiceSchema = new mongoose.Schema(
//   {
//     invoiceNumber: {
//       type: String,
//       required: [true, "Invoice number is required"],
//       unique: true,
//       trim: true,
//       uppercase: true,
//     },
//     clientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Client",
//       required: [true, "Client is required"],
//     },
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       default: null,
//     },
//     serviceDetailId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ClientServiceDetail",
//       default: null,
//     },
//     serviceType: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     items: {
//       type: [invoiceItemSchema],
//       validate: {
//         validator(items) {
//           return Array.isArray(items) && items.length > 0;
//         },
//         message: "At least one invoice item is required",
//       },
//       default: [],
//     },
//     amount: {
//       type: Number,
//       required: [true, "Invoice amount is required"],
//       min: [0, "Invoice amount cannot be negative"],
//     },
//     tax: {
//       type: Number,
//       min: [0, "Tax percentage cannot be negative"],
//       max: [100, "Tax percentage cannot exceed 100"],
//       default: 0,
//     },
//     taxExempt: {
//       type: Boolean,
//       default: false,
//     },
//     totalAmount: {
//       type: Number,
//       required: [true, "Total amount is required"],
//       min: [0, "Total amount cannot be negative"],
//     },
//     paymentStatus: {
//       type: String,
//       enum: {
//         values: invoicePaymentStatuses,
//         message:
//           "Payment status must be pending, partially_paid, paid, or overdue",
//       },
//       default: "pending",
//     },
//        paymentMode: {
//       type: String,
//       enum: {
//         values: invoicePaymentModes,
//         message: "Payment mode must be offline or online",
//       },
//       default: "offline",
//     },
//     dueDate: {
//       type: Date,
//       required: [true, "Due date is required"],
//     },
//     // paidDate: {
//     //   type: Date,
//     //   default: null,
//     // },
//     invoiceDate: {
//       type: String,
//     },
//     invoiceTime: {
//       type: String,
//     },
//     advancePayment: {
//       type: Number,
//       default: 0,
//       min: [0, "Advance payment cannot be negative"],
//     },
//     advancePaymentDate: {
//       type: String,
//       default: "",
//     },
//     advancePaymentTime: {
//       type: String,
//       default: "",
//     },
//     balanceAmount: {
//       type: Number,
//     },
//     clientSnapshot: {
//       companyName: { type: String },
//       clientName: { type: String },
//       phone: { type: String },
//       gstNumber: { type: String },
//       email: { type: String },
//       address: { type: String },
//       city: { type: String },
//       state: { type: String },
//       pincode: { type: String },
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Created by user is required"],
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// invoiceSchema.index({ clientId: 1, createdAt: -1 });
// invoiceSchema.index({ projectId: 1, createdAt: -1 });
// invoiceSchema.index({ serviceDetailId: 1, createdAt: -1 });
// invoiceSchema.index({ clientId: 1, serviceType: 1, createdAt: -1 });
// invoiceSchema.index({ paymentStatus: 1 });
// invoiceSchema.index({ dueDate: 1 });

// const Invoice = mongoose.model("Invoice", invoiceSchema);

// export default Invoice;




// import mongoose from "mongoose";
// export const invoicePaymentModes = ["offline", "online"];
// export const invoicePaymentStatuses = [
//   "pending",
//   "partially_paid",
//   "paid",
//   "overdue",
// ];

// const invoiceItemSchema = new mongoose.Schema(
//   {
//     description: {
//       type: String,
//       required: [true, "Item description is required"],
//       trim: true,
//       maxlength: [300, "Item description cannot exceed 300 characters"],
//     },
//     amount: {
//       type: Number,
//       required: [true, "Item amount is required"],
//       min: [0, "Item amount cannot be negative"],
//     },
//   },
//   { _id: true },
// );

// // NEW: one advance payment entry — amount, online/offline, kisne receive kiya,
// // aur date+time (AM/PM) automatically capture hota hai jab entry add hoti hai.
// const advancePaymentSchema = new mongoose.Schema(
//   {
//     amount: {
//       type: Number,
//       required: [true, "Advance payment amount is required"],
//       min: [0, "Advance payment amount cannot be negative"],
//     },
//     mode: {
//       type: String,
//       enum: {
//         values: invoicePaymentModes,
//         message: "Payment mode must be offline or online",
//       },
//       default: "offline",
//     },
//     receivedBy: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     recordedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: true },
// );

// const invoiceSchema = new mongoose.Schema(
//   {
//     invoiceNumber: {
//       type: String,
//       required: [true, "Invoice number is required"],
//       unique: true,
//       trim: true,
//       uppercase: true,
//     },
//     clientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Client",
//       required: [true, "Client is required"],
//     },
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       default: null,
//     },
//     serviceDetailId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ClientServiceDetail",
//       default: null,
//     },
//     serviceType: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     items: {
//       type: [invoiceItemSchema],
//       validate: {
//         validator(items) {
//           return Array.isArray(items) && items.length > 0;
//         },
//         message: "At least one invoice item is required",
//       },
//       default: [],
//     },
//     amount: {
//       type: Number,
//       required: [true, "Invoice amount is required"],
//       min: [0, "Invoice amount cannot be negative"],
//     },
//     tax: {
//       type: Number,
//       min: [0, "Tax percentage cannot be negative"],
//       max: [100, "Tax percentage cannot exceed 100"],
//       default: 0,
//     },
//     taxExempt: {
//       type: Boolean,
//       default: false,
//     },
//     totalAmount: {
//       type: Number,
//       required: [true, "Total amount is required"],
//       min: [0, "Total amount cannot be negative"],
//     },
//     paymentStatus: {
//       type: String,
//       enum: {
//         values: invoicePaymentStatuses,
//         message:
//           "Payment status must be pending, partially_paid, paid, or overdue",
//       },
//       default: "pending",
//     },
//     paymentMode: {
//       type: String,
//       enum: {
//         values: invoicePaymentModes,
//         message: "Payment mode must be offline or online",
//       },
//       default: "offline",
//     },
//     dueDate: {
//       type: Date,
//       required: [true, "Due date is required"],
//     },
//     invoiceDate: {
//       type: String,
//     },
//     invoiceTime: {
//       type: String,
//     },

//     // NEW: replaces the old single advancePayment/advancePaymentDate/advancePaymentTime
//     // fields — ab har payment apni khud ki entry ke saath store hoti hai.
//     advancePayments: {
//       type: [advancePaymentSchema],
//       default: [],
//     },
//     totalAdvancePaid: {
//       type: Number,
//       default: 0,
//       min: [0, "Total advance paid cannot be negative"],
//     },

//     // Legacy fields — purane invoices ke liye backward compatibility,
//     // naye invoices inhe use nahi karenge.
//     advancePayment: {
//       type: Number,
//       default: 0,
//       min: [0, "Advance payment cannot be negative"],
//     },
//     advancePaymentDate: { type: String, default: "" },
//     advancePaymentTime: { type: String, default: "" },

//     balanceAmount: {
//       type: Number,
//     },
//     clientSnapshot: {
//       companyName: { type: String },
//       clientName: { type: String },
//       phone: { type: String },
//       gstNumber: { type: String },
//       email: { type: String },
//       address: { type: String },
//       city: { type: String },
//       state: { type: String },
//       pincode: { type: String },
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Created by user is required"],
//     },
//   },
//   { timestamps: true },
// );

// invoiceSchema.index({ clientId: 1, createdAt: -1 });
// invoiceSchema.index({ projectId: 1, createdAt: -1 });
// invoiceSchema.index({ serviceDetailId: 1, createdAt: -1 });
// invoiceSchema.index({ clientId: 1, serviceType: 1, createdAt: -1 });
// invoiceSchema.index({ paymentStatus: 1 });
// invoiceSchema.index({ dueDate: 1 });

// const Invoice = mongoose.model("Invoice", invoiceSchema);

// export default Invoice;


import mongoose from "mongoose";
export const invoicePaymentModes = ["offline", "online"];
export const invoicePaymentStatuses = [
  "pending",
  "partially_paid",
  "paid",
  "overdue",
];

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
      maxlength: [300, "Item description cannot exceed 300 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Item amount is required"],
      min: [0, "Item amount cannot be negative"],
    },
  },
  {
    _id: true,
  },
);

// NEW: a single advance payment entry — amount, online/offline mode, who
// received it, and the date+time (AM/PM) it was recorded. recordedAt is
// captured automatically the moment the entry is added on the frontend,
// but defaults to "now" here too as a safety net.
const advancePaymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Advance payment amount is required"],
      min: [0, "Advance payment amount cannot be negative"],
    },
    mode: {
      type: String,
      enum: {
        values: invoicePaymentModes,
        message: "Payment mode must be offline or online",
      },
      default: "offline",
    },
    receivedBy: {
      type: String,
      trim: true,
      default: "",
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    serviceDetailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientServiceDetail",
      default: null,
    },
    serviceType: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [invoiceItemSchema],
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "At least one invoice item is required",
      },
      default: [],
    },
    amount: {
      type: Number,
      required: [true, "Invoice amount is required"],
      min: [0, "Invoice amount cannot be negative"],
    },
    tax: {
      type: Number,
      min: [0, "Tax percentage cannot be negative"],
      max: [100, "Tax percentage cannot exceed 100"],
      default: 0,
    },
    taxExempt: {
      type: Boolean,
      default: false,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: invoicePaymentStatuses,
        message:
          "Payment status must be pending, partially_paid, paid, or overdue",
      },
      default: "pending",
    },
    paymentMode: {
      type: String,
      enum: {
        values: invoicePaymentModes,
        message: "Payment mode must be offline or online",
      },
      default: "offline",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    // paidDate: {
    //   type: Date,
    //   default: null,
    // },
    invoiceDate: {
      type: String,
    },
    invoiceTime: {
      type: String,
    },

    // NEW: replaces the single-value advance payment fields below.
    // Each entry is its own record: amount, online/offline, received by whom,
    // and the date/time it was recorded. Shows up "tukdo tukdo" (itemized)
    // instead of collapsing into one number.
    advancePayments: {
      type: [advancePaymentSchema],
      default: [],
    },
    // Running total of all advancePayments entries, kept in sync on every
    // create/update so the frontend doesn't need to recompute it.
    totalAdvancePaid: {
      type: Number,
      default: 0,
      min: [0, "Total advance paid cannot be negative"],
    },

    // LEGACY — kept only so old invoices created before this change keep
    // reading correctly. New invoices should not populate these; use
    // advancePayments[] / totalAdvancePaid instead.
    advancePayment: {
      type: Number,
      default: 0,
      min: [0, "Advance payment cannot be negative"],
    },
    advancePaymentDate: {
      type: String,
      default: "",
    },
    advancePaymentTime: {
      type: String,
      default: "",
    },

    balanceAmount: {
      type: Number,
    },
    clientSnapshot: {
      companyName: { type: String },
      clientName: { type: String },
      phone: { type: String },
      gstNumber: { type: String },
      email: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
  },
);

invoiceSchema.index({ clientId: 1, createdAt: -1 });
invoiceSchema.index({ projectId: 1, createdAt: -1 });
invoiceSchema.index({ serviceDetailId: 1, createdAt: -1 });
invoiceSchema.index({ clientId: 1, serviceType: 1, createdAt: -1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ dueDate: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;