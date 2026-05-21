import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Tag } from 'lucide-react';
import { dealsAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';

export default function Deals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const res = await dealsAPI.getAll(); setItems(res.deals || []); }
    finally { setLoading(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    await dealsAPI.delete(id); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Deals</h1>
          <p className="text-gray-600 mt-1">Special offers shown in the homepage deals section</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {loading ? <div className="card text-center text-gray-500">Loading…</div>
       : items.length === 0 ? <div className="card text-center text-gray-500">No deals yet.</div>
       : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((d) => (
            <div key={d._id} className="card space-y-3">
              <div className="flex items-start justify-between">
                <Tag className="w-8 h-8 text-primary" />
                {d.badge && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{d.badge}</span>}
              </div>
              <h3 className="font-bold text-lg">{d.title}</h3>
              <div className="text-3xl font-black text-primary">{d.discountLabel}</div>
              <p className="text-sm text-gray-600">{d.description}</p>
              {d.link && <a href={d.link} className="text-xs text-blue-600 hover:underline break-all">{d.link}</a>}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button onClick={() => { setEditing(d); setModalOpen(true); }} className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"><Edit className="w-3.5 h-3.5" />Edit</button>
                <button onClick={() => handleDelete(d._id)} className="flex-1 btn-danger text-sm flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <DealModal deal={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}

function DealModal({ deal, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: deal?.title || '',
    discountLabel: deal?.discountLabel || '',
    description: deal?.description || '',
    badge: deal?.badge || '',
    link: deal?.link || '',
    image: deal?.image || '',
    startsAt: deal?.startsAt ? deal.startsAt.split('T')[0] : '',
    endsAt: deal?.endsAt ? deal.endsAt.split('T')[0] : '',
    order: deal?.order ?? 0,
    isActive: deal?.isActive !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.startsAt) delete payload.startsAt;
      if (!payload.endsAt) delete payload.endsAt;
      if (deal?._id) await dealsAPI.update(deal._id, payload);
      else await dealsAPI.create(payload);
      onSaved();
    } catch (err) { setError(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{deal ? 'Edit Deal' : 'Add Deal'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          <ImageUploader label="Image (optional)" value={form.image} onChange={(url) => setForm({ ...form, image: url })} height="h-32" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Label</label>
              <input value={form.discountLabel} onChange={(e) => setForm({ ...form, discountLabel: e.target.value })} placeholder="20% OFF" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
              <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Ending Soon" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Link</label>
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field" placeholder="/products/…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Starts At</label>
              <input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ends At</label>
              <input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="input-field" />
            </div>
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
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {deal ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
