import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/database';
import initializeSocket from './websocket/socketHandler';
import seedData from './utils/seeder';

// Routes imports
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import taskRoutes from './routes/taskRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// initialize socket.IO
const io = initializeSocket(server);

// connect to database and seed data
connectDB().then(async () => {
    await seedData();
}).catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);
});

// middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins in development
    credentials: true,
}));

// rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true}));

// make io accesible to routes
app.use((req, res, next) => {
    (req as any).io = io;
    next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// error handling middleware
app.use((err:any, req:express.Request, res:express.Response, next:express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// start server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;