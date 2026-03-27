import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Trash2, Copy, Check, Type, AlignLeft, Tags, Palette, Ruler, Image as ImageIcon, Settings, Award, ChevronDown, ChevronRight, FileText, LayoutList, Search, Globe, Link2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { uploadAPI } from '../services/api';
import RichTextEditor from './RichTextEditor';

// ═══════════════ CATEGORY / SUBCATEGORY DATA (matches Navbar) ═══════════════
const PRODUCT_CATEGORIES = [
  {
    slug: 'tshirts',
    name: 'T-Shirts',
    icon: '👕',
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
    slug: 'bags',
    name: 'Bags',
    icon: '👜',
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
    slug: 'caps',
    name: 'Caps',
    icon: '🧢',
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
    slug: 'sweatshirts',
    name: 'Sweatshirts & Hoodies',
    icon: '🧥',
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
    slug: 'lowers',
    name: 'Lower & Shorts',
    icon: '👖',
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
    slug: 'uniforms',
    name: 'School & Office Uniform',
    icon: '👔',
    subcategories: [
      { slug: 'school', name: 'School Uniform & Dress' },
      { slug: 'office', name: 'Office Employee Uniform & Dress' },
      { slug: 'custom', name: 'Custom Uniforms' },
    ],
  },
  {
    slug: 'printing',
    name: 'Printing & Embroidery',
    icon: '🖨️',
    subcategories: [
      { slug: 'screen', name: 'Screen Printing' },
      { slug: 'tf', name: 'TF Printing' },
      { slug: 'digital', name: 'Digital Printing' },
      { slug: 'sublimation', name: 'Sublimation Printing' },
      { slug: 'embroidery', name: 'Embroidery' },
    ],
  },
  {
    slug: 'apron',
    name: 'Apron',
    icon: '🍳',
    subcategories: [],
  },
  {
    slug: 'chef-coat',
    name: 'Chef Coat',
    icon: '👨‍🍳',
    subcategories: [],
  },
  {
    slug: 'raincoats',
    name: 'Raincoats',
    icon: '🌧️',
    subcategories: [],
  },
];

// Predefined options
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple',
  'Pink', 'Brown', 'Gray', 'Navy', 'Maroon', 'Teal', 'Olive', 'Beige'
];

const countWords = (text) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 pb-3 border-b border-gray-200 mb-4">
    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-orange-600" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

// Helper: get display name from slug
const getCategoryName = (slug) => {
  const cat = PRODUCT_CATEGORIES.find(c => c.slug === slug);
  return cat?.name || slug;
};

const getSubcategoryName = (catSlug, subSlug) => {
  const cat = PRODUCT_CATEGORIES.find(c => c.slug === catSlug);
  const sub = cat?.subcategories.find(s => s.slug === subSlug);
  return sub?.name || subSlug;
};

