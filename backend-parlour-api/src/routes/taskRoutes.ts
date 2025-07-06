import express from 'express';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', authorize('superadmin'), createTask);
router.put('/:id', authorize('superadmin'), updateTask);
router.delete('/:id', authorize('superadmin'), deleteTask);

export default router;