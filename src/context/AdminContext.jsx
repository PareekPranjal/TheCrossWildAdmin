import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI, blogsAPI, productTypesAPI, ordersAPI, authAPI } from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Initialize data from localStorage and API
  useEffect(() => {
    const storedAuth = localStorage.getItem('adminAuth');
    const token = localStorage.getItem('adminToken');
    if (storedAuth && token) {
      const authData = JSON.parse(storedAuth);
      setIsAuthenticated(authData.isAuthenticated);
      setUser(authData.user);
    }

    loadProducts();
    loadBlogs();
    loadProductTypes();
  }, []);

  // Auth functions
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success && response.token) {
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminAuth', JSON.stringify({
          isAuthenticated: true,
          user: response.user,
        }));
        setIsAuthenticated(true);
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
  };

  // Data loading functions
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      const productsData = response.products || [];
      const mappedProducts = productsData.map(p => ({
        ...p,
        id: p._id || p.id,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      const stored = localStorage.getItem('adminProducts');
      if (stored) {
        setProducts(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async () => {
    try {
      const response = await blogsAPI.getAll();
      const blogsData = response.blogs || [];
      const mappedBlogs = blogsData.map(b => ({
        ...b,
        id: b._id || b.id,
      }));
      setBlogs(mappedBlogs);
    } catch (error) {
      console.error('Failed to load blogs:', error);
      const stored = localStorage.getItem('adminBlogs');
      if (stored) {
        setBlogs(JSON.parse(stored));
      }
    }
  };

  const loadProductTypes = async () => {
    try {
      const response = await productTypesAPI.getAll();
      const typesData = response.productTypes || [];
      const mappedTypes = typesData.map(t => ({
        ...t,
        id: t._id || t.id,
      }));
      setProductTypes(mappedTypes);
    } catch (error) {
      console.error('Failed to load product types:', error);
    }
  };

  // Product CRUD operations
  const addProduct = async (productData) => {
    try {
      setLoading(true);
      const response = await productsAPI.create(productData);
      // API returns { success, message, product } — extract the product
      const saved = response.product || response;
      const newProduct = {
        ...saved,
        id: saved._id || saved.id,
      };
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      setLoading(true);
      const response = await productsAPI.update(id, updates);
      // API returns { success, message, product } — use the saved product from server
      const saved = response.product || response;
      const updatedProduct = { ...saved, id: saved._id || saved.id };
      const updated = products.map(p => p.id === id ? updatedProduct : p);
      setProducts(updated);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      await productsAPI.delete(id);
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Blog CRUD operations
  const addBlog = async (blog) => {
    try {
      setLoading(true);
      const response = await blogsAPI.create(blog);
      const newBlog = {
        ...response,
        id: response._id || response.id,
      };
      setBlogs([...blogs, newBlog]);
      return newBlog;
    } catch (error) {
      console.error('Failed to add blog:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (id, updates) => {
    try {
      setLoading(true);
      await blogsAPI.update(id, updates);
      const updated = blogs.map(b => b.id === id ? { ...b, ...updates } : b);
      setBlogs(updated);
    } catch (error) {
      console.error('Failed to update blog:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    try {
      setLoading(true);
      await blogsAPI.delete(id);
      const updated = blogs.filter(b => b.id !== id);
      setBlogs(updated);
    } catch (error) {
      console.error('Failed to delete blog:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Order operations
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      const ordersData = response.orders || [];
      const mappedOrders = ordersData.map(o => ({
        ...o,
        id: o._id || o.id,
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      setLoading(true);
      await ordersAPI.updateStatus(id, status);
      const updated = orders.map(o => o.id === id ? { ...o, status } : o);
      setOrders(updated);
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      setLoading(true);
      await ordersAPI.delete(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ProductType operations
  const addProductType = async (data) => {
    try {
      setLoading(true);
      const response = await productTypesAPI.create(data);
      const saved = response.productType || response;
      const newType = { ...saved, id: saved._id || saved.id };
      setProductTypes([...productTypes, newType]);
      return newType;
    } catch (error) {
      console.error('Failed to add product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProductType = async (id, data) => {
    try {
      setLoading(true);
      const response = await productTypesAPI.update(id, data);
      const saved = response.productType || response;
      const updatedType = { ...saved, id: saved._id || saved.id };
      setProductTypes(productTypes.map(t => t.id === id ? updatedType : t));
    } catch (error) {
      console.error('Failed to update product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProductType = async (id) => {
    try {
      setLoading(true);
      await productTypesAPI.delete(id);
      setProductTypes(productTypes.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // Auth
    isAuthenticated,
    user,
    login,
    logout,

    // Data
    products,
    blogs,
    productTypes,
    orders,

    // CRUD operations
    addProduct,
    updateProduct,
    deleteProduct,
    addBlog,
    updateBlog,
    deleteBlog,
    loadOrders,
    updateOrderStatus,
    deleteOrder,
    addProductType,
    updateProductType,
    deleteProductType,

    // Reload
    loadProducts,
    loadBlogs,
    loadProductTypes,

    // UI
    sidebarOpen,
    setSidebarOpen,
    loading,
    setLoading,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
