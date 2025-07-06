import express from 'express';
import {
    getAttendanceLogs,
    punchInOut,
} from '../controllers/attendanceController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', getAttendanceLogs);
router.post('/punch', punchInOut);

export default router;