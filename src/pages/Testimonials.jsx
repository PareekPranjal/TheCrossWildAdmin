import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Star, X, Loader2 } from 'lucide-react';
import { testimonialsAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await testimonialsAPI.getAll();
      setItems(res.testimonials || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    await testimonialsAPI.delete(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage customer reviews shown on the homepage</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="card text-center text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card text-center text-gray-500">No testimonials yet — add your first one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t._id} className="card space-y-3">
              <div className="flex items-center gap-3">
                {t.image && <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />}
                <div className="flex-1">
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.designation}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{t.content}</p>
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button onClick={() => { setEditing(t); setModalOpen(true); }} className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(t._id)} className="flex-1 btn-danger text-sm flex items-center justify-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TestimonialModal
          testimonial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function TestimonialModal({ testimonial, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: testimonial?.name || '',
    designation: testimonial?.designation || '',
    content: testimonial?.content || '',
    image: testimonial?.image || '',
    rating: testimonial?.rating ?? 5,
    order: testimonial?.order ?? 0,
    isActive: testimonial?.isActive !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      setError('Name and content are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (testimonial?._id) {
        await testimonialsAPI.update(testimonial._id, form);
      } else {
        await testimonialsAPI.create(form);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{testimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          <ImageUploader label="Avatar" value={form.image} onChange={(url) => setForm({ ...form, image: url })} height="h-32" round />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
            <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="input-field" placeholder="Founder @ Company" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rating (0-5)</label>
              <input type="number" min={0} max={5} step={0.5} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (visible on site)
          </label>
        </div>
        <div className="p-5 border-t border-gray-200 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {testimonial ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
