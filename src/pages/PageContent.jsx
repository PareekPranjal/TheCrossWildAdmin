import React, { useState, useEffect, useRef } from 'react';
import {
  FileEdit, Save, ChevronDown, ChevronRight, Loader2,
  CheckCircle, AlertCircle, RefreshCw, Plus, Trash2,
  MoveUp, MoveDown, GripVertical, Upload, X, Image as ImageIcon,
} from 'lucide-react';
import { contentAPI, uploadAPI } from '../services/api';

// ─── Re-usable primitives ────────────────────────────────────────────────────

const Label = ({ name }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
    {name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
  </label>
);

const TextInput = ({ value, onChange, multiline = false }) =>
  multiline ? (
    <textarea
      rows={3}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
    />
  ) : (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );

/** Image upload + URL fallback */
const ImageUploadInput = ({ value, onChange }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      onChange(res.imageUrl || res.url || '');
    } catch {
      setError('Upload failed. Try again or paste a URL.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value ? (
        <div className="relative w-full max-w-xs h-28 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 group">
          <img src={value} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
          <ImageIcon className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 items-center flex-wrap">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60 shrink-0"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload Image'}
        </button>
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="or paste image URL…"
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

const SaveBar = ({ saving, msg, onSave }) => (
  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
    <button
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium disabled:opacity-60"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
    {msg && (
      <span className={`flex items-center gap-1 text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
        {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {msg.text}
      </span>
    )}
  </div>
);

// ─── Array editors ───────────────────────────────────────────────────────────

/** Simple string list (e.g. servicesList) */
const StringListEditor = ({ value = [], onChange }) => {
  const update = (i, val) => { const a = [...value]; a[i] = val; onChange(a); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, '']);
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={e => update(i, e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={() => remove(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline mt-1">
        <Plus className="w-4 h-4" /> Add item
      </button>
    </div>
  );
};

/** Feature / point list: [{title, description}] */
const FeatureListEditor = ({ value = [], onChange, extraField }) => {
  const update = (i, field, val) => { const a = [...value]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { title: '', description: '' }]);
  const move = (i, dir) => {
    const a = [...value];
    const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
            <div className="flex gap-1">
              <button onClick={() => move(i, -1)} className="p-1 hover:bg-gray-200 rounded" title="Move up"><MoveUp className="w-3.5 h-3.5 text-gray-500" /></button>
              <button onClick={() => move(i, 1)} className="p-1 hover:bg-gray-200 rounded" title="Move down"><MoveDown className="w-3.5 h-3.5 text-gray-500" /></button>
              <button onClick={() => remove(i)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
            </div>
          </div>
          <div className="space-y-2">
            {extraField && (
              <div>
                <Label name={extraField} />
                <TextInput value={item[extraField]} onChange={v => update(i, extraField, v)} />
              </div>
            )}
            <div>
              <Label name="title" />
              <TextInput value={item.title} onChange={v => update(i, 'title', v)} />
            </div>
            <div>
              <Label name="description" />
              <TextInput value={item.description} onChange={v => update(i, 'description', v)} multiline />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus className="w-4 h-4" /> Add item
      </button>
    </div>
  );
};

/** Slide list: [{src, alt}] */
const SlideListEditor = ({ value = [], onChange }) => {
  const update = (i, field, val) => { const a = [...value]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const a = [...value];
    const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  const add = () => onChange([...value, { src: '', alt: '' }]);
  return (
    <div className="space-y-3">
      {value.map((slide, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Slide #{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="p-1 hover:bg-gray-200 rounded"><MoveUp className="w-3.5 h-3.5 text-gray-500" /></button>
              <button type="button" onClick={() => move(i, 1)}  className="p-1 hover:bg-gray-200 rounded"><MoveDown className="w-3.5 h-3.5 text-gray-500" /></button>
              <button type="button" onClick={() => remove(i)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label name="Slide Image" />
              <ImageUploadInput value={slide.src} onChange={v => update(i, 'src', v)} />
            </div>
            <div>
              <Label name="Alt Text (for SEO)" />
              <TextInput value={slide.alt} onChange={v => update(i, 'alt', v)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus className="w-4 h-4" /> Add slide
      </button>
    </div>
  );
};

/** Office list: [{title, city, address, phone[], hours}] */
const OfficeListEditor = ({ value = [], onChange }) => {
  const update = (i, field, val) => { const a = [...value]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const updatePhone = (i, pi, val) => {
    const a = [...value];
    const phones = [...(a[i].phone || [])];
    phones[pi] = val;
    a[i] = { ...a[i], phone: phones };
    onChange(a);
  };
  const addPhone = (i) => {
    const a = [...value];
    a[i] = { ...a[i], phone: [...(a[i].phone || []), ''] };
    onChange(a);
  };
  const removePhone = (i, pi) => {
    const a = [...value];
    a[i] = { ...a[i], phone: (a[i].phone || []).filter((_, idx) => idx !== pi) };
    onChange(a);
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { title: '', city: '', address: '', phone: [''], hours: '' }]);

  return (
    <div className="space-y-4">
      {value.map((office, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex justify-between mb-3">
            <span className="font-semibold text-sm text-gray-700">{office.city || `Office #${i + 1}`}</span>
            <button onClick={() => remove(i)}><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label name="Office Title" /><TextInput value={office.title} onChange={v => update(i, 'title', v)} /></div>
            <div><Label name="City" /><TextInput value={office.city} onChange={v => update(i, 'city', v)} /></div>
            <div className="sm:col-span-2"><Label name="Address" /><TextInput value={office.address} onChange={v => update(i, 'address', v)} multiline /></div>
            <div><Label name="Business Hours" /><TextInput value={office.hours} onChange={v => update(i, 'hours', v)} /></div>
          </div>
          <div className="mt-3">
            <Label name="Phone Numbers" />
            {(office.phone || []).map((ph, pi) => (
              <div key={pi} className="flex gap-2 mb-2">
                <input type="text" value={ph} onChange={e => updatePhone(i, pi, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={() => removePhone(i, pi)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addPhone(i)} className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add phone
            </button>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus className="w-4 h-4" /> Add office
      </button>
    </div>
  );
};

/** Process steps: [{num, title, text, img, alt, icon}] */
const StepListEditor = ({ value = [], onChange }) => {
  const update = (i, field, val) => { const a = [...value]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const a = [...value];
    const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    // re-number
    a.forEach((s, idx) => { a[idx] = { ...s, num: idx + 1 }; });
    onChange(a);
  };
  const add = () => onChange([...value, { num: value.length + 1, title: '', text: '', img: '', alt: '', icon: 'Package' }]);

  return (
    <div className="space-y-4">
      {value.map((step, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{step.num}</span>
              <span className="font-semibold text-sm text-gray-700">{step.title || `Step ${step.num}`}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => move(i, -1)} className="p-1 hover:bg-gray-200 rounded"><MoveUp className="w-3.5 h-3.5 text-gray-500" /></button>
              <button onClick={() => move(i, 1)} className="p-1 hover:bg-gray-200 rounded"><MoveDown className="w-3.5 h-3.5 text-gray-500" /></button>
              <button onClick={() => remove(i)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label name="Step Title" /><TextInput value={step.title} onChange={v => update(i, 'title', v)} /></div>
            <div><Label name="Icon (Lucide name)" /><TextInput value={step.icon} onChange={v => update(i, 'icon', v)} /></div>
            <div className="sm:col-span-2">
              <Label name="Step Image" />
              <ImageUploadInput value={step.img} onChange={v => update(i, 'img', v)} />
            </div>
            <div><Label name="Image Alt Text" /><TextInput value={step.alt} onChange={v => update(i, 'alt', v)} /></div>
            <div className="sm:col-span-2"><Label name="Step Description" /><TextInput value={step.text} onChange={v => update(i, 'text', v)} multiline /></div>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus className="w-4 h-4" /> Add step
      </button>
    </div>
  );
};

// ─── Section config — maps each section to its field schema ─────────────────

const SECTION_SCHEMA = {
  'home/hero': {
    label: 'Hero Section',
    textFields: [
      { key: 'tagline', multiline: false },
      { key: 'h1', multiline: false },
      { key: 'h1Highlight', multiline: false },
      { key: 'h1Suffix', multiline: false },
      { key: 'description', multiline: true },
      { key: 'cta1Text', multiline: false },
      { key: 'cta1Url', multiline: false },
      { key: 'cta2Text', multiline: false },
      { key: 'cta2Url', multiline: false },
    ],
    arrays: [{ key: 'slides', type: 'slides', label: 'Hero Slides' }],
  },
  'home/trust': {
    label: 'Why Choose / Trust Section',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'subheading', multiline: true },
    ],
    arrays: [{ key: 'features', type: 'features', label: 'Feature Cards' }],
  },
  'home/promo-banner': {
    label: 'Promo Banner (Digital Printing / Brand Promotion)',
    textFields: [
      { key: 'image', type: 'image' },
      { key: 'alt', multiline: false },
      { key: 'linkUrl', multiline: false },
    ],
    arrays: [],
  },
  'home/why-choose': {
    label: 'Customize & Promote Section',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'description', multiline: true },
    ],
    arrays: [{ key: 'points', type: 'features', label: 'Key Points' }],
  },
  'about-us/banner': {
    label: 'Page Banner',
    textFields: [
      { key: 'image', type: 'image' },
      { key: 'title', multiline: false },
      { key: 'subtitle', multiline: false },
    ],
    arrays: [],
  },
  'about-us/intro': {
    label: 'Intro Section',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'paragraph', multiline: true },
      { key: 'paragraph2', multiline: true },
      { key: 'image', type: 'image' },
    ],
    arrays: [{ key: 'servicesList', type: 'strings', label: 'Services List' }],
  },
  'about-us/what-we-offer': {
    label: 'What We Offer',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'subheading', multiline: true },
    ],
    arrays: [{ key: 'items', type: 'features', label: 'Offer Items (title + description)' }],
  },
  'about-us/values': {
    label: 'Value to Customers',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'paragraph', multiline: true },
    ],
    arrays: [{ key: 'items', type: 'features', label: 'Value Items' }],
  },
  'about-us/why-choose-us': {
    label: 'Why Choose Us',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'subheading', multiline: true },
    ],
    arrays: [{ key: 'features', type: 'features', label: 'Feature Cards' }],
  },
  'about-us/founder': {
    label: 'Founder Section',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'name', multiline: false },
      { key: 'description', multiline: true },
      { key: 'image', type: 'image' },
    ],
    arrays: [],
  },
  'our-process/banner': {
    label: 'Page Banner',
    textFields: [
      { key: 'image', type: 'image' },
      { key: 'title', multiline: false },
      { key: 'subtitle', multiline: false },
    ],
    arrays: [],
  },
  'our-process/intro': {
    label: 'Page Intro',
    textFields: [
      { key: 'h1', multiline: false },
      { key: 'h2', multiline: false },
      { key: 'description', multiline: true },
    ],
    arrays: [],
  },
  'our-process/steps': {
    label: 'Process Steps',
    textFields: [],
    arrays: [{ key: 'steps', type: 'steps', label: 'Manufacturing Steps' }],
  },
  'contact-us/banner': {
    label: 'Page Banner',
    textFields: [
      { key: 'image', type: 'image' },
      { key: 'title', multiline: false },
      { key: 'subtitle', multiline: false },
    ],
    arrays: [],
  },
  'contact-us/info': {
    label: 'Contact Info',
    textFields: [
      { key: 'heading', multiline: false },
      { key: 'subheading', multiline: true },
      { key: 'email', multiline: false },
      { key: 'formHeading', multiline: false },
    ],
    arrays: [{ key: 'offices', type: 'offices', label: 'Office Locations' }],
  },
  'why-choose-us/banner': {
    label: 'Page Banner',
    textFields: [
      { key: 'image', type: 'image' },
      { key: 'title', multiline: false },
      { key: 'subtitle', multiline: false },
    ],
    arrays: [],
  },
  'why-choose-us/main': {
    label: 'Why Choose Us Page',
    textFields: [
      { key: 'h1', multiline: false },
      { key: 'heading', multiline: false },
      { key: 'description', multiline: true },
    ],
    arrays: [{ key: 'features', type: 'features', label: 'Feature Cards' }],
  },
};

