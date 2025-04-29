import express from "express";
import { registerUser, getUsers, updateUserById, deleteUserById, changePasswordUserById } from "../controllers/UserController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/users/register", authenticateToken, registerUser);
router.get("/users", authenticateToken, getUsers);
router.put("/user/:userId", authenticateToken, updateUserById);
router.delete("/user/:userId", authenticateToken, deleteUserById);
router.put("/change-password/:userId", changePasswordUserById)

export default router;
