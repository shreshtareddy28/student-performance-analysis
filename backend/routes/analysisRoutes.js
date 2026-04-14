import express from "express";
const router = express.Router();
import { calculatePerformance, getPerformance, getClassAnalytics } from "../controllers/analysisController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

// All analysis routes require authentication
router.use(authMiddleware);

router.post("/calculate/:rollNo", authorizeRoles("faculty", "admin"), calculatePerformance);
router.get("/:rollNo", authorizeRoles("faculty", "admin", "student"), getPerformance);
router.get("/class/analytics", authorizeRoles("faculty", "admin"), getClassAnalytics);

export default router;