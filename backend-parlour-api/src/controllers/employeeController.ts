import { Response, RequestHandler } from 'express';
import Employee from '../models/Employee';
import { AuthRequest } from '../types';

export const getEmployees: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        const employees = await Employee.find().sort({createdAt: -1});
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createEmployee: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        // Only super admin can create employees
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ message: 'Not authorized to create employees' });
            return;
        }

        const employee = await Employee.create(req.body);
        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateEmployee: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        // Only super admin can update employees
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ message: 'Not authorized to update employees' });
            return;
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {new: true, runValidators: true}
        );

        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }

        res.json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteEmployee: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        // Only super admin can delete employees
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ message: 'Not authorized to delete employees' });
            return;
        }

        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }

        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

