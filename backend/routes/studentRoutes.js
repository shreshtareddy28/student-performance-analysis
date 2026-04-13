import express from "express";
const router = express.Router();
import { addStudent, getMyStudent, getStudents, getStudentById, updateStudent, deleteStudent } from "../controllers/studentcontroller.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { validateStudent } from "../middleware/validationMiddleware.js";

// All student routes require authentication
router.use(authMiddleware);

router.post("/", authorizeRoles("faculty", "admin"), validateStudent, addStudent);
router.get("/me", getMyStudent);
router.get("/", authorizeRoles("faculty", "admin"), getStudents);
router.get("/:id", authorizeRoles("faculty", "admin"), getStudentById);
router.put("/:id", authorizeRoles("faculty", "admin"), validateStudent, updateStudent);
router.delete("/:id", authorizeRoles("faculty", "admin"), deleteStudent);

export default router;