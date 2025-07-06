import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Create a limiter for general API endpoints
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again after 15 minutes'
        });
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create a stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts from this IP, please try again after 15 minutes'
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 