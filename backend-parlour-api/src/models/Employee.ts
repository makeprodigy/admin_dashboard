import mongoose, { Schema, Document } from 'mongoose';
import { IEmployee } from '../types';

interface IEmployeeDocument extends Omit<IEmployee, '_id'>, Document {}

const EmployeeSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    joinDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    currentStatus: {
        type: String,
        enum: ['in', 'out'],
        default: 'out'
    }
}, {
    timestamps: true
});

export default mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);