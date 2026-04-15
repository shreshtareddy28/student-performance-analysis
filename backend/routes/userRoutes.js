import express from "express";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { createFaculty, deleteFaculty, getFaculty, updateFaculty } from "../controllers/userController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/faculty", authorizeRoles("admin"), getFaculty);
router.post("/faculty", authorizeRoles("admin"), createFaculty);
router.put("/faculty/:id", authorizeRoles("admin"), updateFaculty);
router.delete("/faculty/:id", authorizeRoles("admin"), deleteFaculty);

export default router;
