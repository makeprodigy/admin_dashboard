import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Generate a random token
const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Validate token
const validateToken = (token: string, storedToken: string): boolean => {
    return crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(storedToken)
    );
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF check for safe methods
    if (SAFE_METHODS.includes(req.method)) {
        return next();
    }

    // Skip CSRF check for login and register routes
    if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
        return next();
    }

    const token = req.headers[CSRF_HEADER] as string;
    const storedToken = req.cookies[CSRF_COOKIE];

    if (!token || !storedToken) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing'
        });
    }

    try {
        if (!validateToken(token, storedToken)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid CSRF token'
            });
        }
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'CSRF validation failed'
        });
    }
};

// Generate and set CSRF token
export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    const token = generateToken();
    
    // Set CSRF token in cookie
    res.cookie(CSRF_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    // Set CSRF token in response header for client to read
    res.setHeader(CSRF_HEADER, token);
    next();
}; 