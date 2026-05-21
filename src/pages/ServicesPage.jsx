import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { serviceCardsAPI, contentAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';

export default function ServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Page-level content (intro + CTA) saved via PageContent
  const [intro, setIntro] = useState({ heading: '', paragraph: '', breadcrumbDescription: '' });
  const [cta, setCta] = useState({ heading: '', paragraph: '', buttonLabel: '', buttonHref: '' });
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaMessage, setMetaMessage] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const res = await serviceCardsAPI.getAll();
      setItems(res.items || []);
      try {
        const introRes = await contentAPI.getSection('services', 'intro');
        setIntro({ ...intro, ...(introRes.data || {}) });
      } catch (_) {}
      try {
        const ctaRes = await contentAPI.getSection('services', 'cta');
        setCta({ ...cta, ...(ctaRes.data || {}) });
      } catch (_) {}
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await serviceCardsAPI.delete(id); load();
  };

  const saveMeta = async () => {
    setSavingMeta(true);
    setMetaMessage('');
    try {
      await contentAPI.upsertSection('services', 'intro', intro);
      await contentAPI.upsertSection('services', 'cta', cta);
      setMetaMessage('Saved');
      setTimeout(() => setMetaMessage(''), 2500);
    } catch (err) {
      setMetaMessage('Save failed');
    } finally { setSavingMeta(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Services Page</h1>
          <p className="text-gray-600 mt-1">The 7 service cards on /services + intro + CTA</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Intro */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Page Intro</h2>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Breadcrumb Description</label>
          <input value={intro.breadcrumbDescription || ''} onChange={(e) => setIntro({ ...intro, breadcrumbDescription: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
          <input value={intro.heading || ''} onChange={(e) => setIntro({ ...intro, heading: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Paragraph</label>
          <textarea value={intro.paragraph || ''} onChange={(e) => setIntro({ ...intro, paragraph: e.target.value })} rows={3} className="input-field" />
        </div>

        <h2 className="text-lg font-bold text-gray-800 border-t pt-4">CTA</h2>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
          <input value={cta.heading || ''} onChange={(e) => setCta({ ...cta, heading: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Paragraph</label>
          <textarea value={cta.paragraph || ''} onChange={(e) => setCta({ ...cta, paragraph: e.target.value })} rows={2} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Button Label</label>
            <input value={cta.buttonLabel || ''} onChange={(e) => setCta({ ...cta, buttonLabel: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Button Href</label>
            <input value={cta.buttonHref || ''} onChange={(e) => setCta({ ...cta, buttonHref: e.target.value })} className="input-field" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveMeta} disabled={savingMeta} className="btn-primary flex items-center gap-2">
            {savingMeta && <Loader2 className="w-4 h-4 animate-spin" />} Save Intro & CTA
          </button>
          {metaMessage && <span className={`text-sm ${metaMessage === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{metaMessage}</span>}
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-800">Service Cards</h2>

      {loading ? <div className="card text-center text-gray-500">Loading…</div>
       : items.length === 0 ? <div className="card text-center text-gray-500">No services yet.</div>
       : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s._id} className="card flex items-start gap-4">
              <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden">
                {s.images?.[0]?.url && <img src={s.images[0].url} alt={s.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{s.title}</div>
                <div className="text-xs text-gray-500 font-mono">{s.slug}</div>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{s.intro}</p>
                <div className="text-xs text-gray-500 mt-1">{(s.features || []).join(' · ')}</div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => { setEditing(s); setModalOpen(true); }} className="btn-secondary text-xs flex items-center gap-1"><Edit className="w-3 h-3" />Edit</button>
                <button onClick={() => handleDelete(s._id)} className="btn-danger text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ServiceModal service={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}

function ServiceModal({ service, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: service?.title || '',
    slug: service?.slug || '',
    intro: service?.intro || '',
    features: service?.features || [],
    link: service?.link || '',
    images: service?.images || [{ url: '' }, { url: '' }, { url: '' }, { url: '' }],
    order: service?.order ?? 0,
    isActive: service?.isActive !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      // Filter empty image slots
      const payload = { ...form, images: form.images.filter((i) => i.url) };
      if (service?._id) await serviceCardsAPI.update(service._id, payload);
      else await serviceCardsAPI.create(payload);
      onSaved();
    } catch (err) { setError(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const setImage = (i, url) => {
    const next = [...form.images];
    while (next.length <= i) next.push({ url: '' });
    next[i] = { ...next[i], url };
    setForm({ ...form, images: next });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{service ? 'Edit Service' : 'Add Service'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (URL fragment)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if blank" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Intro</label>
            <textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} rows={3} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Features (comma-separated)</label>
            <input value={(form.features || []).join(', ')}
              onChange={(e) => setForm({ ...form, features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Link</label>
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/category/tshirts" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Images (4 recommended)</label>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <ImageUploader key={i} value={form.images[i]?.url || ''} onChange={(url) => setImage(i, url)} height="h-32" allowUrl />
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {service ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
