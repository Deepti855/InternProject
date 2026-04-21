import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

export const postAPI = {
  getAll: (params = {}) => api.get('/posts', { params }),
  getMyPosts: () => api.get('/posts/me'),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  getOne: (id) => api.get(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  checkLike: (id) => api.get(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
  getComments: (id) => api.get(`/posts/${id}/comments`),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  toggleBan: (id) => api.patch(`/users/${id}/toggle-ban`),
  delete: (id) => api.delete(`/users/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllPosts: () => api.get('/admin/posts'),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
};

export const chatAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getHistory: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (data) => api.post('/messages', data)
}

export const ecoAssistantAPI = {
  getHistory: () => api.get('/eco-assistant/history'),
  streamReply: async ({ question, onChunk, signal }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/eco-assistant/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question }),
      signal,
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to stream Eco Assistant response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk?.(chunk);
    }

    return fullText;
  },
};

export const sustainabilityAPI = {
  getMaterials: () => api.get('/sustainability/materials'),
  getProducts: () => api.get('/sustainability/products'),
  getProductById: (id) => api.get(`/sustainability/products/${id}`),
};

export const checkoutAPI = {
  createSession: (data) => api.post('/checkout/create-session', data),
  getSession: (sessionId) => api.get(`/checkout/session/${sessionId}`),
  complete: (sessionId) => api.post('/checkout/complete', { sessionId }),
};

export default api;
