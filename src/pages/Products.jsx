import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Plus, Edit, Trash2, Search, Eye, ChevronDown, ChevronRight, Package } from 'lucide-react';
import ProductModal from '../components/ProductModal';

// Category / subcategory data (same as ProductModal)
const PRODUCT_CATEGORIES = [
  {
    slug: 'tshirts', name: 'T-Shirts', icon: '👕',
    subcategories: [
      { slug: 'dry-fit', name: 'Dry Fit T-Shirts' },
      { slug: 'cotton', name: 'Cotton T-Shirts' },
      { slug: 'polyester', name: 'Polyester T-Shirts' },
      { slug: 'cotton-polyester', name: 'Cotton + Polyester T-Shirts' },
      { slug: 'sports-jersey', name: 'Sports Jersey' },
      { slug: 'promotional', name: 'Promotional T-Shirts' },
      { slug: 'custom', name: 'Custom T-Shirts' },
      { slug: 'oversized', name: 'Oversized T-Shirts' },
      { slug: 'lycra', name: 'Lycra T-Shirts' },
    ],
  },
  {
    slug: 'bags', name: 'Bags', icon: '👜',
    subcategories: [
      { slug: 'school', name: 'School Bags' },
      { slug: 'laptop', name: 'Laptop Bags' },
      { slug: 'office', name: 'Office Bags' },
      { slug: 'gym', name: 'Gym Bags' },
      { slug: 'corporate', name: 'Corporate Bags' },
      { slug: 'food-delivery', name: 'Food Delivery Bags' },
      { slug: 'cotton', name: 'Cotton Bags' },
      { slug: 'file-folder', name: 'File & Folder Bags' },
    ],
  },
  {
    slug: 'caps', name: 'Caps', icon: '🧢',
    subcategories: [
      { slug: 'cotton', name: 'Cotton Caps' },
      { slug: 'cotton-polyester', name: 'Cotton & Polyester Caps' },
      { slug: 'polyester', name: 'Polyester Caps' },
      { slug: 'promotional-custom', name: 'Promotional & Custom Caps' },
      { slug: 'hats', name: 'Hats' },
      { slug: 'tennis', name: 'Tennis Caps' },
      { slug: 'sports', name: 'Sports Caps' },
      { slug: 'corduroy', name: 'Corduroy Fabric Caps' },
      { slug: 'denim', name: 'Denim Caps' },
      { slug: 'kids', name: 'Kids Caps' },
      { slug: 'imported', name: 'Imported Fabric Caps' },
    ],
  },
  {
    slug: 'sweatshirts', name: 'Sweatshirts & Hoodies', icon: '🧥',
    subcategories: [
      { slug: 'jackets', name: 'Jackets' },
      { slug: 'cotton-jackets', name: 'Cotton Jackets' },
      { slug: 'sweatshirts-hoodies', name: 'Sweatshirts & Hoodies' },
      { slug: 'spun-spun', name: 'Spun-Spun Sweatshirts & Hoodies' },
      { slug: 'polyester', name: 'Polyester Sweatshirts & Hoodies' },
      { slug: 'cotton-polyester', name: 'Cotton & Polyester Sweatshirts & Hoodies' },
    ],
  },
  {
    slug: 'lowers', name: 'Lower & Shorts', icon: '👖',
    subcategories: [
      { slug: 'dot-knit', name: 'Dot Knit Fabric Shorts & Lower' },
      { slug: 'nirmal', name: 'Nirmal Material Fabric Lower & Shorts' },
      { slug: 'raisenet', name: 'Raisenet Lower & Shorts' },
      { slug: 'dry-fit', name: 'Dry Fit Lower & Shorts' },
      { slug: 'cotton', name: 'Cotton Lower & Shorts' },
      { slug: 'ns', name: 'NS Lower & Shorts' },
    ],
  },
  {
    slug: 'uniforms', name: 'School & Office Uniform', icon: '👔',
    subcategories: [
      { slug: 'school', name: 'School Uniform & Dress' },
      { slug: 'office', name: 'Office Employee Uniform & Dress' },
      { slug: 'custom', name: 'Custom Uniforms' },
    ],
  },
  {
    slug: 'printing', name: 'Printing & Embroidery', icon: '🖨️',
    subcategories: [
      { slug: 'screen', name: 'Screen Printing' },
      { slug: 'tf', name: 'TF Printing' },
      { slug: 'digital', name: 'Digital Printing' },
      { slug: 'sublimation', name: 'Sublimation Printing' },
      { slug: 'embroidery', name: 'Embroidery' },
    ],
  },
  { slug: 'apron', name: 'Apron', icon: '🍳', subcategories: [] },
  { slug: 'chef-coat', name: 'Chef Coat', icon: '👨‍🍳', subcategories: [] },
  { slug: 'raincoats', name: 'Raincoats', icon: '🌧️', subcategories: [] },
];

const getCategoryName = (slug) => {
  const cat = PRODUCT_CATEGORIES.find(c => c.slug === slug);
  return cat?.name || slug;
};

