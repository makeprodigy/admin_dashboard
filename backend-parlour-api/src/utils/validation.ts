interface LoginInput {
    email: string;
    password: string;
}

interface RegisterInput extends LoginInput {
    name: string;
    role: 'superadmin' | 'admin';
}

export const validateLoginInput = (input: Partial<LoginInput>): string[] => {
    const errors: string[] = [];

    if (!input.email) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!input.password) {
        errors.push('Password is required');
    }

    return errors;
};

export const validateRegisterInput = (input: Partial<RegisterInput>): string[] => {
    const errors: string[] = [];

    // Name validation
    if (!input.name) {
        errors.push('Name is required');
    } else if (input.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    } else if (input.name.length > 50) {
        errors.push('Name cannot exceed 50 characters');
    }

    // Email validation
    if (!input.email) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
        errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!input.password) {
        errors.push('Password is required');
    } else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(input.password)) {
            errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character');
        }
        if (input.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
    }

    // Role validation
    if (!input.role) {
        errors.push('Role is required');
    } else if (!['superadmin', 'admin'].includes(input.role)) {
        errors.push('Invalid role');
    }

    return errors;
}; 