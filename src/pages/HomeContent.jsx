import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import SimpleCrudList from '../components/SimpleCrudList';
import {
  homeCapabilitiesAPI,
  homeWhyChooseAPI,
  homeProductHighlightsAPI,
  processStepsAPI,
  categoryHomeCardsAPI,
} from '../services/api';

const SECTIONS = [
  {
    key: 'capabilities',
    title: 'Home Capabilities',
    subtitle: 'T-Shirts / Bags / Caps cards in HomeBrandContent',
    api: homeCapabilitiesAPI,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'T-Shirts' },
      { key: 'items', label: 'Bullets', type: 'list', placeholder: 'Custom Corporate Tees, ...' },
      { key: 'link', label: 'Link', type: 'text', placeholder: '/product/…' },
      { key: 'image', label: 'Image (optional)', type: 'image' },
    ],
  },
  {
    key: 'whyChoose',
    title: 'Home Why Choose',
    subtitle: 'The 01/02/03 "Unmatched Customization" trio',
    api: homeWhyChooseAPI,
    fields: [
      { key: 'number', label: 'Number', type: 'text', placeholder: '01' },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'highlights',
    title: 'Home Product Highlights',
    subtitle: 'Mug / Cap / Digital Printing trio',
    api: homeProductHighlightsAPI,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'image', label: 'Image', type: 'image', required: true },
      { key: 'link', label: 'Link', type: 'text', placeholder: '/product/…' },
    ],
  },
  {
    key: 'processSteps',
    title: 'Process Steps',
    subtitle: 'Shown on home and /our_process — toggle via the page field',
    api: processStepsAPI,
    fields: [
      { key: 'number', label: 'Number', type: 'text', placeholder: '1' },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon (Lucide name)', type: 'text', placeholder: 'Handshake' },
      { key: 'image', label: 'Image (optional)', type: 'image' },
      { key: 'page', label: 'Page (home / our-process / both)', type: 'text', default: 'both' },
    ],
  },
  {
    key: 'categoryCards',
    title: 'Categories Home Cards',
    subtitle: '8 cards in the "What would you like to create?" grid',
    api: categoryHomeCardsAPI,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '👕' },
      { key: 'link', label: 'Link', type: 'text', placeholder: '/category/tshirts' },
      { key: 'popular', label: 'Show Popular badge', type: 'boolean' },
    ],
  },
];

export default function HomeContent() {
  const [open, setOpen] = useState({ capabilities: true });

  const toggle = (k) => setOpen({ ...open, [k]: !open[k] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Home Page Content</h1>
        <p className="text-gray-600 mt-1">All editable sections of the homepage in one place</p>
      </div>

      <div className="card text-sm text-gray-600">
        Note: Hero, Trust badges and Stats are managed on the{' '}
        <Link to="/site-settings" className="text-primary hover:underline font-semibold">Site Settings</Link> page.
      </div>

      {SECTIONS.map((s) => (
        <div key={s.key} className="card">
          <button onClick={() => toggle(s.key)} className="w-full flex items-center justify-between text-left">
            <div>
              <div className="text-lg font-bold text-gray-800">{s.title}</div>
              <div className="text-xs text-gray-500">{s.subtitle}</div>
            </div>
            {open[s.key] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {open[s.key] && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <SimpleCrudList
                embedded
                title={s.title}
                subtitle={s.subtitle}
                api={s.api}
                fields={s.fields}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
