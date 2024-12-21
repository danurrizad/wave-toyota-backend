import express from 'express'
import { getMonitoringAll, updateMonitoring } from '../controllers/MonitoringController.js';

const router = express.Router();

router.get('/monitoring', getMonitoringAll);
// router.get('/setup/:id', getSetupById);

router.put('/monitoring/:materialNo', updateMonitoring);


export default router;
