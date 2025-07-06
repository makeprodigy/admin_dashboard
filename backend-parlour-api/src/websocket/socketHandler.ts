import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}

export const initializeSocket = (server: HTTPServer) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    // Middleware to authenticate socket connections
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                throw new Error('Authentication token not provided');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
            const user = await User.findById(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            socket.userId = user._id.toString();
            socket.userRole = user.role;
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log('User Connected:', socket.id);

        // Join admin room if user has appropriate role
        if (socket.userRole === 'superadmin' || socket.userRole === 'admin') {
            socket.join('admins');
            console.log('Admin joined room:', socket.id);
            
            // Send initial connection success message
            socket.emit('connection-success', {
                message: 'Successfully connected to attendance updates',
                role: socket.userRole
            });
        }

        // Handle attendance updates
        socket.on('attendance-update', (data) => {
            try {
                // Validate data
                if (!data.employeeId || !data.action) {
                    throw new Error('Invalid attendance data');
                }

                // Broadcast the update to all admins
                io.to('admins').emit('attendance-update', {
                    type: 'ATTENDANCE_UPDATE',
                    data: {
                        ...data,
                        timestamp: new Date(),
                        socketId: socket.id
                    }
                });
            } catch (error) {
                socket.emit('error', {
                    message: error instanceof Error ? error.message : 'Failed to process attendance update'
                });
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
            socket.emit('error', {
                message: 'An error occurred'
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('User Disconnected:', socket.id);
        });
    });

    return io;
}

export default initializeSocket;