import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI, blogsAPI, ordersAPI, productTypesAPI } from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Fallback categories when API product types aren't available
const DEFAULT_CATEGORIES = [
  { id: 'tshirts', name: 'T-Shirts', icon: '👕' },
  { id: 'sweatshirts', name: 'Sweatshirts', icon: '🧥' },
  { id: 'caps', name: 'Caps', icon: '🧢' },
  { id: 'bags', name: 'Bags', icon: '🎒' },
  { id: 'mugs', name: 'Mugs', icon: '☕' },
  { id: 'cards', name: 'Business Cards', icon: '💳' },
  { id: 'printing', name: 'Printing', icon: '🖨️' },
  { id: 'uniforms', name: 'Uniforms', icon: '👔' },
  { id: 'gifts', name: 'Gifts', icon: '🎁' },
];

export const AdminProvider = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [productTypes, setProductTypes] = useState([]);

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Initialize data from localStorage and API
  useEffect(() => {
    const storedAuth = localStorage.getItem('adminAuth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setIsAuthenticated(authData.isAuthenticated);
      setUser(authData.user);
    }

    // Load data from API
    loadProducts();
    loadBlogs();
    loadOrders();
    loadProductTypes();
  }, []);

  // Auth functions
  const login = (credentials) => {
    // Simple authentication (replace with your backend API)
    if (credentials.email === 'admin@thecrosswild.com' && credentials.password === 'admin123') {
      const userData = {
        id: 1,
        name: 'Admin User',
        email: credentials.email,
        role: 'admin',
      };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('adminAuth', JSON.stringify({
        isAuthenticated: true,
        user: userData,
      }));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('adminAuth');
  };

  // Data loading functions
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      const productsData = response.products || [];
      // Map _id to id for compatibility
      const mappedProducts = productsData.map(p => ({
        ...p,
        id: p._id || p.id,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Fallback to localStorage if API fails
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
      // Map _id to id for compatibility
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

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      const ordersData = response.orders || [];
      // Map _id to id for compatibility
      const mappedOrders = ordersData.map(o => ({
        ...o,
        id: o._id || o.id,
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      const stored = localStorage.getItem('adminOrders');
      if (stored) {
        setOrders(JSON.parse(stored));
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

      // Build categories from product types for backward compatibility
      if (mappedTypes.length > 0) {
        const dynamicCategories = mappedTypes
          .filter(t => t.isActive !== false)
          .map(t => ({
            id: t.slug,
            name: t.name,
            icon: t.icon || '📦',
            _id: t.id,
          }));
        setCategories(dynamicCategories);
      }
    } catch (error) {
      console.error('Failed to load product types:', error);
      // Keep default categories as fallback
    }
  };

  // Product CRUD operations
  const addProduct = async (product) => {
    try {
      setLoading(true);
      const response = await productsAPI.create(product);
      const newProduct = {
        ...response,
        id: response._id || response.id,
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
      await productsAPI.update(id, updates);
      const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
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

  // Product Type CRUD operations
  const addProductType = async (typeData) => {
    try {
      setLoading(true);
      const response = await productTypesAPI.create(typeData);
      const newType = {
        ...response.productType,
        id: response.productType._id || response.productType.id,
      };
      setProductTypes([...productTypes, newType]);
      // Refresh categories
      await loadProductTypes();
      return newType;
    } catch (error) {
      console.error('Failed to add product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProductType = async (id, updates) => {
    try {
      setLoading(true);
      await productTypesAPI.update(id, updates);
      const updated = productTypes.map(t => t.id === id ? { ...t, ...updates } : t);
      setProductTypes(updated);
      // Refresh categories
      await loadProductTypes();
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
      const updated = productTypes.filter(t => t.id !== id);
      setProductTypes(updated);
      // Refresh categories
      await loadProductTypes();
    } catch (error) {
      console.error('Failed to delete product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const seedProductTypes = async () => {
    try {
      setLoading(true);
      await productTypesAPI.seed();
      await loadProductTypes();
    } catch (error) {
      console.error('Failed to seed product types:', error);
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
  const addOrder = async (order) => {
    try {
      setLoading(true);
      const response = await ordersAPI.create(order);
      const newOrder = {
        ...response,
        id: response._id || response.id,
      };
      setOrders([...orders, newOrder]);
      return newOrder;
    } catch (error) {
      console.error('Failed to add order:', error);
      throw error;
    } finally {
      setLoading(false);
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
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
    } catch (error) {
      console.error('Failed to delete order:', error);
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
    orders,
    categories,
    productTypes,

    // CRUD operations
    addProduct,
    updateProduct,
    deleteProduct,
    addProductType,
    updateProductType,
    deleteProductType,
    seedProductTypes,
    addBlog,
    updateBlog,
    deleteBlog,
    addOrder,
    updateOrderStatus,
    deleteOrder,

    // Reload
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
