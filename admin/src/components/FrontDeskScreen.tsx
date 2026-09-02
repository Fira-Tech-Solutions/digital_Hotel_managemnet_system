import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Hotel,
  BedDouble,
  Users,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  Key,
  CreditCard,
  ChevronRight,
  Eye,
  Filter,
  DoorOpen,
  DoorClosed,
  Sparkles,
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

interface Booking {
  id: string;
  guestName: string;
  guest: { firstName: string; lastName: string; email: string; phone: string };
  roomNumber: string | null;
  roomType: { name: string };
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
  adults: number;
  children: number;
  specialRequests?: string;
}

type ViewMode = 'arrivals' | 'departures' | 'rooms';

const ROOM_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  READY: { label: 'Vacant', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', icon: DoorOpen },
  OCCUPIED: { label: 'Occupied', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30', icon: DoorClosed },
  DIRTY: { label: 'Dirty', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30', icon: AlertTriangle },
  CLEANING: { label: 'Cleaning', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30', icon: Sparkles },
  INSPECTED: { label: 'Inspected', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
  MAINTENANCE: { label: 'Maintenance', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle },
  OUT_OF_ORDER: { label: 'Out of Order', color: 'text-slate-400', bgColor: 'bg-slate-500/10 border-slate-500/30', icon: XCircle },
};

const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'text-slate-300', bgColor: 'bg-slate-500/15 border-slate-500/30' },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30' },
  CHECKED_IN: { label: 'Checked In', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30' },
  CHECKED_OUT: { label: 'Checked Out', color: 'text-slate-400', bgColor: 'bg-slate-500/15 border-slate-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30' },
};

export const FrontDeskScreen: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('arrivals');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.allSettled([
        apiRequest<Room[]>('/api/admin/rooms'),
        apiRequest<Booking[]>('/api/admin/bookings'),
      ]);
      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value);
    } catch { /* partial */ }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Today's arrivals (CONFIRMED or PENDING with check-in today)
  const todayArrivals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return bookings.filter((b) => {
      const checkIn = new Date(b.checkInDate);
      return checkIn >= today && checkIn < tomorrow && ['CONFIRMED', 'PENDING'].includes(b.status);
    });
  }, [bookings, currentTime]);

  // Today's departures (CHECKED_OUT today or CHECKED_IN with checkout today)
  const todayDepartures = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return bookings.filter((b) => {
      const checkOut = new Date(b.checkOutDate);
      return checkOut >= today && checkOut < tomorrow && (b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT');
    });
  }, [bookings, currentTime]);

  // Room stats
  const roomStats = useMemo(() => {
    const stats = { total: rooms.length, ready: 0, occupied: 0, dirty: 0, cleaning: 0, maintenance: 0 };
    rooms.forEach((r) => {
      if (r.status === 'READY') stats.ready++;
      else if (r.status === 'OCCUPIED') stats.occupied++;
      else if (r.status === 'DIRTY') stats.dirty++;
      else if (r.status === 'CLEANING') stats.cleaning++;
      else if (['MAINTENANCE', 'OUT_OF_ORDER'].includes(r.status)) stats.maintenance++;
    });
    return stats;
  }, [rooms]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    let list = viewMode === 'arrivals' ? todayArrivals : todayDepartures;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) =>
        `${b.guest.firstName} ${b.guest.lastName}`.toLowerCase().includes(q) ||
        b.roomNumber?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [viewMode, todayArrivals, todayDepartures, searchQuery]);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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
          <h1 className="text-sm font-bold text-white">{getGreeting()}, {user?.name?.split(' ')[0] || 'Agent'}</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(currentTime)} {formatTime(currentTime)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Front Desk Active</span>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-4 py-3 bg-[#121417] border-b border-slate-800/50">
        <div className="p-3 rounded-xl bg-[#16191F] border border-slate-800/90">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rooms</span>
          <div className="text-xl font-extrabold text-white font-mono mt-1">{roomStats.total}</div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Available</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{roomStats.ready}</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Occupied</span>
          <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">{roomStats.occupied}</div>
        </div>
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Dirty</span>
          <div className="text-xl font-extrabold text-red-400 font-mono mt-1">{roomStats.dirty}</div>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Today</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-bold text-emerald-400 font-mono">{todayArrivals.length} in</span>
            <span className="text-sm font-bold text-blue-400 font-mono">{todayDepartures.length} out</span>
          </div>
        </div>
      </div>

      {/* View Mode Tabs + Search */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#121417]">
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
          {[
            { mode: 'arrivals' as ViewMode, label: 'Arrivals', icon: ArrowUpRight, count: todayArrivals.length, color: 'text-emerald-400' },
            { mode: 'departures' as ViewMode, label: 'Departures', icon: ArrowDownRight, count: todayDepartures.length, color: 'text-blue-400' },
            { mode: 'rooms' as ViewMode, label: 'All Rooms', icon: BedDouble, count: rooms.length, color: 'text-slate-300' },
          ].map(({ mode, label, icon: Icon, count, color }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === mode
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${viewMode === mode ? color : ''}`} />
              {label}
              <span className={`text-[10px] font-mono ${viewMode === mode ? color : 'text-slate-500'}`}>{count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Guest or room..."
            className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs w-32"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {viewMode === 'rooms' ? (
          /* Room Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {rooms.map((room) => {
              const config = ROOM_STATUS_CONFIG[room.status] || ROOM_STATUS_CONFIG.OUT_OF_ORDER;
              const Icon = config.icon;
              return (
                <div
                  key={room.id}
                  className={`p-3 rounded-xl border ${config.bgColor} transition-all hover:scale-[1.02] cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-extrabold text-white font-mono">{room.number}</span>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 block">{room.roomType.name}</span>
                  <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
                  {room.floor && (
                    <span className="text-[9px] text-slate-600 block mt-1">F{room.floor}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Arrivals / Departures List */
          <div className="space-y-2.5">
            {filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                {viewMode === 'arrivals' ? (
                  <CalendarCheck className="w-10 h-10 text-slate-600 mb-2" />
                ) : (
                  <DoorClosed className="w-10 h-10 text-slate-600 mb-2" />
                )}
                <p className="text-sm text-slate-400">
                  {viewMode === 'arrivals' ? 'No arrivals expected today' : 'No departures expected today'}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const statusConfig = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.PENDING;
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#16191F] border border-slate-800/90 hover:border-slate-700 transition-all"
                  >
                    {/* Guest Info */}
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {booking.guest.firstName} {booking.guest.lastName}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        {booking.roomNumber && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3 h-3" />
                            Room {booking.roomNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3" />
                          {formatDate(new Date(booking.checkInDate))} — {formatDate(new Date(booking.checkOutDate))}
                        </span>
                        {booking.guest.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.guest.phone}
                          </span>
                        )}
                      </div>
                      {booking.specialRequests && (
                        <p className="text-[10px] text-amber-400 mt-1 truncate">
                          Note: {booking.specialRequests}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {viewMode === 'arrivals' && booking.status === 'CONFIRMED' && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all active:scale-95">
                          <Key className="w-3.5 h-3.5" />
                          Check In
                        </button>
                      )}
                      {viewMode === 'departures' && booking.status === 'CHECKED_IN' && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-all active:scale-95">
                          <CreditCard className="w-3.5 h-3.5" />
                          Check Out
                        </button>
                      )}
                      <button className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
