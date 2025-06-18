import express from 'express'
import { getScheduleByMonth, upsertSchedules } from '../controllers/ScheduleController.js';

const router = express.Router();

router.get('/schedules/:date', getScheduleByMonth);
router.post('/schedules', upsertSchedules);

export default router;
