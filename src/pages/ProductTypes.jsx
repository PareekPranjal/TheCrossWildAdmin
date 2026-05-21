import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, RefreshCw } from 'lucide-react';
import { productTypesAPI } from '../services/api';

const FIELD_TYPES = ['text', 'number', 'select', 'multiselect', 'boolean'];

export default function ProductTypes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const res = await productTypesAPI.getAll();
      setItems(res.productTypes || res.types || res.items || []);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product type?')) return;
    await productTypesAPI.delete(id);
    load();
  };

  const handleSeed = async () => {
    if (!window.confirm('Seed the default 12 product types? (idempotent — existing ones will be skipped)')) return;
    setSeeding(true);
    try { await productTypesAPI.seed(); load(); }
    finally { setSeeding(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Product Types</h1>
          <p className="text-gray-600 mt-1">Define dynamic detail-field schemas for products</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSeed} disabled={seeding} className="btn-secondary flex items-center gap-2">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Seed Defaults
          </button>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Type
          </button>
        </div>
      </div>

      {loading ? <div className="card text-center text-gray-500">Loading…</div>
       : items.length === 0 ? <div className="card text-center text-gray-500">No product types yet — click <strong>Seed Defaults</strong> or add one.</div>
       : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t._id} className="card space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{t.icon || '📦'}</span>
                <div className="flex-1">
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{t.slug}</div>
                </div>
              </div>
              <p className="text-xs text-gray-600">{t.description}</p>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div>Sizes: {t.hasSizes ? '✓' : '✗'} · Colors: {t.hasColors ? '✓' : '✗'}</div>
                <div>{t.detailFields?.length || 0} detail field(s)</div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button onClick={() => { setEditing(t); setModalOpen(true); }} className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"><Edit className="w-3.5 h-3.5" />Edit</button>
                <button onClick={() => handleDelete(t._id)} className="flex-1 btn-danger text-sm flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductTypeModal type={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}

function ProductTypeModal({ type, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: type?.name || '',
    icon: type?.icon || '📦',
    description: type?.description || '',
    hasSizes: type?.hasSizes !== false,
    hasColors: type?.hasColors !== false,
    customSizes: type?.customSizes || [],
    detailFields: type?.detailFields || [],
    isActive: type?.isActive !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (type?._id) await productTypesAPI.update(type._id, form);
      else await productTypesAPI.create(form);
      onSaved();
    } catch (err) { setError(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const addField = () => setForm({ ...form, detailFields: [...form.detailFields, { fieldName: '', fieldType: 'text', options: [], required: false, placeholder: '' }] });
  const updateField = (i, key, val) => {
    const next = [...form.detailFields]; next[i] = { ...next[i], [key]: val }; setForm({ ...form, detailFields: next });
  };
  const removeField = (i) => setForm({ ...form, detailFields: form.detailFields.filter((_, idx) => idx !== i) });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{type ? 'Edit Product Type' : 'Add Product Type'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field text-center text-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hasSizes} onChange={(e) => setForm({ ...form, hasSizes: e.target.checked })} />
              Has Sizes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hasColors} onChange={(e) => setForm({ ...form, hasColors: e.target.checked })} />
              Has Colors
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Sizes (comma-separated)</label>
            <input value={(form.customSizes || []).join(', ')}
              onChange={(e) => setForm({ ...form, customSizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="S, M, L, XL" className="input-field" />
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">Detail Fields</h3>
              <button type="button" onClick={addField} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add field</button>
            </div>
            <div className="space-y-3">
              {form.detailFields.map((f, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <input value={f.fieldName} onChange={(e) => updateField(i, 'fieldName', e.target.value)} placeholder="Field name" className="input-field col-span-5" />
                    <select value={f.fieldType} onChange={(e) => updateField(i, 'fieldType', e.target.value)} className="input-field col-span-3">
                      {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input value={f.placeholder || ''} onChange={(e) => updateField(i, 'placeholder', e.target.value)} placeholder="Placeholder" className="input-field col-span-3" />
                    <button type="button" onClick={() => removeField(i)} className="col-span-1 text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={f.required} onChange={(e) => updateField(i, 'required', e.target.checked)} />
                      Required
                    </label>
                    {(f.fieldType === 'select' || f.fieldType === 'multiselect') && (
                      <input
                        value={(f.options || []).join(', ')}
                        onChange={(e) => updateField(i, 'options', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                        placeholder="option1, option2, option3"
                        className="input-field flex-1 text-xs"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {type ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
