import axios from 'axios';

// Déterminer l'URL de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour ajouter les headers d'authentification et tenant
apiInstance.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage (côté client uniquement)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Debug
      console.log('Axios request to:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Axios request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Axios response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
); 