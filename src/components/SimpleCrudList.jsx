import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import ImageUploader from './ImageUploader';

/**
 * Generic single-image, single-list CRUD page UI.
 *
 * Props:
 *   title       — page heading
 *   subtitle    — page subheading
 *   api         — { getAll, create, update, delete } that match makeCrudAPI
 *   itemsKey    — response field that contains the items array (default 'items')
 *   fields      — array of field definitions:
 *                   { key, label, type: 'text'|'textarea'|'number'|'boolean'|'image'|'list', placeholder?, required?, default? }
 *   renderCard  — function(item) → JSX for the card body
 *   pageSize    — optional; if set, paginates
 */
export default function SimpleCrudList({
  title,
  subtitle,
  api,
  itemsKey = 'items',
  fields,
  renderCard,
  imageCategory = 'general',
  embedded = false, // when true, don't render an outer heading (for use inside HomeContent)
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getAll();
      setItems(res[itemsKey] || res.items || []);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(id);
    load();
  };

  const reorder = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index], b = items[target];
    await Promise.all([
      api.update(a._id, { order: b.order ?? target }),
      api.update(b._id, { order: a.order ?? index }),
    ]);
    load();
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      )}
      {embedded && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{title}{subtitle && <span className="ml-2 text-xs font-normal text-gray-500">— {subtitle}</span>}</h2>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      )}

      {loading ? <div className={embedded ? 'text-sm text-gray-500' : 'card text-center text-gray-500'}>Loading…</div>
       : items.length === 0 ? <div className={embedded ? 'text-sm text-gray-400' : 'card text-center text-gray-500'}>No items yet.</div>
       : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={it._id} className="border border-gray-200 rounded-lg p-3 bg-white flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {renderCard ? renderCard(it) : <DefaultCard item={it} fields={fields} />}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => reorder(i, -1)} className="p-1 text-gray-400 hover:text-gray-700"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => reorder(i, +1)} className="p-1 text-gray-400 hover:text-gray-700"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => { setEditing(it); setModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(it._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CrudModal
          title={editing ? `Edit ${title}` : `New ${title}`}
          item={editing}
          fields={fields}
          api={api}
          imageCategory={imageCategory}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function DefaultCard({ item, fields }) {
  const titleField = fields.find((f) => f.key === 'title') || fields.find((f) => f.key === 'name') || fields[0];
  const imgKey = fields.find((f) => f.type === 'image')?.key;
  return (
    <div className="flex items-center gap-3 min-w-0">
      {imgKey && item[imgKey] && <img src={item[imgKey]} alt="" className="w-12 h-12 rounded object-cover" />}
      <div className="min-w-0">
        <div className="font-semibold truncate">{item[titleField.key]}</div>
        <div className="text-xs text-gray-500 truncate">
          {fields.filter((f) => f.key !== titleField.key && f.type !== 'image' && f.type !== 'list' && f.type !== 'boolean').slice(0, 2).map((f) => item[f.key]).filter(Boolean).join(' · ')}
        </div>
      </div>
    </div>
  );
}

function CrudModal({ title, item, fields, api, imageCategory, onClose, onSaved }) {
  const initial = {};
  fields.forEach((f) => {
    if (item) initial[f.key] = item[f.key] ?? (f.default ?? defaultForType(f.type));
    else initial[f.key] = f.default ?? defaultForType(f.type);
  });
  initial.isActive = item?.isActive ?? true;
  initial.order = item?.order ?? 0;

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm({ ...form, [k]: v });

  const save = async (e) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !form[f.key]) {
        setError(`${f.label} is required`);
        return;
      }
    }
    setSaving(true); setError('');
    try {
      if (item?._id) await api.update(item._id, form);
      else await api.create(form);
      onSaved();
    } catch (err) { setError(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          {fields.map((f) => (
            <FieldEditor key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} imageCategory={imageCategory} />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={(e) => set('order', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <label className="flex items-center gap-2 text-sm pt-7">
              <input type="checkbox" checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              Active
            </label>
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

function defaultForType(t) {
  switch (t) {
    case 'list': return [];
    case 'boolean': return false;
    case 'number': return 0;
    default: return '';
  }
}

function FieldEditor({ field, value, onChange, imageCategory }) {
  const { type, label, placeholder, required } = field;
  if (type === 'image') {
    return <ImageUploader label={label + (required ? ' *' : '')} value={value || ''} onChange={onChange} height="h-32" category={imageCategory} />;
  }
  if (type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}{required ? ' *' : ''}</label>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="input-field" />
      </div>
    );
  }
  if (type === 'number') {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}{required ? ' *' : ''}</label>
        <input type="number" value={value ?? 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="input-field" />
      </div>
    );
  }
  if (type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    );
  }
  if (type === 'list') {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}{required ? ' *' : ''}</label>
        <input value={(value || []).join(', ')}
          onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder={placeholder || 'Comma-separated'} className="input-field" />
        <p className="text-xs text-gray-500 mt-1">Separate items with commas</p>
      </div>
    );
  }
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}{required ? ' *' : ''}</label>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-field" />
    </div>
  );
}
