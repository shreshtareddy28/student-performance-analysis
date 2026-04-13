import express from "express";
const router = express.Router();
import { calculatePerformance, getPerformance, getSummary } from "../controllers/analysisController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { validatePerformance } from "../middleware/validationMiddleware.js";

// All analysis routes require authentication
router.use(authMiddleware);

router.post("/", authorizeRoles("faculty", "admin"), validatePerformance, calculatePerformance);
router.get("/summary", authorizeRoles("faculty", "admin"), getSummary);
router.get("/:student_id", authorizeRoles("faculty", "admin", "student"), getPerformance);

export default router;