import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export const getAllRestaurants = () => {
    return api.get('/restaurants')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching restaurants:', error);
            throw error;
        });
};

export const getRestaurantById = async (id) => {
    try {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        throw error;
    }
};

export const createRestaurant = async (restaurantData) => {
    try {
        const response = await api.post('/restaurants', restaurantData);
        return response.data;
    } catch (error) {
        console.error('Error creating restaurant:', error);
        throw error;
    }
};

export const getFeaturedRestaurant = async () => {
    try {
        const response = await api.get('/restaurants?featured=true');
        return response.data[0]; // Return the first featured restaurant
    } catch (error) {
        console.error('Error fetching featured restaurant:', error);
        throw error;
    }
};

export const toggleFeature = async (restaurantId) => {
    try {
        const response = await api.put(`/restaurants/${restaurantId}/feature`);
        return response.data;
    } catch (error) {
        console.error('Error toggling feature status:', error);
        throw error;
    }
}; 