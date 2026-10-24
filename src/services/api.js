export const BASE_URL = 'http://127.0.0.1:8000';
const API_URL = 'http://127.0.0.1:8000/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };

  // Si enviamos requerirAuth: false, NO adjuntamos el Bearer token
  if (token && options.requerirAuth !== false) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Ocurrió un error en la petición');
  }

  return data;
}