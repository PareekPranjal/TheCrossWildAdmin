import React, { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { siteSettingsAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';

const TABS = [
  { key: 'header', label: 'Header' },
  { key: 'footer', label: 'Footer' },
  { key: 'contact', label: 'Contact' },
  { key: 'social', label: 'Social' },
  { key: 'floatingButtons', label: 'Floating Buttons' },
  { key: 'layoutMeta', label: 'Layout Meta' },
  { key: 'stats', label: 'Stats' },
  { key: 'trustBadges', label: 'Trust Badges' },
  { key: 'personSchema', label: 'Person Schema' },
];

// Helpers for nested updates
const setIn = (obj, path, value) => {
  const next = JSON.parse(JSON.stringify(obj || {}));
  const keys = path.split('.');
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return next;
};

const getIn = (obj, path, fallback = '') => {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj) ?? fallback;
};

// Repeater helpers — given the entire form object + the dot-path of the array
function arrayPush(form, path, item) {
  const arr = [...(getIn(form, path, []) || [])];
  arr.push(item);
  return setIn(form, path, arr);
}
function arrayRemove(form, path, idx) {
  const arr = [...(getIn(form, path, []) || [])];
  arr.splice(idx, 1);
  return setIn(form, path, arr);
}
function arrayMove(form, path, idx, dir) {
  const arr = [...(getIn(form, path, []) || [])];
  const target = idx + dir;
  if (target < 0 || target >= arr.length) return form;
  [arr[idx], arr[target]] = [arr[target], arr[idx]];
  return setIn(form, path, arr);
}
function arrayUpdate(form, path, idx, key, val) {
  const arr = [...(getIn(form, path, []) || [])];
  arr[idx] = { ...arr[idx], [key]: val };
  return setIn(form, path, arr);
}

const InputRow = ({ label, value, onChange, placeholder, type = 'text', textarea }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
    {textarea ? (
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={3} className="input-field" />
    ) : (
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className="input-field" />
    )}
  </div>
);

const StringArrayEditor = ({ label, items, onChange, placeholder }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <button type="button"
          onClick={() => onChange([...(items || []), ''])}
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {(items || []).map((v, i) => (
          <div key={i} className="flex gap-2">
            <input value={v} onChange={(e) => {
              const next = [...(items || [])]; next[i] = e.target.value; onChange(next);
            }} placeholder={placeholder} className="input-field flex-1" />
            <button type="button" onClick={() => onChange((items || []).filter((_, idx) => idx !== i))}
              className="px-2 text-red-500 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SiteSettings() {
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState('header');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await siteSettingsAPI.get();
      setForm(res.settings || {});
    } catch (err) {
      setMessage('Failed to load settings');
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await siteSettingsAPI.update(form);
      setForm(res.settings);
      setMessage('Saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="p-6">Loading…</div>;

  const update = (path, value) => setForm(setIn(form, path, value));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Site Settings</h1>
          <p className="text-gray-600 mt-1">Header, footer, contact, social, and layout config</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('Saved') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 -mt-2 -mx-2 px-2 pb-2">
          {TABS.map((t) => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${activeTab === t.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pt-6 space-y-5">
          {activeTab === 'header' && (
            <>
              <ImageUploader label="Logo" value={getIn(form, 'header.logo')}
                onChange={(url) => update('header.logo', url)} height="h-32" />
              <InputRow label="Logo Alt Text" value={getIn(form, 'header.logoAlt')}
                onChange={(v) => update('header.logoAlt', v)} />
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Top-Bar Phone" value={getIn(form, 'header.topBarPhone')}
                  onChange={(v) => update('header.topBarPhone', v)} placeholder="+91-9529626262" />
                <InputRow label="Top-Bar Email" value={getIn(form, 'header.topBarEmail')}
                  onChange={(v) => update('header.topBarEmail', v)} />
              </div>

              {/* Top bar links */}
              <LinkArrayEditor
                label="Top-Bar Links"
                items={getIn(form, 'header.topBarLinks', [])}
                onChange={(v) => update('header.topBarLinks', v)}
              />

              <StringArrayEditor label="Promo Ticker"
                items={getIn(form, 'header.promoTicker', [])}
                onChange={(v) => update('header.promoTicker', v)}
                placeholder="Promo message…" />

              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-2">Customize CTA</legend>
                <InputRow label="Label" value={getIn(form, 'header.customizeCTA.label')}
                  onChange={(v) => update('header.customizeCTA.label', v)} />
                <InputRow label="WhatsApp URL" value={getIn(form, 'header.customizeCTA.whatsappUrl')}
                  onChange={(v) => update('header.customizeCTA.whatsappUrl', v)} />
                <InputRow label="Email Mailto" value={getIn(form, 'header.customizeCTA.emailMailto')}
                  onChange={(v) => update('header.customizeCTA.emailMailto', v)} />
              </fieldset>
            </>
          )}

          {activeTab === 'footer' && (
            <>
              <ImageUploader label="Footer Logo" value={getIn(form, 'footer.logo')}
                onChange={(url) => update('footer.logo', url)} height="h-32" />
              <InputRow label="Company Description" value={getIn(form, 'footer.companyDescription')}
                onChange={(v) => update('footer.companyDescription', v)} textarea />
              <InputRow label="Copyright Suffix"
                value={getIn(form, 'footer.copyrightText')}
                onChange={(v) => update('footer.copyrightText', v)}
                placeholder="The CrossWild. All rights reserved."
              />
              <p className="text-xs text-gray-500 -mt-3">Year is rendered dynamically (current year). Don't include the year here.</p>

              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-2">Newsletter</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!getIn(form, 'footer.newsletter.enabled')}
                    onChange={(e) => update('footer.newsletter.enabled', e.target.checked)} />
                  Enable newsletter signup
                </label>
                <InputRow label="Heading" value={getIn(form, 'footer.newsletter.heading')}
                  onChange={(v) => update('footer.newsletter.heading', v)} />
                <InputRow label="Subheading" value={getIn(form, 'footer.newsletter.subheading')}
                  onChange={(v) => update('footer.newsletter.subheading', v)} />
                <div className="grid grid-cols-2 gap-3">
                  <InputRow label="Placeholder" value={getIn(form, 'footer.newsletter.placeholder')}
                    onChange={(v) => update('footer.newsletter.placeholder', v)} />
                  <InputRow label="Button Label" value={getIn(form, 'footer.newsletter.buttonLabel')}
                    onChange={(v) => update('footer.newsletter.buttonLabel', v)} />
                </div>
              </fieldset>

              <LinkArrayEditor label="Footer Bottom Links (Privacy/Terms/Cookies)"
                items={getIn(form, 'footer.bottomLinks', [])}
                onChange={(v) => update('footer.bottomLinks', v)} />

              <p className="text-xs text-gray-500">Tip: edit the main Services / Quick Links nav from the <strong>Menus</strong> page.</p>

              {/* Branch offices */}
              <BranchOfficeEditor
                items={getIn(form, 'footer.branchOffices', [])}
                onChange={(v) => update('footer.branchOffices', v)}
              />
            </>
          )}

          {activeTab === 'contact' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Primary Phone" value={getIn(form, 'contact.primaryPhone')}
                  onChange={(v) => update('contact.primaryPhone', v)} />
                <InputRow label="Primary Email" value={getIn(form, 'contact.primaryEmail')}
                  onChange={(v) => update('contact.primaryEmail', v)} />
              </div>
              <StringArrayEditor label="Secondary Phones" items={getIn(form, 'contact.secondaryPhones', [])}
                onChange={(v) => update('contact.secondaryPhones', v)} placeholder="+91-…" />
              <StringArrayEditor label="Secondary Emails" items={getIn(form, 'contact.secondaryEmails', [])}
                onChange={(v) => update('contact.secondaryEmails', v)} placeholder="email@…" />
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="WhatsApp Number" value={getIn(form, 'contact.whatsappNumber')}
                  onChange={(v) => update('contact.whatsappNumber', v)} />
                <InputRow label="WhatsApp Prefilled Message" value={getIn(form, 'contact.whatsappPrefilledMessage')}
                  onChange={(v) => update('contact.whatsappPrefilledMessage', v)} />
              </div>
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-2">Address</legend>
                <InputRow label="Street" value={getIn(form, 'contact.address.street')}
                  onChange={(v) => update('contact.address.street', v)} />
                <div className="grid grid-cols-2 gap-3">
                  <InputRow label="City" value={getIn(form, 'contact.address.city')}
                    onChange={(v) => update('contact.address.city', v)} />
                  <InputRow label="State" value={getIn(form, 'contact.address.state')}
                    onChange={(v) => update('contact.address.state', v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputRow label="Postal Code" value={getIn(form, 'contact.address.postalCode')}
                    onChange={(v) => update('contact.address.postalCode', v)} />
                  <InputRow label="Country" value={getIn(form, 'contact.address.country')}
                    onChange={(v) => update('contact.address.country', v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputRow label="Latitude" type="number" value={getIn(form, 'contact.address.geo.lat')}
                    onChange={(v) => update('contact.address.geo.lat', parseFloat(v) || 0)} />
                  <InputRow label="Longitude" type="number" value={getIn(form, 'contact.address.geo.lng')}
                    onChange={(v) => update('contact.address.geo.lng', parseFloat(v) || 0)} />
                </div>
              </fieldset>
            </>
          )}

          {activeTab === 'social' && (
            <>
              {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'pinterest', 'whatsapp'].map((k) => (
                <InputRow key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={getIn(form, `social.${k}`)}
                  onChange={(v) => update(`social.${k}`, v)} placeholder="https://…" />
              ))}
            </>
          )}

          {activeTab === 'floatingButtons' && (
            <>
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-2">Floating Call Button</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!getIn(form, 'floatingButtons.call.enabled')}
                    onChange={(e) => update('floatingButtons.call.enabled', e.target.checked)} />
                  Enabled
                </label>
                <InputRow label="Phone (tel: format)" value={getIn(form, 'floatingButtons.call.phone')}
                  onChange={(v) => update('floatingButtons.call.phone', v)} />
                <InputRow label="ARIA Label" value={getIn(form, 'floatingButtons.call.ariaLabel')}
                  onChange={(v) => update('floatingButtons.call.ariaLabel', v)} />
              </fieldset>
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-2">Floating WhatsApp Button</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!getIn(form, 'floatingButtons.whatsapp.enabled')}
                    onChange={(e) => update('floatingButtons.whatsapp.enabled', e.target.checked)} />
                  Enabled
                </label>
                <InputRow label="WhatsApp URL" value={getIn(form, 'floatingButtons.whatsapp.url')}
                  onChange={(v) => update('floatingButtons.whatsapp.url', v)} />
                <InputRow label="ARIA Label" value={getIn(form, 'floatingButtons.whatsapp.ariaLabel')}
                  onChange={(v) => update('floatingButtons.whatsapp.ariaLabel', v)} />
              </fieldset>
            </>
          )}

          {activeTab === 'layoutMeta' && (
            <>
              <InputRow label="Theme Color (hex)" value={getIn(form, 'layoutMeta.themeColor')}
                onChange={(v) => update('layoutMeta.themeColor', v)} />
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="Geo Region (e.g. IN-RJ)" value={getIn(form, 'layoutMeta.geoRegion')}
                  onChange={(v) => update('layoutMeta.geoRegion', v)} />
                <InputRow label="Geo Placename" value={getIn(form, 'layoutMeta.geoPlacename')}
                  onChange={(v) => update('layoutMeta.geoPlacename', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="Geo Position (lat;lng)" value={getIn(form, 'layoutMeta.geoPosition')}
                  onChange={(v) => update('layoutMeta.geoPosition', v)} />
                <InputRow label="ICBM (lat, lng)" value={getIn(form, 'layoutMeta.icbm')}
                  onChange={(v) => update('layoutMeta.icbm', v)} />
              </div>
              <InputRow label="Googlebot Directives" value={getIn(form, 'layoutMeta.googlebot')}
                onChange={(v) => update('layoutMeta.googlebot', v)} />
              <InputRow label="Bingbot Directives" value={getIn(form, 'layoutMeta.bingbot')}
                onChange={(v) => update('layoutMeta.bingbot', v)} />
              <ImageUploader label="Favicon (.ico)" value={getIn(form, 'layoutMeta.faviconIco')}
                onChange={(url) => update('layoutMeta.faviconIco', url)} height="h-24" />
              <ImageUploader label="Apple Touch Icon" value={getIn(form, 'layoutMeta.appleTouchIcon')}
                onChange={(url) => update('layoutMeta.appleTouchIcon', url)} height="h-24" />
            </>
          )}

          {activeTab === 'stats' && (
            <StatsEditor items={getIn(form, 'stats', [])} onChange={(v) => update('stats', v)} />
          )}

          {activeTab === 'trustBadges' && (
            <StringArrayEditor label="Hero Trust Badges (3 items)" items={getIn(form, 'trustBadges', [])}
              onChange={(v) => update('trustBadges', v)} placeholder="Badge text" />
          )}

          {activeTab === 'personSchema' && (
            <>
              <InputRow label="Person Name" value={getIn(form, 'personSchema.name')}
                onChange={(v) => update('personSchema.name', v)} />
              <InputRow label="Job Title" value={getIn(form, 'personSchema.jobTitle')}
                onChange={(v) => update('personSchema.jobTitle', v)} />
              <InputRow label="Works For" value={getIn(form, 'personSchema.worksFor')}
                onChange={(v) => update('personSchema.worksFor', v)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkArrayEditor({ label, items, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <button type="button" onClick={() => onChange([...(items || []), { label: '', href: '', order: items?.length || 0 }])}
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add link
        </button>
      </div>
      <div className="space-y-2">
        {(items || []).map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input value={it.label || ''}
              onChange={(e) => { const next = [...items]; next[i] = { ...it, label: e.target.value }; onChange(next); }}
              placeholder="Label" className="input-field col-span-4" />
            <input value={it.href || ''}
              onChange={(e) => { const next = [...items]; next[i] = { ...it, href: e.target.value }; onChange(next); }}
              placeholder="/path or https://…" className="input-field col-span-6" />
            <button type="button" className="col-span-1 text-gray-500" onClick={() => {
              if (i === 0) return;
              const next = [...items];
              [next[i - 1], next[i]] = [next[i], next[i - 1]];
              onChange(next);
            }}><ChevronUp className="w-4 h-4" /></button>
            <button type="button" className="col-span-1 text-red-500" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BranchOfficeEditor({ items, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">Branch Offices</label>
        <button type="button" onClick={() => onChange([...(items || []), { city: '', address: '', phone: '', hours: '', email: '', mapLink: '', order: items?.length || 0 }])}
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add office
        </button>
      </div>
      <div className="space-y-3">
        {(items || []).map((it, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Office #{i + 1}</span>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={it.city || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, city: e.target.value }; onChange(n); }}
                placeholder="City" className="input-field" />
              <input value={it.phone || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, phone: e.target.value }; onChange(n); }}
                placeholder="Phone" className="input-field" />
            </div>
            <textarea value={it.address || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, address: e.target.value }; onChange(n); }}
              placeholder="Address" rows={2} className="input-field" />
            <div className="grid grid-cols-2 gap-2">
              <input value={it.hours || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, hours: e.target.value }; onChange(n); }}
                placeholder="Hours" className="input-field" />
              <input value={it.email || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, email: e.target.value }; onChange(n); }}
                placeholder="Email" className="input-field" />
            </div>
            <input value={it.mapLink || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, mapLink: e.target.value }; onChange(n); }}
              placeholder="Google Maps link" className="input-field" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsEditor({ items, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">Stats Counters</label>
        <button type="button" onClick={() => onChange([...(items || []), { label: '', value: '', icon: '', order: items?.length || 0 }])}
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add stat
        </button>
      </div>
      <div className="space-y-2">
        {(items || []).map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input value={it.value || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, value: e.target.value }; onChange(n); }}
              placeholder="5000+" className="input-field col-span-3" />
            <input value={it.label || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, label: e.target.value }; onChange(n); }}
              placeholder="Happy Customers" className="input-field col-span-5" />
            <input value={it.icon || ''} onChange={(e) => { const n = [...items]; n[i] = { ...it, icon: e.target.value }; onChange(n); }}
              placeholder="Lucide icon name" className="input-field col-span-3" />
            <button type="button" className="col-span-1 text-red-500" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
