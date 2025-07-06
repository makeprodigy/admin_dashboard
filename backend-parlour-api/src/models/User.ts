import mongoose, { Schema, Document} from "mongoose";
import bcrypt from "bcryptjs";
import {IUser} from "../types";

interface IUserDocument extends Omit<IUser, '_id'>, Document {
    comparePassword(password: string): Promise<boolean>;
}

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v: string) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function(v: string) {
                return passwordRegex.test(v);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
        }
    },
    role: {
        type: String,
        enum: {
            values: ['superadmin', 'admin'],
            message: '{VALUE} is not a valid role'
        },
        required: [true, 'Role is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for email lookup optimization
UserSchema.index({ email: 1 });

UserSchema.pre<IUserDocument>('save', async function(next) {
    if(!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 rounds
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
}

// Method to handle failed login attempts
UserSchema.methods.handleFailedLogin = async function(): Promise<void> {
    this.failedLoginAttempts += 1;
    
    if (this.failedLoginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    }
    
    await this.save();
}

// Method to reset failed login attempts
UserSchema.methods.resetFailedAttempts = async function(): Promise<void> {
    if (this.failedLoginAttempts > 0) {
        this.failedLoginAttempts = 0;
        this.lockUntil = null;
        await this.save();
    }
}

export default mongoose.model<IUserDocument>('User', UserSchema);



