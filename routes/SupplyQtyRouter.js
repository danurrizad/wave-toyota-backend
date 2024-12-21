import express from 'express'
import { getSupplyQtyAll, updateSupplyQty } from './../controllers/SupplyQtyController.js';

const router = express.Router();

router.get('/supply-qty', getSupplyQtyAll);
// router.get('/setup/:id', getSetupById);

router.put('/supply-qty/:materialNo', updateSupplyQty);


export default router;
