import githubApi from "../config/githubApi.js";
import express from "express";
import {  testGithub,
  getRepo,
  getCommits,
  getCommit, } from "../controllers/githubController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";



const router = express.Router();

router.use(protect, authorizeRoles("super_admin", "admin"));
router.get("/test", testGithub);


router.get("/repo/:owner/:repo", getRepo);

router.get("/repo/:owner/:repo/commits", getCommits);

router.get("/repo/:owner/:repo/commit/:sha", getCommit);
export default router;

