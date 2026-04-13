import express from "express";
const router = express.Router();
import { addMarks, getMarks, getMarksByStudent, updateMarks, deleteMarks } from "../controllers/marksController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { validateMarks } from "../middleware/validationMiddleware.js";

// All marks routes require authentication
router.use(authMiddleware);

router.post("/", authorizeRoles("faculty", "admin"), validateMarks, addMarks);
router.get("/", authorizeRoles("faculty", "admin", "student"), getMarks);
router.get("/student/:student_id", authorizeRoles("faculty", "admin", "student"), getMarksByStudent);
router.put("/:id", authorizeRoles("faculty", "admin"), validateMarks, updateMarks);
router.delete("/:id", authorizeRoles("faculty", "admin"), deleteMarks);

export default router;