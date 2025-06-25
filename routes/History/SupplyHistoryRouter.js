import express from 'express';

import { createSupplyHistory, getSupplyHistory } from '../../controllers/History/SupplyHistoryController.js'

const router = express.Router()

router.get("/history/supply", getSupplyHistory)
router.post("/history/supply", createSupplyHistory)

export default router