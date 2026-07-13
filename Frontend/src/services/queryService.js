import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getQueries = (params) => api.get('/queries', { params });
export const getMyQueries = () => api.get('/queries/my');
export const getQueriesStats = () => api.get('/queries/stats');
export const getQueryById = (id) => api.get(`/queries/${id}`);
export const createQuery = (data) => api.post('/queries', data);
export const submitQuery = (data) => api.post('/queries/submit', data);
export const updateQuery = (id, data) => api.put(`/queries/${id}`, data);
export const deleteQuery = (id) => api.delete(`/queries/${id}`);


