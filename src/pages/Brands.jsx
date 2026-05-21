import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, ExternalLink } from 'lucide-react';
import { brandsAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';

export default function Brands() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const res = await brandsAPI.getAll(); setItems(res.brands || []); }
    finally { setLoading(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    await brandsAPI.delete(id); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Brands</h1>
          <p className="text-gray-600 mt-1">Logos shown in the "Trusted By" marquee</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {loading ? <div className="card text-center text-gray-500">Loading…</div>
       : items.length === 0 ? <div className="card text-center text-gray-500">No brands yet.</div>
       : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((b) => (
            <div key={b._id} className="card space-y-3 text-center">
              <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
                {b.logoImage ? <img src={b.logoImage} alt={b.name} className="max-h-full max-w-full object-contain" /> : <span className="text-gray-300 text-xs">no logo</span>}
              </div>
              <div className="font-bold text-sm">{b.name}</div>
              {b.websiteUrl && <a href={b.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />Visit</a>}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button onClick={() => { setEditing(b); setModalOpen(true); }} className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1"><Edit className="w-3 h-3" />Edit</button>
                <button onClick={() => handleDelete(b._id)} className="flex-1 btn-danger text-xs flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <BrandModal brand={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}

function BrandModal({ brand, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: brand?.name || '',
    logoImage: brand?.logoImage || '',
    websiteUrl: brand?.websiteUrl || '',
    order: brand?.order ?? 0,
    isActive: brand?.isActive !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (brand?._id) await brandsAPI.update(brand._id, form);
      else await brandsAPI.create(form);
      onSaved();
    } catch (err) { setError(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{brand ? 'Edit Brand' : 'Add Brand'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          <ImageUploader label="Logo" value={form.logoImage} onChange={(url) => setForm({ ...form, logoImage: url })} height="h-32" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Brand Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL</label>
            <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="input-field" placeholder="https://…" />
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
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {brand ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
