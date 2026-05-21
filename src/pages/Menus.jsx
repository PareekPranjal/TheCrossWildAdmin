import React, { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { menusAPI } from '../services/api';

const MENU_KEYS = [
  { key: 'header-primary', label: 'Header — Primary' },
  { key: 'header-mobile', label: 'Header — Mobile' },
  { key: 'footer-services', label: 'Footer — Services' },
  { key: 'footer-quick-links', label: 'Footer — Quick Links' },
  { key: 'footer-bottom', label: 'Footer — Bottom' },
];

export default function Menus() {
  const [active, setActive] = useState(MENU_KEYS[0].key);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { load(active); }, [active]);

  const load = async (key) => {
    try {
      const res = await menusAPI.getByKey(key);
      setItems(res.menu?.items || []);
    } catch (err) {
      setItems([]);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await menusAPI.upsert({ key: active, items });
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage('Save failed');
    } finally { setSaving(false); }
  };

  const addItem = () => setItems([...items, { label: '', href: '', order: items.length, children: [] }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, key, value) => {
    const next = [...items]; next[i] = { ...next[i], [key]: value }; setItems(next);
  };
  const moveItem = (i, dir) => {
    const target = i + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[i], next[target]] = [next[target], next[i]];
    setItems(next);
  };
  const addChild = (i) => {
    const next = [...items]; next[i] = { ...next[i], children: [...(next[i].children || []), { label: '', href: '', order: (next[i].children?.length || 0) }] }; setItems(next);
  };
  const updateChild = (i, ci, key, value) => {
    const next = [...items];
    const kids = [...(next[i].children || [])];
    kids[ci] = { ...kids[ci], [key]: value };
    next[i] = { ...next[i], children: kids };
    setItems(next);
  };
  const removeChild = (i, ci) => {
    const next = [...items];
    next[i] = { ...next[i], children: (next[i].children || []).filter((_, idx) => idx !== ci) };
    setItems(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Menus</h1>
          <p className="text-gray-600 mt-1">Header and footer navigation</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>

      {message && <div className={`p-3 rounded ${message === 'Saved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}

      <div className="card">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 -mt-2 pb-2">
          {MENU_KEYS.map((m) => (
            <button key={m.key} onClick={() => setActive(m.key)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${active === m.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="pt-5 space-y-3">
          {items.length === 0 && <p className="text-gray-500 text-sm">No items yet — add one.</p>}
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <input value={item.label || ''}
                  onChange={(e) => updateItem(i, 'label', e.target.value)}
                  placeholder="Label" className="input-field col-span-4" />
                <input value={item.href || ''}
                  onChange={(e) => updateItem(i, 'href', e.target.value)}
                  placeholder="/path or https://…" className="input-field col-span-5" />
                <button type="button" onClick={() => moveItem(i, -1)} className="col-span-1 p-2 text-gray-500"><ChevronUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveItem(i, +1)} className="col-span-1 p-2 text-gray-500"><ChevronDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>

              {/* Children */}
              <div className="pl-6 space-y-2">
                {(item.children || []).map((c, ci) => (
                  <div key={ci} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-xs text-gray-400">↳</span>
                    <input value={c.label || ''} onChange={(e) => updateChild(i, ci, 'label', e.target.value)} placeholder="Sublabel" className="input-field col-span-4" />
                    <input value={c.href || ''} onChange={(e) => updateChild(i, ci, 'href', e.target.value)} placeholder="/path" className="input-field col-span-6" />
                    <button type="button" onClick={() => removeChild(i, ci)} className="col-span-1 text-red-500 p-2"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addChild(i)} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add sublink
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
