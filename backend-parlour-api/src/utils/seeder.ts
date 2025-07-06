import mongoose from 'mongoose';
import User from '../models/User';
import Employee from '../models/Employee';
import Task from '../models/Task';

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Employee.deleteMany({});
        await Task.deleteMany({});

        // Create users with valid passwords (uppercase, lowercase, number, special char)
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'superadmin@parlour.com',
            password: 'SuperAdmin@123',
            role: 'superadmin'
        });

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@parlour.com',
            password: 'AdminUser@123',
            role: 'admin'
        });

        // Create employees
        const employees = await Employee.create([
            {
                name: 'Sarah Johnson',
                email: 'sarah@parlour.com',
                phone: '+1234567890',
                position: 'Senior Stylist',
                joinDate: new Date('2023-01-15'),
                isActive: true,
                currentStatus: 'out'
            },
            {
                name: 'Michael Chen',
                email: 'michael@parlour.com',
                phone: '+1234567891',
                position: 'Massage Therapist',
                joinDate: new Date('2023-02-20'),
                isActive: true,
                currentStatus: 'out'
            },
            {
                name: 'Emma Davis',
                email: 'emma@parlour.com',
                phone: '+1234567892',
                position: 'Nail Artist',
                joinDate: new Date('2023-03-10'),
                isActive: true,
                currentStatus: 'out'
            }
        ]);

        // Create tasks
        await Task.create([
            {
                title: 'Monthly Inventory Check',
                description: 'Complete inventory check of all beauty products and supplies',
                assignedTo: employees[0]._id,
                status: 'pending',
                priority: 'high',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                createdBy: superAdmin._id
            },
            {
                title: 'Client Follow-up Calls',
                description: 'Call clients from last week\'s appointments for feedback',
                assignedTo: employees[1]._id,
                status: 'in-progress',
                priority: 'medium',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                createdBy: superAdmin._id
            },
            {
                title: 'Update Service Menu',
                description: 'Add new summer special services to the menu',
                assignedTo: employees[2]._id,
                status: 'pending',
                priority: 'low',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                createdBy: admin._id
            }
        ]);

        console.log('Seed data created successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

export default seedData; 