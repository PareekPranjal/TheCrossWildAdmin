import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
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
} from 'lucide-react';
import { seoAPI, uploadAPI } from '../services/api';

// Tabs for different sections
const TABS = [
  { id: 'global', label: 'Global Settings', icon: Globe },
  { id: 'pages', label: 'Page SEO', icon: FileText },
  { id: 'social', label: 'Social & Tracking', icon: Share2 },
  { id: 'advanced', label: 'Advanced', icon: Code },
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
      const [globalResponse, pagesResponse, statsResponse] = await Promise.all([
        seoAPI.getGlobalSettings(),
        seoAPI.getAllPages(),
        seoAPI.getStats(),
      ]);

      if (globalResponse.settings) {
        setGlobalSettings(prev => ({ ...prev, ...globalResponse.settings }));
      }
      setPages(pagesResponse.pages || []);
      setStats(statsResponse.stats || null);
    } catch (error) {
      console.error('Failed to load SEO data:', error);
      showMessage('error', 'Failed to load SEO settings');
    } finally {
      setLoading(false);
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
                onClick={() => setActiveTab(tab.id)}
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
            </div>
          )}
        </div>
      </div>

      {/* Page SEO Modal */}
      {showPageModal && (
        <PageSEOModal
          page={editingPage}
          onClose={() => {
            setShowPageModal(false);
            setEditingPage(null);
          }}
          onSave={savePageSEO}
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

export default SEO;