const Products = () => {
  const { products, deleteProduct } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);

  // ─── Compute category & subcategory counts ───
  const categoryCounts = {};
  const subcategoryCounts = {}; // { 'tshirts': { 'dry-fit': 3, 'cotton': 5 } }

  products.forEach(p => {
    if (p.productCategories && p.productCategories.length > 0) {
      p.productCategories.forEach(pc => {
        categoryCounts[pc.category] = (categoryCounts[pc.category] || 0) + 1;
        if (!subcategoryCounts[pc.category]) subcategoryCounts[pc.category] = {};
        (pc.subcategories || []).forEach(sub => {
          subcategoryCounts[pc.category][sub] = (subcategoryCounts[pc.category][sub] || 0) + 1;
        });
      });
    } else if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  // ─── Filter products ───
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (product.productCategories && product.productCategories.length > 0) {
        const inCat = product.productCategories.some(pc => pc.category === selectedCategory);
        matchesCategory = inCat;

        if (selectedSubcategory && matchesCategory) {
          matchesCategory = product.productCategories.some(
            pc => pc.category === selectedCategory && pc.subcategories?.includes(selectedSubcategory)
          );
        }
      } else {
        matchesCategory = product.category === selectedCategory;
      }
    }

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const toggleExpandCategory = (slug) => {
    setExpandedCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleCategoryClick = (slug) => {
    if (selectedCategory === slug) {
      setSelectedCategory('all');
      setSelectedSubcategory('');
    } else {
      setSelectedCategory(slug);
      setSelectedSubcategory('');
    }
  };

  const handleSubcategoryClick = (catSlug, subSlug) => {
    setSelectedCategory(catSlug);
    if (selectedSubcategory === subSlug) {
      setSelectedSubcategory('');
    } else {
      setSelectedSubcategory(subSlug);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Total Count */}
      <div className="card bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-orange-700 font-medium">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          </div>
          {selectedCategory !== 'all' && (
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-500">Showing</p>
              <p className="text-xl font-bold text-orange-600">
                {filteredProducts.length} {getCategoryName(selectedCategory)}
                {selectedSubcategory && (
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({PRODUCT_CATEGORIES.find(c => c.slug === selectedCategory)?.subcategories.find(s => s.slug === selectedSubcategory)?.name})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Cards with Counts */}
      <div className="card">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Categories</h3>

        <div className="space-y-2">
          {/* All categories button */}
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedSubcategory(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">📋</span>
            <span className="flex-1 font-medium">All Categories</span>
            <span className={`text-lg font-bold ${selectedCategory === 'all' ? 'text-white' : 'text-gray-800'}`}>
              {products.length}
            </span>
          </button>

          {PRODUCT_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.slug] || 0;
            const isActive = selectedCategory === cat.slug;
            const isExpanded = expandedCategories.includes(cat.slug);
            const hasSubs = cat.subcategories.length > 0;
            const subCounts = subcategoryCounts[cat.slug] || {};

            return (
              <div key={cat.slug}>
                <div className="flex items-center gap-1">
                  {/* Category button */}
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : count > 0
                          ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          : 'bg-gray-50/50 text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="flex-1 font-medium text-sm">{cat.name}</span>
                    <span className={`font-bold text-lg ${isActive ? 'text-white' : count > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                      {count}
                    </span>
                  </button>

                  {/* Expand button for subcategories */}
                  {hasSubs && count > 0 && (
                    <button
                      onClick={() => toggleExpandCategory(cat.slug)}
                      className="p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                  )}
                </div>

                {/* Subcategory counts */}
                {hasSubs && isExpanded && count > 0 && (
                  <div className="ml-10 mt-1 mb-2 space-y-1">
                    {cat.subcategories.map(sub => {
                      const subCount = subCounts[sub.slug] || 0;
                      const isSubActive = selectedCategory === cat.slug && selectedSubcategory === sub.slug;
                      return (
                        <button
                          key={sub.slug}
                          onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                            isSubActive
                              ? 'bg-blue-500 text-white'
                              : subCount > 0
                                ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                : 'text-gray-300'
                          }`}
                        >
                          <span className="flex-1">{sub.name}</span>
                          <span className={`font-semibold ${isSubActive ? 'text-white' : subCount > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                            {subCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Product</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Categories</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Badges</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const pCats = product.productCategories || [];
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Eye className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {pCats.length > 0 ? (
                            pCats.map(pc => (
                              <span
                                key={pc.category}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                              >
                                {getCategoryName(pc.category)}
                                {pc.subcategories?.length > 0 && (
                                  <span className="text-blue-500 ml-1">+{pc.subcategories.length}</span>
                                )}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                              {getCategoryName(product.category)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.bestSeller && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">Best Seller</span>}
                          {product.newArrival && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">New</span>}
                          {product.featured && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">Featured</span>}
                          {product.trending && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">Trending</span>}
                          {product.mostPopular && <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-[10px] font-bold">Popular</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    {searchQuery || selectedCategory !== 'all' ? (
                      'No products found matching your filters'
                    ) : (
                      <div>
                        <p className="mb-4">No products yet. Add your first product!</p>
                        <button onClick={handleAdd} className="btn-primary">
                          <Plus className="w-5 h-5 inline mr-2" />
                          Add Product
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Products;
