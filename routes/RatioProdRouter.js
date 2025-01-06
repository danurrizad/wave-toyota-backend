import express from "express";
import { getRatioProdAll, createRatioProd, updateRatioProd } from "../controllers/RatioProdController.js";

const router = express.Router();

router.get('/ratio-production', getRatioProdAll)
router.post('/ratio-production', createRatioProd)
router.put('/ratio-production/:ratio_id', updateRatioProd)

export default router;