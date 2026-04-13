import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";
import { signup, login, createUser } from "../controllers/authController.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/register", authMiddleware, authorizeRoles("admin", "faculty"), createUser);

export default router;