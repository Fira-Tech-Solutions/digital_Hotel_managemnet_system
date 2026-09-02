import React, { useState, useEffect, useCallback } from 'react';
import {
  Hotel,
  BedDouble,
  Users,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  Wrench,
  Sparkles,
  Activity,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  Wifi,
  WifiOff,
  Bell,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';

interface DashboardData {
  occupancy: {
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
  };
  todayOrders: {
    total: number;
    revenue: number;
    active: number;
  };
  activeServiceRequests: number;
  roomStatusSummary: Record<string, number>;
}

interface Room {
  id: string;
  number: string;
  status: string;
  roomType: { name: string; basePrice: string };
  floor: number | null;
}

interface Station {
  id: string;
  name: string;
  code: string;
  status: string;
  lastSeenAt: string | null;
  department: { name: string; code: string };
}

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: string;
  total: number;
}

interface ServiceRequest {
  id: string;
  serviceType: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  location: { name: string } | null;
  department: { name: string } | null;
}

export const ExecutiveCommandCenter: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, roomsRes, stationsRes, bookingsRes, srRes] = await Promise.allSettled([
        apiRequest<DashboardData>('/api/admin/reports/dashboard'),
        apiRequest<Room[]>('/api/admin/rooms'),
        apiRequest<Station[]>('/api/admin/stations'),
        apiRequest<Booking[]>('/api/admin/bookings'),
        apiRequest<ServiceRequest[]>('/api/admin/service-requests'),
      ]);
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value);
      if (stationsRes.status === 'fulfilled') setStations(stationsRes.value);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value);
      if (srRes.status === 'fulfilled') setServiceRequests(srRes.value);
    } catch {
      // partial failures handled by Promise.allSettled
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
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

  // Derived data
  const totalRooms = dashboard?.occupancy.totalRooms ?? rooms.length;
  const occupiedRooms = dashboard?.occupancy.occupiedRooms ?? rooms.filter((r) => r.status === 'OCCUPIED').length;
  const occupancyRate = dashboard?.occupancy.occupancyRate ?? (totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0);
  const todayRevenue = dashboard?.todayOrders.revenue ?? 0;
  const activeOrders = dashboard?.todayOrders.active ?? 0;
  const pendingSRs = serviceRequests.filter((sr) => sr.status === 'PENDING').length;
  const urgentSRs = serviceRequests.filter((sr) => sr.priority === 'URGENT' && sr.status !== 'COMPLETED').length;

  const arrivals = bookings.filter((b) => {
    const checkIn = new Date(b.checkIn);
    const today = new Date();
    return checkIn.toDateString() === today.toDateString() && (b.status === 'CONFIRMED' || b.status === 'PENDING');
  }).length;

  const departures = bookings.filter((b) => {
    const checkOut = new Date(b.checkOut);
    const today = new Date();
    return checkOut.toDateString() === today.toDateString() && b.status === 'CHECKED_IN';
  }).length;

  // Room status counts
  const roomStatusCounts = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Station health
  const onlineStations = stations.filter((s) => s.status === 'ONLINE').length;
  const offlineStations = stations.filter((s) => s.status !== 'ONLINE').length;

  // Department pulse
  const departmentPulse = [
    { name: 'Kitchen', icon: UtensilsCrossed, status: activeOrders > 10 ? 'busy' : activeOrders > 5 ? 'normal' : 'quiet', active: activeOrders },
    { name: 'Housekeeping', icon: BedDouble, status: (roomStatusCounts['DIRTY'] || 0) > 3 ? 'busy' : 'normal', active: roomStatusCounts['DIRTY'] || 0 },
    { name: 'Maintenance', icon: Wrench, status: pendingSRs > 3 ? 'attention' : 'normal', active: pendingSRs },
    { name: 'Front Desk', icon: Hotel, status: arrivals > 5 ? 'busy' : 'normal', active: arrivals },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'busy': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'attention': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'quiet': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'busy': return 'Busy';
      case 'attention': return 'Needs Attention';
      case 'quiet': return 'Quiet';
      default: return 'Normal';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Manager'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-slate-400">
              {formatDate(currentTime)}
            </p>
            <span className="text-xs font-mono text-slate-500">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Hotel Operating Normally</span>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Occupancy */}
        <div className="col-span-2 p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <BedDouble className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">{occupancyRate}%</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span>{occupiedRooms} / {totalRooms} rooms</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                occupancyRate > 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                occupancyRate > 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                'bg-gradient-to-r from-slate-500 to-slate-400'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white font-mono">
            {todayRevenue > 0 ? `$${todayRevenue.toLocaleString()}` : '—'}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Today</p>
        </div>

        {/* Arrivals */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Arrivals</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white font-mono">{arrivals}</span>
          <p className="text-[11px] text-slate-500 mt-1">Expected today</p>
        </div>

        {/* Departures */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Departures</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white font-mono">{departures}</span>
          <p className="text-[11px] text-slate-500 mt-1">Expected today</p>
        </div>

        {/* Active Orders */}
        <div className="p-5 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white font-mono">{activeOrders}</span>
          <p className="text-[11px] text-slate-500 mt-1">In progress</p>
        </div>
      </div>

      {/* Department Pulse + Room Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Pulse */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Department Pulse
          </h3>
          <div className="space-y-3">
            {departmentPulse.map((dept) => {
              const Icon = dept.icon;
              return (
                <div key={dept.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{dept.name}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(dept.status)}`}>
                    {getStatusLabel(dept.status)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Status Distribution */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-amber-400" />
            Room Status
          </h3>
          <div className="space-y-3">
            {[
              { status: 'READY', label: 'Ready', color: 'bg-emerald-400', icon: CheckCircle2 },
              { status: 'OCCUPIED', label: 'Occupied', color: 'bg-amber-400', icon: Users },
              { status: 'DIRTY', label: 'Needs Cleaning', color: 'bg-red-400', icon: AlertTriangle },
              { status: 'CLEANING', label: 'Being Cleaned', color: 'bg-blue-400', icon: RefreshCw },
              { status: 'MAINTENANCE', label: 'Maintenance', color: 'bg-orange-400', icon: Wrench },
            ].map(({ status, label, color, icon: Icon }) => {
              const count = roomStatusCounts[status] || 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{count}</span>
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${color}`}
                        style={{ width: `${totalRooms > 0 ? (count / totalRooms) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Station Health + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Station Health */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-amber-400" />
            Station Health
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">{onlineStations} Online</span>
            </div>
            {offlineStations > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-slate-400">{offlineStations} Offline</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {stations.map((station) => (
              <div key={station.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${station.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">{station.name}</span>
                    <span className="text-[10px] text-slate-500">{station.department.name}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {station.lastSeenAt ? new Date(station.lastSeenAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Service Requests */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Service Requests
            {urgentSRs > 0 && (
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {urgentSRs} URGENT
              </span>
            )}
          </h3>
          {serviceRequests.filter((sr) => sr.status !== 'COMPLETED').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
              <p className="text-sm text-slate-400">All requests handled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {serviceRequests
                .filter((sr) => sr.status !== 'COMPLETED')
                .slice(0, 5)
                .map((sr) => (
                  <div key={sr.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-200">
                        {sr.serviceType.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        sr.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                        sr.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {sr.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{sr.description || sr.location?.name || 'No details'}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(sr.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Needs Attention */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Needs Attention
          </h3>
          <div className="space-y-2">
            {urgentSRs > 0 && (
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-400">{urgentSRs} Urgent Service Request{urgentSRs > 1 ? 's' : ''}</span>
                </div>
                <p className="text-[11px] text-slate-400">Immediate attention required</p>
              </div>
            )}
            {(roomStatusCounts['MAINTENANCE'] || 0) > 0 && (
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400">{roomStatusCounts['MAINTENANCE']} Room{roomStatusCounts['MAINTENANCE'] > 1 ? 's' : ''} in Maintenance</span>
                </div>
                <p className="text-[11px] text-slate-400">Requires engineering attention</p>
              </div>
            )}
            {offlineStations > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{offlineStations} Station{offlineStations > 1 ? 's' : ''} Offline</span>
                </div>
                <p className="text-[11px] text-slate-400">Operational screens disconnected</p>
              </div>
            )}
            {urgentSRs === 0 && (roomStatusCounts['MAINTENANCE'] || 0) === 0 && offlineStations === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
                <p className="text-sm text-slate-400">No critical issues</p>
                <p className="text-[11px] text-slate-600 mt-1">All systems operational</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
