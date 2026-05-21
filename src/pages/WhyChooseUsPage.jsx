import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import SimpleCrudList from '../components/SimpleCrudList';
import { whyChooseReasonsAPI, contentAPI } from '../services/api';

export default function WhyChooseUsPage() {
  const [intro, setIntro] = useState({ heading: '', paragraph1: '', paragraph2: '', breadcrumbDescription: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await contentAPI.getSection('why-choose-us', 'intro');
        setIntro({ ...intro, ...(res.data || {}) });
      } catch (_) {}
    })();
    // eslint-disable-next-line
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await contentAPI.upsertSection('why-choose-us', 'intro', intro);
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage('Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Why Choose Us Page</h1>
        <p className="text-gray-600 mt-1">/why-choose-us — intro + 11-reason grid</p>
      </div>

      <div className="card space-y-3">
        <h2 className="text-lg font-bold">Page Intro</h2>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Breadcrumb Description</label>
          <input value={intro.breadcrumbDescription || ''} onChange={(e) => setIntro({ ...intro, breadcrumbDescription: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
          <input value={intro.heading || ''} onChange={(e) => setIntro({ ...intro, heading: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Paragraph 1</label>
          <textarea value={intro.paragraph1 || ''} onChange={(e) => setIntro({ ...intro, paragraph1: e.target.value })} rows={3} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Paragraph 2</label>
          <textarea value={intro.paragraph2 || ''} onChange={(e) => setIntro({ ...intro, paragraph2: e.target.value })} rows={3} className="input-field" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Intro
          </button>
          {message && <span className={`text-sm ${message === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{message}</span>}
        </div>
      </div>

      <div className="card">
        <SimpleCrudList
          embedded
          title="Reasons Grid"
          subtitle="11-item grid"
          api={whyChooseReasonsAPI}
          fields={[
            { key: 'text', label: 'Reason text', type: 'text', required: true },
            { key: 'icon', label: 'Icon (Lucide name, optional)', type: 'text' },
          ]}
        />
      </div>
    </div>
  );
}
