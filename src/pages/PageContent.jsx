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

/** Product list: [{name, image, description, features[]}] */
const ProductListEditor = ({ value = [], onChange }) => {
  const update = (i, field, val) => { const a = [...value]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const a = [...value]; const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; onChange(a);
  };
  const updateFeature = (i, fi, val) => {
    const a = [...value]; const features = [...(a[i].features || [])];
    features[fi] = val; a[i] = { ...a[i], features }; onChange(a);
  };
  const addFeature = (i) => { const a = [...value]; a[i] = { ...a[i], features: [...(a[i].features || []), ''] }; onChange(a); };
  const removeFeature = (i, fi) => { const a = [...value]; a[i] = { ...a[i], features: (a[i].features || []).filter((_, idx) => idx !== fi) }; onChange(a); };
  const add = () => onChange([...value, { name: '', image: '', description: '', features: [] }]);

  return (
    <div className="space-y-4">
      {value.map((product, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-gray-700">{product.name || `Product #${i + 1}`}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="p-1 hover:bg-gray-200 rounded"><MoveUp className="w-3.5 h-3.5 text-gray-500" /></button>
              <button type="button" onClick={() => move(i, 1)} className="p-1 hover:bg-gray-200 rounded"><MoveDown className="w-3.5 h-3.5 text-gray-500" /></button>
              <button type="button" onClick={() => remove(i)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
            </div>
          </div>
          <div className="space-y-3">
            <div><Label name="Product Name" /><TextInput value={product.name} onChange={v => update(i, 'name', v)} /></div>
            <div><Label name="Product Image" /><ImageUploadInput value={product.image} onChange={v => update(i, 'image', v)} /></div>
            <div><Label name="Description" /><TextInput value={product.description} onChange={v => update(i, 'description', v)} multiline /></div>
            <div>
              <Label name="Feature Bullet Points (optional)" />
              <div className="space-y-2">
                {(product.features || []).map((f, fi) => (
                  <div key={fi} className="flex gap-2">
                    <input type="text" value={f} onChange={e => updateFeature(i, fi, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" onClick={() => removeFeature(i, fi)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addFeature(i)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Add feature
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus className="w-4 h-4" /> Add product
      </button>
    </div>
  );
};

/** Content sections: [{heading, subheading, body, bullets[]}] */
const ContentSectionListEditor = ({ value = [], onChange }) => {
  const update = (i, field, val) => { const a = [...value]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const a = [...value]; const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; onChange(a);
  };
  const updateBullet = (i, bi, val) => {
    const a = [...value]; const bullets = [...(a[i].bullets || [])];
    bullets[bi] = val; a[i] = { ...a[i], bullets }; onChange(a);
  };
  const addBullet = (i) => { const a = [...value]; a[i] = { ...a[i], bullets: [...(a[i].bullets || []), ''] }; onChange(a); };
  const removeBullet = (i, bi) => { const a = [...value]; a[i] = { ...a[i], bullets: (a[i].bullets || []).filter((_, idx) => idx !== bi) }; onChange(a); };
  const add = () => onChange([...value, { heading: '', subheading: '', body: '', bullets: [] }]);

  return (
    <div className="space-y-4">
      {value.map((section, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-gray-700">{section.heading || `Section #${i + 1}`}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="p-1 hover:bg-gray-200 rounded"><MoveUp className="w-3.5 h-3.5 text-gray-500" /></button>
              <button type="button" onClick={() => move(i, 1)} className="p-1 hover:bg-gray-200 rounded"><MoveDown className="w-3.5 h-3.5 text-gray-500" /></button>
              <button type="button" onClick={() => remove(i)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
            </div>
          </div>
          <div className="space-y-3">
            <div><Label name="Section Heading (H2)" /><TextInput value={section.heading} onChange={v => update(i, 'heading', v)} /></div>
            <div><Label name="Sub-heading / Italic Label (optional)" /><TextInput value={section.subheading} onChange={v => update(i, 'subheading', v)} /></div>
            <div>
              <Label name="Body Text — separate paragraphs with a blank line" />
              <textarea rows={5} value={section.body || ''} onChange={e => update(i, 'body', e.target.value)}
                placeholder={"Paragraph one.\n\nParagraph two."}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-vertical" />
            </div>
            <div>
              <Label name="Bullet Points (optional)" />
              <div className="space-y-2">
                {(section.bullets || []).map((b, bi) => (
                  <div key={bi} className="flex gap-2">
                    <input type="text" value={b} onChange={e => updateBullet(i, bi, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" onClick={() => removeBullet(i, bi)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addBullet(i)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Add bullet
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus className="w-4 h-4" /> Add section
      </button>
    </div>
  );
};

// ─── Service page defaults (pre-fill admin when DB has no saved data) ────────

const SERVICE_DEFAULTS = {
  'customize-promotional-t-shirt-manufacturer-in-Jaipur': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/ed3730d3c937c8abfc9cb55772e0de8a.jpg', title: 'Custom T-shirt Manufacturer in Jaipur', subtitle: 'Polo, Round Neck, V-Neck & Dry Fit T-shirts — Bulk printing from ₹70/piece' },
    seo: { title: 'Customize, Promotional T-shirt Manufacturer and Printing in Jaipur-TheCrosswild', description: 'The crosswild is the reputed & leading firm in the field of manufacturer & printing of all types of customize, promotional T-shirts in Jaipur for more info call 9529626262', keywords: 't-shirt manufacturer in jaipur, t-shirt printing in Jaipur, t-shirt printer in jaipur, customize t-shirt in jaipur, promotional t-shirt in jaipur, tshirt manufacturing company in jaipur, t-shirts at a wholesale price, bulk t-shirt manufacturing' },
    products: { items: [
      { name: 'Polo T-Shirt', image: 'https://www.thecrosswild.com/products_image/0c06d108827197660b14472a650fc036.jpg', description: 'The Cross Wild manufactures high quality Polo T-shirts in various styles, colors and sizes as per the requirements of the clients. We guarantee that your custom polo shirt will be completed on time every time.', features: [] },
      { name: 'Round Neck T-shirt', image: 'https://www.thecrosswild.com/products_image/29789ee9122312588a1facf5f9bdc7dd.jpg', description: 'Round neck t-shirts are perfect for both men and women. These t-shirts are comfortable and softer than you can imagine. The round neck looks even better with a custom design on it. Book one for yourself or your loved ones today!', features: [] },
      { name: 'Customised T-shirt', image: 'https://www.thecrosswild.com/products_image/68b8fbc7dfab9d830a9e38d62f2502ac.jpg', description: 'Customized products are the best creative gifts for lovely people and workplace employee. Custom printing offers more choices of products which can.', features: [] },
      { name: 'Dry Fit Sports T-shirt', image: 'https://www.thecrosswild.com/products_image/f5528e5386c99cd334f4dab763edbd92.jpg', description: 'Get the best quality Drift T-shirts & promotional t-shirts for events & sports from best T-shirt manufacturers in Jaipur. Polyester T-shirts that come with various knit types will suit an array of design and prints on it. Due to its less water retaining properties and skin fit aesthetics, Drift T-shirts make more sense for sports & marathon events.', features: [] },
      { name: 'Promotional T-shirt', image: 'https://www.thecrosswild.com/products_image/eb0859ce28338b9620490c7a94eb31b1.jpg', description: 'The Cross Wild provide the Promotional T-shirt In Jaipur. We provide you with the most fashionable and attractive design in a T-shirt. All our t-shirts are intended for cooling friends who take the utmost care in selecting the best designs to wear. Give a Fresh & Elegant Look Through the Day and did not shrink a bit.', features: ['Soft Sleeves', 'Perfect fitting on the body', 'Umbro Design', '100% Cotton'] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Custom T-shirt Manufacturer in Jaipur', subheading: '', body: 'Nowadays, both casual and formal t-shirts are forcing businesses to think beyond the other clothing options. Customized products are doing well for this generation, and so are our amazing products. We as a reputed custom t-shirt manufacturers in Jaipur guarantee high quality fabric and maximum thread. Our t-shirt range starts at Rs. 70 per piece.', bullets: [] },
        { heading: 'Polo, Round, V-neck Promotional T-shirt Printing in Jaipur', subheading: '', body: 'Manufacturing of t-shirts is one of the functions of this organization. Being a t-shirt printing company in Jaipur, the CrossWild also provides delivery facility outside the city.\n\nKeeping in mind concept designing, we not only understand the need of the customer but also design it. Our brand is unmatched in converting those designs into quality printing. Promotional t-shirt printing in Jaipur is common, but Cross Wild is exceptional. This is due to the experience of their staff and the quality of the printing tools used. We are here to provide you with the best trends available in terms of polo, round, V-neck, dry fit sports t-shirts.', bullets: [] },
      ],
      afterSections: [
        { heading: 'Customized Bulk T-shirt Printing in India | Corporate T-shirts Manufacturer', subheading: '', body: 'The CrossWild has a wide range of excellent quality corporate t-shirts. One can easily fulfill their need of custom t-shirt printing for promotional purposes with us. With the best quality and prices, we believe in customer satisfaction and mutual respect.\n\nWe also provide customized T-shirt printing on bulk orders in India. One of the main goals of this organization is to build trust among the customers and provide them standard products at reasonable prices. Many corporate startups consider promotional products to gain a better customer base. Our expert team can design custom T-shirt printing on bulk orders for all types of sports events, yoga, cricket tournaments, professional and personal events.', bullets: [] },
        { heading: 'Why Cross Wild for Customize T-shirts', subheading: '', body: '', bullets: ['Elegant and Classic Colors', 'Skin Friendly Fabric', 'Exclusive Designs', 'Perfect Fit to Body'] },
      ],
    },
  },
  'sweatshirt-hoodie-manufacturer-in-Jaipur': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/6475bbd0fc62eef7a6bb1b793933e830.jpg', title: 'Custom Sweatshirt & Hoodie Manufacturer in Jaipur', subtitle: 'Premium sweatshirts, hoodies, sweaters & tracksuits — bulk orders for corporates & groups' },
    seo: { title: 'Best Sweatshirt, Hoodie Manufacturer and Printer in Jaipur', description: 'The crosswild are recognized as the foremost Manufacturer and designing of a wide range of sweatshirt and hoodie in Jaipur at best price. Call 9571815050', keywords: 'sweatshirt manufacturer in Jaipur, hoodie manufacturer in Jaipur, sweatshirt printer in Jaipur' },
    products: { items: [
      { name: 'Sweatshirt', image: 'https://www.thecrosswild.com/products_image/564e4a74f39c30ede3ea2f262debe4a4.jpg', description: 'We are Men Sweatshirt Wholesalers, Suppliers and Manufacturing Company in Jaipur, India. Our company manufacture Sweatshirt for Men in various styles, designs, colours, prints, embroidery and sizes.\n\nWe are Sweatshirt export company, offering an exotic collection of Men Sweatshirt that are manufactured using only best quality fabrics that add exceptionally comfortable feel.', features: [] },
      { name: 'Hoodies', image: 'https://www.thecrosswild.com/products_image/98475159d591ffdc68f5ed05821be0e9.jpg', description: 'We are the manufacture of different types of Hoodies.', features: [] },
      { name: 'Sweaters', image: 'https://www.thecrosswild.com/products_image/ec96c104e6f55f8814b9071a92156210.jpg', description: 'We manufacturer the stylish and fashionable Sweaters.', features: [] },
      { name: 'Tracksuit', image: 'https://www.thecrosswild.com/products_image/5e582bc24b0af8858daeaa4c41d4febf.jpg', description: 'We are manufacturer of wide variety of Tracksuits with stylish and trend fashion designs and prints.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Custom Sweatshirt & Hoodie Manufacturer in Jaipur', subheading: '', body: 'Being the prime sweatshirt printer in Jaipur, our catalogues speak our caliber. Our custom and personalized woolens with soft fabric will give you added comfort, while the top stitching will make it a durable choice for the fall. Stay warm as you brave the elements with our exclusive range of breathable and wind-resistant sweatshirts and hoodies. Trusted by a lot of corporates, companies, groups, and shops across Jaipur and beyond; our bespoke quality will leave you astonished.\n\nThe CrossWild massive design gallery has just about every idea you could imagine. With a wide range of sweater options, why settle for a basic one in winter? With a variety of materials, colors, and sizes, the Cross Wild offers an endless array of customized sweatshirts and woolens.', bullets: [] },
      ],
      afterSections: [
        { heading: 'Promotional & Customized Sweatshirt Manufacturing Company in Jaipur', subheading: '', body: 'Since we keep customers as our first priority, we are committed to making their experience as smooth and as convenient as possible. The entire process of purchase, delivery, and payment is customer-friendly with a focus on fast delivery and smooth payment options. All this has collectively made The Cross Wild a decent shopping hub.', bullets: [] },
      ],
    },
  },
  'school-laptop-bag-manufacturer-in-Jaipur': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/1cf6d53e65f3078d8a0cfba336955713.jpg', title: 'Bag Manufacturer in Jaipur', subtitle: 'School, Laptop, Corporate, Food Delivery & Gym Bags — bulk manufacturing at best prices' },
    seo: { title: 'Best Food Delivery, School, Office Bags Manufacturer in Jaipur - The CrossWild', description: 'The Crosswild is the largest bag manufacturer in Jaipur. We specialize in manufacturing school, laptop, corporate, food delivery backpacks/bags etc. at the best price. Call 9571815050.', keywords: 'bag manufacturer in Jaipur, food delivery bags, bags supplier in jaipur, bag manufacturing company in Jaipur' },
    products: { items: [
      { name: 'Bag Pack', image: 'https://www.thecrosswild.com/products_image/a9605470f8ab81052d979aaf10cbfcd1.jpg', description: "Backpacks are perfect for those times when you've got the world to carry on your back, literally. Indeed, backpacks are your all-time friend, especially when you can't just organise the load properly. We have a huge variety of backpacks in different sizes, colour, and fabric, with which you can blow someone else's mind. The bags are durable and stylish at the same time, giving you the much-required relief in carrying things.", features: [] },
      { name: 'School Bag', image: 'https://www.thecrosswild.com/products_image/7ce7854d3bdabdb70d535cc6635b8a1e.jpg', description: 'Bright, colourful, and functional; the CrossWild offer school bags for boys and girls of all ages. Choose from the collection of school bags with name, custom prints, designs and patterns.', features: ['Attractive backpack', 'Fine raw-Material', 'Separate space for notebook and books.'] },
      { name: 'Laptop Bag', image: 'https://www.thecrosswild.com/products_image/909a8a47ec773aab30a62f4842e7ece6.jpg', description: 'In Jaipur, Crosswild is one of the top Laptop Bag manufacturers providing Laptop bags in various shapes and sizes. The bags come with an easy-to-carry, durable strap with multiple folds. Designed to protect your laptop tablet, we have the most stylish and affordable options for you.', features: [] },
      { name: 'Food Delivery Bags', image: 'https://www.thecrosswild.com/products_image/64967665b8a0a42eeff038a1a4da662b.jpg', description: "We help provide you with consistency. When you want to keep food, grocery, and e-commerce packages safe during delivery, there's really no other option. Invest in a quality delivery bag from The Cross Wild - A Bags manufacturer and make sure every customer can appreciate the delicious, safe, fresh packages with every order.", features: [] },
      { name: 'eCommerce Delivery Bags', image: 'https://www.thecrosswild.com/products_image/9ce74d413be46ea047b680b65e5c7aa6.jpg', description: 'We manufacture premium quality Ecommerce Delivery Bags, our products are quality tested. We build quality and robustness.', features: ['Our bags are waterproof.', 'Velcro strips to secure the flap.', 'Two-way industrial zippers and reinforced stitching.', 'Removable silver reflective lining.', 'Hardboard internal dividers.'] },
      { name: 'Office Bag', image: 'https://www.thecrosswild.com/products_image/592988b5cab7ffe3bee30ea74ab70a76.jpg', description: 'Set a professional image by carrying a stylish office bag to the office. The Cross Wild offers an endless array of office bags with multiple zip closures to keep important items and documents organized. We also customize the bags as per the demands of our customers.', features: [] },
      { name: 'Travel Bag', image: 'https://www.thecrosswild.com/products_image/0b8beb77484360b93d7dbc3b66271df8.jpg', description: 'From practical backpacks for your daily commute to wheeled backpacks for traveling, we have something for every need and occasion. Besides, you can also get your colleagues and customers to carry your logo with custom travel bags.', features: [] },
      { name: 'Corporate Bags', image: 'https://www.thecrosswild.com/products_image/434c37ef79b102bd5c2e64df74df0828.jpg', description: 'The Crosswild has also recently become a top corporate bag manufacturer in Jaipur. Designed to offer better personalization, the corporate bags are available at highly competitive prices. We also have ready stock of bags in the city, get it when you need it.', features: [] },
      { name: 'Gym Bag', image: 'https://www.thecrosswild.com/products_image/3512feaa31d0cd1cfe05786b57553eca.jpg', description: 'Highly practical and suitable for gym and trips, our gym bags gives you and your brand the right exposure. We boast of ourselves as the leading gym bag manufacturer in Jaipur for providing the highest quality, durable gym bags.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Bag Manufacturer in Jaipur', subheading: '', body: "In today's era, the trend of bags is considered a solid basis to judge the level of any person. With the growing fashion, bags are now considered as a part of clothing. The CrossWild is a designing and printing-based best bag manufacturer in Jaipur. We also offer our own designs and custom. Bags are one of the most useful products manufactured by this organization.", bullets: [] },
      ],
      afterSections: [],
    },
  },
  'cap-printing-manufacturer-in-jaipur': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/a1770d345abcda021af21af6ba5638e2.jpg', title: 'Cap Printing & Manufacturing in Jaipur', subtitle: 'Corporate, Sports, Tourist & Plain Caps — customized bulk orders at minimum price' },
    seo: { title: 'Caps Printing, Manufacturer in Jaipur, India | Customized & Promotional Caps -The CrossWild', description: 'The CrossWild is well reputed customized & promotional caps printing & printing manufacturer in Jaipur, India. We are manufacturer of corporate, sports, tourist caps call +91-9529626262.', keywords: 'cap printing in jaipur, cap manufacturer in jaipur, customized caps, promotional caps' },
    products: { items: [
      { name: 'Corporate Cap', image: 'https://www.thecrosswild.com/products_image/3a24a9801ed1dbdd1b4bf5d5d911eda2.jpg', description: 'We are Manufacturer & Suppliers of the Customize Corporate Cap in Jaipur. The Crosswild have a wide collection of Corporate Cap in different colours, sizes and price. Our Professional Team can design Customized Corporate Cap according to your requirement.', features: ['Best-Quality', 'Premium Customization', 'Minimum Price', 'Adjustable self-material strap'] },
      { name: 'Sports Cap', image: 'https://www.thecrosswild.com/products_image/ac448874f5641fe053e423a219cd4ce0.jpg', description: 'We are manufacturer and suppliers of the Sports Cap in Jaipur. The Crosswild offer a wide range of Sports Cap with various designs, patterns and colour combination. Our Sports Cap are known for their long lasting and cost effective features. Design your Brand Logo, Team Name on the Cap. We customized the Sports Cap according to your requirement.', features: ['Best-Quality', 'Premium Customization', 'Minimum Price', 'Adjustable self-material strap'] },
      { name: 'Tourist Cap', image: 'https://www.thecrosswild.com/products_image/cd1ffc6104e185ecb2dfefd56ee0eb66.jpg', description: 'we are counted as a leading Manufacturer Tourist Cap in Jaipur. we have a huge collection of Tourist Cap with variety patterns, size and colour combination. Our designs and manufacturer high-quality Tourist Cap are delivered at the best affordable price. We customize the Tourist Cap with your current requirement.', features: [] },
      { name: 'Plain Cap', image: 'https://www.thecrosswild.com/products_image/eacd5a023684aca00f9c8450c970c904.jpg', description: 'The Crosswild manufacturer of highly fashionable Plain Cap in Jaipur. Our Caps are high on demand, due to their best quality. These Plain Cap help to keep you dry during playing and exercise as well as jogging. We have a wide collection of Plain Cap with different colours, patterns and size. We can provide Plain Cap according to your requirement.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Promotional Customized Cap Printing & Manufacturing Company in Jaipur, India — The Cross Wild', subheading: '', body: "There doesn't seem to be much order when it comes to accessorizing your outfit. Hats and caps have become major accessories and items that people not only use in the sun but also use to enhance their looks. When these caps are customized, they add yet another charm to the look.\n\nIf you are also looking for caps, we are here to help you. We are a pioneer in providing Customized Cap Printing in Jaipur. With years of experience in designing customized caps, we take pride in offering personalized caps for every occasion and purpose.\n\nYou can choose from many different caps and hats, which vary in model type, color, size, and pattern. The Cross Wild a leading cap manufacturer in Jaipur ensures that the caps are of the highest quality and fit snugly on the wearer.", bullets: [] },
      ],
      afterSections: [
        { heading: 'Various Types of Caps We Manufacture and Print', subheading: '', body: 'The use of ultra-modern equipment ensures that your hat is embroidered or printed to the highest standard. Whether you want embroidery or plain text, we promise to meet your every wish. We have all the resources available to you to quickly create your unique cap. This means that personalized tactile caps are delivered in almost the same way as our simple and plain caps.', bullets: [] },
      ],
    },
  },
  'mug-printing-in-Jaipur': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/b1510016f57c92271cac5515176a700e.jpg', title: 'Personalized Custom Mug Printing in Jaipur', subtitle: 'Promotional, corporate, coffee & customized mugs — bulk orders at best price' },
    seo: { title: 'Personalized Custom Mug Printing in Jaipur, India -The Crosswild', description: 'The Crosswild is one of the leading firm providing mug printing services and all types of personalized custom mug printing at best price in Jaipur. For more details call on +91-9529626262', keywords: 'mug printing in jaipur, mug printer in jaipur, custom mug printing service' },
    products: { items: [
      { name: 'Promotional Mug', image: 'https://www.thecrosswild.com/products_image/f59a0b7a5ea4504fa3b3bb09f753af1a.jpg', description: "Promote your Brand with every sip with The Cross Wild Promotional Mug. We are the manufacturer of the Customize Promotional Mug in Jaipur. The Cross Wild have a variety of promotional mug in different designs, shape, and rate. Our qualified team can make Customized Promotional mugs according to clients' needs.", features: [] },
      { name: 'Printed/Customised Mug', image: 'https://www.thecrosswild.com/products_image/cf74faf07125a982b5aaf25d33a9f9c9.jpg', description: 'We are a manufacturer and supplier of Printed and Customized Mugs in Jaipur. The Crosswild offer a wide range of Printed and Customized Mug with various designs, patterns, and color combination. Design your Picture, Brand Logo, and Name on the Mug. We design and customize Mug according to your requirement.', features: [] },
      { name: 'Coffee Mug', image: 'https://www.thecrosswild.com/products_image/83cde8baeac2b07d58ccbc805f16ee53.jpg', description: 'The Crosswild are manufacturer of customized coffee mugs in Jaipur. We have many varieties of coffee mugs with separate style patterns, sizes, and color combinations. our features service and high-quality we are delivered customize coffee at the best price. we customize the coffee cup to your needs.', features: [] },
      { name: 'Corporate Mug', image: 'https://www.thecrosswild.com/products_image/bdff08bbc4cc26f26aa9ff8f1918ef0d.jpg', description: 'We are the leading all types of mug manufacturers in Jaipur, India. We make a premium quality ceramic mug. If you want to make your corporate mugs in bulk quantities then you can contact us and get free quotes.', features: [] },
      { name: 'Plain Mug', image: 'https://www.thecrosswild.com/products_image/7f1647eee1a016d84f75ad7c00c4cc64.jpg', description: 'Enjoy a cup of your favorite morning brew with one of our Customize Plain mugs. The Crosswild is the best manufacturer and supplier of Customize Plain Mug in Jaipur. Contact us if you want to buy and get a free quote for bulk orders.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Personalized Custom Mug Printing in Jaipur — The Cross Wild', subheading: '', body: 'Most people start their day with morning tea, but many love to drink tea in their favorite mug. One of the biggest benefits of drinking coffee or tea in a mug is that it keeps your drink warm and gives you the energy to work all day and night. A beautifully printed coffee mug does not only add beauty to the office or home space but it can be used as both a paperweight and holder.\n\nSo, if you are planning to get a customized Mug for a loved one or for your office then we are helping you with this. We hold expertise in mug printing in Jaipur and can print any logo, photos, or design on the mug.', bullets: [] },
      ],
      afterSections: [
        { heading: 'What are we specialized in Mug Printing?', subheading: '', body: '', bullets: ['From promotional mugs to corporate mugs and even plain mugs we can provide our clients with every type of mug they want.', "We at The Cross Wild can print inspirational quotes also as per the client's requirements of our clients. In fact, it is a perfect option if looking to gift something to employees. With our high-quality printing technology, we will make your creation definitely look great and worth it.", "We can even get it printed in whichever color you want whether raw, solid, neon, or pale. At The Cross Wild, we help our clients in each possible way, and with organized catalog customers will be able to choose the mug they are looking for in an easy and time-saving way.", 'All mugs define the style statement and each piece is of premium and best quality. We have a team of professionals who work effectively and make sure that printing is done within time and parcels are delivered timely.', "The thing that makes us stand out in today's competitive market is that we pay attention to what the customer wants."] },
      ],
    },
  },
  'printing': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/a1829511fa2ebde94dbdd9c7699e550c.jpg', title: 'Digital, Rubber & Screen Printing in Jaipur', subtitle: 'Digital, screen, sublimation & rubber printing on t-shirts, bags, mugs & more' },
    seo: { title: 'Digital, Rubber, Screen Printing Services in Jaipur, India - The Cross Wild', description: 'Cross Wild is a leading commercial printing service provider company in Jaipur, India, specializing in digital, screen, and rubber printing on t-shirts at the best prices.', keywords: 'digital printing in jaipur, screen printing in jaipur, rubber printing in jaipur' },
    products: { items: [
      { name: 'Digital Printing', image: 'https://www.thecrosswild.com/products_image/eb85bc3c535700dfb594d1d6751244ac.jpg', description: 'The Cross Wild is the Best Manufacturer of Digital Printing in Jaipur. We provide the best quality t-shirts, bags, mugs, and sweatshirts with Custom Digital Printing. Our Team will take. Contact us if you want to buy and get a free quote for bulk orders.', features: [] },
      { name: 'Screen Printing', image: 'https://www.thecrosswild.com/products_image/a34823c6ca08d69011b704e0e9551548.jpg', description: 'The Crosswild is the best manufacturer of Screen Printing in Jaipur. We perform premium quality screen printing services on T-shirts, Mugs, Hoodies, and other promotional products. Contact us to get a free quote.', features: [] },
      { name: 'Sublimation Printing', image: 'https://www.thecrosswild.com/products_image/4c2c70e121e7476fa095c187b6ab2a2e.jpg', description: 'Sublimation Printing - This printing technology is used for printing on various media. One such carrier is a cloth. The most common dye-sublimation printing on T-shirts, shirts, and sweatshirts. Such clothes can be washed, ironed, and even bleached. Sublimation printing on fabric is a transfer image that is printed on fabric on a wide printer, in which the image is bright, saturated, and stable.', features: [] },
      { name: 'Rubber Printing', image: 'https://www.thecrosswild.com/products_image/68ee7632b4a386af593eafa8458d17b8.jpg', description: 'Rubber Printing - We are a professional manufacturer of rubber printing squeegee blades, we export our squeegee for more than 7 years.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Digital, Rubber Printing on T-shirt | Commercial Printing Company in Jaipur', subheading: '', body: 'We are the largest commercial printing company in Jaipur, specializing in t-shirt printing methods like digital, rubber, screen, sublimation, etc.', bullets: [] },
      ],
      afterSections: [],
    },
  },
  'sanitizer-and-infrared-thermometer-wholesaler-jaipur': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/8b29d382d7a8727aaa07a5c7755ec46b.jpg', title: 'Sanitizer & Infrared Thermometer Wholesaler Jaipur', subtitle: 'Hand sanitizer & infrared thermometer manufacturer & wholesaler in Jaipur, Rajasthan' },
    seo: { title: 'Hand Sanitizer, Infrared Thermometer Manufacturer Wholesale in Jaipur, Rajasthan - The Crosswild', description: 'We are Hand Sanitizer and Infrared Thermometer Manufacturer and Wholesaler in Jaipur Rajasthan. Get the Best Deal on Sanitizer and Infrared Thermometer. Call us for free quote.', keywords: 'hand sanitizer manufacturer in rajasthan, infrared thermometer wholesaler in jaipur' },
    products: { items: [
      { name: 'Infrared Thermometer', image: 'https://www.thecrosswild.com/products_image/5da4f9acc5fc11aa068ceffe79add3b8.jpg', description: 'Infrared Thermometer is the only best way to check the temperature of all people entering into the premises and keep your place free from the risk of spread of Covid-19.', features: [] },
      { name: 'Hand Sanitizer', image: 'https://www.thecrosswild.com/products_image/1110ab722cc416528eb7515635a9cc10.jpg', description: 'Alcohol-based hand sanitizers available in 50 ml, 100 ml, 200 ml, 500 ml and 1 Liter packages — ideal for offices, hospitals, retail outlets, and bulk gifting.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Sanitizer and Infrared Thermometer Wholesaler Jaipur', subheading: 'Alcohol Based Hand Sanitizer Wholesaler in Jaipur', body: "Hands Sanitizer or Alcohol based sanitizer plays an important role these days, it keeps you and your family safe from the spread of the virus.\n\nHand Sanitizers become essential for everyone, whether you're in office or travelling, sanitizers help you every time to maintain your proper hygiene as covid-19 is spreading everywhere.\n\nThere are many Hand Sanitizer Manufacturers in Jaipur that provide a wide variety of hand sanitizers in different quantities from 50 ml, 100 ml, 200 ml to 500 ml and 1 Liter packages.\n\nIf you're a retailer want to sell top quality hand sanitizers, you can place your hand sanitizer bulk order in Jaipur and you'll get delivery on time.", bullets: [] },
      ],
      afterSections: [
        { heading: 'Infrared Thermometer Wholesale in Jaipur', subheading: '', body: "Infrared Thermometer is a need of all organizations, Healthcare units and Industries, as after lockdown all sectors resume their work.\n\nInfrared Thermometer is the only best way to check the temperature of all people entering into the premises and keep your place free from the risk of spread of Covid-19.\n\nAs one of the leading Infrared Thermometer Wholesaler in Jaipur, we are dedicated to providing top qualities Infrared Thermometers and Hand Sanitizers to our dealer's at most affordable prices.", bullets: [] },
        { heading: 'Best Infrared Thermometer Supplier in Jaipur', subheading: '', body: 'Find the best infrared thermometer in Jaipur at most competitive prices from Cross Wild. We have plenty of choices and options, when it comes to choosing Infrared Thermometers in Jaipur.', bullets: [] },
      ],
    },
  },
  'face-mask-and-ppe-kit-manufacturer-jaipur': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/18f1046130e78256ffcfed19179e0961.jpg', title: 'Face Mask & PPE Kit Manufacturer in Jaipur', subtitle: 'N95 masks, printed face masks & PPE kits — wholesale manufacturer in Jaipur, Rajasthan' },
    seo: { title: 'N95 Face Mask, PPE Kit Manufacturer Wholesale in Jaipur, Rajasthan - The Crosswild', description: 'We are manufacturing N95 face mask, printed face mask and PPE kits at best price in Jaipur Rajasthan. Get the best deals on face mask and PPE kits. Call us for free quote.', keywords: 'n95 mask manufacturer in rajasthan, ppe kit manufacturer in rajasthan, ppe kit manufacturer' },
    products: { items: [
      { name: 'Face Mask', image: 'https://www.thecrosswild.com/products_image/7ee58cd665ba15256c8e85808a85e7b6.jpg', description: 'We manufacture high-quality face masks including N95 masks, printed face masks, and surgical masks to keep you and your team safe. Available in bulk quantities at the best wholesale prices.', features: [] },
      { name: 'PPE Kit', image: 'https://www.thecrosswild.com/products_image/900af3a323036134f274d01d1bd2d79f.jpg', description: 'Complete PPE Kits manufactured using high-standard materials for hospitals, clinics, salons, and other essential service workers. Bulk orders welcome with fast delivery across India.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Face Mask And PPE Kit Manufacturer & Wholesaler', subheading: '', body: "We understand how important it is these days to cover your face and body with face masks and PPE kits if you're working in healthcare sectors.\n\nThis is the time when face masks have become a necessity for everyone. To help you in this difficult situation, Cross Wild comes up with a wide range of PPE Kits and Face Masks. As one of the leading face mask manufacturers in Jaipur, we offer an exclusive collection of PPE Kits and Face Masks that are made from high-quality materials and keep you safe from viruses.", bullets: [] },
      ],
      afterSections: [
        { heading: 'N95 Mask Manufacturer in Jaipur', subheading: '', body: 'N95 Masks are in higher demand around the globe, as these masks keep you safe from viruses and their quality is much higher as compared to ordinary masks available in the market.\n\nThese kinds of masks are a must-have for every healthcare worker as they have much more power to keep the wearer safe. There are very few N95 mask manufacturers in Jaipur, and The Cross Wild is one of them — offering masks and PPE kit manufacturing services to keep the people of our country safe and healthy.', bullets: [] },
        { heading: 'Top PPE Kit Manufacturer in Jaipur', subheading: '', body: 'Help protect yourself and society, now and in the future, with PPE kits manufactured using high-standard materials. As one of the leading PPE Kit Manufacturers in Rajasthan, you can find a wide variety of PPE Kits for hospitals, clinics, salons, and others.', bullets: [] },
        { heading: 'Face Masks and PPE Kit in Jaipur', subheading: '', body: '', bullets: ["No matter what kind of face mask and PPE kit you're looking for in bulk, your search will end here at Cross Wild.", 'Keep you and your family safe from viruses with our certified protective gear.', 'For any kind of face masks and PPE kits in wholesale, feel free to get in touch with us!'] },
      ],
    },
  },
  'school-uniform': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/0c977d4571c4f822f96a1cc74bc91517.jpg', title: 'School Uniform Manufacturer In Jaipur', subtitle: 'Custom school uniforms for students, teachers & sports — bulk orders from Jaipur' },
    seo: { title: 'Customized School Dress | School Uniform Manufacturer In Jaipur India', description: 'Find the best school uniform manufacturer in Jaipur for your dress customization needs. Crosswild provides school uniform manufacturers and promotional printing services at wholesaler prices. For bulk orders call 9529626262.', keywords: 'School Uniform Manufacturers Jaipur, Sport T Shirt Manufacturers In Jaipur, Teacher Uniform Manufacturers In Jaipur, Customized School dress manufactuers, Girls School dress manufacturers, Boys School dress manufacturers, Girls School Uniform manufacturers' },
    products: { items: [
      { name: 'Girls School Uniform', image: 'https://www.thecrosswild.com/products_image/6f037be3dce207d89d5cdafd83cd28ce.jpg', description: 'Leading manufacturer of school uniforms for girls such as salwar suits, shirts, pants, and skirts. You can select the fabric in pattern and grade as per your requirements. If you need Salwar Suit in different designs then you can tell us. We have tailors who are experts in their work.', features: [] },
      { name: 'School House Uniform', image: 'https://www.thecrosswild.com/products_image/75d8c5aa82f17774857d95ffafd93fc1.jpg', description: "Design your school's students' uniforms in comfortable fabric according to their schoolhouse. Want to get perfect and high-quality fabric dresses for school students? Enquiry now for bulk orders.", features: [] },
      { name: 'Boys School Uniform', image: 'https://www.thecrosswild.com/products_image/ebe8c56622667e5d29c12316b2f7e8b1.jpg', description: "Students should feel comfortable in what they wear. Hence, we always recommend you choose cotton and polycotton. Boys' shorts and full/half pants and t-shirts or shirts, you can get anything made from us. Different patterns are available. Inquire now for more details.", features: [] },
      { name: 'School Sports Uniform', image: 'https://www.thecrosswild.com/products_image/7a6ba77b5a3ca04de4ef9479825461d1.jpg', description: 'An athlete or a team needs to play a vital role. We consider the breath-ability, comfort and durability of our sports school uniforms. You can contact us for school sports uniforms like basketball, cricket, etc.', features: [] },
      { name: 'School Teachers Uniform', image: 'https://www.thecrosswild.com/products_image/8ea195c9b0a741b7d76d1979a679dbc8.jpg', description: "A teacher's personality also reflects on students, such as how to maintain discipline, manners, personality, hygiene, professionalism, etc. Staff should be well-presented and have a positive impact on students. So, design their formal attire from the best School Teachers' Uniform manufacturer.", features: [] },
      { name: 'Pre-Primary School Uniform', image: 'https://www.thecrosswild.com/products_image/5173fbc952708f453b5e9bde8d2086b6.jpg', description: "Kids should be comfortable throughout the day. Always suggest soft fabrics for their attire that will be easy to clean. For a positive learning environment, their uniforms should be stylish and vibrant. Many options are available for kids' school uniforms like t-shirts, skirts, shorts, polo shirts, and jumpers. Inquire now for more information.", features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'School Uniform Manufacturer for Student and Teacher | Sport Dress Manufacturer In Jaipur', subheading: '', body: "The Cross Wild it is the best school uniform manufacturer in Jaipur that develops and manufactures a comprehensive range of quality high-performance uniforms for students and teachers. Our commitment to excellence ensures that each garment we manufacture provides the highest level of comfort in wearing and durability.\n\nAlong with student uniforms, we also provide uniforms for educators. Our manufacturing units in Jaipur design and produce professional and comfortable teacher uniforms that speak volumes about the commitment and professionalism of teaching staff. We offer different styles and sizes so that every teacher can look great while helping to maintain a positive learning environment.\n\nBesides this for the schools which emphasize on physical education and sports, sport T-shirt manufacturers in Jaipur offer different types of sportswear for performance. Besides that, we at The Cross Wild provide customized printed sport T shirts in Jaipur, which prove to be a great medium to showcase a school's unique identity and spirit.", bullets: [] },
      ],
      afterSections: [
        { heading: 'Kids, Girls and Boys School Uniform & Dress Manufacturer Jaipur', subheading: '', body: "We specialize in polyester cotton school uniforms, which besides being fashionable, are comfortable to wear every day. Our range of boys', girls', and pre-primary kids' uniforms is designed for the best fit for each student. Being one of the leading school dress wholesaler, we believe in offering such clothes that keep the children comfortable, functional, and focused on their studies and activities.\n\nWe have designed our uniforms, keeping active school students in mind. For example, school tracksuit manufacturers in Jaipur have prepared tracksuits that are just apt for physical education classes as well as for the purpose of playing sports activities with a lot of ease and style.\n\nAt The Cross Wild, we pride ourselves on an extensive range to satisfy every student and teacher needs when it comes to school uniforms. From stylish school uniforms to professional ones for educators, we will support you in finding your perfect solution. Rest assured that, together with us, your school community will look cohesive and professional.", bullets: [] },
      ],
    },
  },
  'staff-uniform-manufacturer': {
    banner: { image: 'https://www.thecrosswild.com/upload/category/48929651dd915ebe39e4f608bf8d674a.png', title: 'Uniform Manufacturer for Office Employees & Healthcare Workers in Jaipur', subtitle: 'Custom uniforms for offices, hospitals, hotels, retail & workshops — bulk orders from Jaipur' },
    seo: { title: 'Uniform Manufacturer, Supplier for Office Employees and Healthcare Workers in Jaipur', description: 'The Crosswild offers a wide range of healthcare, industrial workshop and office staff uniforms with customization and branding in Jaipur. Call 9529626262 for bulk orders.', keywords: 'uniform for office staff in Jaipur, doctors uniform manufacturer in Jaipur, employee uniform supplier' },
    products: { items: [
      { name: 'Office Staff Uniform', image: 'https://www.thecrosswild.com/products_image/1ab794294005ed569e6b8093901e47b0.png', description: 'Enhance your office environment with the leading manufacturer of office staff uniforms. We offer a wide range of options including suits, shirts and trousers, all made from high-quality fabrics. Choose the style and material that best suits your needs. If you have a specific design requirement, we are here to customize. Contact us to begin a bulk order.', features: [] },
      { name: 'Doctors Uniform', image: 'https://www.thecrosswild.com/products_image/3e96df68e2f1770428e2495f8e7fe70b.png', description: 'Design doctors uniforms with the expertise of our manufacturer to combine professionalism and comfort. Need a special design or additional features? Let us know, and our skilled team will create a uniform to your exact specifications. Get in touch for more information and bulk orders.', features: [] },
      { name: 'Hospital Staff Uniform', image: 'https://www.thecrosswild.com/products_image/4baffe8b501fdf846f016305e9268e73.png', description: "For hospital staff, comfort and functionality are crucial. We offer a range of uniforms suitable for a variety of roles within healthcare settings. Our fabrics are chosen for their durability and comfort. Contact us for customized solutions that meet your hospital's need and feels at ease.", features: [] },
      { name: 'Workshop Staff Uniform', image: 'https://www.thecrosswild.com/products_image/39ea10fad7bf4c8350a799b255d17567.png', description: 'We provide durable fabrics and practical designs to keep factory workers safe and comfortable during their shifts. Our uniforms offer both flexibility and comfort in the factory. From work shirts to coveralls, inquire now for custom uniforms that meet industry standards.', features: [] },
      { name: 'Hotel Staff Uniform', image: 'https://www.thecrosswild.com/products_image/ceeca38033f62ddd520b10dbe95e1bba.png', description: 'The personality of the hospitality service personnel also reflects on the visitors, such as how to maintain etiquette, personality and professionalism etc. Whether for the front desk, housekeeping or service staff, we offer a variety of designs and fabrics that reflect the elegance and professionalism of your establishment. Get in touch to explore customized options that make a lasting impression.', features: [] },
      { name: 'Retail Store Staff Uniform', image: 'https://www.thecrosswild.com/products_image/f244d9fe61a5fc9871b89bd5db5e9946.png', description: 'Create a consistent and professional look for your retail team with our versatile uniforms. We offer a range of styles including t-shirts, blouses and aprons etc, all designed to be both stylish and comfortable. Contact us to discuss your specific custom requirements.', features: [] },
    ] },
    content: {
      beforeSections: [
        { heading: 'Custom Uniform Manufacturer in Jaipur', subheading: '', body: 'We offer custom uniforms reflecting your enterprise identity with logo and size customization in various sectors, including healthcare, hospitality and industrial businesses. We are also proud to be one of the leading employee uniform supplier in Jaipur. Our uniforms are specially designed to meet the demands of the workforce and maintain comfort and hygiene in any workplace. We are among the leading work wear manufacturers that provide quality, durable, and easy-to-maintain work uniforms.', bullets: [] },
      ],
      afterSections: [
        { heading: 'Doctors and Hospital Uniform Manufacturer in Jaipur', subheading: '', body: 'At CrossWild, we value the art of tailoring uniforms for personnel across various industries. Our company is a leading hospital uniform manufacturer in Jaipur with brand logo, tailoring durable and comfortable uniforms for doctors, hospital staff and workers, from ensuring quality in production to finer details, we promise that your staff will never suffer from hygiene issues and will remain comfortable, whether it is in the hospital operation theater, patient ward etc.', bullets: [] },
        { heading: 'Industrial Worker Uniform Manufacturer in Jaipur, India', subheading: '', body: 'In addition, our range extends to industrial employee uniform manufacturing, where we customize uniforms as per the needs of industrial factories. For retail businesses, we have exclusive uniforms available for showroom staff and we ensure that your team represents your brand respectfully. As an employee uniform supplier in Jaipur, we are proud to provide quality uniforms that meet the specific needs of your business.\n\nDo you need custom uniforms for staff? Choose The CrossWild and experience the difference in quality, customization and customer satisfaction provided by professional staff uniform manufacturers.', bullets: [] },
      ],
    },
  },
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

  // ── Service Pages — generated (banner + seo + products + content) ──────────
  ...(() => {
    const slugs = [
      'customize-promotional-t-shirt-manufacturer-in-Jaipur',
      'sweatshirt-hoodie-manufacturer-in-Jaipur',
      'school-laptop-bag-manufacturer-in-Jaipur',
      'cap-printing-manufacturer-in-jaipur',
      'mug-printing-in-Jaipur',
      'printing',
      'sanitizer-and-infrared-thermometer-wholesaler-jaipur',
      'face-mask-and-ppe-kit-manufacturer-jaipur',
      'school-uniform',
      'staff-uniform-manufacturer',
    ];
    const schemas = {};
    slugs.forEach(slug => {
      schemas[`${slug}/banner`] = {
        label: 'Page Banner',
        textFields: [
          { key: 'image', type: 'image' },
          { key: 'title', multiline: false },
          { key: 'subtitle', multiline: false },
        ],
        arrays: [],
        defaults: SERVICE_DEFAULTS[slug]?.banner || {},
      };
      schemas[`${slug}/seo`] = {
        label: 'SEO (Title, Description, Keywords)',
        textFields: [
          { key: 'title', multiline: false },
          { key: 'description', multiline: true },
          { key: 'keywords', multiline: false },
        ],
        arrays: [],
        defaults: SERVICE_DEFAULTS[slug]?.seo || {},
      };
      schemas[`${slug}/products`] = {
        label: 'Products',
        textFields: [],
        arrays: [{ key: 'items', type: 'products', label: 'Product Cards (name, image, description, features)' }],
        defaults: SERVICE_DEFAULTS[slug]?.products || {},
      };
      schemas[`${slug}/content`] = {
        label: 'Page Content',
        textFields: [],
        arrays: [
          { key: 'beforeSections', type: 'content-sections', label: 'Sections Before Products' },
          { key: 'afterSections', type: 'content-sections', label: 'Sections After Products' },
        ],
        defaults: SERVICE_DEFAULTS[slug]?.content || {},
      };
    });
    return schemas;
  })(),
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
      .then(res => {
        const apiData = res.data || {};
        const isEmpty = Object.keys(apiData).length === 0;
        setData(isEmpty ? (schema.defaults || {}) : apiData);
      })
      .catch(() => setData(schema.defaults || {}))
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
      case 'products': return <ProductListEditor value={current} onChange={update} />;
      case 'content-sections': return <ContentSectionListEditor value={current} onChange={update} />;
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
    { slug: 'customize-promotional-t-shirt-manufacturer-in-Jaipur', label: 'T-Shirt Manufacturing', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'sweatshirt-hoodie-manufacturer-in-Jaipur', label: 'Sweatshirt Manufacturing', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'school-laptop-bag-manufacturer-in-Jaipur', label: 'Bag Manufacturer', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'cap-printing-manufacturer-in-jaipur', label: 'Cap Manufacturer', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'mug-printing-in-Jaipur', label: 'Mug Printing', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'printing', label: 'Digital Printing', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'sanitizer-and-infrared-thermometer-wholesaler-jaipur', label: 'Sanitizer & Infrared Thermometer', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'face-mask-and-ppe-kit-manufacturer-jaipur', label: 'Face Masks & PPE Kits', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'school-uniform', label: 'School Uniform', sections: ['banner', 'seo', 'products', 'content'] },
    { slug: 'staff-uniform-manufacturer', label: 'Staff Uniform', sections: ['banner', 'seo', 'products', 'content'] },
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
