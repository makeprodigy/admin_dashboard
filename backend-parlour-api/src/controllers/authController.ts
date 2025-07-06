import { Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { validateLoginInput, validateRegisterInput } from '../utils/validation';
import { AuthRequest } from '../types';
import { Error as MongooseError } from 'mongoose';

const generateToken = (id: string): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
        algorithm: 'HS256'
    });
};

export const login: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const validationErrors = validateLoginInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
            return res.status(423).json({
                success: false,
                message: `Account is locked. Please try again in ${remainingTime} minutes`
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            await user.handleFailedLogin();
            
            if (user.failedLoginAttempts >= 5) {
                return res.status(423).json({
                    success: false,
                    message: 'Account locked due to too many failed attempts. Please try again in 15 minutes'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset failed attempts on successful login
        await user.resetFailedAttempts();

        // Generate JWT token
        const token = generateToken(user._id.toString());

        // Remove sensitive data before sending response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
};

export const register: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        const validationErrors = validateRegisterInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role
        });

        // Generate token
        const token = generateToken(user._id.toString());

        // Remove sensitive data before sending response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(201).json({
            success: true,
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle mongoose validation errors
        if (error instanceof MongooseError.ValidationError) {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred during registration'
        });
    }
};