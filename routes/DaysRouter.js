import express from 'express'
import { createDays, getDays, updateDays } from '../controllers/DaysController.js';

const router = express.Router();

router.get('/days', getDays);
router.post('/days', createDays);
router.put('/days/:daysId', updateDays);

export default router;
