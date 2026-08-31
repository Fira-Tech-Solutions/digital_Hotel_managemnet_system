import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  AlertCircle, 
  Filter, 
  Pause, 
  Play, 
  Plus, 
  Sparkles, 
  Crown, 
  UserCheck, 
  CheckSquare, 
  Square,
  ArrowRight,
  Flame,
  Volume2
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface LiveOrdersScreenProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onToggleItemPrep: (orderId: string, itemId: string) => void;
  onAddNewOrder: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const LiveOrdersScreen: React.FC<LiveOrdersScreenProps> = ({
  orders,
  onUpdateOrderStatus,
  onToggleItemPrep,
  onAddNewOrder,
  isPaused,
  onTogglePause,
}) => {
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const newOrders = orders.filter((o) => o.status === 'new');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#121417] text-slate-100 p-4 sm:p-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        {/* System Online Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            <span className="font-semibold text-slate-200">
              {isPaused ? 'Orders Paused' : 'System Online'}
            </span>
          </div>

          <span className="text-xs text-slate-400 hidden md:inline">
            Last synced: <span className="text-slate-300 font-mono">Just now</span>
          </span>
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Station Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              id="select-station-filter"
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">All Stations</option>
              <option value="grill" className="bg-slate-900 text-white">Grill & Meat</option>
              <option value="garde" className="bg-slate-900 text-white">Garde Manger</option>
              <option value="pasta" className="bg-slate-900 text-white">Pasta & Hot Line</option>
              <option value="bar" className="bg-slate-900 text-white">Bar & Beverage</option>
            </select>
          </div>

          {/* Pause / Resume Button */}
          <button
            id="btn-toggle-pause"
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPaused 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Orders' : 'Pause Orders'}</span>
          </button>

          {/* Quick Add Order */}
          <button
            id="btn-add-ticket"
            onClick={onAddNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Ticket</span>
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 overflow-hidden min-h-0">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="flex flex-col rounded-2xl bg-[#16191F]/90 border border-slate-800/90 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                New Orders
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 font-mono">
              {newOrders.length}
            </span>
          </div>

          {/* Column Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {newOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <ChefHat className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs font-medium text-slate-400">No new tickets</p>
                <p className="text-[11px] text-slate-600">Simulate an order to test</p>
              </div>
            ) : (
              newOrders.map((order) => (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="rounded-xl bg-[#1A1E26] border border-slate-700/70 p-4 shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          #{order.orderNumber}
                        </span>
                        {order.isVip ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                            <Crown className="w-2.5 h-2.5" />
                            Table {order.tableNumber} (VIP)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                            Table {order.tableNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{order.timeAgo}</span>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="py-3 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs">
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-slate-200">
                              <span className="text-amber-400 font-bold mr-1.5">{item.qty}x</span>
                              {item.name}
                            </span>
                          </div>
                          {item.specialAlert && (
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-semibold">
                              <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                              <span>{item.specialAlert}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accept Button */}
                  <button
                    id={`btn-accept-${order.id}`}
                    onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                    className="w-full mt-2 py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/15 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>Accept Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="flex flex-col rounded-2xl bg-[#16191F]/90 border border-slate-800/90 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Preparing
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 font-mono">
              {preparingOrders.length}
            </span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Flame className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs font-medium text-slate-400">All stations clear</p>
                <p className="text-[11px] text-slate-600">Accepted orders will appear here</p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="rounded-xl bg-[#1A1E26] border border-blue-500/30 p-4 shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          #{order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-semibold">
                          Table {order.tableNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-blue-400 text-xs font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{order.startedTimeAgo || order.timeAgo}</span>
                      </div>
                    </div>

                    {/* Interactive Checklist for Kitchen Plating */}
                    <div className="py-3 space-y-2.5">
                      {order.items.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => onToggleItemPrep(order.id, item.id)}
                          className="flex items-start gap-2 text-xs cursor-pointer group select-none"
                        >
                          <div className="mt-0.5 text-slate-400 group-hover:text-amber-400 transition-colors">
                            {item.prepChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </div>

                          <div className="flex-1">
                            <span className={`font-medium ${item.prepChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              <span className="text-amber-400 font-bold mr-1.5">{item.qty}x</span>
                              {item.name}
                            </span>

                            {item.specialAlert && (
                              <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold">
                                <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                                <span>{item.specialAlert}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mark Ready Button */}
                  <button
                    id={`btn-ready-${order.id}`}
                    onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                    className="w-full mt-2 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY / RUNNER */}
        <div className="flex flex-col rounded-2xl bg-[#16191F]/90 border border-slate-800/90 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Ready for Service
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 font-mono">
              {readyOrders.length}
            </span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <CheckCircle className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
                <p className="text-xs font-medium text-slate-400">No ready dishes</p>
                <p className="text-[11px] text-slate-600">Dishes waiting for runners appear here</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="rounded-xl bg-[#1A1E26] border border-emerald-500/30 p-4 shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Subtle pulsing green accent */}
                  <span className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          #{order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                          Table {order.tableNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold animate-pulse">
                        <UserCheck className="w-2.5 h-2.5" />
                        <span>Runner Alerted</span>
                      </div>
                    </div>

                    {/* Items summary */}
                    <div className="py-3 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs flex items-center justify-between">
                          <span className="text-slate-200 font-medium">
                            <span className="text-emerald-400 font-bold mr-1.5">{item.qty}x</span>
                            {item.name}
                          </span>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete / Served button */}
                  <button
                    id={`btn-complete-${order.id}`}
                    onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                    className="w-full mt-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-600 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>Confirm Delivered to Table</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
