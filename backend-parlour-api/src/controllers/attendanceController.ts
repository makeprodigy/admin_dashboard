import { Request, Response, RequestHandler } from 'express';
import AttendanceLog from '../models/AttendanceLog';
import Employee from '../models/Employee';

export const getAttendanceLogs: RequestHandler = async (req: Request, res: Response) => {
    try {
        const logs = await AttendanceLog.find()
        .populate('employeeId', 'name email')
        .sort({timestamp: -1})
        .limit(100);

        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const punchInOut: RequestHandler = async (req: Request & { io?: any }, res: Response) => {
    try {
        const { employeeId, action } = req.body;

        // update employee status
        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            { currentStatus: action === 'punch-in' ? 'in' : 'out'},
            {new: true}
        ).select('name email currentStatus');

        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }

        // create attendance log
        const log = await AttendanceLog.create({
            employeeId,
            action,
            timestamp: new Date(),
        });

        const populatedLog = await AttendanceLog.findById(log._id)
        .populate('employeeId', 'name email');

        // emit websocket event
        if (req.io) {
            req.io.to('admins').emit('attendance-update', {
                type: 'ATTENDANCE_UPDATE',
                data: {
                    employee,
                    log: populatedLog
                }
            });
        }

        res.json({ success: true, data: populatedLog });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};