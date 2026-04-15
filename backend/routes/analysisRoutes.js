import express from "express";
const router = express.Router();
import { calculatePerformance, getDashboardSummary, getPerformance, getClassAnalytics } from "../controllers/analysisController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

// All analysis routes require authentication
router.use(authMiddleware);

router.get("/dashboard/summary", authorizeRoles("faculty", "admin", "student"), getDashboardSummary);
router.get("/class/analytics", authorizeRoles("faculty", "admin"), getClassAnalytics);
router.post("/calculate/:rollNo", authorizeRoles("faculty", "admin"), calculatePerformance);
router.get("/:rollNo", authorizeRoles("faculty", "admin", "student"), getPerformance);

export default router;
