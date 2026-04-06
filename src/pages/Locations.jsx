import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Globe, Phone, Mail, Clock, ChevronDown, ChevronRight, Star, X, Loader2, Save, Package } from 'lucide-react';
import { locationsAPI } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyProduct = () => ({ name: '', slug: '', icon: '📦', link: '', types: [], description: '' });
const emptyContact = () => ({ address: '', phone: [''], email: '', hours: '', mapLink: '' });
const emptyLocation = () => ({
  name: '', slug: '', state: '', isHeadquarters: false, isActive: true,
  tagline: '', heroHeading: '', description: '',
  whyChooseUs: [''], printingMethods: [''], fabrics: [''], partners: [''],
  products: [emptyProduct()],
  contact: emptyContact(),
  seo: { title: '', description: '', keywords: [], ogImage: '', canonicalUrl: '', noIndex: false, noFollow: false },
});

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ─── Sub-components ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6 first:mt-0">{children}</h3>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${props.className || ''}`} />
);

const Textarea = (props) => (
  <textarea {...props} rows={props.rows || 3} className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-vertical ${props.className || ''}`} />
);

// Editable list (why choose us, printing methods, etc.)
const EditableList = ({ items, onChange, placeholder }) => {
  const update = (i, val) => { const a = [...items]; a[i] = val; onChange(a); };
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={e => update(i, e.target.value)} placeholder={placeholder} />
          <button type="button" onClick={() => remove(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-orange-600 hover:underline font-medium">+ Add item</button>
    </div>
  );
};

// Product editor
const ProductEditor = ({ products, onChange }) => {
  const update = (i, field, val) => {
    const a = [...products];
    a[i] = { ...a[i], [field]: val };
    onChange(a);
  };
  const updateTypes = (i, val) => update(i, 'types', val.split('\n').filter(Boolean));
  const add = () => onChange([...products, emptyProduct()]);
  const remove = (i) => onChange(products.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {products.map((p, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
          <button type="button" onClick={() => remove(i)} className="absolute top-3 right-3 p-1 text-red-500 hover:bg-red-50 rounded-lg">
            <X className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Product Name"><Input value={p.name} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. T-shirt Manufacturing" /></Field>
            <Field label="Slug"><Input value={p.slug} onChange={e => update(i, 'slug', e.target.value)} placeholder="e.g. tshirts" /></Field>
            <Field label="Icon (emoji)"><Input value={p.icon} onChange={e => update(i, 'icon', e.target.value)} placeholder="👕" /></Field>
            <Field label="Link"><Input value={p.link} onChange={e => update(i, 'link', e.target.value)} placeholder="/products?category=tshirts" /></Field>
          </div>
          <Field label="Description">
            <Textarea value={p.description} onChange={e => update(i, 'description', e.target.value)} placeholder="Short product description..." rows={2} />
          </Field>
          <Field label="Types (one per line)">
            <Textarea value={(p.types || []).join('\n')} onChange={e => updateTypes(i, e.target.value)} placeholder="Polo T-shirts&#10;Round Neck T-shirts" rows={3} />
          </Field>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-orange-600 hover:underline font-medium">+ Add product</button>
    </div>
  );
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const LocationModal = ({ location, onClose, onSaved }) => {
  const isEdit = !!location;
  const [form, setForm] = useState(isEdit ? {
    ...location,
    whyChooseUs: location.whyChooseUs?.length ? location.whyChooseUs : [''],
    printingMethods: location.printingMethods?.length ? location.printingMethods : [''],
    fabrics: location.fabrics?.length ? location.fabrics : [''],
    partners: location.partners?.length ? location.partners : [''],
    contact: { ...emptyContact(), ...location.contact, phone: location.contact?.phone?.length ? location.contact.phone : [''] },
    seo: { title: '', description: '', keywords: [], ogImage: '', canonicalUrl: '', noIndex: false, noFollow: false, ...location.seo },
  } : emptyLocation());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setContact = (field, val) => setForm(prev => ({ ...prev, contact: { ...prev.contact, [field]: val } }));
  const setSeo = (field, val) => setForm(prev => ({ ...prev, seo: { ...prev.seo, [field]: val } }));

  const handleNameChange = (val) => {
    set('name', val);
    if (!isEdit) set('slug', slugify(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    // Clean empty strings from lists
    const payload = {
      ...form,
      whyChooseUs: form.whyChooseUs.filter(Boolean),
      printingMethods: form.printingMethods.filter(Boolean),
      fabrics: form.fabrics.filter(Boolean),
      partners: form.partners.filter(Boolean),
      contact: { ...form.contact, phone: form.contact.phone.filter(Boolean) },
      seo: { ...form.seo, keywords: typeof form.seo.keywords === 'string' ? form.seo.keywords.split(',').map(k => k.trim()).filter(Boolean) : form.seo.keywords },
    };
    try {
      if (isEdit) {
        await locationsAPI.update(location._id, payload);
      } else {
        await locationsAPI.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'products', label: 'Products' },
    { id: 'contact', label: 'Contact' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            {isEdit ? `Edit — ${location.name}` : 'Add New Location'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100">
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t.id ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 min-h-[400px]">

            {/* ── BASIC INFO ── */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City Name" required>
                    <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Jaipur" required />
                  </Field>
                  <Field label="Slug" required>
                    <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="e.g. jaipur" required />
                  </Field>
                  <Field label="State" required>
                    <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Rajasthan" required />
                  </Field>
                  <Field label="Status">
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
                        <span className="text-sm">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isHeadquarters} onChange={e => set('isHeadquarters', e.target.checked)} className="rounded" />
                        <span className="text-sm">Headquarters</span>
                      </label>
                    </div>
                  </Field>
                </div>
                <Field label="Tagline">
                  <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Headquarters — Custom Manufacturing in the Pink City" />
                </Field>
                <Field label="Hero Heading">
                  <Input value={form.heroHeading} onChange={e => set('heroHeading', e.target.value)} placeholder="e.g. Custom T-shirt, Bags & Uniform Manufacturing in Jaipur" />
                </Field>
                <Field label="Description" required>
                  <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full location description..." rows={4} required />
                </Field>
              </div>
            )}

            {/* ── CONTENT ── */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <SectionTitle>Why Choose Us (one per line)</SectionTitle>
                  <EditableList items={form.whyChooseUs} onChange={v => set('whyChooseUs', v)} placeholder="e.g. Starting at just ₹70 — best price guaranteed" />
                </div>
                <div>
                  <SectionTitle>Printing Methods</SectionTitle>
                  <EditableList items={form.printingMethods} onChange={v => set('printingMethods', v)} placeholder="e.g. Screen Printing" />
                </div>
                <div>
                  <SectionTitle>Fabric Options</SectionTitle>
                  <EditableList items={form.fabrics} onChange={v => set('fabrics', v)} placeholder="e.g. Cotton" />
                </div>
                <div>
                  <SectionTitle>Trusted Partners / Brands</SectionTitle>
                  <EditableList items={form.partners} onChange={v => set('partners', v)} placeholder="e.g. Amity University" />
                </div>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {activeTab === 'products' && (
              <div>
                <SectionTitle>Products Offered at This Location</SectionTitle>
                <ProductEditor products={form.products} onChange={v => set('products', v)} />
              </div>
            )}

            {/* ── CONTACT ── */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <Field label="Address">
                  <Textarea value={form.contact.address} onChange={e => setContact('address', e.target.value)} placeholder="Full address..." rows={2} />
                </Field>
                <Field label="Phone Numbers">
                  <EditableList items={form.contact.phone} onChange={v => setContact('phone', v)} placeholder="+91-9XXXXXXXXX" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email">
                    <Input value={form.contact.email} onChange={e => setContact('email', e.target.value)} placeholder="orders@thecrosswild.com" type="email" />
                  </Field>
                  <Field label="Working Hours">
                    <Input value={form.contact.hours} onChange={e => setContact('hours', e.target.value)} placeholder="Mon–Sat, 9 AM – 7:30 PM" />
                  </Field>
                </div>
                <Field label="Google Maps Link">
                  <Input value={form.contact.mapLink} onChange={e => setContact('mapLink', e.target.value)} placeholder="https://maps.google.com/?q=..." />
                </Field>
              </div>
            )}

            {/* ── SEO ── */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <Field label="SEO Title">
                  <Input value={form.seo.title} onChange={e => setSeo('title', e.target.value)} placeholder="e.g. Custom T-shirt Manufacturing in Jaipur | The CrossWild" />
                  <p className="text-xs text-gray-400 mt-1">{form.seo.title?.length || 0}/70 chars</p>
                </Field>
                <Field label="SEO Description">
                  <Textarea value={form.seo.description} onChange={e => setSeo('description', e.target.value)} placeholder="Meta description for search engines..." rows={3} />
                  <p className="text-xs text-gray-400 mt-1">{form.seo.description?.length || 0}/160 chars</p>
                </Field>
                <Field label="Keywords (comma-separated)">
                  <Input value={Array.isArray(form.seo.keywords) ? form.seo.keywords.join(', ') : form.seo.keywords} onChange={e => setSeo('keywords', e.target.value)} placeholder="t-shirt jaipur, custom printing jaipur, ..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Canonical URL">
                    <Input value={form.seo.canonicalUrl} onChange={e => setSeo('canonicalUrl', e.target.value)} placeholder="https://the-cross-wild.vercel.app/locations/jaipur" />
                  </Field>
                  <Field label="OG Image URL">
                    <Input value={form.seo.ogImage} onChange={e => setSeo('ogImage', e.target.value)} placeholder="https://..." />
                  </Field>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.seo.noIndex} onChange={e => setSeo('noIndex', e.target.checked)} className="rounded" />
                    <span className="text-sm font-medium">No Index</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.seo.noFollow} onChange={e => setSeo('noFollow', e.target.checked)} className="rounded" />
                    <span className="text-sm font-medium">No Follow</span>
                  </label>
                </div>

                {/* Preview */}
                {(form.seo.title || form.name) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Google Preview</p>
                    <p className="text-blue-700 text-sm font-medium truncate">{form.seo.title || form.name}</p>
                    <p className="text-green-700 text-xs">{form.seo.canonicalUrl || `thecrosswild.com/locations/${form.slug}`}</p>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">{form.seo.description || form.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {error && <p className="px-6 text-sm text-red-600 font-medium">{error}</p>}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : isEdit ? 'Update Location' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsAPI.getAll();
      setLocations(data.locations || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleDelete = async (loc) => {
    if (!window.confirm(`Delete location "${loc.name}"?`)) return;
    try {
      await locationsAPI.delete(loc._id);
      fetchLocations();
    } catch {
      alert('Failed to delete location');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingLocation(null);
    fetchLocations();
  };

  const filtered = locations.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><MapPin className="w-6 h-6 text-orange-500" /> Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">{locations.length} location{locations.length !== 1 ? 's' : ''} — manage all city pages, content & SEO</p>
        </div>
        <button onClick={() => { setEditingLocation(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by city or state..."
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No locations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(loc => {
            const isExpanded = expandedId === loc._id;
            return (
              <div key={loc._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : loc._id)} className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{loc.name}</span>
                      {loc.isHeadquarters && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> HQ</span>}
                      {!loc.isActive && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">Inactive</span>}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{loc.state} · {loc.products?.length || 0} products · {loc.contact?.phone?.[0] || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`https://the-cross-wild.vercel.app/locations/${loc.slug}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View on site">
                      <Globe className="w-4 h-4" />
                    </a>
                    <button onClick={() => { setEditingLocation(loc); setShowModal(true); }} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(loc)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded preview */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4 text-sm">
                    {loc.tagline && <p className="text-gray-600 italic">"{loc.tagline}"</p>}
                    {loc.description && <p className="text-gray-700 leading-relaxed">{loc.description}</p>}

                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* Contact */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Contact</p>
                        {loc.contact?.address && <p className="text-gray-600 text-xs mb-1">{loc.contact.address}</p>}
                        {loc.contact?.phone?.map(p => <p key={p} className="text-gray-600 text-xs">{p}</p>)}
                        {loc.contact?.hours && <p className="text-gray-500 text-xs mt-1">{loc.contact.hours}</p>}
                      </div>
                      {/* Products */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Products</p>
                        {loc.products?.map(p => <p key={p.slug} className="text-gray-600 text-xs">{p.icon} {p.name}</p>)}
                      </div>
                      {/* SEO */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">SEO</p>
                        <p className="text-gray-600 text-xs truncate">{loc.seo?.title || '—'}</p>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{loc.seo?.description || '—'}</p>
                      </div>
                    </div>

                    {loc.whyChooseUs?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Why Choose Us</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {loc.whyChooseUs.map((r, i) => <li key={i} className="text-gray-600 text-xs">{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <LocationModal
          location={editingLocation}
          onClose={() => { setShowModal(false); setEditingLocation(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Locations;
