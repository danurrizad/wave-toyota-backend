import express from "express";
import { getConsumptionAll, createConsumption } from "../../controllers/History/ConsumptionController.js";

const router = express.Router();

router.get("/consumption", getConsumptionAll);
router.post("/consumption", createConsumption);

export default router;
