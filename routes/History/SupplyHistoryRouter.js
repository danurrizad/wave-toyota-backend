import express from 'express';

import { getSupplyHistoryAll, createSupplyHistory } from '../../controllers/History/SupplyHistoryController.js'

const router = express.Router()

router.get("/history/supply", getSupplyHistoryAll)
router.post("/history/supply", createSupplyHistory)

export default router