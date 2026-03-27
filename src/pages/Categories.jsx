import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Globe, Link2, X, Loader2, ChevronDown, ChevronRight, FolderOpen, FolderPlus, Layers } from 'lucide-react';
import { categoriesAPI, uploadAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';

const Categories = () => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [parentForNew, setParentForNew] = useState(null); // when adding subcategory
  const [expandedIds, setExpandedIds] = useState(new Set());

  const fetchTree = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getTree();
      setTree(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTree(); }, []);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(tree.map(c => c._id || c.id));
    setExpandedIds(allIds);
  };

  const collapseAll = () => setExpandedIds(new Set());

  const handleDelete = async (cat) => {
    const subCount = cat.subcategories?.length || 0;
    const msg = subCount > 0
      ? `Delete category "${cat.name}" and its ${subCount} subcategories?`
      : `Delete category "${cat.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await categoriesAPI.delete(cat.id || cat._id);
      fetchTree();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const handleDeleteSub = async (sub) => {
    if (!window.confirm(`Delete subcategory "${sub.name}"?`)) return;
    try {
      await categoriesAPI.delete(sub.id || sub._id);
      fetchTree();
    } catch (error) {
      alert('Failed to delete subcategory');
    }
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setParentForNew(null);
    setShowModal(true);
  };

  const openAddSubcategory = (parent) => {
    setEditingCategory(null);
    setParentForNew(parent);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setParentForNew(null);
    setShowModal(true);
  };

  const totalCategories = tree.length;
  const totalSubcategories = tree.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product categories with full SEO control
            <span className="mx-2">|</span>
            <span className="font-medium text-gray-700">{totalCategories}</span> categories,{' '}
            <span className="font-medium text-gray-700">{totalSubcategories}</span> subcategories
          </p>
        </div>
        <button
          onClick={openAddCategory}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Expand / Collapse controls */}
      {tree.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={expandAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={collapseAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Collapse All
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tree.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No categories yet</p>
          <p className="text-sm">Click "Add Category" to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tree.map((cat) => {
            const catId = cat._id || cat.id;
            const isExpanded = expandedIds.has(catId);
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;

            return (
              <div key={catId} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* ── Parent Category Row ── */}
                <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(catId)}
                    className={`p-1.5 rounded-lg transition-colors ${hasSubs ? 'hover:bg-blue-100 text-blue-600' : 'text-gray-300 cursor-default'}`}
                    disabled={!hasSubs}
                  >
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>

                  {/* Icon */}
                  {cat.icon ? (
                    <span className="text-2xl">{cat.icon}</span>
                  ) : (
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                  )}

                  {/* Image */}
                  {cat.image && (
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border" />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 text-base">{cat.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {hasSubs && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">
                          {cat.subcategories.length} sub
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400 font-mono">ID: {cat.id}</span>
                      {cat.seoUrl && (
                        <span className="text-xs text-green-600 font-mono">/{cat.seoUrl}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openAddSubcategory(cat)}
                      className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                      title="Add Subcategory"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── Subcategories ── */}
                {isExpanded && hasSubs && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {cat.subcategories.map((sub, idx) => {
                      const subId = sub._id || sub.id;
                      return (
                        <div
                          key={subId}
                          className={`flex items-center gap-3 px-4 py-3 pl-16 hover:bg-blue-50/40 transition-colors ${idx < cat.subcategories.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          {/* Connector line visual */}
                          <div className="w-5 h-5 flex items-center justify-center text-gray-300">
                            <Layers className="w-4 h-4" />
                          </div>

                          {/* Sub icon/image */}
                          {sub.image ? (
                            <img src={sub.image} alt={sub.name} className="w-8 h-8 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                              <span className="text-orange-400 text-xs font-bold">{sub.name?.charAt(0)}</span>
                            </div>
                          )}

                          {/* Sub info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700 text-sm">{sub.name}</span>
                              <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${sub.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {sub.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-gray-400 font-mono">ID: {sub.id}</span>
                              {sub.seoUrl && (
                                <span className="text-xs text-green-500 font-mono">/{sub.seoUrl}</span>
                              )}
                            </div>
                          </div>

                          {/* Sub actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(sub)}
                              className="p-1.5 hover:bg-blue-100 text-blue-500 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sub)}
                              className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {/* Add subcategory row */}
                    <button
                      onClick={() => openAddSubcategory(cat)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 pl-16 text-sm text-green-600 hover:bg-green-50/50 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Subcategory to {cat.name}
                    </button>
                  </div>
                )}

                {/* Show "expand to see subs" hint when collapsed and has subs */}
                {!isExpanded && hasSubs && (
                  <button
                    onClick={() => toggleExpand(catId)}
                    className="w-full px-4 py-2 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50/30 transition-colors text-left pl-14"
                  >
                    {cat.subcategories.length} subcategories — click to expand
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editingCategory}
          parentCategory={parentForNew}
          allParentCategories={tree}
          onClose={() => { setShowModal(false); setEditingCategory(null); setParentForNew(null); }}
          onSaved={() => { setShowModal(false); setEditingCategory(null); setParentForNew(null); fetchTree(); }}
        />
      )}
    </div>
  );
};

