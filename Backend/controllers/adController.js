import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import mongoose from "mongoose";

import Ad from "../models/Ad.js";

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "ads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}


/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}${extension}`;

    cb(null, uniqueName);
  },
});


/* =========================================================
   MULTER FILE FILTER
========================================================= */

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and AVIF images are allowed"
      ),
      false
    );
  }
};


/* =========================================================
   MULTER UPLOAD
   Maximum: 10 MB
========================================================= */

export const adUpload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});


/* =========================================================
   HELPERS
========================================================= */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


const normalizeDate = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};


const normalizeBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return Boolean(value);
};


const normalizeNumber = (value, defaultValue = 0) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? defaultValue
    : number;
};


const normalizeProducts = (products) => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map((product) => ({
    id: product?.id || "",
    name: product?.name || "",
    description: product?.description || "",
    image: product?.image || "",
    price: product?.price || "",
    type:
      product?.type === "service"
        ? "service"
        : "product",
  }));
};


/* =========================================================
   GET ACTIVE ADS
   GET /api/ads/active
========================================================= */

export const getActiveAds = async (req, res) => {
  try {
    const now = new Date();

    const ads = await Ad.find({
      active: true,

      $or: [
        {
          startAt: null,
        },
        {
          startAt: {
            $lte: now,
          },
        },
      ],

      $and: [
        {
          $or: [
            {
              endAt: null,
            },
            {
              endAt: {
                $gte: now,
              },
            },
          ],
        },
      ],
    })
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  } catch (error) {
    console.error(
      "Get active ads error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active ads",
      error: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE AD
   GET /api/ads/:id
========================================================= */

export const getAdById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid advertisement ID",
      });
    }

    const ad = await Ad.findById(id).lean();

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error(
      "Get ad error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch advertisement",
      error: error.message,
    });
  }
};


/* =========================================================
   GET ALL ADS
   GET /api/ads
========================================================= */

export const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find()
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  } catch (error) {
    console.error(
      "Get all ads error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch advertisements",
      error: error.message,
    });
  }
};


/* =========================================================
   UPLOAD AD IMAGE
   POST /api/ads/upload
   FormData field: image
========================================================= */

export const uploadAdImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const imageUrl = `/uploads/ads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      url: imageUrl,
      data: {
        url: imageUrl,
        path: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error(
      "Upload ad image error:",
      error
    );

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // Ignore cleanup error
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload advertisement image",
      error: error.message,
    });
  }
};


/* =========================================================
   CREATE AD
   POST /api/ads
========================================================= */

export const createAd = async (req, res) => {
  try {
    const {
      heading,
      description,
      image,
      mobileImage,
      productId,
      productSlug,
      productPath,
      label,
      position,
      active,
      sortOrder,
      startAt,
      endAt,
      products,
    } = req.body;

    /* ---------------------------------------------
       REQUIRED VALIDATION
    --------------------------------------------- */

    if (!heading || !String(heading).trim()) {
      return res.status(400).json({
        success: false,
        message: "Heading is required",
      });
    }

    if (!image || !String(image).trim()) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }


    /* ---------------------------------------------
       CREATE AD
    --------------------------------------------- */

    const ad = await Ad.create({
      heading: String(heading).trim(),

      description:
        description !== undefined
          ? String(description)
          : "",

      image: String(image).trim(),

      mobileImage:
        mobileImage !== undefined
          ? String(mobileImage).trim()
          : "",

      productId:
        productId &&
        mongoose.Types.ObjectId.isValid(productId)
          ? productId
          : null,

      productSlug:
        productSlug !== undefined
          ? String(productSlug).trim()
          : "",

      productPath:
        productPath !== undefined
          ? String(productPath).trim()
          : "",

      label:
        label !== undefined &&
        String(label).trim()
          ? String(label).trim()
          : "Explore More",

      position:
        ["left", "center", "right"].includes(position)
          ? position
          : "center",

      active: normalizeBoolean(active, true),

      sortOrder: normalizeNumber(sortOrder, 0),

      startAt: normalizeDate(startAt),

      endAt: normalizeDate(endAt),

      products: normalizeProducts(products),
    });


    return res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      data: ad,
    });
  } catch (error) {
    console.error(
      "Create ad error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create advertisement",
      error: error.message,
    });
  }
};


/* =========================================================
   UPDATE AD
   PUT /api/ads/:id
========================================================= */

export const updateAd = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid advertisement ID",
      });
    }

    const existingAd = await Ad.findById(id);

    if (!existingAd) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found",
      });
    }


    /* ---------------------------------------------
       BUILD UPDATE DATA
    --------------------------------------------- */

    const updateData = {};


    if (req.body.heading !== undefined) {
      if (
        !String(req.body.heading).trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Heading cannot be empty",
        });
      }

      updateData.heading =
        String(req.body.heading).trim();
    }


    if (req.body.description !== undefined) {
      updateData.description =
        String(req.body.description);
    }


    if (req.body.image !== undefined) {
      updateData.image =
        String(req.body.image).trim();
    }


    if (req.body.mobileImage !== undefined) {
      updateData.mobileImage =
        String(req.body.mobileImage).trim();
    }


    if (req.body.productId !== undefined) {
      updateData.productId =
        req.body.productId &&
        mongoose.Types.ObjectId.isValid(
          req.body.productId
        )
          ? req.body.productId
          : null;
    }


    if (req.body.productSlug !== undefined) {
      updateData.productSlug =
        String(req.body.productSlug).trim();
    }


    if (req.body.productPath !== undefined) {
      updateData.productPath =
        String(req.body.productPath).trim();
    }


    if (req.body.label !== undefined) {
      updateData.label =
        String(req.body.label).trim() ||
        "Explore More";
    }


    if (req.body.position !== undefined) {
      updateData.position =
        ["left", "center", "right"].includes(
          req.body.position
        )
          ? req.body.position
          : "center";
    }


    if (req.body.active !== undefined) {
      updateData.active =
        normalizeBoolean(
          req.body.active,
          true
        );
    }


    if (req.body.sortOrder !== undefined) {
      updateData.sortOrder =
        normalizeNumber(
          req.body.sortOrder,
          0
        );
    }


    if (req.body.startAt !== undefined) {
      updateData.startAt =
        normalizeDate(req.body.startAt);
    }


    if (req.body.endAt !== undefined) {
      updateData.endAt =
        normalizeDate(req.body.endAt);
    }


    if (req.body.products !== undefined) {
      updateData.products =
        normalizeProducts(
          req.body.products
        );
    }


    /* ---------------------------------------------
       UPDATE
    --------------------------------------------- */

    const ad = await Ad.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );


    return res.status(200).json({
      success: true,
      message: "Advertisement updated successfully",
      data: ad,
    });
  } catch (error) {
    console.error(
      "Update ad error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update advertisement",
      error: error.message,
    });
  }
};


/* =========================================================
   DELETE AD
   DELETE /api/ads/:id
========================================================= */

export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid advertisement ID",
      });
    }

    const ad = await Ad.findByIdAndDelete(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Advertisement deleted successfully",
      data: {
        id: ad._id,
      },
    });
  } catch (error) {
    console.error(
      "Delete ad error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete advertisement",
      error: error.message,
    });
  }
};