// ─── Section editor ──────────────────────────────────────────────────────────

const SectionEditor = ({ pageSlug, sectionKey }) => {
  const schema = SECTION_SCHEMA[`${pageSlug}/${sectionKey}`];
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    contentAPI.getSection(pageSlug, sectionKey)
      .then(res => setData(res.data || {}))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, [open, pageSlug, sectionKey]);

  const setField = (field, val) => setData(prev => ({ ...prev, [field]: val }));

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await contentAPI.upsertSection(pageSlug, sectionKey, data);
      setMsg({ type: 'success', text: 'Saved!' });
    } catch {
      setMsg({ type: 'error', text: 'Save failed.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const renderArray = (arr) => {
    const current = data[arr.key] || [];
    const update = (val) => setField(arr.key, val);
    switch (arr.type) {
      case 'strings': return <StringListEditor value={current} onChange={update} />;
      case 'features': return <FeatureListEditor value={current} onChange={update} />;
      case 'slides': return <SlideListEditor value={current} onChange={update} />;
      case 'offices': return <OfficeListEditor value={current} onChange={update} />;
      case 'steps': return <StepListEditor value={current} onChange={update} />;
      default: return null;
    }
  };

  if (!schema) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <span className="font-medium text-gray-800 text-sm">{schema.label}</span>
        <span className="text-xs text-gray-400 mr-auto ml-3">
          {schema.textFields.length} text{schema.arrays.length ? ` + ${schema.arrays.map(a => a.label).join(', ')}` : ''}
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
      </button>

      {open && (
        <div className="p-4 bg-white space-y-5">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {/* Text / Image fields */}
              {schema.textFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schema.textFields.map(f => (
                    <div key={f.key} className={(f.multiline || f.type === 'image') ? 'sm:col-span-2' : ''}>
                      <Label name={f.key} />
                      {f.type === 'image' ? (
                        <ImageUploadInput value={data[f.key]} onChange={v => setField(f.key, v)} />
                      ) : (
                        <TextInput value={data[f.key]} onChange={v => setField(f.key, v)} multiline={f.multiline} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Array fields */}
              {schema.arrays.map(arr => (
                <div key={arr.key}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    {arr.label}
                  </h4>
                  {renderArray(arr)}
                </div>
              ))}

              <SaveBar saving={saving} msg={msg} onSave={handleSave} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Page config — grouped by footer tab ────────────────────────────────────

const TAB_PAGES = {
  home: [
    { slug: 'home', label: 'Home Page', sections: ['hero', 'promo-banner', 'trust', 'why-choose'] },
  ],
  quickLinks: [
    { slug: 'about-us',      label: 'About Us',       sections: ['banner', 'intro', 'what-we-offer', 'values', 'why-choose-us', 'founder'] },
    { slug: 'contact-us',    label: 'Contact Us',      sections: ['banner', 'info'] },
    { slug: 'why-choose-us', label: 'Why Choose Us',   sections: ['banner', 'main'] },
  ],
  services: [
    { slug: 'our-process', label: 'Our Process', sections: ['banner', 'intro', 'steps'] },
  ],
};

const PageBlock = ({ page }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileEdit className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-gray-900">{page.label}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {page.sections.length} section{page.sections.length !== 1 ? 's' : ''}
          </span>
        </div>
        {open ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mt-4 mb-4">
            Click a section to expand and edit. Changes go live within 60 seconds.
          </p>
          {page.sections.map(sk => (
            <SectionEditor key={sk} pageSlug={page.slug} sectionKey={sk} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'home',       label: 'Home' },
  { key: 'quickLinks', label: 'Quick Links Pages' },
  { key: 'services',   label: 'Services Pages' },
];

export default function PageContent() {
  const [activeTab, setActiveTab] = useState('home');
  const pages = TAB_PAGES[activeTab] || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Content</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Edit page text, banners, headings, lists, steps, and more. Changes go live in ~60 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shrink-0">
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          Live in ~60s
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {pages.map(page => (
        <PageBlock key={page.slug} page={page} />
      ))}

      {pages.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No pages configured for this tab yet.</p>
        </div>
      )}
    </div>
  );
}
