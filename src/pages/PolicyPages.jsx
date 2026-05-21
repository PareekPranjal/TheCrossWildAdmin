import React, { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { policyPagesAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';

const PAGE_OPTIONS = [
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'disclaimer', label: 'Disclaimer' },
  { slug: 'terms', label: 'Terms of Service' },
  { slug: 'cookies', label: 'Cookie Policy' },
];

export default function PolicyPages() {
  const [active, setActive] = useState('privacy-policy');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { load(active); }, [active]);

  const load = async (slug) => {
    try {
      const res = await policyPagesAPI.getBySlug(slug);
      setForm(res.page || { slug, title: '', metaTitle: '', metaDescription: '', intro: '', sections: [] });
    } catch (err) {
      setForm({ slug, title: '', metaTitle: '', metaDescription: '', intro: '', sections: [] });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await policyPagesAPI.upsert(form);
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const addSection = () => setForm({ ...form, sections: [...(form.sections || []), { heading: '', body: '', order: form.sections?.length || 0 }] });
  const updateSection = (i, key, val) => {
    const next = [...(form.sections || [])]; next[i] = { ...next[i], [key]: val }; setForm({ ...form, sections: next });
  };
  const removeSection = (i) => setForm({ ...form, sections: (form.sections || []).filter((_, idx) => idx !== i) });
  const moveSection = (i, dir) => {
    const target = i + dir;
    if (target < 0 || target >= (form.sections || []).length) return;
    const next = [...form.sections];
    [next[i], next[target]] = [next[target], next[i]];
    setForm({ ...form, sections: next });
  };

  if (!form) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Policy Pages</h1>
          <p className="text-gray-600 mt-1">Privacy, Disclaimer, Terms, Cookies</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>

      {message && <div className={`p-3 rounded ${message === 'Saved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}

      <div className="flex flex-wrap gap-2">
        {PAGE_OPTIONS.map((p) => (
          <button key={p.slug} onClick={() => setActive(p.slug)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${active === p.slug ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Page Title</label>
          <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Title</label>
          <input value={form.metaTitle || ''} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description</label>
          <textarea value={form.metaDescription || ''} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} className="input-field" />
        </div>
        <div>
          <RichTextEditor
            label="Intro (HTML)"
            value={form.intro || ''}
            onChange={(v) => setForm({ ...form, intro: v })}
            minHeight="120px"
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Sections</h3>
            <button type="button" onClick={addSection} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add section
            </button>
          </div>
          <div className="space-y-4">
            {(form.sections || []).map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Section #{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSection(i, -1)} className="p-1 text-gray-500"><ChevronUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveSection(i, +1)} className="p-1 text-gray-500"><ChevronDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => removeSection(i)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <input value={s.heading || ''} onChange={(e) => updateSection(i, 'heading', e.target.value)} placeholder="Section heading" className="input-field" />
                <RichTextEditor
                  value={s.body || ''}
                  onChange={(v) => updateSection(i, 'body', v)}
                  minHeight="160px"
                />
              </div>
            ))}
          </div>
        </div>

        {form.lastUpdated && (
          <p className="text-xs text-gray-500">Last updated: {new Date(form.lastUpdated).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
