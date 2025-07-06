import express from 'express';
import {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from '../controllers/employeeController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // authenticate all employee routes

router.get('/', getEmployees);
router.post('/', authorize('superadmin'), createEmployee);
router.put('/:id', authorize('superadmin'), updateEmployee);
router.delete('/:id', authorize('superadmin'), deleteEmployee);

export default router;