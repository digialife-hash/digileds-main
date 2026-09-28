import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  getMyPurchases,
} from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


/*
=========================================================
CREATE PAYMENT ORDER
POST /api/payments/create-order
=========================================================
*/

router.post(
  "/create-order",
  
  authMiddleware,
  createPaymentOrder
);


/*
=========================================================
VERIFY PAYMENT
POST /api/payments/verify
=========================================================
*/

router.post(
  "/verify",
  
  authMiddleware,
  verifyPayment
);


/*
=========================================================
MY PURCHASES
GET /api/payments/my-purchases
=========================================================
*/

router.get(
  "/my-purchases",
  authMiddleware,
  getMyPurchases
);


export default router;