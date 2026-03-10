import api from '../lib/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const loginUser = async (data: any) => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

export const registerUser = async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};
