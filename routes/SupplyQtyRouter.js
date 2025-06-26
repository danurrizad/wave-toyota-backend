import express from 'express'
import { getSupplyQty, getSupplyQtyByNoPlant, updateSupplyQty } from './../controllers/SupplyQtyController.js';

const router = express.Router();

router.get('/supply-qty', getSupplyQty);
router.get('/supply-qty/:material_no/:plant', getSupplyQtyByNoPlant);

router.put('/supply-qty/:materialNo', updateSupplyQty);


export default router;
