import express from "express";
import { handleDemoProxyRoute } from "../proxy/demo-proxy.js";

const router = express.Router();

router.get("/d/:id", (req, res, next) =>
  req.path.endsWith("/") ? next() : res.redirect(308, `/d/${req.params.id}/`),
);

router.use("/d/:id", handleDemoProxyRoute);

export default router;
