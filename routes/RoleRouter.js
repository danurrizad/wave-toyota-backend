import express from "express";
import { getAllRole, getRoleById, createRole, updateRole, deleteRole } from "../controllers/RoleController.js";
const router = express.Router();

router.get('/role', getAllRole)
router.get('/role/:roleId', getRoleById)
router.post('/role', createRole)
router.put('/role/:role_id', updateRole)
router.delete('/role/:role_id', deleteRole)

export default router;