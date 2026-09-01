import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Booking, BookingStatus, Guest, TableQR } from '../types';

interface BookingsScreenProps {
  bookings: Booking[];
  guests: Guest[];
  tables: TableQR[];
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onAddBooking: (data: {
    guestId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    specialRequests: string;
  }) => void;
}

const statusTabs: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'CHECKED_IN', label: 'Checked In' },
  { key: 'CHECKED_OUT', label: 'Checked Out' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  CONFIRMED: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  CHECKED_IN: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  CHECKED_OUT: 'bg-slate-700/50 text-slate-400 border-slate-600',
  CANCELLED: 'bg-red-500/10 text-red-300 border-red-500/30',
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  CANCELLED: 'Cancelled',
};

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  bookings,
  guests,
  tables,
  onUpdateBookingStatus,
  onAddBooking,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGuestId, setNewGuestId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newRequests, setNewRequests] = useState('');

  const filtered = bookings.filter((b) => {
    const matchesTab = activeTab === 'all' || b.status === activeTab;
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGuestId && newRoomId && newCheckIn && newCheckOut) {
      onAddBooking({
        guestId: newGuestId,
        roomId: newRoomId,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        specialRequests: newRequests,
      });
      setNewGuestId('');
      setNewRoomId('');
      setNewCheckIn('');
      setNewCheckOut('');
      setNewRequests('');
      setIsAddModalOpen(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Bookings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage reservations, check-ins, and guest bookings.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New Booking</span>
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-900/60 border border-slate-800 rounded-2xl">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
                {bookings.filter((b) => b.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by guest or room..."
          className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6"></th>
                <th className="py-3.5 px-6">Guest</th>
                <th className="py-3.5 px-6">Room</th>
                <th className="py-3.5 px-6">Check-in</th>
                <th className="py-3.5 px-6">Check-out</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filtered.map((booking) => {
                const isExpanded = expandedId === booking.id;
                return (
                  <React.Fragment key={booking.id}>
                    <tr
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    >
                      <td className="py-4 px-3 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 inline" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 inline" />
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-white">{booking.guestName}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {booking.roomNumber}
                        </span>
                        <span className="ml-1.5 text-[11px] text-slate-500">{booking.roomType}</span>
                      </td>
                      <td className="py-4 px-6 text-[11px] font-mono text-slate-300">{booking.checkIn}</td>
                      <td className="py-4 px-6 text-[11px] font-mono text-slate-300">{booking.checkOut}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyles[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-sm text-white">
                        {formatCurrency(booking.total)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-900/40">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Details</h4>
                              <div className="flex justify-between"><span className="text-slate-400">Booking ID</span><span className="text-slate-200 font-mono text-[10px]">{booking.id.slice(-8)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Created</span><span className="text-slate-200">{booking.createdAt}</span></div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Actions</h4>
                              <div className="flex flex-wrap gap-2">
                                {booking.status === 'PENDING' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateBookingStatus(booking.id, 'CONFIRMED'); }}
                                    className="px-3 py-1.5 bg-blue-500/20 text-blue-300 text-[11px] font-bold rounded-lg border border-blue-500/30 hover:bg-blue-500/30"
                                  >
                                    <CheckCircle className="w-3 h-3 inline mr-1" />Confirm
                                  </button>
                                )}
                                {booking.status === 'CONFIRMED' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateBookingStatus(booking.id, 'CHECKED_IN'); }}
                                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30"
                                  >
                                    Check In
                                  </button>
                                )}
                                {booking.status === 'CHECKED_IN' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateBookingStatus(booking.id, 'CHECKED_OUT'); }}
                                    className="px-3 py-1.5 bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-600 hover:bg-slate-600"
                                  >
                                    Check Out
                                  </button>
                                )}
                                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateBookingStatus(booking.id, 'CANCELLED'); }}
                                    className="px-3 py-1.5 bg-red-500/20 text-red-300 text-[11px] font-bold rounded-lg border border-red-500/30 hover:bg-red-500/30"
                                  >
                                    <XCircle className="w-3 h-3 inline mr-1" />Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                            {booking.specialRequests && (
                              <div className="space-y-2">
                                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Special Requests</h4>
                                <p className="text-slate-300 flex items-start gap-1.5">
                                  <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                                  {booking.specialRequests}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#151921] border border-slate-700 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">New Booking</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest</label>
                <select
                  required
                  value={newGuestId}
                  onChange={(e) => setNewGuestId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select guest...</option>
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room</label>
                <select
                  required
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select room...</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>Table {t.tableNumber} ({t.zone})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Special Requests</label>
                <textarea
                  placeholder="Any special requests or notes..."
                  value={newRequests}
                  onChange={(e) => setNewRequests(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 resize-none h-20"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
