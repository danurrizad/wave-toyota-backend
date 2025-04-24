import express from "express";
import { getConsumptionAll, getConsumptionOnRange, getTotalUnitsToday, createConsumption } from "../../controllers/History/ConsumptionController.js";

const router = express.Router();

router.get("/consumption-all", getConsumptionAll);
router.get("/consumption-history", getConsumptionOnRange);
router.get("/total-units", getTotalUnitsToday);
router.post("/consumption", createConsumption);


export default router;
