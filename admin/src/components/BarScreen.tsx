import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wine,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Flame,
  Timer,
  Volume2,
  BellOff,
  Bell,
  ArrowRight,
  TrendingUp,
  Eye,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { getSocket } from '../lib/socket';

interface BarOrder {
  id: string;
  orderNumber: number;
  tableNumber: string;
  status: string;
  createdAt: string;
  isVip: boolean;
  items: BarOrderItem[];
  notes?: string;
}

interface BarOrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string; price: number };
  specialAlert?: string;
}

interface BarStats {
  total: number;
  waiting: number;
  avgTime: number;
}

export const BarScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BarOrder[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiRequest<BarOrder[]>('/api/admin/orders');
      setOrders(data.filter((o) => ['new', 'accepted', 'preparing', 'ready'].includes(o.status)));
    } catch { /* handle */ }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket.IO
  useEffect(() => {
    const sock = getSocket();
    const handleNew = (order: BarOrder) => { setOrders((prev) => [order, ...prev]); if (soundEnabled) playNotif(); };
    const handleUpdate = (updated: BarOrder) => {
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o).filter((o) => ['new', 'accepted', 'preparing', 'ready'].includes(o.status)));
    };
    sock.on('new_order', handleNew);
    sock.on('order_updated', handleUpdate);
    return () => { sock.off('new_order', handleNew); sock.off('order_updated', handleUpdate); };
  }, [soundEnabled]);

  const stats: BarStats = useMemo(() => {
    const now = new Date();
    const waiting = orders.filter((o) => o.status === 'new' || o.status === 'accepted').length;
    const totalMins = orders.reduce((s, o) => s + (now.getTime() - new Date(o.createdAt).getTime()) / 60000, 0);
    return {
      total: orders.length,
      waiting,
      avgTime: orders.length > 0 ? Math.round(totalMins / orders.length) : 0,
    };
  }, [orders, currentTime]);

  const getTimeSince = (createdAt: string) => {
    const mins = Math.floor((currentTime.getTime() - new Date(createdAt).getTime()) / 60000);
    if (mins >= 15) return { text: `${mins}m`, urgency: 'overdue' as const };
    if (mins >= 10) return { text: `${mins}m`, urgency: 'warning' as const };
    return { text: `${mins}m`, urgency: 'normal' as const };
  };

  const handleAccept = async (id: string) => {
    try { await apiRequest(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'preparing' }) }); fetchOrders(); } catch {}
  };
  const handleReady = async (id: string) => {
    try { await apiRequest(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'ready' }) }); fetchOrders(); } catch {}
  };
  const handleComplete = async (id: string) => {
    try { await apiRequest(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) }); fetchOrders(); } catch {}
  };

  const playNotif = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      gain.gain.value = 0.08;
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  const newOrders = orders.filter((o) => o.status === 'new' || o.status === 'accepted');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F1114] text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#16191F] border-b border-slate-800/90">
        <div className="flex items-center gap-3">
          <Wine className="w-5 h-5 text-purple-400" />
          <div>
            <span className="text-sm font-bold text-white">Bar Display</span>
            <span className="text-[11px] text-slate-400 ml-2">Beverage orders</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">Active: <span className="font-bold text-white font-mono">{stats.total}</span></span>
          <span className="text-purple-400">Avg: <span className="font-bold font-mono">{stats.avgTime}m</span></span>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-lg bg-slate-800 border border-slate-700">
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <BellOff className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 overflow-hidden min-h-0">
        {/* New */}
        <div className="flex flex-col rounded-xl bg-[#16191F]/90 border border-slate-800/90 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-purple-500/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300">Incoming</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 font-mono">{newOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {newOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <Wine className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs text-slate-500">No drink orders</p>
              </div>
            ) : newOrders.map((order) => {
              const time = getTimeSince(order.createdAt);
              return (
                <div key={order.id} className={`rounded-xl border p-3.5 shadow-lg transition-all ${
                  time.urgency === 'overdue' ? 'border-red-500/60 bg-red-500/5' :
                  time.urgency === 'warning' ? 'border-amber-500/40 bg-amber-500/5' :
                  'border-slate-700/70 bg-[#1A1E26]'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">#{order.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold">Table {order.tableNumber}</span>
                      {order.isVip && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">VIP</span>}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-mono font-bold ${
                      time.urgency === 'overdue' ? 'text-red-400' : time.urgency === 'warning' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      <Timer className="w-3 h-3" />
                      {time.text}
                    </div>
                  </div>
                  <div className="py-2 space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-xs">
                        <span className="font-medium text-slate-200">
                          <span className="text-purple-400 font-bold mr-1">{item.quantity}x</span>
                          {item.menuItem.name}
                        </span>
                        {item.specialAlert && (
                          <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 text-[10px] font-semibold">
                            <AlertCircle className="w-2.5 h-2.5" />{item.specialAlert}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleAccept(order.id)} className="w-full mt-1 py-2.5 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]">
                    <span>Accept</span><ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preparing */}
        <div className="flex flex-col rounded-xl bg-[#16191F]/90 border border-blue-500/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-300">Preparing</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 font-mono">{preparingOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <Flame className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs text-slate-500">All clear</p>
              </div>
            ) : preparingOrders.map((order) => {
              const time = getTimeSince(order.createdAt);
              return (
                <div key={order.id} className={`rounded-xl border p-3.5 shadow-lg transition-all ${
                  time.urgency === 'overdue' ? 'border-red-500/60 bg-red-500/5' :
                  time.urgency === 'warning' ? 'border-amber-500/40 bg-amber-500/5' :
                  'border-blue-500/30 bg-[#1A1E26]'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">#{order.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-semibold">Table {order.tableNumber}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-mono font-bold ${time.urgency === 'overdue' ? 'text-red-400' : 'text-blue-400'}`}>
                      <Timer className="w-3 h-3" />{time.text}
                    </div>
                  </div>
                  <div className="py-2 space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-xs">
                        <span className="font-medium text-slate-200">
                          <span className="text-blue-400 font-bold mr-1">{item.quantity}x</span>{item.menuItem.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleReady(order.id)} className="w-full mt-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]">
                    <CheckCircle className="w-3.5 h-3.5" /><span>Ready</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ready */}
        <div className="flex flex-col rounded-xl bg-[#16191F]/90 border border-emerald-500/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Ready</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 font-mono">{readyOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs text-slate-500">No ready drinks</p>
              </div>
            ) : readyOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 shadow-lg relative overflow-hidden">
                <span className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">#{order.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">Table {order.tableNumber}</span>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold animate-pulse">
                    <Bell className="w-2.5 h-2.5" />Runner
                  </span>
                </div>
                <div className="py-2 space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-medium">
                        <span className="text-emerald-400 font-bold mr-1">{item.quantity}x</span>{item.menuItem.name}
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ))}
                </div>
                <button onClick={() => handleComplete(order.id)} className="w-full mt-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-[0.98]">
                  <span>Confirm Delivered</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
