import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Receipt, 
  Users, 
  Download, 
  ChevronRight, 
  Calendar, 
  Utensils, 
  Crown,
  CheckCircle2
} from 'lucide-react';
import { Order, MenuItem } from '../types';

interface DashboardScreenProps {
  orders: Order[];
  menuItems: MenuItem[];
  onNavigateToMenu: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  orders,
  menuItems,
  onNavigateToMenu,
}) => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  const [exportNotice, setExportNotice] = useState<boolean>(false);

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalRevenue || 0), 4850);
  const totalOrdersCount = orders.length + 135;

  // Chart data for 7 days
  const weeklyData = [
    { day: 'Mon', count: 85, revenue: 3200 },
    { day: 'Tue', count: 98, revenue: 3900 },
    { day: 'Wed', count: 110, revenue: 4100 },
    { day: 'Thu', count: 125, revenue: 4600 },
    { day: 'Fri', count: 168, revenue: 6400 },
    { day: 'Sat', count: 195, revenue: 7800 },
    { day: 'Sun', count: 142, revenue: 4850 },
  ];

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Dining Room Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time performance metrics for the main dining room and private lounge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {exportNotice && (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-fadeIn">
              Report CSV Downloaded!
            </span>
          )}
          <button
            id="btn-export-report"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Orders */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {totalOrdersCount}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
              <span className="text-slate-400">vs. last Friday</span>
            </div>
          </div>
        </div>

        {/* Card 2: Avg Prep Time */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Avg Prep Time
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              12.5m
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[11px]">
                -2.5m Faster
              </span>
              <span>Target: 15m</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +8.4%
              </span>
              <span className="text-slate-400">vs target</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Tables */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Tables
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                18
              </span>
              <span className="text-sm text-slate-400 font-medium">/ 24 tables</span>
            </div>
            {/* Occupancy progress bar */}
            <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full w-[75%]" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">75% Dining Room Capacity</span>
          </div>
        </div>
      </div>

      {/* Main Visuals Row: 7-Day Chart & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Over 7 Days Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Orders Volume (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Peak service spikes occurring between 19:30 - 21:30
              </p>
            </div>

            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  timeRange === 'weekly' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  timeRange === 'monthly' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* SVG Bar Chart with Gold Highlights */}
          <div className="relative h-56 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {weeklyData.map((item, index) => {
              const heightPercent = (item.count / 200) * 100;
              const isToday = index === weeklyData.length - 1;

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 bg-slate-800 text-white text-[11px] px-2 py-1 rounded shadow-lg border border-slate-700 pointer-events-none z-10 font-mono whitespace-nowrap">
                    {item.count} orders (${item.revenue.toLocaleString()})
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[40px] bg-slate-800/80 rounded-t-lg relative overflow-hidden transition-all duration-300 group-hover:bg-slate-700 flex items-end" style={{ height: `${heightPercent}%` }}>
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday 
                          ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                          : 'bg-gradient-to-t from-amber-500/40 to-amber-500/80'
                      }`}
                      style={{ height: '100%' }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-xs font-semibold ${isToday ? 'text-amber-400' : 'text-slate-400'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Top Selling Dishes
              </h3>
              <button
                onClick={onNavigateToMenu}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Menu</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3.5">
              {menuItems.slice(0, 4).map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {item.category} • ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {item.ordersCount || 35 - idx * 6} orders
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ${((item.ordersCount || 35 - idx * 6) * item.price).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Kitchen efficiency rating</span>
            <span className="text-emerald-400 font-bold">98.4% On-Time</span>
          </div>
        </div>
      </div>

      {/* Recent Completed Orders Table */}
      <div className="rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Recent Completed Orders
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Service records with table routing, ticket fulfillment, and billings
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {completedOrders.length} Completed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Table</th>
                <th className="py-3 px-6">Time Completed</th>
                <th className="py-3 px-6">Items Ordered</th>
                <th className="py-3 px-6 text-right">Revenue</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {completedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-amber-400">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3.5 px-6 font-medium">
                    <span className="flex items-center gap-1.5">
                      {order.isVip && <Crown className="w-3 h-3 text-amber-400" />}
                      {order.tableNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400 font-mono">
                    {order.timeCompleted || '19:42 PM'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-slate-300">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-white">
                    ${order.totalRevenue ? order.totalRevenue.toFixed(2) : '185.00'}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Served
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
