import mongoose, { Schema, Document } from 'mongoose';
import { IAttendanceLog } from '../types';

interface IAttendanceLogDocument extends Omit<IAttendanceLog, '_id'>, Document {}

const AttendanceLogSchema: Schema = new Schema({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    action: {
        type: String,
        enum: ['punch-in', 'punch-out'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model<IAttendanceLogDocument>('AttendanceLog', AttendanceLogSchema);