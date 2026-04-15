import express from "express";
const router = express.Router();
import { addStudent, getMyStudent, getStudents, getStudentByRollNo, updateStudent, deleteStudent } from "../controllers/studentcontroller.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { validateStudent } from "../middleware/validationMiddleware.js";

// All student routes require authentication
router.use(authMiddleware);

router.post("/", authorizeRoles("admin"), validateStudent, addStudent);
router.get("/me", getMyStudent);
router.get("/", authorizeRoles("faculty", "admin"), getStudents);
router.get("/:rollNo", authorizeRoles("faculty", "admin", "student"), getStudentByRollNo);
router.put("/:rollNo", authorizeRoles("faculty", "admin"), updateStudent);
router.delete("/:rollNo", authorizeRoles("admin"), deleteStudent);

export default router;
