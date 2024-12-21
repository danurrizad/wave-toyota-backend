import express from "express";
import { login, logout } from "../controllers/AuthController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/verify-token", authenticate)

export default router;
