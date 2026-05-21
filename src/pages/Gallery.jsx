import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { galleryAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const res = await galleryAPI.getAll(); setItems(res.items || []); }
    finally { setLoading(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    await galleryAPI.delete(id); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gallery</h1>
          <p className="text-gray-600 mt-1">Images shown on the /image-gallery page</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {loading ? <div className="card text-center text-gray-500">Loading…</div>
       : items.length === 0 ? <div className="card text-center text-gray-500">No gallery images yet.</div>
       : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((g) => (
            <div key={g._id} className="card p-3 space-y-2">
              <div className="aspect-square rounded overflow-hidden bg-gray-100">
                <img src={g.image} alt={g.alt || g.title} className="w-full h-full object-cover" />
              </div>
              <div className="text-xs">
                <div className="font-bold truncate">{g.title || g.alt || 'Untitled'}</div>
                {g.category && <div className="text-gray-500">{g.category}</div>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(g); setModalOpen(true); }} className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1"><Edit className="w-3 h-3" /></button>
                <button onClick={() => handleDelete(g._id)} className="flex-1 btn-danger text-xs flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <GalleryModal item={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}

function GalleryModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    alt: item?.alt || '',
    image: item?.image || '',
    category: item?.category || '',
    order: item?.order ?? 0,
    isActive: item?.isActive !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.image) { setError('Image is required'); return; }
    setSaving(true); setError('');
    try {
      if (item?._id) await galleryAPI.update(item._id, form);
      else await galleryAPI.create(form);
      onSaved();
    } catch (err) { setError(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{item ? 'Edit Image' : 'Add Image'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          <ImageUploader label="Image *" value={form.image} onChange={(url) => setForm({ ...form, image: url })} height="h-48" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Alt Text</label>
            <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="tshirts / bags / etc" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="input-field" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
        </div>
        <div className="p-5 border-t border-gray-200 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
