import axios from 'axios';

// API Base URL - change this to your deployed backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadBase64: async (base64Data) => {
    const response = await api.post('/upload/base64', { imageData: base64Data });
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
