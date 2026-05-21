import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { uploadAPI } from '../services/api';

/**
 * Reusable image uploader matching BlogModal's pattern.
 * - Shows local preview immediately, then uploads to Cloudinary via /api/upload.
 * - Calls `onChange(imageUrl)` once the upload completes.
 * - Allows pasting a URL as a fallback (no upload).
 *
 * Props:
 *   value         — current image URL (or empty)
 *   onChange(url) — fires whenever the URL changes (upload OR url paste OR delete)
 *   label         — label above the field
 *   maxSizeMb     — max file size, default 5
 *   height        — preview height class, default 'h-48'
 *   round         — render as circular avatar
 *   category      — Cloudinary folder (passed to upload endpoint)
 *   hint          — small text under the field
 *   allowUrl      — show the "or paste URL" input (default: true)
 */
export default function ImageUploader({
  value,
  onChange,
  label,
  maxSizeMb = 5,
  height = 'h-48',
  round = false,
  category = 'general',
  hint,
  allowUrl = true,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMb}MB`);
      return;
    }
    setError('');
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const result = await uploadAPI.uploadImage(file, category);
      onChange(result.imageUrl);
      setPreview(result.imageUrl);
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    onChange('');
    setPreview('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const shape = round ? 'rounded-full' : 'rounded-lg';

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {preview ? (
        <div className={`relative group ${round ? 'inline-block' : ''}`}>
          <img
            src={preview}
            alt="preview"
            className={`${round ? 'w-24 h-24' : `w-full ${height}`} object-cover border border-gray-200 ${shape}`}
          />
          <div className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity ${shape} flex items-center justify-center gap-3`}>
            <button type="button" onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-full hover:bg-gray-100">
              <Upload className="w-4 h-4 text-gray-700" />
            </button>
            <button type="button" onClick={clear}
              className="p-2 bg-red-500 rounded-full hover:bg-red-600">
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
          {uploading && (
            <div className={`absolute inset-0 bg-black/70 flex items-center justify-center ${shape}`}>
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full ${height} border-2 border-dashed border-gray-300 ${shape} hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-gray-600 text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <span className="text-gray-600 text-sm">Click to upload</span>
              <span className="text-gray-400 text-xs">PNG/JPG up to {maxSizeMb}MB</span>
            </>
          )}
        </button>
      )}

      {allowUrl && (
        <div className="mt-2">
          <input
            type="text"
            value={preview || ''}
            onChange={(e) => { onChange(e.target.value); setPreview(e.target.value); }}
            placeholder="Or paste image URL"
            className="input-field text-xs"
          />
        </div>
      )}

      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
