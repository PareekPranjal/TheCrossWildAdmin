import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  FileText,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Code,
  Share2,
  BarChart3,
  Package,
  Wand2,
  ChevronDown,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { seoAPI, uploadAPI } from '../services/api';

// Tabs for different sections
const TABS = [
  { id: 'global',  label: 'Global Settings', icon: Globe },
  { id: 'pages',   label: 'Page SEO',         icon: FileText },
  { id: 'content', label: 'Content SEO',       icon: Package },
  { id: 'social',  label: 'Social & Tracking', icon: Share2 },
  { id: 'advanced',label: 'Advanced',          icon: Code },
];

// Predefined pages for quick setup
const PREDEFINED_PAGES = [
  { path: '/', name: 'Home Page' },
  { path: '/products', name: 'Products Page' },
  { path: '/blog', name: 'Blog Page' },
  { path: '/about', name: 'About Page' },
  { path: '/contact', name: 'Contact Page' },
];

const SEO = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState({
    siteName: '',
    siteUrl: '',
    defaultTitle: '',
    titleTemplate: '',
    defaultDescription: '',
    defaultKeywords: [],
    defaultOgImage: '',
    favicon: '',
    appleTouchIcon: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      whatsapp: '',
    },
    contactInfo: {
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
    organizationSchema: {
      type: 'Organization',
      name: '',
      logo: '',
      description: '',
    },
    googleSiteVerification: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    customHeadScripts: '',
    robotsTxt: '',
  });

  // Page SEO State
  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [showPageModal, setShowPageModal] = useState(false);

  // Content SEO state
  const [contentItems, setContentItems] = useState({ products: [], blogs: [], categories: [] });
  const [contentSubTab, setContentSubTab] = useState('products');
  const [editingContent, setEditingContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Schemas (LocalBusiness + FAQ) — loaded into globalSettings, saved with it
  const [faqItems, setFaqItems] = useState([]);
  const [localBusiness, setLocalBusiness] = useState({
    telephone: '', email: '', priceRange: '',
    address: { street: '', city: '', state: '', postalCode: '', country: 'India' },
    openingHours: 'Mo-Sa 09:00-19:30',
  });

  // Stats
  const [stats, setStats] = useState(null);

  // Image upload refs
  const ogImageRef = useRef(null);
  const faviconRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [globalResponse, pagesResponse, statsResponse, schemasResponse] = await Promise.all([
        seoAPI.getGlobalSettings(),
        seoAPI.getAllPages(),
        seoAPI.getStats(),
        seoAPI.getSchemas(),
      ]);

      if (globalResponse.settings) {
        setGlobalSettings(prev => ({ ...prev, ...globalResponse.settings }));
      }
      setPages(pagesResponse.pages || []);
      setStats(statsResponse.stats || null);
      if (schemasResponse.localBusiness) setLocalBusiness(prev => ({ ...prev, ...schemasResponse.localBusiness }));
      if (schemasResponse.faqItems?.length) setFaqItems(schemasResponse.faqItems);
    } catch (error) {
      console.error('Failed to load SEO data:', error);
      showMessage('error', 'Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const loadContentItems = async () => {
    try {
      setContentLoading(true);
      const res = await seoAPI.getContentItems();
      setContentItems({
        products:   res.products   || [],
        blogs:      res.blogs      || [],
        categories: res.categories || [],
      });
    } catch (error) {
      showMessage('error', 'Failed to load content items');
    } finally {
      setContentLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!confirm('Auto-generate SEO for all products, blogs, and categories that are missing SEO data?')) return;
    try {
      setBulkGenerating(true);
      const res = await seoAPI.bulkGenerate();
      showMessage('success', res.message || 'SEO auto-generated successfully');
      await loadContentItems();
      await loadData(); // refresh stats
    } catch (error) {
      showMessage('error', 'Failed to auto-generate SEO');
    } finally {
      setBulkGenerating(false);
    }
  };

  const saveContentSEO = async (item, seoData) => {
    try {
      setSaving(true);
      if (item.type === 'product')  await seoAPI.updateProductSEO(item._id, seoData);
      if (item.type === 'blog')     await seoAPI.updateBlogSEO(item._id, seoData);
      if (item.type === 'category') await seoAPI.updateCategorySEO(item._id, seoData);
      await loadContentItems();
      await loadData();
      setEditingContent(null);
      showMessage('success', `${item.name} SEO saved`);
    } catch (error) {
      showMessage('error', 'Failed to save SEO');
    } finally {
      setSaving(false);
    }
  };

  const saveSchemas = async () => {
    try {
      setSaving(true);
      await seoAPI.updateSchemas({ localBusiness, faqItems });
      showMessage('success', 'Schemas saved successfully');
    } catch (error) {
      showMessage('error', 'Failed to save schemas');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Upload image via backend (Cloudinary)
  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const result = await uploadAPI.uploadImage(file);
      const url = result.imageUrl;

      if (field === 'ogImage') {
        setGlobalSettings(prev => ({ ...prev, defaultOgImage: url }));
      } else if (field === 'favicon') {
        setGlobalSettings(prev => ({ ...prev, favicon: url }));
      } else if (field === 'logo') {
        setGlobalSettings(prev => ({
          ...prev,
          organizationSchema: { ...prev.organizationSchema, logo: url },
        }));
      }
      showMessage('success', 'Image uploaded successfully');
    } catch (error) {
      showMessage('error', 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const saveGlobalSettings = async () => {
    try {
      setSaving(true);
      await seoAPI.updateGlobalSettings(globalSettings);
      showMessage('success', 'Global SEO settings saved successfully');
    } catch (error) {
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const savePageSEO = async (pageData) => {
    try {
      setSaving(true);
      await seoAPI.savePageSEO(pageData);
      await loadData();
      setShowPageModal(false);
      setEditingPage(null);
      showMessage('success', 'Page SEO saved successfully');
    } catch (error) {
      showMessage('error', 'Failed to save page SEO');
    } finally {
      setSaving(false);
    }
  };

  const deletePageSEO = async (id) => {
    if (!confirm('Are you sure you want to delete this page SEO?')) return;

    try {
      await seoAPI.deletePageSEO(id);
      await loadData();
      showMessage('success', 'Page SEO deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete page SEO');
    }
  };

  const handleKeywordsChange = (value, setter, field = 'defaultKeywords') => {
    const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
    if (setter === 'global') {
      setGlobalSettings(prev => ({ ...prev, [field]: keywords }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">SEO Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your website's search engine optimization settings
          </p>
        </div>
        <button
          onClick={saveGlobalSettings}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.pages?.total || 0}</p>
                <p className="text-sm text-gray-500">Pages with SEO</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.products?.withSEO || 0}/{stats.products?.total || 0}
                </p>
                <p className="text-sm text-gray-500">Products SEO</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.blogs?.withSEO || 0}/{stats.blogs?.total || 0}
                </p>
                <p className="text-sm text-gray-500">Blogs SEO</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {[stats.tracking?.googleAnalytics, stats.tracking?.googleTagManager, stats.tracking?.facebookPixel].filter(Boolean).length}/3
                </p>
                <p className="text-sm text-gray-500">Tracking Setup</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'content' && !contentItems.products.length) loadContentItems();
                }}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Global Settings Tab */}
          {activeTab === 'global' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Basic SEO Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={globalSettings.siteName}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="input-field"
                    placeholder="The CrossWild"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site URL
                  </label>
                  <input
                    type="url"
                    value={globalSettings.siteUrl}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                    className="input-field"
                    placeholder="https://thecrosswild.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Title <span className="text-gray-400">(max 70 characters)</span>
                  </label>
                  <input
                    type="text"
                    value={globalSettings.defaultTitle}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, defaultTitle: e.target.value }))}
                    className="input-field"
                    maxLength={70}
                    placeholder="The CrossWild - Custom Printing & Promotional Merchandise"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {globalSettings.defaultTitle?.length || 0}/70 characters
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title Template
                  </label>
                  <input
                    type="text"
                    value={globalSettings.titleTemplate}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, titleTemplate: e.target.value }))}
                    className="input-field"
                    placeholder="%s | The CrossWild"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use %s as placeholder for page-specific title
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Meta Description <span className="text-gray-400">(max 160 characters)</span>
                  </label>
                  <textarea
                    value={globalSettings.defaultDescription}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, defaultDescription: e.target.value }))}
                    className="input-field"
                    rows={3}
                    maxLength={160}
                    placeholder="Premium custom printing services..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {globalSettings.defaultDescription?.length || 0}/160 characters
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Keywords <span className="text-gray-400">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={globalSettings.defaultKeywords?.join(', ') || ''}
                    onChange={(e) => handleKeywordsChange(e.target.value, 'global')}
                    className="input-field"
                    placeholder="custom printing, t-shirts, promotional merchandise"
                  />
                </div>
              </div>

              {/* OG Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Open Graph Image
                </label>
                <input
                  ref={ogImageRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'ogImage')}
                  className="hidden"
                />
                <div className="flex items-start gap-4">
                  {globalSettings.defaultOgImage ? (
                    <div className="relative group">
                      <img
                        src={globalSettings.defaultOgImage}
                        alt="OG Image"
                        className="w-48 h-28 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => ogImageRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white"
                      >
                        <Upload className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => ogImageRef.current?.click()}
                      className="w-48 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-1">Upload Image</span>
                    </button>
                  )}
                  <div className="text-sm text-gray-500">
                    <p>Recommended size: 1200 x 630 pixels</p>
                    <p>This image appears when your site is shared on social media</p>
                  </div>
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                <input
                  ref={faviconRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'favicon')}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  {globalSettings.favicon ? (
                    <div className="relative group">
                      <img
                        src={globalSettings.favicon}
                        alt="Favicon"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => faviconRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => faviconRef.current?.click()}
                      className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary"
                    >
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                  <span className="text-sm text-gray-500">Recommended: 32x32 or 64x64 pixels</span>
                </div>
              </div>
            </div>
          )}

          {/* Page SEO Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Page-Specific SEO</h2>
                <button
                  onClick={() => {
                    setEditingPage(null);
                    setShowPageModal(true);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Page SEO
                </button>
              </div>

              {/* Quick Add Predefined Pages */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3">Quick Add Common Pages</h3>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_PAGES.filter(
                    (p) => !pages.find((page) => page.pagePath === p.path)
                  ).map((page) => (
                    <button
                      key={page.path}
                      onClick={() => {
                        setEditingPage({ pagePath: page.path, title: '', description: '' });
                        setShowPageModal(true);
                      }}
                      className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      + {page.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages List */}
              <div className="space-y-3">
                {pages.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No page-specific SEO settings yet</p>
                    <p className="text-sm text-gray-400">Click "Add Page SEO" to get started</p>
                  </div>
                ) : (
                  pages.map((page) => (
                    <div
                      key={page._id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{page.pagePath}</span>
                          {page.noIndex && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                              noindex
                            </span>
                          )}
                        </div>
                        {page.title && (
                          <p className="text-sm text-gray-600 mt-1">{page.title}</p>
                        )}
                        {page.description && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                            {page.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPage(page);
                            setShowPageModal(true);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deletePageSEO(page._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Content SEO Tab ──────────────────────────────────── */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-gray-800">Content SEO</h2>
                <button
                  onClick={handleBulkGenerate}
                  disabled={bulkGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                >
                  {bulkGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Auto-Generate Missing SEO
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Edit the SEO title, description, and keywords for every product, blog post, and category on your site.
              </p>

              {/* Sub-tabs */}
              <div className="flex border-b border-gray-200">
                {['products', 'blogs', 'categories'].map((tab) => {
                  const items = contentItems[tab] || [];
                  const covered = items.filter((i) => i.hasSEO).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setContentSubTab(tab)}
                      className={`px-5 py-2.5 font-medium capitalize transition-colors flex items-center gap-2 ${
                        contentSubTab === tab
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        covered === items.length && items.length > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {covered}/{items.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Coverage bar */}
              {(() => {
                const items = contentItems[contentSubTab] || [];
                const covered = items.filter((i) => i.hasSEO).length;
                const pct = items.length ? Math.round((covered / items.length) * 100) : 0;
                return (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">SEO Coverage</span>
                      <span className={`text-sm font-bold ${pct === 100 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {covered}/{items.length} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Item list */}
              <div className="space-y-2">
                {contentLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (contentItems[contentSubTab] || []).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                    No {contentSubTab} found
                  </div>
                ) : (
                  (contentItems[contentSubTab] || []).map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                        {item.hasSEO ? (
                          <p className="text-sm text-gray-500 truncate mt-0.5">{item.seo?.title}</p>
                        ) : (
                          <p className="text-sm text-red-500 mt-0.5">No SEO metadata — click Edit to add</p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        item.hasSEO ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.hasSEO ? '✓ Optimized' : '✗ Missing'}
                      </span>
                      <button
                        onClick={() => setEditingContent({ ...item, type: contentSubTab.slice(0, -1) })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 text-sm font-medium text-gray-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit SEO
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Social & Tracking Tab */}
          {activeTab === 'social' && (
            <div className="space-y-8">
              {/* Social Links */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Media Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(globalSettings.socialLinks || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {key}
                      </label>
                      <input
                        type="url"
                        value={value || ''}
                        onChange={(e) =>
                          setGlobalSettings((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, [key]: e.target.value },
                          }))
                        }
                        className="input-field"
                        placeholder={`https://${key}.com/...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Codes */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics & Tracking</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Site Verification
                    </label>
                    <input
                      type="text"
                      value={globalSettings.googleSiteVerification || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          googleSiteVerification: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="verification code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={globalSettings.googleAnalyticsId || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          googleAnalyticsId: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Tag Manager ID
                    </label>
                    <input
                      type="text"
                      value={globalSettings.googleTagManagerId || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          googleTagManagerId: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={globalSettings.facebookPixelId || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          facebookPixelId: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="XXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info for Schema */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information (for Schema)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={globalSettings.contactInfo?.phone || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value },
                        }))
                      }
                      className="input-field"
                      placeholder="+91-9529626262"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={globalSettings.contactInfo?.email || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value },
                        }))
                      }
                      className="input-field"
                      placeholder="orders@thecrosswild.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={globalSettings.contactInfo?.address?.street || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo?.address, street: e.target.value },
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={globalSettings.contactInfo?.address?.city || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo?.address, city: e.target.value },
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={globalSettings.contactInfo?.address?.state || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo?.address, state: e.target.value },
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={globalSettings.contactInfo?.address?.postalCode || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo?.address, postalCode: e.target.value },
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={globalSettings.contactInfo?.address?.country || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo?.address, country: e.target.value },
                          },
                        }))
                      }
                      className="input-field"
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-8">
              {/* Organization Schema */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Organization Schema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={globalSettings.organizationSchema?.name || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          organizationSchema: { ...prev.organizationSchema, name: e.target.value },
                        }))
                      }
                      className="input-field"
                      placeholder="The CrossWild"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={globalSettings.organizationSchema?.logo || ''}
                        onChange={(e) =>
                          setGlobalSettings((prev) => ({
                            ...prev,
                            organizationSchema: { ...prev.organizationSchema, logo: e.target.value },
                          }))
                        }
                        className="input-field flex-1"
                        placeholder="https://..."
                      />
                      <input
                        ref={logoRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Description
                    </label>
                    <textarea
                      value={globalSettings.organizationSchema?.description || ''}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          organizationSchema: { ...prev.organizationSchema, description: e.target.value },
                        }))
                      }
                      className="input-field"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Head Scripts */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom Head Scripts</h2>
                <textarea
                  value={globalSettings.customHeadScripts || ''}
                  onChange={(e) =>
                    setGlobalSettings((prev) => ({ ...prev, customHeadScripts: e.target.value }))
                  }
                  className="input-field font-mono text-sm"
                  rows={6}
                  placeholder="<!-- Add custom scripts here -->"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add custom scripts like schema markup, chatbots, etc.
                </p>
              </div>

              {/* Robots.txt */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Robots.txt Content</h2>
                <textarea
                  value={globalSettings.robotsTxt || ''}
                  onChange={(e) =>
                    setGlobalSettings((prev) => ({ ...prev, robotsTxt: e.target.value }))
                  }
                  className="input-field font-mono text-sm"
                  rows={8}
                  placeholder="User-agent: *&#10;Allow: /&#10;&#10;Sitemap: https://thecrosswild.com/sitemap.xml"
                />
              </div>

              {/* Sitemap Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">Sitemap</h3>
                <p className="text-sm text-green-700 mb-3">
                  Your sitemap is automatically generated at:
                </p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-1.5 rounded text-sm">
                    {globalSettings.siteUrl}/api/seo/sitemap.xml
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${globalSettings.siteUrl}/api/seo/sitemap.xml`);
                      showMessage('success', 'URL copied!');
                    }}
                    className="p-1.5 hover:bg-green-200 rounded"
                  >
                    <Copy className="w-4 h-4 text-green-700" />
                  </button>
                  <a
                    href={`${globalSettings.siteUrl?.replace('https://thecrosswild.com', 'http://localhost:5001')}/api/seo/sitemap.xml`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-green-200 rounded"
                  >
                    <ExternalLink className="w-4 h-4 text-green-700" />
                  </a>
                </div>
              </div>

              {/* LocalBusiness Schema */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    LocalBusiness Schema
                  </h2>
                  <button
                    onClick={saveSchemas}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Schemas
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
                    <input type="tel" value={localBusiness.telephone || ''} className="input-field"
                      placeholder="+91-9529626262"
                      onChange={(e) => setLocalBusiness(p => ({ ...p, telephone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range</label>
                    <input type="text" value={localBusiness.priceRange || ''} className="input-field"
                      placeholder="₹70–₹300"
                      onChange={(e) => setLocalBusiness(p => ({ ...p, priceRange: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Opening Hours</label>
                    <input type="text" value={localBusiness.openingHours || ''} className="input-field"
                      placeholder="Mo-Sa 09:00-19:30"
                      onChange={(e) => setLocalBusiness(p => ({ ...p, openingHours: e.target.value }))} />
                    <p className="text-xs text-gray-500 mt-1">Schema.org format, e.g. Mo-Sa 09:00-19:30</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                    <input type="text" value={localBusiness.address?.street || ''} className="input-field"
                      onChange={(e) => setLocalBusiness(p => ({ ...p, address: { ...p.address, street: e.target.value } }))} />
                  </div>
                  {['city','state','postalCode','country'].map((f) => (
                    <div key={f}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{f}</label>
                      <input type="text" value={localBusiness.address?.[f] || ''} className="input-field"
                        onChange={(e) => setLocalBusiness(p => ({ ...p, address: { ...p.address, [f]: e.target.value } }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-purple-500" />
                    FAQ Schema Items
                  </h2>
                  <button
                    onClick={() => setFaqItems(p => [...p, { question: '', answer: '' }])}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                  </button>
                </div>
                <div className="space-y-4">
                  {faqItems.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-lg">No FAQ items yet. Add your first FAQ above.</p>
                  )}
                  {faqItems.map((faq, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">FAQ #{idx + 1}</span>
                        <button onClick={() => setFaqItems(p => p.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                        <input type="text" value={faq.question} className="input-field"
                          placeholder="What is the minimum order quantity?"
                          onChange={(e) => setFaqItems(p => p.map((f, i) => i === idx ? { ...f, question: e.target.value } : f))} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                        <textarea value={faq.answer} className="input-field" rows={2}
                          placeholder="Our minimum order quantity is..."
                          onChange={(e) => setFaqItems(p => p.map((f, i) => i === idx ? { ...f, answer: e.target.value } : f))} />
                      </div>
                    </div>
                  ))}
                  {faqItems.length > 0 && (
                    <button onClick={saveSchemas} disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 text-sm mt-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save FAQ Items
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page SEO Modal */}
      {showPageModal && (
        <PageSEOModal
          page={editingPage}
          onClose={() => { setShowPageModal(false); setEditingPage(null); }}
          onSave={savePageSEO}
          saving={saving}
        />
      )}

      {/* Content SEO Modal */}
      {editingContent && (
        <ContentSEOModal
          item={editingContent}
          onClose={() => setEditingContent(null)}
          onSave={saveContentSEO}
          saving={saving}
        />
      )}
    </div>
  );
};

// Page SEO Modal Component
const PageSEOModal = ({ page, onClose, onSave, saving }) => {
  const [formData, setFormData] = useState({
    pagePath: page?.pagePath || '',
    title: page?.title || '',
    description: page?.description || '',
    keywords: page?.keywords || [],
    ogTitle: page?.ogTitle || '',
    ogDescription: page?.ogDescription || '',
    ogImage: page?.ogImage || '',
    canonicalUrl: page?.canonicalUrl || '',
    noIndex: page?.noIndex || false,
    noFollow: page?.noFollow || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pagePath) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {page?._id ? 'Edit Page SEO' : 'Add Page SEO'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Path *
            </label>
            <input
              type="text"
              value={formData.pagePath}
              onChange={(e) => setFormData((prev) => ({ ...prev, pagePath: e.target.value }))}
              className="input-field"
              placeholder="/products"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Start with / (e.g., /products, /about)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title <span className="text-gray-400">(max 70 chars)</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="input-field"
              maxLength={70}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/70 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description <span className="text-gray-400">(max 160 chars)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="input-field"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/160 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              type="text"
              value={formData.keywords.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OG Image URL</label>
            <input
              type="url"
              value={formData.ogImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, ogImage: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
            <input
              type="url"
              value={formData.canonicalUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
              className="input-field"
              placeholder="https://thecrosswild.com/products"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.noIndex}
                onChange={(e) => setFormData((prev) => ({ ...prev, noIndex: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">No Index</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.noFollow}
                onChange={(e) => setFormData((prev) => ({ ...prev, noFollow: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">No Follow</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Content SEO Modal ─────────────────────────────────────────────────────────
const ContentSEOModal = ({ item, onClose, onSave, saving }) => {
  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
  const [form, setForm] = useState({
    title:        item.seo?.title        || '',
    description:  item.seo?.description  || '',
    keywords:     item.seo?.keywords     || [],
    ogImage:      item.seo?.ogImage      || '',
    canonicalUrl: item.seo?.canonicalUrl || '',
    noIndex:      item.seo?.noIndex      || false,
    noFollow:     item.seo?.noFollow     || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item, form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit SEO — {typeLabel}</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{item.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              SEO Title <span className="text-gray-400">(max 70 chars)</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              className="input-field"
              maxLength={70}
              placeholder={`${item.name} | The CrossWild`}
            />
            <div className="flex items-center justify-between mt-1">
              <p className={`text-xs ${form.title.length > 60 ? 'text-yellow-600' : 'text-gray-400'}`}>
                {form.title.length}/70 — {form.title.length <= 60 ? 'Good' : form.title.length <= 70 ? 'Slightly long' : 'Too long'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Meta Description <span className="text-gray-400">(max 160 chars)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              className="input-field"
              rows={3}
              maxLength={160}
              placeholder="Describe this page in 120–160 characters…"
            />
            <p className={`text-xs mt-1 ${form.description.length > 155 ? 'text-yellow-600' : form.description.length >= 120 ? 'text-green-600' : 'text-gray-400'}`}>
              {form.description.length}/160
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Keywords <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              type="text"
              value={form.keywords.join(', ')}
              onChange={(e) => setForm(p => ({ ...p, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
              className="input-field"
              placeholder="custom t-shirts, manufacturer, Jaipur"
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">OG Image URL</label>
            <input
              type="url"
              value={form.ogImage}
              onChange={(e) => setForm(p => ({ ...p, ogImage: e.target.value }))}
              className="input-field"
              placeholder="https://…"
            />
          </div>

          {/* Canonical */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Canonical URL</label>
            <input
              type="url"
              value={form.canonicalUrl}
              onChange={(e) => setForm(p => ({ ...p, canonicalUrl: e.target.value }))}
              className="input-field"
              placeholder="https://thecrosswild.com/products/..."
            />
          </div>

          {/* Robots */}
          <div className="flex gap-6">
            {[['noIndex','No Index (hide from Google)'],['noFollow','No Follow']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key]}
                  onChange={(e) => setForm(p => ({ ...p, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 accent-primary" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-60 font-medium">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save SEO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SEO;
