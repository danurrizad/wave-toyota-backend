import express from 'express'
import { getSetupAll, updateSetup } from '../controllers/SetupController.js';

const router = express.Router();

router.get('/setup', getSetupAll);
// router.get('/setup/:id', getSetupById);

router.put('/setup/:materialNo', updateSetup);


export default router;
