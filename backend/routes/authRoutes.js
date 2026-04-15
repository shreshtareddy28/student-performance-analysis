import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";
import { signup, login, getMe, updateMe } from "../controllers/authController.js";

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, authorizeRoles("admin", "faculty", "student"), getMe);
router.put("/me", authMiddleware, authorizeRoles("admin", "faculty", "student"), updateMe);

export default router;