const ProductModal = ({ product, onClose }) => {
  const { addProduct, updateProduct, productTypes } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    tagline: '',
    description: '',
    shortDescription: '',
    sections: [], // [{title: '', content: ''}]
    productCategories: [], // [{category: 'tshirts', subcategories: ['dry-fit','cotton']}]
    productType: '',
    image: '',
    imageTrackingCode: '',
    imagePublicId: '',
    subImages: [],
    sizes: [],
    colors: [],
    details: {},
    customFields: [],
    bestSeller: false,
    newArrival: false,
    featured: false,
    trending: false,
    mostPopular: false,
    // SEO fields
    sku: '',
    slug: '',
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '',
      canonicalUrl: '',
      otherMetaTags: '',
      noIndex: false,
      noFollow: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingSubImages, setUploadingSubImages] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Derive primary category from first productCategories entry
  const primaryCategorySlug = formData.productCategories[0]?.category || '';

  // Get the selected product type's detail fields (match by primary category slug)
  const selectedProductType = productTypes.find(
    t => (t._id || t.id) === formData.productType || t.slug === primaryCategorySlug
  );

  useEffect(() => {
    if (product) {
      const productTypeId = product.productType?._id || product.productType || '';

      // Build productCategories from existing data
      let pCats = product.productCategories || [];
      // If old product has only `category` but no productCategories, convert it
      if (pCats.length === 0 && product.category) {
        pCats = [{ category: product.category, subcategories: [] }];
      }

      setFormData({
        name: product.name || '',
        title: product.title || '',
        tagline: product.tagline || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        sections: product.sections || [],
        productCategories: pCats,
        productType: productTypeId,
        image: product.image || '',
        imageTrackingCode: product.imageTrackingCode || '',
        imagePublicId: product.imagePublicId || '',
        subImages: product.subImages || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        details: product.details || {},
        customFields: product.customFields || [],
        bestSeller: product.bestSeller || false,
        newArrival: product.newArrival || false,
        featured: product.featured || false,
        trending: product.trending || false,
        mostPopular: product.mostPopular || false,
        // SEO fields
        sku: product.sku || '',
        slug: product.slug || '',
        seo: {
          title: product.seo?.title || '',
          description: product.seo?.description || '',
          keywords: product.seo?.keywords || [],
          ogImage: product.seo?.ogImage || '',
          canonicalUrl: product.seo?.canonicalUrl || '',
          otherMetaTags: product.seo?.otherMetaTags || '',
          noIndex: product.seo?.noIndex || false,
          noFollow: product.seo?.noFollow || false,
        },
      });

      // Expand categories that are already selected
      setExpandedCategories(pCats.map(pc => pc.category));
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ─── Category / Subcategory toggle logic ───
  const toggleCategory = (catSlug) => {
    setFormData(prev => {
      const exists = prev.productCategories.find(pc => pc.category === catSlug);
      if (exists) {
        // Remove category entirely
        return {
          ...prev,
          productCategories: prev.productCategories.filter(pc => pc.category !== catSlug),
        };
      } else {
        // Add category with no subcategories selected yet
        return {
          ...prev,
          productCategories: [...prev.productCategories, { category: catSlug, subcategories: [] }],
        };
      }
    });

    // Auto-expand when selecting
    setExpandedCategories(prev =>
      prev.includes(catSlug) ? prev : [...prev, catSlug]
    );

    if (errors.productCategories) {
      setErrors(prev => ({ ...prev, productCategories: '' }));
    }
  };

  const toggleSubcategory = (catSlug, subSlug) => {
    setFormData(prev => {
      const updated = prev.productCategories.map(pc => {
        if (pc.category !== catSlug) return pc;
        const hasSub = pc.subcategories.includes(subSlug);
        return {
          ...pc,
          subcategories: hasSub
            ? pc.subcategories.filter(s => s !== subSlug)
            : [...pc.subcategories, subSlug],
        };
      });
      return { ...prev, productCategories: updated };
    });
  };

  const toggleExpandCategory = (catSlug) => {
    setExpandedCategories(prev =>
      prev.includes(catSlug)
        ? prev.filter(s => s !== catSlug)
        : [...prev, catSlug]
    );
  };

  const isCategorySelected = (catSlug) =>
    formData.productCategories.some(pc => pc.category === catSlug);

  const isSubcategorySelected = (catSlug, subSlug) => {
    const pc = formData.productCategories.find(pc => pc.category === catSlug);
    return pc?.subcategories.includes(subSlug) || false;
  };

  const getSelectedSubCount = (catSlug) => {
    const pc = formData.productCategories.find(pc => pc.category === catSlug);
    return pc?.subcategories.length || 0;
  };

  // ─── Section (CMS blocks) handlers ───
  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '' }],
    }));
  };

  const updateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? { ...s, [field]: value } : s),
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const moveSectionUp = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const arr = [...prev.sections];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return { ...prev, sections: arr };
    });
  };

  const moveSectionDown = (index) => {
    setFormData(prev => {
      if (index >= prev.sections.length - 1) return prev;
      const arr = [...prev.sections];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return { ...prev, sections: arr };
    });
  };

  // ─── Detail field handlers ───
  const handleDetailChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, [fieldName]: value },
    }));
  };

  const handleDetailMultiSelect = (fieldName, value) => {
    setFormData(prev => {
      const currentValues = prev.details[fieldName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, details: { ...prev.details, [fieldName]: newValues } };
    });
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const addCustomSize = () => {
    const size = customSizeInput.trim();
    if (size && !formData.sizes.includes(size)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
      setCustomSizeInput('');
    }
  };

  const addCustomColor = () => {
    const color = customColorInput.trim();
    if (color && !formData.colors.includes(color)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
      setCustomColorInput('');
    }
  };

  const addCustomField = () => {
    const label = newFieldLabel.trim();
    if (label) {
      setFormData(prev => ({
        ...prev,
        customFields: [...prev.customFields, { label, value: '' }],
      }));
      setNewFieldLabel('');
    }
  };

  const updateCustomField = (index, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((f, i) => i === index ? { ...f, value } : f),
    }));
  };

  const removeCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // ─── Image upload ───
  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image size must be less than 5MB'); return; }

    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(file, primaryCategorySlug || 'general');
      if (response.success && response.imageUrl) {
        setFormData(prev => ({
          ...prev,
          image: response.imageUrl,
          imageTrackingCode: response.trackingCode || '',
          imagePublicId: response.publicId || '',
        }));
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      if (!file.type.startsWith('image/')) { alert(`"${file.name}" is not an image file`); return; }
      if (file.size > 5 * 1024 * 1024) { alert(`"${file.name}" exceeds 5MB limit`); return; }
    }
    setUploadingSubImages(true);
    try {
      const uploadPromises = files.map(file =>
        uploadAPI.uploadImage(file, primaryCategorySlug || 'general')
      );
      const results = await Promise.all(uploadPromises);
      const newSubImages = results
        .filter(r => r.success && r.imageUrl)
        .map(r => ({ url: r.imageUrl, trackingCode: r.trackingCode, publicId: r.publicId }));
      setFormData(prev => ({ ...prev, subImages: [...prev.subImages, ...newSubImages] }));
    } catch (error) {
      console.error('Sub-image upload failed:', error);
      alert('Some images failed to upload. Please try again.');
    } finally {
      setUploadingSubImages(false);
      e.target.value = '';
    }
  };

  const removeSubImage = (index) => {
    setFormData(prev => ({ ...prev, subImages: prev.subImages.filter((_, i) => i !== index) }));
  };

  const copyTrackingCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.image) newErrors.image = 'Main image is required';
    if (formData.productCategories.length === 0) newErrors.productCategories = 'Select at least one category';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const productData = {
      ...formData,
      // Set legacy `category` from first selected category for backward compat
      category: formData.productCategories[0]?.category || '',
      price: 0,
      stock: 100,
    };

    try {
      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const sizeOptions = selectedProductType?.customSizes?.length > 0
    ? selectedProductType.customSizes
    : SIZE_OPTIONS;

  const showSizes = selectedProductType ? selectedProductType.hasSizes !== false : true;
  const showColors = selectedProductType ? selectedProductType.hasColors !== false : true;

  // Count total selected items
  const totalSelectedCategories = formData.productCategories.length;
  const totalSelectedSubs = formData.productCategories.reduce((sum, pc) => sum + pc.subcategories.length, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details below to {product ? 'update' : 'create'} a product</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6">

          {/* ═══════════════ SECTION 1: BASIC INFO ═══════════════ */}
          <div>
            <SectionHeader icon={Type} title="Basic Information" subtitle="Product name, title, and description" />

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  placeholder="e.g., Custom Round Neck T-Shirt"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Product Title + Word Count */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Product Title</label>
                  <span className="text-xs text-gray-400">{countWords(formData.title)} words</span>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder="e.g., Premium Custom Printed Round Neck T-Shirt - 100% Cotton"
                />
                <p className="text-xs text-gray-400 mt-1">Display title shown on the website. Leave empty to use the product name.</p>
              </div>

              {/* Description (Rich Text Editor) */}
              <div>
                <RichTextEditor
                  label={<>Description <span className="text-red-500">*</span></>}
                  value={formData.description}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, description: val }));
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  placeholder="Write a detailed product description..."
                  minHeight="200px"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Tagline */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Tagline</label>
                  <span className="text-xs text-gray-400">{countWords(formData.tagline)} words</span>
                </div>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder='e.g., "Print to look professional with these comfortable T-shirts"'
                />
                <p className="text-xs text-gray-400 mt-1">Short catchy line shown below the product name.</p>
              </div>

              {/* Short Description (Rich Text Editor) */}
              <div>
                <RichTextEditor
                  label="Short Description"
                  value={formData.shortDescription}
                  onChange={(val) => setFormData(prev => ({ ...prev, shortDescription: val }))}
                  placeholder="Key points shown in the hero section. Use bullet points for best display."
                  minHeight="150px"
                />
                <p className="text-xs text-gray-400 mt-1">Key points shown in the hero section.</p>
              </div>
            </div>
          </div>

          {/* ═══════════════ CONTENT SECTIONS (CMS Blocks) ═══════════════ */}
          <div>
            <SectionHeader icon={LayoutList} title="Content Sections" subtitle="Add detailed information blocks shown below the hero area" />

            {formData.sections.length > 0 && (
              <div className="space-y-4 mb-4">
                {formData.sections.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                        placeholder="Section title (e.g., Design & Print Information)"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSectionDown(index)}
                          disabled={index === formData.sections.length - 1}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <RichTextEditor
                      value={section.content}
                      onChange={(val) => updateSection(index, 'content', val)}
                      placeholder="Section content..."
                      minHeight="150px"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addSection}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Content Section
            </button>
          </div>

          {/* ═══════════════ SECTION 2: CATEGORIES & SUBCATEGORIES ═══════════════ */}
          <div>
            <SectionHeader icon={Tags} title="Categories & Subcategories" subtitle="Select one or more categories, then pick subcategories" />

            {/* Selection summary */}
            {totalSelectedCategories > 0 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-xs font-semibold text-orange-700 mb-2">
                  {totalSelectedCategories} {totalSelectedCategories === 1 ? 'category' : 'categories'} selected
                  {totalSelectedSubs > 0 && `, ${totalSelectedSubs} ${totalSelectedSubs === 1 ? 'subcategory' : 'subcategories'}`}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.productCategories.map(pc => (
                    <React.Fragment key={pc.category}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">
                        {getCategoryName(pc.category)}
                        <button type="button" onClick={() => toggleCategory(pc.category)} className="hover:text-orange-200">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                      {pc.subcategories.map(sub => (
                        <span key={sub} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {getSubcategoryName(pc.category, sub)}
                          <button type="button" onClick={() => toggleSubcategory(pc.category, sub)} className="hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Category accordion list */}
            <div className="space-y-2">
              {PRODUCT_CATEGORIES.map(cat => {
                const isSelected = isCategorySelected(cat.slug);
                const isExpanded = expandedCategories.includes(cat.slug);
                const subCount = getSelectedSubCount(cat.slug);
                const hasSubs = cat.subcategories.length > 0;

                return (
                  <div
                    key={cat.slug}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isSelected ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200'
                    }`}
                  >
                    {/* Category header row */}
                    <div className="flex items-center gap-2 p-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'border-gray-300 hover:border-orange-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>

                      {/* Icon + Name */}
                      <span className="text-lg">{cat.icon}</span>
                      <span className={`text-sm font-semibold flex-1 ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                        {cat.name}
                      </span>

                      {/* Sub count badge */}
                      {isSelected && subCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                          {subCount} sub
                        </span>
                      )}

                      {/* Expand/collapse for subcategories */}
                      {hasSubs && (
                        <button
                          type="button"
                          onClick={() => toggleExpandCategory(cat.slug)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-gray-500" />
                            : <ChevronRight className="w-4 h-4 text-gray-500" />
                          }
                        </button>
                      )}
                    </div>

                    {/* Subcategories panel */}
                    {hasSubs && isExpanded && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="ml-7 pl-3 border-l-2 border-orange-200">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Subcategories
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.subcategories.map(sub => {
                              const subSelected = isSubcategorySelected(cat.slug, sub.slug);
                              const categoryActive = isCategorySelected(cat.slug);
                              return (
                                <button
                                  key={sub.slug}
                                  type="button"
                                  onClick={() => {
                                    // Auto-select category if not selected
                                    if (!categoryActive) toggleCategory(cat.slug);
                                    // Need a slight delay if we just added the category
                                    if (!categoryActive) {
                                      setTimeout(() => toggleSubcategory(cat.slug, sub.slug), 0);
                                    } else {
                                      toggleSubcategory(cat.slug, sub.slug);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                    subSelected
                                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                  }`}
                                >
                                  {subSelected && <span className="mr-1">✓</span>}
                                  {sub.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.productCategories && (
              <p className="text-red-500 text-xs mt-2">{errors.productCategories}</p>
            )}
          </div>

          {/* ═══════════════ SECTION 3: IMAGES ═══════════════ */}
          <div>
            <SectionHeader icon={ImageIcon} title="Product Images" subtitle="Main image (required) + additional images" />

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Main Image */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Main Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.image ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={formData.image} alt="Main product" className="w-full h-full object-contain p-2" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '', imageTrackingCode: '', imagePublicId: '' }))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {formData.imageTrackingCode && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-1 truncate">
                            {formData.imageTrackingCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyTrackingCode(formData.imageTrackingCode)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                            title="Copy tracking code"
                          >
                            {copiedCode ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Click to upload</span>
                          <span className="text-xs text-gray-400 mt-0.5">Max 5MB</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                  {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Additional Images
                </label>
                <div className="space-y-2">
                  {formData.subImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.subImages.map((img, index) => {
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        const imgCode = typeof img === 'string' ? '' : img.trackingCode;
                        return (
                          <div key={index} className="relative group">
                            <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                              <img src={imgUrl} alt={`Additional ${index + 1}`} className="w-full h-full object-contain p-1" />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSubImage(index)}
                              className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {imgCode && (
                              <p className="text-[8px] font-mono text-gray-400 truncate mt-0.5" title={imgCode}>{imgCode}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all">
                    {uploadingSubImages ? (
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Add images (multi-select)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" multiple onChange={handleSubImagesUpload} className="hidden" disabled={uploadingSubImages} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════ SECTION 4: SIZES ═══════════════ */}
          {showSizes && (
            <div>
              <SectionHeader icon={Ruler} title="Available Sizes" subtitle="Select predefined or add custom sizes" />

              <div className="flex flex-wrap gap-2 mb-3">
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleMultiSelect('sizes', size)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      formData.sizes.includes(size)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  placeholder="Add custom size (e.g., 28, 30, 42)"
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>

              {formData.sizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {formData.sizes.map(size => (
                    <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                      {size}
                      <button type="button" onClick={() => handleMultiSelect('sizes', size)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ SECTION 5: COLORS ═══════════════ */}
          {showColors && (
            <div>
              <SectionHeader icon={Palette} title="Available Colors" subtitle="Select predefined or add custom colors" />

              <div className="flex flex-wrap gap-2 mb-3">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleMultiSelect('colors', color)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      formData.colors.includes(color)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  placeholder="Add custom color (e.g., Royal Blue, Wine Red)"
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>

              {formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {formData.colors.map(color => (
                    <span key={color} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {color}
                      <button type="button" onClick={() => handleMultiSelect('colors', color)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ SECTION 6: BADGES ═══════════════ */}
          <div>
            <SectionHeader icon={Award} title="Product Badges" subtitle="Highlight this product with badges" />

            <div className="flex flex-wrap gap-2">
              {[
                { name: 'bestSeller', label: 'Best Seller' },
                { name: 'newArrival', label: 'New Arrival' },
                { name: 'featured', label: 'Featured' },
                { name: 'trending', label: 'Trending' },
                { name: 'mostPopular', label: 'Most Popular' },
              ].map(badge => (
                <button
                  key={badge.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, [badge.name]: !prev[badge.name] }))}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                    formData[badge.name]
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                  }`}
                >
                  {formData[badge.name] ? '✓ ' : ''}{badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════════ SECTION 7: PRODUCT TYPE DETAILS ═══════════════ */}
          {selectedProductType?.detailFields?.length > 0 && (
            <div>
              <SectionHeader icon={AlignLeft} title={`${selectedProductType.name} Details`} subtitle="Type-specific fields" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProductType.detailFields.map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {field.fieldName} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.fieldType === 'text' && (
                      <input
                        type="text"
                        value={formData.details[field.fieldName] || ''}
                        onChange={(e) => handleDetailChange(field.fieldName, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                        placeholder={field.placeholder || `Enter ${field.fieldName}`}
                      />
                    )}

                    {field.fieldType === 'number' && (
                      <input
                        type="number"
                        value={formData.details[field.fieldName] || ''}
                        onChange={(e) => handleDetailChange(field.fieldName, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                        placeholder={field.placeholder || `Enter ${field.fieldName}`}
                      />
                    )}

                    {field.fieldType === 'select' && (
                      <select
                        value={formData.details[field.fieldName] || ''}
                        onChange={(e) => handleDetailChange(field.fieldName, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                      >
                        <option value="">Select {field.fieldName}</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.fieldType === 'multiselect' && (
                      <div className="flex flex-wrap gap-2">
                        {(field.options || []).map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDetailMultiSelect(field.fieldName, opt)}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                              (formData.details[field.fieldName] || []).includes(opt)
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {field.fieldType === 'boolean' && (
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.details[field.fieldName] || false}
                          onChange={(e) => handleDetailChange(field.fieldName, e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-200"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ SECTION 8: CUSTOM FIELDS ═══════════════ */}
          <div>
            <SectionHeader icon={Settings} title="Extra Custom Fields" subtitle="Add any additional product information" />

            {formData.customFields.length > 0 && (
              <div className="space-y-3 mb-4">
                {formData.customFields.map((field, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 truncate" title={field.label}>
                        {field.label}
                      </div>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateCustomField(index, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                        placeholder="Enter value"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomField())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Field label (e.g., Material, GSM, Weight)"
              />
              <button
                type="button"
                onClick={addCustomField}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* ═══════════════ SECTION: SEO & META ═══════════════ */}
          <div>
            <SectionHeader icon={Search} title="SEO & Meta Tags" subtitle="Search engine optimization settings (like old site format + advanced)" />

            <div className="space-y-4">
              {/* SKU */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder="e.g., TCWT002"
                />
              </div>

              {/* SEO URL / Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-green-600" />
                    SEO URL
                  </label>
                  {formData.slug && (
                    <span className="text-xs text-green-600 font-mono">/products/{formData.slug}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                    setFormData(prev => ({ ...prev, slug: val }));
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder="e.g., round-neck-t-shirt (auto-generated if empty)"
                />
                <p className="text-xs text-red-500 mt-1 font-medium">*Please do not use space and special digits except hyphen (-). Use unique SEO URL always.</p>
              </div>

              {/* Meta Tag Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Meta Tag Title</label>
                  <span className={`text-xs ${(formData.seo.title?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.seo.title?.length || 0}/70
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.seo.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                  maxLength={70}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder="Meta title for search engines (max 70 chars)"
                />
              </div>

              {/* Meta Tag Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Meta Tag Description</label>
                  <span className={`text-xs ${(formData.seo.description?.length || 0) > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.seo.description?.length || 0}/160
                  </span>
                </div>
                <textarea
                  value={formData.seo.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all resize-y"
                  placeholder="Meta description for search engines (max 160 chars)"
                />
              </div>

              {/* Meta Tag Keywords */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Meta Tag Keywords
                </label>
                <input
                  type="text"
                  value={formData.seo.keywords?.join(', ') || ''}
                  onChange={(e) => {
                    const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, seo: { ...prev.seo, keywords } }));
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={formData.seo.canonicalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder="https://thecrosswild.com/products/..."
                />
              </div>

              {/* OG Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  OG Image URL
                </label>
                <input
                  type="text"
                  value={formData.seo.ogImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogImage: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                  placeholder="Custom Open Graph image URL (defaults to product image)"
                />
              </div>

              {/* Other Meta Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Other Meta Tags
                </label>
                <textarea
                  value={formData.seo.otherMetaTags}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, otherMetaTags: e.target.value } }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all resize-y font-mono"
                  placeholder='e.g., <script type="application/ld+json">...</script>'
                />
                <p className="text-xs text-gray-500 mt-1">Custom meta tags, JSON-LD structured data, etc.</p>
              </div>

              {/* Robot directives */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.seo.noIndex}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, noIndex: e.target.checked } }))}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-200"
                  />
                  <span className="text-sm text-gray-700">No Index</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.seo.noFollow}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, noFollow: e.target.checked } }))}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-200"
                  />
                  <span className="text-sm text-gray-700">No Follow</span>
                </label>
              </div>

              {/* SEO Preview */}
              {(formData.seo.title || formData.name) && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Google Preview</p>
                  <div className="space-y-1">
                    <p className="text-blue-700 text-lg font-medium truncate leading-tight">
                      {formData.seo.title || formData.name}
                    </p>
                    <p className="text-green-700 text-sm truncate">
                      thecrosswild.com/products/{formData.slug || '...'}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {formData.seo.description || formData.description?.substring(0, 160) || 'No description set'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════ ACTION BUTTONS ═══════════════ */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || uploadingSubImages}
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
