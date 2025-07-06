export interface IUser {
    _id: string;
    email: string;
    password: string;
    role: 'superadmin' | 'admin';
    name: string;
    failedLoginAttempts: number;
    lockUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
    handleFailedLogin(): Promise<void>;
    resetFailedAttempts(): Promise<void>;
    comparePassword(password: string): Promise<boolean>;
}

export interface IEmployee {
    _id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    joinDate: Date;
    isActive: boolean;
    currentStatus: 'in' | 'out';
    createdAt: Date;
    updatedAt: Date;
}

export interface ITask {
    _id: string;
    title: string;
    description: string;
    assignedTo: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAttendanceLog {
    _id: string;
    employeeId: string;
    action: 'punch-in' | 'punch-out';
    timestamp: Date;
    createdAt: Date;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: IUser;
}