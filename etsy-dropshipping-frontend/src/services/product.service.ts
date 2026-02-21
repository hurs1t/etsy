import { authApi } from './auth.service';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create a separate instance for data to inject token
const dataApi = axios.create({
    baseURL: `${API_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send Cookies
});

dataApi.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Use Bearer prefix
    }
    return config;
});

dataApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getProducts = async () => {
    const response = await dataApi.get('/products');
    return response.data;
};

export const createProduct = async (data: any) => {
    const response = await dataApi.post('/products', data);
    return response.data;
};

export const deleteProductsBulk = async (ids: string[]) => {
    const response = await dataApi.post('/products/bulk-delete', { ids });
    return response.data;
};

export const getDashboardStats = async (): Promise<{ total: number; drafts: number; published: number; recent: any[] }> => {
    const response = await dataApi.get('/products/stats');
    return response.data;
};

export const scrapeProduct = async (url: string) => {
    const response = await dataApi.post('/scraper/scrape', { url });
    return response.data;
};

export const generateAiContent = async (data: { productTitle: string, productDescription?: string, keywords?: string[], fields?: string[] }) => {
    const response = await dataApi.post('/ai-content/generate', data);
    return response.data;
};

export const getEtsyAuthUrl = async () => {
    const response = await dataApi.get('/etsy/auth');
    return response.data;
};
export const getProduct = async (id: string) => {
    const response = await dataApi.get(`/products/${id}`);
    return response.data;
};

export const updateProduct = async (id: string, data: any) => {
    const response = await dataApi.patch(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    const response = await dataApi.delete(`/products/${id}`);
    return response.data;
};

export const deleteProductImage = async (imageId: string) => {
    const response = await dataApi.delete(`/images/${imageId}`);
    return response.data;
};

export const reorderProductImage = async (imageId: string, orderIndex: number) => {
    const response = await dataApi.patch(`/images/${imageId}/reorder`, { orderIndex });
    return response.data;
};
export const upscaleProductImage = async (imageId: string) => {
    const response = await dataApi.post(`/images/${imageId}/upscale`, {});
    return response.data;
};

export const getShippingProfiles = async () => {
    const response = await dataApi.get('/etsy/shipping-profiles');
    return response.data;
};

export const publishProduct = async (id: string, imageIds?: string[]) => {
    const response = await dataApi.post(`/etsy/publish/${id}`, { imageIds });
    return response.data;
};

export const getTaxonomyNodes = async () => {
    const response = await dataApi.get('/etsy/taxonomy');
    return response.data;
};

export const getTaxonomyProperties = async (taxonomyId: number) => {
    const response = await dataApi.get(`/etsy/taxonomy/${taxonomyId}/properties`);
    return response.data;
};

export const disconnectEtsy = async () => {
    const response = await dataApi.post('/etsy/disconnect');
    return response.data;
};
export const analyzeSeo = async (data: any) => {
    const response = await dataApi.post('/ai-content/analyze', data);
    return response.data;
};
