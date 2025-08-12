import { CONFIG } from '../config/environment';

interface User {
    userAddress: string;
    platform: string;
    metadata: Record<string, any>;
    // Add other user fields as needed
}

interface UserResponse {
    success: boolean;
    data?: User;
    error?: string;
}

interface CreateUserRequest {
    userAddress: string;
    platform: string;
    metadata: Record<string, any>;
}

/**
 * Check if a user exists in the backend
 */
export const checkUserExists = async (address: string): Promise<UserResponse> => {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/users/address/${address}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to check user existence'
            };
        }

        return {
            success: true,
            data: data.data
        };
    } catch (error) {
        console.error('Error checking user existence:', error);
        return {
            success: false,
            error: 'Network error while checking user'
        };
    }
};

/**
 * Create a new user in the backend
 */
export const createUser = async (userData: CreateUserRequest): Promise<UserResponse> => {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to create user'
            };
        }

        return {
            success: true,
            data: data.data
        };
    } catch (error) {
        console.error('Error creating user:', error);
        return {
            success: false,
            error: 'Network error while creating user'
        };
    }
};

/**
 * Ensure user exists - check if user exists, create if not
 */
export const ensureUserExists = async (address: string): Promise<UserResponse> => {
    try {
        // First check if user exists
        const checkResult = await checkUserExists(address);

        if (checkResult.success && checkResult.data) {
            // User exists, return the user data
            console.log('User already exists:', address);
            return checkResult;
        }

        // User doesn't exist, create new user
        const createData: CreateUserRequest = {
            userAddress: address,
            platform: 'hashandslash',
            metadata: {
                createdAt: new Date().toISOString(),
                game: 'sudoku'
            }
        };

        const createResult = await createUser(createData);

        if (createResult.success) {
            console.log('New user created successfully:', address);
        } else {
            console.error('Failed to create user:', createResult.error);
        }

        return createResult;
    } catch (error) {
        console.error('Error ensuring user exists:', error);
        return {
            success: false,
            error: 'Failed to ensure user exists'
        };
    }
};
