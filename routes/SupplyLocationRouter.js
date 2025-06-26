import express from 'express'
import { getSupplyLocations, createSupplyLocation, updateSupplyLocation, deleteSupplyLocationByName, getSupplyLocationByName  } from '../controllers/SupplyLocation.js';

const router = express.Router();

router.get('/supply-location', getSupplyLocations);
router.get('/supply-location/:locationName/:plant', getSupplyLocationByName);
router.post('/supply-location', createSupplyLocation);
router.put('/supply-location/update', updateSupplyLocation);
router.delete('/supply-location/delete/:id', deleteSupplyLocationByName);


export default router;
