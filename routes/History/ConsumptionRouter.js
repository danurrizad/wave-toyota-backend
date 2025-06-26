import express from "express";
import { getConsumptions, getTotalUnitsToday, createConsumption } from "../../controllers/History/ConsumptionController.js";

const router = express.Router();

router.get("/consumption-history", getConsumptions);
router.get("/total-units", getTotalUnitsToday);
router.post("/consumption", createConsumption);


export default router;
