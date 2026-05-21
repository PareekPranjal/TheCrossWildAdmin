import React, { useEffect, useState } from 'react';
import { Search, Trash2, Eye, X, Loader2, Package, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import { ordersAPI } from '../services/api';

const STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => { load(); }, [statusFilter, search]);

  const load = async () => {
    setLoading(true);
    try {
      const [oRes, sRes] = await Promise.all([
        ordersAPI.getAll({ status: statusFilter || undefined, search: search || undefined }),
        ordersAPI.getStats().catch(() => ({ stats: null })),
      ]);
      setOrders(oRes.orders || []);
      setStats(sRes.stats || null);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    await ordersAPI.updateStatus(id, status);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    await ordersAPI.delete(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <p className="text-gray-600 mt-1">Customer orders submitted via the checkout flow</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatBox icon={Package} color="text-blue-600" bg="bg-blue-50" label="Total" value={stats.total} />
          <StatBox icon={Clock} color="text-yellow-600" bg="bg-yellow-50" label="Pending" value={stats.pending} />
          <StatBox icon={Loader2} color="text-indigo-600" bg="bg-indigo-50" label="Processing" value={stats.processing} />
          <StatBox icon={CheckCircle} color="text-green-600" bg="bg-green-50" label="Completed" value={stats.completed} />
          <StatBox icon={IndianRupee} color="text-purple-600" bg="bg-purple-50" label="Revenue" value={`₹${stats.totalRevenue?.toLocaleString() || 0}`} />
        </div>
      )}

      <div className="card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order #, name, email…" className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
              <th className="py-2 px-3">Order #</th>
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3">Items</th>
              <th className="py-2 px-3">Total</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-6 text-gray-500">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-6 text-gray-500">No orders.</td></tr>
            ) : orders.map((o) => (
              <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="py-2 px-3">
                  <div className="font-medium">{o.customerName}</div>
                  <div className="text-xs text-gray-500">{o.customerEmail}</div>
                </td>
                <td className="py-2 px-3">{o.items?.length || 0}</td>
                <td className="py-2 px-3 font-semibold">₹{o.total?.toLocaleString() || 0}</td>
                <td className="py-2 px-3">
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}
                    className={`text-xs rounded px-2 py-1 ${statusColor(o.status)}`}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="py-2 px-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="py-2 px-3 flex gap-1">
                  <button onClick={() => setViewing(o)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(o._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function StatBox({ icon: Icon, color, bg, label, value }) {
  return (
    <div className={`card flex items-center gap-3 ${bg}`}>
      <Icon className={`w-7 h-7 ${color}`} />
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function statusColor(s) {
  return {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100';
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Order {order.orderNumber}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Customer</h3>
              <div>{order.customerName}</div>
              <div className="text-gray-500">{order.customerEmail}</div>
              <div className="text-gray-500">{order.customerPhone}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Shipping</h3>
              {order.shippingAddress ? (
                <>
                  <div>{order.shippingAddress.address}</div>
                  <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                  <div>{order.shippingAddress.pincode}</div>
                </>
              ) : <div className="text-gray-400">No address</div>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {(order.items || []).map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded" />}
                  <div className="flex-1">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">{[it.size, it.color].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>× {it.quantity}</div>
                    <div className="font-semibold">₹{it.price?.toLocaleString() || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between font-bold border-t pt-3">
            <span>Total</span>
            <span>₹{order.total?.toLocaleString() || 0}</span>
          </div>

          {order.notes && (
            <div>
              <h3 className="font-semibold mb-1">Notes</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
