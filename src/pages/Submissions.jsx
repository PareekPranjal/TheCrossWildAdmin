import React, { useEffect, useState } from 'react';
import { Trash2, Download, Loader2 } from 'lucide-react';
import { subscribersAPI, contactSubmissionsAPI, quoteSubmissionsAPI } from '../services/api';

const TABS = [
  { key: 'subscribers', label: 'Newsletter Subscribers' },
  { key: 'contact', label: 'Contact Form' },
  { key: 'quote', label: 'Quote Requests' },
];

export default function Submissions() {
  const [tab, setTab] = useState('subscribers');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Submissions</h1>
        <p className="text-gray-600 mt-1">Visitor signups, contact forms, and quote requests</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${tab === t.key ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'subscribers' && <SubscribersTab />}
      {tab === 'contact' && <ContactsTab />}
      {tab === 'quote' && <QuotesTab />}
    </div>
  );
}

function downloadCSV(rows, headers, filename) {
  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function SubscribersTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const res = await subscribersAPI.getAll(); setItems(res.subscribers || []); }
    finally { setLoading(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete subscriber?')) return;
    await subscribersAPI.delete(id); load();
  };
  return (
    <div className="card overflow-x-auto">
      <div className="flex justify-end mb-3">
        <button onClick={() => downloadCSV(items.map((s) => ({ email: s.email, source: s.source, createdAt: s.createdAt })), ['email', 'source', 'createdAt'], 'subscribers.csv')}
          className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
          <th className="py-2 px-3">Email</th><th className="py-2 px-3">Source</th><th className="py-2 px-3">Date</th><th></th>
        </tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={4} className="text-center py-6 text-gray-500">Loading…</td></tr>
           : items.length === 0 ? <tr><td colSpan={4} className="text-center py-6 text-gray-500">No subscribers yet.</td></tr>
           : items.map((s) => (
            <tr key={s._id} className="border-b border-gray-100">
              <td className="py-2 px-3">{s.email}</td>
              <td className="py-2 px-3 text-xs text-gray-500">{s.source}</td>
              <td className="py-2 px-3 text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="py-2 px-3"><button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContactsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const res = await contactSubmissionsAPI.getAll(); setItems(res.submissions || []); }
    finally { setLoading(false); }
  };
  const updateStatus = async (id, status) => { await contactSubmissionsAPI.updateStatus(id, status); load(); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete submission?')) return;
    await contactSubmissionsAPI.delete(id); load();
  };
  return (
    <div className="card overflow-x-auto">
      <div className="flex justify-end mb-3">
        <button onClick={() => downloadCSV(items.map((s) => ({ name: s.name, email: s.email, phone: s.phone, message: s.message, status: s.status, createdAt: s.createdAt })), ['name', 'email', 'phone', 'message', 'status', 'createdAt'], 'contacts.csv')}
          className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
          <th className="py-2 px-3">Name</th><th className="py-2 px-3">Email</th><th className="py-2 px-3">Phone</th><th className="py-2 px-3">Message</th><th className="py-2 px-3">Status</th><th className="py-2 px-3">Date</th><th></th>
        </tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={7} className="text-center py-6 text-gray-500">Loading…</td></tr>
           : items.length === 0 ? <tr><td colSpan={7} className="text-center py-6 text-gray-500">No submissions yet.</td></tr>
           : items.map((s) => (
            <tr key={s._id} className="border-b border-gray-100">
              <td className="py-2 px-3">{s.name}</td>
              <td className="py-2 px-3 text-xs">{s.email}</td>
              <td className="py-2 px-3 text-xs">{s.phone}</td>
              <td className="py-2 px-3 text-xs max-w-xs truncate" title={s.message}>{s.message}</td>
              <td className="py-2 px-3">
                <select value={s.status} onChange={(e) => updateStatus(s._id, e.target.value)} className="text-xs rounded px-2 py-1 bg-gray-100">
                  {['new', 'read', 'handled', 'archived'].map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </td>
              <td className="py-2 px-3 text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="py-2 px-3"><button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuotesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const res = await quoteSubmissionsAPI.getAll(); setItems(res.submissions || []); }
    finally { setLoading(false); }
  };
  const updateStatus = async (id, status) => { await quoteSubmissionsAPI.updateStatus(id, status); load(); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete quote?')) return;
    await quoteSubmissionsAPI.delete(id); load();
  };
  return (
    <div className="card overflow-x-auto">
      <div className="flex justify-end mb-3">
        <button onClick={() => downloadCSV(items.map((s) => ({ name: s.name, email: s.email, phone: s.phone, enquiry: s.enquiry, location: s.location, status: s.status, createdAt: s.createdAt })), ['name', 'email', 'phone', 'enquiry', 'location', 'status', 'createdAt'], 'quotes.csv')}
          className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
          <th className="py-2 px-3">Name</th><th className="py-2 px-3">Email</th><th className="py-2 px-3">Phone</th><th className="py-2 px-3">Location</th><th className="py-2 px-3">Enquiry</th><th className="py-2 px-3">Status</th><th className="py-2 px-3">Date</th><th></th>
        </tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={8} className="text-center py-6 text-gray-500">Loading…</td></tr>
           : items.length === 0 ? <tr><td colSpan={8} className="text-center py-6 text-gray-500">No quote requests.</td></tr>
           : items.map((s) => (
            <tr key={s._id} className="border-b border-gray-100">
              <td className="py-2 px-3">{s.name}</td>
              <td className="py-2 px-3 text-xs">{s.email}</td>
              <td className="py-2 px-3 text-xs">{s.phone}</td>
              <td className="py-2 px-3 text-xs">{s.location}</td>
              <td className="py-2 px-3 text-xs max-w-xs truncate" title={s.enquiry}>{s.enquiry}</td>
              <td className="py-2 px-3">
                <select value={s.status} onChange={(e) => updateStatus(s._id, e.target.value)} className="text-xs rounded px-2 py-1 bg-gray-100">
                  {['new', 'read', 'handled', 'archived'].map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </td>
              <td className="py-2 px-3 text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="py-2 px-3"><button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
