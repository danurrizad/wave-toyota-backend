import express from "express";
import { login, getAuth, logout, refresh } from "../controllers/AuthController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/auth/login", login);
router.get("/auth/getAuth", getAuth);
router.post("/auth/logout", logout);
router.post("/auth/verify-token", authenticate)
router.post("/auth/refresh", refresh)

export default router;
