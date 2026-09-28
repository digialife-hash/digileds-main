import express from "express";
import { generalLimiter } from "../middleware/limiters.js";
import { prometheus } from "../services/metrics.js";
import healthRoutes from "./health.routes.js";
import demoRoutes from "./demo.routes.js";
import projectRoutes from "./project.routes.js";
import portfolioRoutes from "./portfolio.routes.js";
import authRoutes from "./auth.routes.js";
import visitorAnalyticsRoutes from "./visitor-analytics.routes.js";
import teamRoutes from "./team.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import contactRoutes from "./contact.routes.js";
import careerRoutes from "./career.routes.js";
import leadRoutes from "./lead.routes.js";
import careerOpeningRoutes from "./career-opening.routes.js";
const router = express.Router();

router.use("/api", generalLimiter);
router.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) =>
  res.status(204).end(),
);
router.use(healthRoutes);
router.use(demoRoutes);
router.use(projectRoutes);
router.use(portfolioRoutes);
router.use(authRoutes);
router.use(visitorAnalyticsRoutes);
router.use(teamRoutes);
router.use(subscriptionRoutes);
router.use(contactRoutes);
router.use(careerRoutes);
router.use(leadRoutes);
router.use(careerOpeningRoutes);
router.get("/metrics", (_req, res) =>
  res.type("text/plain").send(prometheus()),
);

export default router;
