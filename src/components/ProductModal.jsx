import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { uploadAPI } from '../services/api';

// Predefined options
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple',
  'Pink', 'Brown', 'Gray', 'Navy', 'Maroon', 'Teal', 'Olive', 'Beige'
];

const ProductModal = ({ product, onClose }) => {
  const { addProduct, updateProduct, categories, productTypes } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    productType: '',
    image: '',
    subImages: [],
    sizes: [],
    colors: [],
    details: {},
    minOrderQuantity: 1,
    bestSeller: false,
    newArrival: false,
    featured: false,
    trending: false,
    mostPopular: false,
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingSubImage, setUploadingSubImage] = useState(false);

  // Get the selected product type's detail fields
  const selectedProductType = productTypes.find(
    t => (t._id || t.id) === formData.productType || t.slug === formData.category
  );

  useEffect(() => {
    if (product) {
      const productTypeId = product.productType?._id || product.productType || '';
      setFormData({
        name: product.name || '',
        title: product.title || '',
        description: product.description || '',
        category: product.category || '',
        productType: productTypeId,
        image: product.image || '',
        subImages: product.subImages || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        details: product.details || {},
        minOrderQuantity: product.minOrderQuantity || 1,
        bestSeller: product.bestSeller || false,
        newArrival: product.newArrival || false,
        featured: product.featured || false,
        trending: product.trending || false,
        mostPopular: product.mostPopular || false,
      });
    } else if (categories.length > 0) {
      // Set default category for new product
      setFormData(prev => ({
        ...prev,
        category: categories[0].id,
        productType: categories[0]._id || '',
      }));
    }
  }, [product, categories]);

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

  const handleCategoryChange = (e) => {
    const selectedSlug = e.target.value;
    const cat = categories.find(c => c.id === selectedSlug);
    setFormData(prev => ({
      ...prev,
      category: selectedSlug,
      productType: cat?._id || '',
      details: {}, // Reset details when type changes
    }));
  };

  const handleDetailChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [fieldName]: value,
      },
    }));
  };

  const handleDetailMultiSelect = (fieldName, value) => {
    setFormData(prev => {
      const currentValues = prev.details[fieldName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        details: {
          ...prev.details,
          [fieldName]: newValues,
        },
      };
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

  const handleImageUpload = async (e, isSubImage = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      if (isSubImage) {
        setUploadingSubImage(true);
      } else {
        setUploading(true);
      }

      const response = await uploadAPI.uploadImage(file);

      if (response.success && response.imageUrl) {
        if (isSubImage) {
          setFormData(prev => ({
            ...prev,
            subImages: [...prev.subImages, response.imageUrl]
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            image: response.imageUrl
          }));
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      if (isSubImage) {
        setUploadingSubImage(false);
      } else {
        setUploading(false);
      }
    }
  };

  const removeSubImage = (index) => {
    setFormData(prev => ({
      ...prev,
      subImages: prev.subImages.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.image) newErrors.image = 'Main image is required';
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
      minOrderQuantity: Number(formData.minOrderQuantity) || 1,
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

  // Determine which size options to show
  const sizeOptions = selectedProductType?.customSizes?.length > 0
    ? selectedProductType.customSizes
    : SIZE_OPTIONS;

  const showSizes = selectedProductType ? selectedProductType.hasSizes !== false : true;
  const showColors = selectedProductType ? selectedProductType.hasColors !== false : true;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Custom T-Shirt"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Product Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Premium Custom Printed Round Neck T-Shirt - High Quality Cotton"
            />
            <p className="text-xs text-gray-400 mt-1">Display title shown on the website. Leave empty to use the product name.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe your product..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Product Type / Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Type *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {selectedProductType?.description && (
              <p className="text-sm text-gray-500 mt-1">{selectedProductType.description}</p>
            )}
          </div>

          {/* Main Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Image *
            </label>
            <div className="space-y-3">
              {formData.image && (
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={formData.image}
                    alt="Main product"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${errors.image ? 'border-red-500' : 'border-gray-300'}`}>
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>{formData.image ? 'Change Main Image' : 'Upload Main Image'}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          {/* Sub Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Images (Optional)
            </label>
            <div className="space-y-3">
              {formData.subImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {formData.subImages.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={img}
                        alt={`Sub image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                {uploadingSubImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add More Images</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                  disabled={uploadingSubImage}
                />
              </label>
            </div>
          </div>

          {/* Dynamic Detail Fields based on Product Type */}
          {selectedProductType?.detailFields?.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedProductType.name} Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProductType.detailFields.map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.fieldName} {field.required && '*'}
                    </label>

                    {field.fieldType === 'text' && (
                      <input
                        type="text"
                        value={formData.details[field.fieldName] || ''}
                        onChange={(e) => handleDetailChange(field.fieldName, e.target.value)}
                        className="input-field"
                        placeholder={field.placeholder || `Enter ${field.fieldName}`}
                      />
                    )}

                    {field.fieldType === 'number' && (
                      <input
                        type="number"
                        value={formData.details[field.fieldName] || ''}
                        onChange={(e) => handleDetailChange(field.fieldName, e.target.value)}
                        className="input-field"
                        placeholder={field.placeholder || `Enter ${field.fieldName}`}
                      />
                    )}

                    {field.fieldType === 'select' && (
                      <select
                        value={formData.details[field.fieldName] || ''}
                        onChange={(e) => handleDetailChange(field.fieldName, e.target.value)}
                        className="input-field"
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
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
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
                          className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sizes Multi-Select */}
          {showSizes && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleMultiSelect('sizes', size)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      formData.sizes.includes(size)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {formData.sizes.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">Selected: {formData.sizes.join(', ')}</p>
              )}
            </div>
          )}

          {/* Colors Multi-Select */}
          {showColors && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Available Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleMultiSelect('colors', color)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      formData.colors.includes(color)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
              {formData.colors.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">Selected: {formData.colors.join(', ')}</p>
              )}
            </div>
          )}

          {/* Min Order Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Order Quantity
            </label>
            <input
              type="number"
              name="minOrderQuantity"
              value={formData.minOrderQuantity}
              onChange={handleChange}
              className="input-field w-32"
              min="1"
            />
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Product Badges
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'bestSeller', label: 'Best Seller' },
                { name: 'newArrival', label: 'New Arrival' },
                { name: 'featured', label: 'Featured' },
                { name: 'trending', label: 'Trending' },
                { name: 'mostPopular', label: 'Most Popular' },
              ].map(badge => (
                <label key={badge.name} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name={badge.name}
                    checked={formData[badge.name]}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{badge.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={uploading || uploadingSubImage}
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