// ═══════════════ CATEGORY MODAL ═══════════════
const CategoryModal = ({ category, parentCategory, allParentCategories, onClose, onSaved }) => {
  const isSubcategory = !!parentCategory || !!category?.parentCategory;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '',
    parentCategory: parentCategory?._id || '',
    description: '',
    richDescription: '',
    description1: '',
    image: '',
    seoUrl: '',
    seo: {
      title: '',
      description: '',
      keywords: [],
      canonicalUrl: '',
      ogImage: '',
      otherMetaTags: '',
      noIndex: false,
      noFollow: false,
    },
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id || '',
        name: category.name || '',
        icon: category.icon || '',
        parentCategory: category.parentCategory?._id || category.parentCategory || '',
        description: category.description || '',
        richDescription: category.richDescription || '',
        description1: category.description1 || '',
        image: category.image || '',
        seoUrl: category.seoUrl || '',
        seo: {
          title: category.seo?.title || '',
          description: category.seo?.description || '',
          keywords: category.seo?.keywords || [],
          canonicalUrl: category.seo?.canonicalUrl || '',
          ogImage: category.seo?.ogImage || '',
          otherMetaTags: category.seo?.otherMetaTags || '',
          noIndex: category.seo?.noIndex || false,
          noFollow: category.seo?.noFollow || false,
        },
        isActive: category.isActive !== false,
      });
    }
  }, [category]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUploading(true);
    try {
      const result = await uploadAPI.uploadImage(file, 'categories');
      setFormData(prev => ({ ...prev, image: result.imageUrl }));
    } catch (error) {
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  const validate = () => {
    const errs = {};
    if (!formData.id.trim()) errs.id = 'Category ID is required';
    if (!formData.name.trim()) errs.name = 'Name is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const submitData = { ...formData };
      // Set parentCategory to null if empty (top-level)
      if (!submitData.parentCategory) submitData.parentCategory = null;

      if (category) {
        await categoriesAPI.update(category.id || category._id, submitData);
      } else {
        await categoriesAPI.create(submitData);
      }
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
    setSaving(false);
  };

  const parentName = parentCategory?.name || allParentCategories?.find(p => (p._id || p.id) === formData.parentCategory)?.name || '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {category ? 'Edit' : 'Add'} {isSubcategory ? 'Subcategory' : 'Category'}
            </h2>
            {isSubcategory && parentName && (
              <p className="text-sm text-blue-600 mt-0.5">
                Under: <span className="font-semibold">{parentName}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {isSubcategory ? 'Subcategory' : 'Category'} ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                className={`input-field ${errors.id ? 'border-red-500' : ''}`}
                placeholder={isSubcategory ? 'e.g., dry-fit, cotton' : 'e.g., bags, tshirts'}
                disabled={!!category}
              />
              {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder={isSubcategory ? 'e.g., Dry Fit T-Shirts' : 'e.g., T-Shirts'}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Parent category selector (for editing, shows which parent this belongs to) */}
          {!parentCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Parent Category <span className="text-xs text-gray-400 font-normal">(leave empty for top-level)</span>
              </label>
              <select
                value={formData.parentCategory || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, parentCategory: e.target.value }))}
                className="input-field"
                disabled={!!category && !category.parentCategory}
              >
                <option value="">— None (Top-level Category) —</option>
                {allParentCategories?.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Icon (only for top-level categories) */}
          {!isSubcategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Icon <span className="text-xs text-gray-400 font-normal">(emoji)</span>
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="input-field w-24"
                placeholder="e.g., 👕"
              />
            </div>
          )}

          {/* Description (Rich Text Editor) */}
          <div>
            <RichTextEditor
              label="Description"
              value={formData.description}
              onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
              placeholder="Main category description (supports headings, bold, lists, etc.)"
              minHeight="200px"
              note="NOTE: Don't copy content directly from word file or any website. Please copy in notepad and then paste."
            />
          </div>

          {/* Description 1 (Rich Text Editor) - only for top-level */}
          {!isSubcategory && (
            <div>
              <RichTextEditor
                label="Description 1"
                value={formData.description1}
                onChange={(val) => setFormData(prev => ({ ...prev, description1: val }))}
                placeholder="Secondary description block (optional)"
                minHeight="150px"
                note="NOTE: Don't copy content directly from word file or any website. Please copy in notepad and then paste."
              />
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Image (Size: 728px X 455px)
            </label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
                Choose File
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
              {formData.image ? (
                <div className="flex items-center gap-2">
                  <img src={formData.image} alt="Category" className="w-16 h-10 object-cover rounded border" />
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-500">No file chosen</span>
              )}
            </div>
          </div>

          {/* SEO Section */}
          <div className="space-y-4 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              SEO Settings
            </h3>

            {/* SEO URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-green-600" />
                  SEO URL <span className="text-red-500">*</span>
                </label>
                {formData.seoUrl && (
                  <span className="text-xs text-green-600 font-mono">/{formData.seoUrl}</span>
                )}
              </div>
              <input
                type="text"
                value={formData.seoUrl}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-');
                  setFormData(prev => ({ ...prev, seoUrl: val }));
                }}
                className="input-field"
                placeholder="e.g., school-laptop-bag-manufacturer-in-Jaipur"
              />
              <p className="text-xs text-red-500 mt-1 font-medium">*Please do not use space and special digits except hyphen (-). Use unique SEO URL always.</p>
            </div>

            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Meta Title <span className="text-red-500">*</span></label>
                <span className={`text-xs ${(formData.seo.title?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.seo.title?.length || 0}/120
                </span>
              </div>
              <input
                type="text"
                value={formData.seo.title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                maxLength={120}
                className="input-field"
                placeholder="e.g., Best Food Delivery, School, Office Bags Manufacturer in Jaipur - The CrossWild"
              />
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                value={formData.seo.keywords?.join(', ') || ''}
                onChange={(e) => {
                  const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                  setFormData(prev => ({ ...prev, seo: { ...prev.seo, keywords } }));
                }}
                className="input-field"
                placeholder="bag manufacturer in Jaipur, food delivery bags, bags supplier in jaipur"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Meta Description</label>
                <span className={`text-xs ${(formData.seo.description?.length || 0) > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.seo.description?.length || 0}/300
                </span>
              </div>
              <textarea
                value={formData.seo.description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                maxLength={300}
                rows={3}
                className="input-field"
                placeholder="The Crosswild is the largest bag manufacturer in Jaipur..."
              />
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                Canonical Tags
              </label>
              <input
                type="text"
                value={formData.seo.canonicalUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } }))}
                className="input-field"
                placeholder="https://thecrosswild.com/..."
              />
            </div>

            {/* Other Meta Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Other Meta Tags</label>
              <textarea
                value={formData.seo.otherMetaTags}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, otherMetaTags: e.target.value } }))}
                rows={3}
                className="input-field font-mono text-xs"
                placeholder='e.g., <script type="application/ld+json">{"@context":"https://schema.org",...}</script>'
              />
            </div>

            {/* Robot directives */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seo.noIndex}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, noIndex: e.target.checked } }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">No Index</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seo.noFollow}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, noFollow: e.target.checked } }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">No Follow</span>
              </label>
            </div>

            {/* Google Preview */}
            {(formData.seo.title || formData.name) && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Google Preview</p>
                <p className="text-blue-700 text-base font-medium truncate">{formData.seo.title || formData.name}</p>
                <p className="text-green-700 text-xs truncate">thecrosswild.com/{formData.seoUrl || '...'}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{formData.seo.description || 'No description'}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
              className="input-field"
            >
              <option value="true">Enable</option>
              <option value="false">Disable</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
              {category ? 'Update' : 'Add'} {isSubcategory ? 'Subcategory' : 'Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Categories;
