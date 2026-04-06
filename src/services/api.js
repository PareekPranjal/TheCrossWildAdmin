import axios from 'axios';

// API Base URL - uses VITE_API_URL from .env locally, falls back to production URL on Vercel
const API_URL = import.meta.env.VITE_API_URL || 'https://crosswild-backend-p5l3.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminAuth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  },
};

// Product Types API
export const productTypesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/product-types', { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/product-types/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/product-types', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/product-types/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/product-types/${id}`);
    return response.data;
  },

  seed: async () => {
    const response = await api.post('/product-types/seed');
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getTree: async (params = {}) => {
    const response = await api.get('/categories/tree', { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Blogs API
export const blogsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/blogs', { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  create: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  update: async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/blogs/stats');
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file, category = 'general') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadBase64: async (base64Data, category = 'general') => {
    const response = await api.post('/upload/base64', { imageData: base64Data, category });
    return response.data;
  },
};

// SEO API
export const seoAPI = {
  // Global SEO settings
  getGlobalSettings: async () => {
    const response = await api.get('/seo/global');
    return response.data;
  },

  updateGlobalSettings: async (settings) => {
    const response = await api.put('/seo/global', settings);
    return response.data;
  },

  // Page SEO settings
  getAllPages: async () => {
    const response = await api.get('/seo/pages');
    return response.data;
  },

  getPageSEO: async (path) => {
    const response = await api.get(`/seo/pages/${encodeURIComponent(path)}`);
    return response.data;
  },

  savePageSEO: async (pageData) => {
    const response = await api.post('/seo/pages', pageData);
    return response.data;
  },

  deletePageSEO: async (id) => {
    const response = await api.delete(`/seo/pages/${id}`);
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await api.get('/seo/stats');
    return response.data;
  },
};

// Locations API
export const locationsAPI = {
  getAll: async () => {
    const response = await api.get('/locations');
    return response.data;
  },

  getOne: async (slug) => {
    const response = await api.get(`/locations/${slug}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/locations', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

export default api;
