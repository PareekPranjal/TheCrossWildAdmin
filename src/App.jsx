import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Blogs from './pages/Blogs';
import SEO from './pages/SEO';
import Locations from './pages/Locations';
import PageContent from './pages/PageContent';
import Orders from './pages/Orders';
import ProductTypes from './pages/ProductTypes';
import SiteSettings from './pages/SiteSettings';
import Menus from './pages/Menus';
import Testimonials from './pages/Testimonials';
import Brands from './pages/Brands';
import Deals from './pages/Deals';
import Gallery from './pages/Gallery';
import PolicyPages from './pages/PolicyPages';
import HomeContent from './pages/HomeContent';
import ServicesPage from './pages/ServicesPage';
import WhyChooseUsPage from './pages/WhyChooseUsPage';
import Submissions from './pages/Submissions';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authInitialized } = useAdmin();
  if (!authInitialized) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, authInitialized } = useAdmin();
  if (!authInitialized) return null;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const CatchAllRoute = () => {
  const { isAuthenticated, authInitialized } = useAdmin();
  if (!authInitialized) return null;
  return <Navigate to={isAuthenticated ? '/' : '/login'} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="product-types" element={<ProductTypes />} />
        <Route path="categories" element={<Categories />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="orders" element={<Orders />} />
        <Route path="seo" element={<SEO />} />
        <Route path="locations" element={<Locations />} />
        <Route path="page-content" element={<PageContent />} />

        {/* CMS — site-wide */}
        <Route path="site-settings" element={<SiteSettings />} />
        <Route path="menus" element={<Menus />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="brands" element={<Brands />} />
        <Route path="deals" element={<Deals />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="policy-pages" element={<PolicyPages />} />

        {/* CMS — per-page */}
        <Route path="home-content" element={<HomeContent />} />
        <Route path="services-page" element={<ServicesPage />} />
        <Route path="why-choose-us-page" element={<WhyChooseUsPage />} />

        {/* Inbox */}
        <Route path="submissions" element={<Submissions />} />
      </Route>

      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppRoutes />
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
