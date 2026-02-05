import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Layers, Download } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown (Select)' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'boolean', label: 'Yes/No (Boolean)' },
];

const ProductTypes = () => {
  const { productTypes, addProductType, updateProductType, deleteProductType, seedProductTypes, loading } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [expandedType, setExpandedType] = useState(null);

  const handleEdit = (type) => {
    setEditingType(type);
    setShowModal(true);
  };

  const handleDelete = async (type) => {
    if (window.confirm(`Are you sure you want to delete "${type.name}"? This won't delete existing products but they will lose their type reference.`)) {
      try {
        await deleteProductType(type.id || type._id);
      } catch (error) {
        alert('Failed to delete product type.');
      }
    }
  };

  const handleSeed = async () => {
    if (window.confirm('This will create default product types (T-Shirts, Bags, Bottles, etc.) if none exist. Continue?')) {
      try {
        await seedProductTypes();
      } catch (error) {
        alert('Failed to seed product types.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Product Types</h1>
          <p className="text-gray-500 mt-1">Manage product types and their custom detail fields</p>
        </div>
        <div className="flex gap-3">
          {productTypes.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-5 h-5" />
              Load Defaults
            </button>
          )}
          <button
            onClick={() => { setEditingType(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product Type
          </button>
        </div>
      </div>

      {/* Product Types List */}
      {productTypes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Layers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Product Types Yet</h3>
          <p className="text-gray-500 mb-6">Create product types to define custom fields for different product categories.</p>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Load Default Product Types
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {productTypes.map((type) => (
            <div key={type.id || type._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Type Header */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => setExpandedType(expandedType === type.id ? null : type.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span className="text-2xl">{type.icon || '📦'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{type.name}</h3>
                    <p className="text-sm text-gray-500">
                      {type.detailFields?.length || 0} custom fields
                      {type.hasSizes !== false && ' · Sizes'}
                      {type.hasColors !== false && ' · Colors'}
                      {type.isActive === false && ' · Inactive'}
                    </p>
                  </div>
                  {expandedType === type.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedType === type.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {type.description && (
                    <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Slug:</span>{' '}
                      <span className="text-gray-500">{type.slug}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Has Sizes:</span>{' '}
                      <span className="text-gray-500">{type.hasSizes !== false ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Has Colors:</span>{' '}
                      <span className="text-gray-500">{type.hasColors !== false ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Status:</span>{' '}
                      <span className={type.isActive !== false ? 'text-green-600' : 'text-red-600'}>
                        {type.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {type.detailFields?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Custom Detail Fields:</h4>
                      <div className="space-y-2">
                        {type.detailFields.map((field, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex-1">
                              <span className="font-medium text-gray-800 text-sm">{field.fieldName}</span>
                              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {field.fieldType}
                              </span>
                              {field.required && (
                                <span className="ml-1 text-xs text-red-500">required</span>
                              )}
                            </div>
                            {field.options?.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {field.options.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {type.customSizes?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Custom Sizes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {type.customSizes.map((size, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ProductTypeModal
          productType={editingType}
          onClose={() => { setShowModal(false); setEditingType(null); }}
          onSave={async (data) => {
            try {
              if (editingType) {
                await updateProductType(editingType.id || editingType._id, data);
              } else {
                await addProductType(data);
              }
              setShowModal(false);
              setEditingType(null);
            } catch (error) {
              alert('Failed to save product type. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
};

// Product Type Modal Component
const ProductTypeModal = ({ productType, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: productType?.name || '',
    icon: productType?.icon || '📦',
    description: productType?.description || '',
    hasSizes: productType?.hasSizes !== false,
    hasColors: productType?.hasColors !== false,
    customSizes: productType?.customSizes?.join(', ') || '',
    isActive: productType?.isActive !== false,
    detailFields: productType?.detailFields || [],
  });

  const [newField, setNewField] = useState({
    fieldName: '',
    fieldType: 'text',
    options: '',
    required: false,
    placeholder: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addField = () => {
    if (!newField.fieldName.trim()) {
      alert('Field name is required');
      return;
    }

    const field = {
      fieldName: newField.fieldName.trim(),
      fieldType: newField.fieldType,
      required: newField.required,
      placeholder: newField.placeholder,
      options: (newField.fieldType === 'select' || newField.fieldType === 'multiselect')
        ? newField.options.split(',').map(o => o.trim()).filter(Boolean)
        : [],
    };

    setFormData(prev => ({
      ...prev,
      detailFields: [...prev.detailFields, field],
    }));

    setNewField({
      fieldName: '',
      fieldType: 'text',
      options: '',
      required: false,
      placeholder: '',
    });
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      detailFields: prev.detailFields.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Product type name is required');
      return;
    }

    const data = {
      name: formData.name.trim(),
      icon: formData.icon,
      description: formData.description,
      hasSizes: formData.hasSizes,
      hasColors: formData.hasColors,
      isActive: formData.isActive,
      detailFields: formData.detailFields,
      customSizes: formData.customSizes
        ? formData.customSizes.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {productType ? 'Edit Product Type' : 'Add Product Type'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name and Icon */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Track Suits"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="input-field text-center text-2xl"
                placeholder="📦"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Brief description of this product type"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <input
                type="checkbox"
                name="hasSizes"
                checked={formData.hasSizes}
                onChange={handleChange}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm font-medium text-gray-700">Has Sizes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <input
                type="checkbox"
                name="hasColors"
                checked={formData.hasColors}
                onChange={handleChange}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm font-medium text-gray-700">Has Colors</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          {/* Custom Sizes */}
          {formData.hasSizes && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custom Sizes (comma separated, leave empty for default)
              </label>
              <input
                type="text"
                name="customSizes"
                value={formData.customSizes}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 28, 30, 32, 34, 36, 38, 40"
              />
            </div>
          )}

          {/* Detail Fields */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Detail Fields</h3>
            <p className="text-sm text-gray-500 mb-4">
              Define what extra details this product type should have (e.g., Fabric, Sleeve Type for T-Shirts).
            </p>

            {/* Existing Fields */}
            {formData.detailFields.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.detailFields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 text-sm">{field.fieldName}</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {field.fieldType}
                      </span>
                      {field.required && (
                        <span className="ml-1 text-xs text-red-500">required</span>
                      )}
                      {field.options?.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Options: {field.options.join(', ')}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Field */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
              <h4 className="text-sm font-semibold text-blue-800">Add New Field</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newField.fieldName}
                  onChange={(e) => setNewField(prev => ({ ...prev, fieldName: e.target.value }))}
                  className="input-field"
                  placeholder="Field Name (e.g., Fabric)"
                />
                <select
                  value={newField.fieldType}
                  onChange={(e) => setNewField(prev => ({ ...prev, fieldType: e.target.value }))}
                  className="input-field"
                >
                  {FIELD_TYPES.map(ft => (
                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                  ))}
                </select>
              </div>

              {(newField.fieldType === 'select' || newField.fieldType === 'multiselect') && (
                <input
                  type="text"
                  value={newField.options}
                  onChange={(e) => setNewField(prev => ({ ...prev, options: e.target.value }))}
                  className="input-field"
                  placeholder="Options (comma separated, e.g., Cotton, Polyester, Blend)"
                />
              )}

              {(newField.fieldType === 'text' || newField.fieldType === 'number') && (
                <input
                  type="text"
                  value={newField.placeholder}
                  onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                  className="input-field"
                  placeholder="Placeholder text (optional)"
                />
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Required field</span>
                </label>
                <button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {productType ? 'Update Product Type' : 'Create Product Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductTypes;
