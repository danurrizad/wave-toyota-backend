import express from 'express'
import { getSupplyQtyAll, getSupplyQtyByNoPlant, updateSupplyQty } from './../controllers/SupplyQtyController.js';

const router = express.Router();

router.get('/supply-qty', getSupplyQtyAll);
router.get('/supply-qty/:material_no/:plant', getSupplyQtyByNoPlant);

router.put('/supply-qty/:materialNo', updateSupplyQty);


export default router;
