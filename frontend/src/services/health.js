import axios from 'axios';

const API_URL = 'https://dental-ujqk.onrender.com';

/**
 * Check if backend is reachable
 */
export const checkBackendHealth = async () => {
  try {
    console.log('🏥 Checking backend health...');
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000,
    });
    console.log('✅ Backend is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', {
      message: error.message,
      status: error.response?.status,
      url: `${API_URL}/api/health`,
    });
    return false;
  }
};

/**
 * Get backend API URL
 */
export const getApiUrl = () => API_URL;
