import express from "express";
import { getRatioProdAll, updateRatioProd } from "../controllers/RatioProdController.js";

const router = express.Router();

router.get('/ratio-production', getRatioProdAll)
router.put('/ratio-production/:ratio_id', updateRatioProd)

export default router;