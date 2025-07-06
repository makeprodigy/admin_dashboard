import { Response, RequestHandler } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../types';

export const getTasks: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await Task.find()
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({createdAt: -1});
        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createTask: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        // Only super admin can create tasks
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ message: 'Not authorized to create tasks' });
            return;
        }

        const taskData = {
            ...req.body,
            createdBy: req.user!._id,
        };

        const task = await Task.create(taskData);
        const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

        res.status(201).json({ success: true, data: populatedTask });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTask: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        // Only super admin can update tasks
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ message: 'Not authorized to update tasks' });
            return;
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id, 
            req.body,
            {new: true, runValidators: true}
        )
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
        
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        
        res.json({success: true, data: task});
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteTask: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        // Only super admin can delete tasks
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ message: 'Not authorized to delete tasks' });
            return;
        }

        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        res.json({success: true, message: 'Task deleted successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
