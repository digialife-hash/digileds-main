import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    data: {
      user: req.user,
    },
    error: null,
  });
});

router.get(
  "/super-admin-only",
  protect,
  authorizeRoles("super_admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Super admin route accessed successfully",
      data: null,
      error: null,
    });
  }
);

router.get(
  "/employee-only",
  protect,
  authorizeRoles("employee", "super_admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Employee route accessed successfully",
      data: null,
      error: null,
    });
  }
);

router.get(
  "/client-only",
  protect,
  authorizeRoles("client", "super_admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Client route accessed successfully",
      data: null,
      error: null,
    });
  }
);

export default router;
