import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  ChefHat,
  AlertCircle,
  Filter,
  Pause,
  Play,
  Flame,
  Volume2,
  Bell,
  BellOff,
  Timer,
  AlertTriangle,
  ArrowRight,
  Eye,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { getSocket } from '../lib/socket';

interface KDSOrder {
  id: string;
  orderNumber: number;
  tableNumber: string;
  status: string;
  total: number;
  createdAt: string;
  isVip: boolean;
  items: KDSOrderItem[];
  guestName?: string;
  notes?: string;
}

interface KDSOrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string; price: number };
  specialAlert?: string;
  prepChecked?: boolean;
}

interface KDSStats {
  total: number;
  overdue: number;
  avgTime: number;
}

type StationFilter = 'all' | 'grill' | 'garde' | 'pasta' | 'bar';

const OVERDUE_THRESHOLD_MIN = 15;
const URGENT_THRESHOLD_MIN = 10;

const STATION_LABELS: Record<StationFilter, string> = {
  all: 'All Stations',
  grill: 'Grill & Meat',
  garde: 'Garde Manger',
  pasta: 'Pasta & Hot Line',
  bar: 'Bar & Beverage',
};

const STATION_COLORS: Record<StationFilter, string> = {
  all: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  grill: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  garde: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  pasta: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  bar: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

export const KitchenDisplayScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [stationFilter, setStationFilter] = useState<StationFilter>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch active kitchen orders
  const fetchOrders = useCallback(async () => {
    try {
      const allOrders = await apiRequest<KDSOrder[]>('/api/admin/orders');
      // Filter to orders that are in the kitchen workflow
      const kitchenOrders = allOrders.filter((o) =>
        ['new', 'accepted', 'preparing', 'ready'].includes(o.status)
      );
      setOrders(kitchenOrders);
    } catch {
      // silently handle
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    const handleNewOrder = (order: KDSOrder) => {
      setOrders((prev) => [order, ...prev]);
      if (soundEnabled) playNotification();
    };

    const handleOrderUpdate = (updated: KDSOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)).filter((o) =>
          ['new', 'accepted', 'preparing', 'ready'].includes(o.status)
        )
      );
    };

    const sock = getSocket();
    sock.on('new_order', handleNewOrder);
    sock.on('order_updated', handleOrderUpdate);

    return () => {
      sock.off('new_order', handleNewOrder);
      sock.off('order_updated', handleOrderUpdate);
    };
  }, [soundEnabled]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (stationFilter === 'all') return orders;
    return orders;
  }, [orders, stationFilter]);

  const newOrders = filteredOrders.filter((o) => o.status === 'new' || o.status === 'accepted');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready');

  // Stats
  const stats: KDSStats = useMemo(() => {
    const now = new Date();
    const overdue = filteredOrders.filter((o) => {
      const mins = Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / 60000);
      return mins >= OVERDUE_THRESHOLD_MIN && o.status !== 'ready';
    }).length;

    const totalMins = filteredOrders.reduce((sum, o) => {
      return sum + (now.getTime() - new Date(o.createdAt).getTime()) / 60000;
    }, 0);

    return {
      total: filteredOrders.length,
      overdue,
      avgTime: filteredOrders.length > 0 ? Math.round(totalMins / filteredOrders.length) : 0,
    };
  }, [filteredOrders, currentTime]);

  const getTimeSince = (createdAt: string): { text: string; urgency: 'normal' | 'warning' | 'overdue' } => {
    const mins = Math.floor((currentTime.getTime() - new Date(createdAt).getTime()) / 60000);
    if (mins >= OVERDUE_THRESHOLD_MIN) return { text: `${mins}m`, urgency: 'overdue' };
    if (mins >= URGENT_THRESHOLD_MIN) return { text: `${mins}m`, urgency: 'warning' };
    return { text: `${mins}m`, urgency: 'normal' };
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'preparing' }),
      });
      fetchOrders();
    } catch {
      // handle
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ready' }),
      });
      fetchOrders();
    } catch {
      // handle
    }
  };

  const handleBumpOrder = async (orderId: string) => {
    try {
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      fetchOrders();
    } catch {
      // handle
    }
  };

  const playNotification = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // audio not available
    }
  };

  const getUrgencyStyle = (urgency: 'normal' | 'warning' | 'overdue') => {
    switch (urgency) {
      case 'overdue': return 'border-red-500/60 bg-red-500/5 shadow-red-500/10';
      case 'warning': return 'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10';
      default: return 'border-slate-700/70 bg-[#1A1E26]';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F1114] text-slate-100">
      {/* KDS Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#16191F] border-b border-slate-800/90">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white tracking-tight">Kitchen Display</span>
          </div>

          {/* Station Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value as StationFilter)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              {Object.entries(STATION_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="bg-slate-900 text-white">{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              Active: <span className="font-bold text-white font-mono">{stats.total}</span>
            </span>
            {stats.overdue > 0 && (
              <span className="text-red-400">
                Overdue: <span className="font-bold font-mono">{stats.overdue}</span>
              </span>
            )}
            <span className="text-slate-400">
              Avg: <span className="font-bold text-white font-mono">{stats.avgTime}m</span>
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <BellOff className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Pause */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* 3-Column Kanban */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 overflow-hidden min-h-0">
        {/* NEW / ACCEPTED */}
        <div className="flex flex-col rounded-xl bg-[#16191F]/90 border border-slate-800/90 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Incoming
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 font-mono">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {newOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <ChefHat className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs text-slate-500">No incoming orders</p>
              </div>
            ) : (
              newOrders.map((order) => {
                const time = getTimeSince(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-3.5 shadow-lg transition-all ${getUrgencyStyle(time.urgency)} ${
                      selectedOrder === order.id ? 'ring-2 ring-amber-500/40' : ''
                    }`}
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          #{order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          Table {order.tableNumber}
                        </span>
                        {order.isVip && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-mono font-bold ${
                        time.urgency === 'overdue' ? 'text-red-400' :
                        time.urgency === 'warning' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        <Timer className="w-3 h-3" />
                        {time.urgency === 'overdue' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                        {time.text}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="py-2 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs">
                          <span className="font-medium text-slate-200">
                            <span className="text-amber-400 font-bold mr-1">{item.quantity}x</span>
                            {item.menuItem.name}
                          </span>
                          {item.specialAlert && (
                            <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-semibold">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {item.specialAlert}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Accept Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptOrder(order.id);
                      }}
                      className="w-full mt-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/15 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>Accept & Start</span>
                      <Flame className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PREPARING */}
        <div className="flex flex-col rounded-xl bg-[#16191F]/90 border border-blue-500/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Preparing
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 font-mono">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <Flame className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs text-slate-500">All stations clear</p>
              </div>
            ) : (
              preparingOrders.map((order) => {
                const time = getTimeSince(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-3.5 shadow-lg transition-all ${getUrgencyStyle(time.urgency)} ${
                      selectedOrder === order.id ? 'ring-2 ring-blue-500/40' : ''
                    }`}
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          #{order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-semibold">
                          Table {order.tableNumber}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-mono font-bold ${
                        time.urgency === 'overdue' ? 'text-red-400' :
                        time.urgency === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        <Timer className="w-3 h-3" />
                        {time.urgency === 'overdue' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                        {time.text}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="py-2 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs">
                          <span className="font-medium text-slate-200">
                            <span className="text-blue-400 font-bold mr-1">{item.quantity}x</span>
                            {item.menuItem.name}
                          </span>
                          {item.specialAlert && (
                            <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-semibold">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {item.specialAlert}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mark Ready */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkReady(order.id);
                      }}
                      className="w-full mt-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Ready for Pickup</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* READY / BUMP */}
        <div className="flex flex-col rounded-xl bg-[#16191F]/90 border border-emerald-500/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Ready to Serve
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 font-mono">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs text-slate-500">No ready dishes</p>
              </div>
            ) : (
              readyOrders.map((order) => {
                const time = getTimeSince(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 shadow-lg transition-all relative overflow-hidden"
                  >
                    <span className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          #{order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                          Table {order.tableNumber}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold animate-pulse">
                        <Bell className="w-2.5 h-2.5" />
                        Runner
                      </span>
                    </div>

                    {/* Items */}
                    <div className="py-2 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs flex items-center justify-between">
                          <span className="text-slate-200 font-medium">
                            <span className="text-emerald-400 font-bold mr-1">{item.quantity}x</span>
                            {item.menuItem.name}
                          </span>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>

                    {/* Bump (Complete) */}
                    <button
                      onClick={() => handleBumpOrder(order.id)}
                      className="w-full mt-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>Confirm Delivered</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
