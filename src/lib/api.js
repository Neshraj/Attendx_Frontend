import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://attendx-server-vmyb.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

export function apiError(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}

export default api;
