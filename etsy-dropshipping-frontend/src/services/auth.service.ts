import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authApi = axios.create({
    baseURL: `${API_URL}/auth`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginUser = async (data: any) => {
    const response = await authApi.post('/login', data);
    return response.data;
};

export const registerUser = async (data: any) => {
    const response = await authApi.post('/register', data);
    return response.data;
};
