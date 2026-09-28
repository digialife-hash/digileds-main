import express from "express";
import { getHealth } from "../controllers/health.controller.js";

const router = express.Router();
router.get("/api/health", getHealth);

export default router;
