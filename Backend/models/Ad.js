import mongoose from "mongoose";

/* =========================================================
   PRODUCT SUB-SCHEMA
========================================================= */

const adProductSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["product", "service"],
      default: "product",
    },
  },
  {
    _id: false,
  }
);


/* =========================================================
   AD SCHEMA
========================================================= */

const adSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /* Desktop image */
    image: {
      type: String,
      required: true,
      trim: true,
    },

    /* Mobile image */
    mobileImage: {
      type: String,
      default: "",
      trim: true,
    },

    /* CTA button text */
    label: {
      type: String,
      default: "Explore More",
      trim: true,
    },

    /* Hero text position */
    position: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center",
    },

    /* Advertisement status */
    active: {
      type: Boolean,
      default: true,
    },

    /* Display order */
    sortOrder: {
      type: Number,
      default: 0,
    },

    /* Optional scheduling */
    startAt: {
      type: Date,
      default: null,
    },

    endAt: {
      type: Date,
      default: null,
    },

    /* Products/services displayed on ProductAds page */
    products: {
      type: [adProductSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


/* =========================================================
   INDEXES
========================================================= */

adSchema.index({
  active: 1,
  sortOrder: 1,
});

adSchema.index({
  startAt: 1,
  endAt: 1,
});


const Ad = mongoose.model("Ad", adSchema);

export default Ad;