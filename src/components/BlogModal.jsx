import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Trash2, Search, Globe, Link2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { uploadAPI } from '../services/api';
import RichTextEditor from './RichTextEditor';

const BlogModal = ({ blog, onClose }) => {
  const { addBlog, updateBlog } = useAdmin();
  const [formData, setFormData] = useState({
    title: '',
    paragraph: '',
    image: '',
    imageData: null,
    author: {
      name: '',
      image: '',
      imageData: null,
      designation: 'Content Writer',
    },
    tags: [],
    publishDate: new Date().getFullYear().toString(),
    showOnHome: false,
    // SEO fields
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
  const [uploadingAuthor, setUploadingAuthor] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [authorImagePreview, setAuthorImagePreview] = useState('');

  const imageInputRef = useRef(null);
  const authorImageInputRef = useRef(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        paragraph: blog.paragraph || '',
        image: blog.image || '',
        imageData: null,
        author: {
          name: blog.author?.name || '',
          image: blog.author?.image || '',
          imageData: null,
          designation: blog.author?.designation || 'Content Writer',
        },
        tags: blog.tags || [],
        publishDate: blog.publishDate || new Date().getFullYear().toString(),
        showOnHome: blog.showOnHome || false,
        slug: blog.slug || '',
        seo: {
          title: blog.seo?.title || '',
          description: blog.seo?.description || '',
          keywords: blog.seo?.keywords || [],
          ogImage: blog.seo?.ogImage || '',
          canonicalUrl: blog.seo?.canonicalUrl || '',
          otherMetaTags: blog.seo?.otherMetaTags || '',
          noIndex: blog.seo?.noIndex || false,
          noFollow: blog.seo?.noFollow || false,
        },
      });
      setImagePreview(blog.image || '');
      setAuthorImagePreview(blog.author?.image || '');
    }
  }, [blog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAuthorChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      author: { ...prev.author, [name]: value }
    }));
  };

  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  // Handle featured image upload via backend (Cloudinary)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
      return;
    }

    setUploading(true);
    setErrors(prev => ({ ...prev, image: '' }));

    try {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // Upload via backend → Cloudinary
      const result = await uploadAPI.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        image: result.imageUrl,
        imageData: null
      }));
      setImagePreview(result.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
    }
    setUploading(false);
  };

  // Handle author image upload via backend (Cloudinary)
  const handleAuthorImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, authorImage: 'Please select an image file' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, authorImage: 'Image size should be less than 2MB' }));
      return;
    }

    setUploadingAuthor(true);
    setErrors(prev => ({ ...prev, authorImage: '' }));

    try {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setAuthorImagePreview(reader.result);
      reader.readAsDataURL(file);

      // Upload via backend → Cloudinary
      const result = await uploadAPI.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author,
          image: result.imageUrl,
          imageData: null
        }
      }));
      setAuthorImagePreview(result.imageUrl);
    } catch (error) {
      console.error('Author upload error:', error);
      setErrors(prev => ({ ...prev, authorImage: 'Failed to upload image' }));
    }
    setUploadingAuthor(false);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '', imageData: null }));
    setImagePreview('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeAuthorImage = () => {
    setFormData(prev => ({
      ...prev,
      author: { ...prev.author, image: '', imageData: null }
    }));
    setAuthorImagePreview('');
    if (authorImageInputRef.current) {
      authorImageInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.paragraph.trim()) newErrors.paragraph = 'Content is required';
    if (!formData.author.name.trim()) newErrors.authorName = 'Author name is required';
    if (!formData.image && !formData.imageData && !imagePreview) {
      newErrors.image = 'Featured image is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for submission
    const submitData = {
      title: formData.title,
      paragraph: formData.paragraph,
      image: formData.image || '',
      imageData: formData.imageData,
      author: {
        name: formData.author.name,
        image: formData.author.image || '',
        imageData: formData.author.imageData,
        designation: formData.author.designation,
      },
      tags: formData.tags,
      publishDate: formData.publishDate,
      showOnHome: formData.showOnHome,
      slug: formData.slug || undefined,
      seo: formData.seo,
    };

    // Remove null/empty imageData fields
    if (!submitData.imageData) delete submitData.imageData;
    if (!submitData.author.imageData) delete submitData.author.imageData;

    try {
      if (blog) {
        await updateBlog(blog.id, submitData);
      } else {
        await addBlog(submitData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save blog:', error);
      setErrors({ submit: 'Failed to save blog. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {blog ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter blog title..."
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Show on Home Page toggle */}
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-800">Show on Home Page</p>
              <p className="text-xs text-gray-500 mt-0.5">Feature this blog in the Blogs section on the homepage</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, showOnHome: !prev.showOnHome }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.showOnHome ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  formData.showOnHome ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Featured Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Featured Image *
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Featured preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <span className="ml-2 text-white">Uploading...</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-gray-600">Uploading image...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-600 font-medium">Click to upload featured image</span>
                    <span className="text-gray-400 text-sm">PNG, JPG up to 5MB</span>
                  </>
                )}
              </button>
            )}
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          {/* Content (Rich Text Editor) */}
          <div>
            <RichTextEditor
              label={<>Content <span className="text-red-500">*</span></>}
              value={formData.paragraph}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, paragraph: val }));
                if (errors.paragraph) setErrors(prev => ({ ...prev, paragraph: '' }));
              }}
              placeholder="Write your blog content..."
              minHeight="300px"
              note="NOTE: Don't copy content directly from word file or any website. Please copy in notepad and then paste."
            />
            {errors.paragraph && <p className="text-red-500 text-sm mt-1">{errors.paragraph}</p>}
          </div>

          {/* Author Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">Author Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Author Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.author.name}
                  onChange={handleAuthorChange}
                  className={`input-field ${errors.authorName ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
                {errors.authorName && <p className="text-red-500 text-sm mt-1">{errors.authorName}</p>}
              </div>

              {/* Author Designation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.author.designation}
                  onChange={handleAuthorChange}
                  className="input-field"
                  placeholder="Content Writer"
                />
              </div>
            </div>

            {/* Author Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author Image
              </label>
              <input
                ref={authorImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleAuthorImageUpload}
                className="hidden"
              />

              <div className="flex items-center gap-4">
                {authorImagePreview ? (
                  <div className="relative group">
                    <img
                      src={authorImagePreview}
                      alt="Author preview"
                      className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeAuthorImage}
                        className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    {uploadingAuthor && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => authorImageInputRef.current?.click()}
                    disabled={uploadingAuthor}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                  >
                    {uploadingAuthor ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  <p>Upload author photo</p>
                  <p className="text-xs">PNG, JPG up to 2MB</p>
                </div>
              </div>
              {errors.authorImage && <p className="text-red-500 text-sm mt-1">{errors.authorImage}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="input-field"
              placeholder="creative, design, technology"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publish Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Publish Year
            </label>
            <input
              type="text"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleChange}
              className="input-field"
              placeholder="2025"
            />
          </div>

          {/* SEO & Meta Tags */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-green-600" />
              SEO & Meta Tags
            </h3>

            {/* SEO URL / Slug */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-green-600" />
                  SEO URL
                </label>
                {formData.slug && (
                  <span className="text-xs text-green-600 font-mono">/blog/{formData.slug}</span>
                )}
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  setFormData(prev => ({ ...prev, slug: val }));
                }}
                className="input-field"
                placeholder="e.g., how-to-choose-custom-tshirts (auto-generated if empty)"
              />
              <p className="text-xs text-red-500 mt-1 font-medium">*Use only lowercase letters, numbers, and hyphens. Must be unique.</p>
            </div>

            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
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
                className="input-field"
                placeholder="Meta title for search engines"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Meta Tag Description</label>
                <span className={`text-xs ${(formData.seo.description?.length || 0) > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.seo.description?.length || 0}/160
                </span>
              </div>
              <textarea
                value={formData.seo.description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                maxLength={160}
                rows={2}
                className="input-field"
                placeholder="Meta description for search engines"
              />
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Tag Keywords</label>
              <input
                type="text"
                value={formData.seo.keywords?.join(', ') || ''}
                onChange={(e) => {
                  const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                  setFormData(prev => ({ ...prev, seo: { ...prev.seo, keywords } }));
                }}
                className="input-field"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={formData.seo.canonicalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } }))}
                  className="input-field"
                  placeholder="https://thecrosswild.com/blog/..."
                />
              </div>

              {/* OG Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">OG Image URL</label>
                <input
                  type="text"
                  value={formData.seo.ogImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogImage: e.target.value } }))}
                  className="input-field"
                  placeholder="Custom Open Graph image URL"
                />
              </div>
            </div>

            {/* Other Meta Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Other Meta Tags</label>
              <textarea
                value={formData.seo.otherMetaTags}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, otherMetaTags: e.target.value } }))}
                rows={2}
                className="input-field font-mono text-xs"
                placeholder='Custom meta tags, JSON-LD structured data, etc.'
              />
            </div>

            {/* Robot directives */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seo.noIndex}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, noIndex: e.target.checked } }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">No Index</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seo.noFollow}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, noFollow: e.target.checked } }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">No Follow</span>
              </label>
            </div>

            {/* SEO Preview */}
            {(formData.seo.title || formData.title) && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Google Preview</p>
                <p className="text-blue-700 text-base font-medium truncate">{formData.seo.title || formData.title}</p>
                <p className="text-green-700 text-xs truncate">thecrosswild.com/blog/{formData.slug || '...'}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{formData.seo.description || formData.paragraph?.substring(0, 160) || 'No description'}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={uploading || uploadingAuthor}
            >
              {uploading || uploadingAuthor ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                blog ? 'Update Blog' : 'Add Blog'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;
