import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

export const protect: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({message: 'Not authorized, token missing'});
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.status(401).json({message: 'Not authorized, invalid token'});
            return;
        }

        (req as AuthRequest).user = user as any;
        next();
    } catch (error) {
        res.status(401).json({message: 'Not authorized, invalid token'});
    }
};

export const authorize = (...roles: string[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        if (!authReq.user) {
            res.status(403).json({message: 'User not authenticated'});
            return;
        }
        
        if (!roles.includes(authReq.user.role)) {
            res.status(403).json({message: `User role ${authReq.user.role} is not authorized to access this route`});
            return;
        }
        
        next();
    }
};