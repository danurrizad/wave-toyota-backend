import express from "express";
import { registerUser, getUsers } from "../controllers/UserController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/users/register", registerUser);
router.get("/users", authenticate, getUsers);

export default router;
