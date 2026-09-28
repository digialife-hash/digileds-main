import express from "express";

import {
  getActiveAds,
  getAdById,
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  uploadAdImage,
  adUpload,
} from "../controllers/adController.js";

const router = express.Router();


/* =========================================================
   IMAGE UPLOAD
========================================================= */

router.post(
  "/upload",
  adUpload.single("image"),
  uploadAdImage
);


/* =========================================================
   ACTIVE ADS
========================================================= */

router.get(
  "/active",
  getActiveAds
);


/* =========================================================
   ALL ADS
========================================================= */

router.get(
  "/",
  getAllAds
);


/* =========================================================
   SINGLE AD
========================================================= */

router.get(
  "/:id",
  getAdById
);


/* =========================================================
   CREATE
========================================================= */

router.post(
  "/",
  createAd
);


/* =========================================================
   UPDATE
========================================================= */

router.put(
  "/:id",
  updateAd
);


/* =========================================================
   DELETE
========================================================= */

router.delete(
  "/:id",
  deleteAd
);


export default router;