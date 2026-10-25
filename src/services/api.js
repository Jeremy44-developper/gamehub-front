import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // On s'assure que le token existe, commence par 'ey' et fait une longueur minimale de JWT (ex: > 50 caractères)
    if (token && token.startsWith('ey') && token.length > 50) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // S'il n'est pas valide, on nettoie pour éviter d'envoyer de la bouse au serveur
      localStorage.removeItem('token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;