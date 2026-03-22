import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Link } from 'react-router-dom';
import {
  Package,
  FileText,
  TrendingUp,
  Eye,
} from 'lucide-react';

// Same category data as ProductModal for consistent naming
const CATEGORY_NAMES = {
  tshirts: 'T-Shirts',
  bags: 'Bags',
  caps: 'Caps',
  sweatshirts: 'Sweatshirts & Hoodies',
  lowers: 'Lower & Shorts',
  uniforms: 'School & Office Uniform',
  printing: 'Printing & Embroidery',
  apron: 'Apron',
  'chef-coat': 'Chef Coat',
  raincoats: 'Raincoats',
};

const CATEGORY_ICONS = {
  tshirts: '👕',
  bags: '👜',
  caps: '🧢',
  sweatshirts: '🧥',
  lowers: '👖',
  uniforms: '👔',
  printing: '🖨️',
  apron: '🍳',
  'chef-coat': '👨‍🍳',
  raincoats: '🌧️',
};

const Dashboard = () => {
  const { products, blogs } = useAdmin();

  const totalProducts = products.length;
  const totalBlogs = blogs.length;

  // Count products by category
  const categoryCounts = {};
  products.forEach(p => {
    // Count from productCategories array
    if (p.productCategories && p.productCategories.length > 0) {
      p.productCategories.forEach(pc => {
        categoryCounts[pc.category] = (categoryCounts[pc.category] || 0) + 1;
      });
    } else if (p.category) {
      // Fallback to legacy category field
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  // Sort categories by count descending
  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/products" className="stat-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-gray-800">{totalProducts}</h3>
              <p className="text-sm text-gray-500 mt-2">
                Across {sortedCategories.length} categories
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>
        </Link>

        <Link to="/blogs" className="stat-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Blog Posts</p>
              <h3 className="text-3xl font-bold text-gray-800">{totalBlogs}</h3>
              <p className="text-sm text-gray-500 mt-2">
                Published articles
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Products by Category */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">Products by Category</h3>
          <Link to="/products" className="text-primary hover:underline text-sm font-medium">
            View All
          </Link>
        </div>

        {sortedCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedCategories.map(([slug, count]) => (
              <div
                key={slug}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">{CATEGORY_ICONS[slug] || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {CATEGORY_NAMES[slug] || slug}
                  </p>
                </div>
                <span className="text-xl font-bold text-primary">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No products yet. Add your first product!</p>
        )}
      </div>

      {/* Recent Products */}
      {products.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800">Recently Added Products</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map(product => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{CATEGORY_NAMES[product.category] || product.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
