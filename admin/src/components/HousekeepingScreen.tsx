import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BedDouble,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  Search,
  Wrench,
  Eye,
  ArrowRight,
  ClipboardList,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';

interface Room {
  id: string;
  number: string;
  status: string;
  floor: number | null;
  roomType: { id: string; name: string; basePrice: string };
}

type StatusFilter = 'all' | 'DIRTY' | 'CLEANING' | 'INSPECTED' | 'READY' | 'MAINTENANCE';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; textColor: string; priority: number }> = {
  READY: { label: 'Ready', color: 'bg-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', textColor: 'text-emerald-400', priority: 0 },
  INSPECTED: { label: 'Inspected', color: 'bg-emerald-300', bgColor: 'bg-emerald-500/10 border-emerald-500/30', textColor: 'text-emerald-300', priority: 1 },
  CLEANING: { label: 'Cleaning', color: 'bg-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30', textColor: 'text-blue-400', priority: 2 },
  DIRTY: { label: 'Needs Cleaning', color: 'bg-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30', textColor: 'text-amber-400', priority: 3 },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30', textColor: 'text-orange-400', priority: 4 },
  OUT_OF_ORDER: { label: 'Out of Order', color: 'bg-slate-400', bgColor: 'bg-slate-500/10 border-slate-500/30', textColor: 'text-slate-400', priority: 5 },
};

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All Rooms', color: 'text-slate-300' },
  { value: 'DIRTY', label: 'Needs Cleaning', color: 'text-amber-400' },
  { value: 'CLEANING', label: 'In Progress', color: 'text-blue-400' },
  { value: 'INSPECTED', label: 'Inspected', color: 'text-emerald-300' },
  { value: 'READY', label: 'Ready', color: 'text-emerald-400' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'text-orange-400' },
];

export const HousekeepingScreen: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchRooms = useCallback(async () => {
    try {
      const data = await apiRequest<Room[]>('/api/admin/rooms');
      setRooms(data);
    } catch { /* handle */ }
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleUpdateStatus = async (roomId: string, newStatus: string) => {
    try {
      await apiRequest(`/api/admin/rooms/${roomId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchRooms();
    } catch { /* handle */ }
  };

  // Stats
  const stats = useMemo(() => {
    const s = { total: rooms.length, dirty: 0, cleaning: 0, inspected: 0, ready: 0, occupied: 0, maintenance: 0 };
    rooms.forEach((r) => {
      if (r.status === 'DIRTY') s.dirty++;
      else if (r.status === 'CLEANING') s.cleaning++;
      else if (r.status === 'INSPECTED') s.inspected++;
      else if (r.status === 'READY') s.ready++;
      else if (r.status === 'OCCUPIED') s.occupied++;
      else if (['MAINTENANCE', 'OUT_OF_ORDER'].includes(r.status)) s.maintenance++;
    });
    return s;
  }, [rooms]);

  // Filtered and sorted rooms
  const filteredRooms = useMemo(() => {
    let list = statusFilter === 'all' ? rooms : rooms.filter((r) => r.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.number.toLowerCase().includes(q) || r.roomType.name.toLowerCase().includes(q));
    }
    // Sort by priority (dirty first)
    return [...list].sort((a, b) => {
      const pa = STATUS_CONFIG[a.status]?.priority ?? 99;
      const pb = STATUS_CONFIG[b.status]?.priority ?? 99;
      return pb - pa;
    });
  }, [rooms, statusFilter, searchQuery]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F1114] text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#16191F] border-b border-slate-800/90">
        <div>
          <h1 className="text-sm font-bold text-white">{getGreeting()}, Housekeeping</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Room status and cleaning assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 px-4 py-3 bg-[#121417] border-b border-slate-800/50">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Dirty', value: stats.dirty, color: 'text-amber-400', bgColor: stats.dirty > 0 ? 'bg-amber-500/5 border-amber-500/20' : '' },
          { label: 'Cleaning', value: stats.cleaning, color: 'text-blue-400', bgColor: stats.cleaning > 0 ? 'bg-blue-500/5 border-blue-500/20' : '' },
          { label: 'Inspected', value: stats.inspected, color: 'text-emerald-300' },
          { label: 'Ready', value: stats.ready, color: 'text-emerald-400' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-orange-400' },
        ].map(({ label, value, color, bgColor }) => (
          <div key={label} className={`p-2.5 rounded-xl border border-slate-800/90 ${bgColor || 'bg-[#16191F]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <div className={`text-lg font-extrabold font-mono mt-0.5 ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121417]">
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
          {STATUS_FILTER_OPTIONS.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === value ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Room or type..."
            className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs w-28"
          />
        </div>
      </div>

      {/* Room Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredRooms.map((room) => {
            const config = STATUS_CONFIG[room.status] || STATUS_CONFIG.OUT_OF_ORDER;
            return (
              <div
                key={room.id}
                className={`p-3.5 rounded-xl border ${config.bgColor} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-extrabold text-white font-mono">{room.number}</span>
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block">{room.roomType.name}</span>
                <span className={`text-[10px] font-bold ${config.textColor}`}>{config.label}</span>
                {room.floor && <span className="text-[9px] text-slate-600 block mt-1">Floor {room.floor}</span>}

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  {room.status === 'DIRTY' && (
                    <button
                      onClick={() => handleUpdateStatus(room.id, 'CLEANING')}
                      className="flex-1 py-1.5 px-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-[10px] font-bold rounded-lg transition-all"
                    >
                      Start Cleaning
                    </button>
                  )}
                  {room.status === 'CLEANING' && (
                    <button
                      onClick={() => handleUpdateStatus(room.id, 'INSPECTED')}
                      className="flex-1 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition-all"
                    >
                      Mark Inspected
                    </button>
                  )}
                  {room.status === 'INSPECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(room.id, 'READY')}
                      className="flex-1 py-1.5 px-2 bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold rounded-lg transition-all"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
