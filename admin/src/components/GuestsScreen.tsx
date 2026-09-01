import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Crown,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { Guest } from '../types';

interface GuestsScreenProps {
  guests: Guest[];
  onAddGuest: (data: Omit<Guest, 'id' | 'bookingsCount' | 'createdAt' | 'bookings'>) => void;
  onEditGuest: (id: string, data: Partial<Guest>) => void;
}

export const GuestsScreen: React.FC<GuestsScreenProps> = ({
  guests,
  onAddGuest,
  onEditGuest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIsVip, setNewIsVip] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail) {
      onAddGuest({ name: newName, email: newEmail, phone: newPhone, isVip: newIsVip });
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewIsVip(false);
      setIsAddModalOpen(false);
    }
  };

  const startEdit = (guest: Guest) => {
    setEditingId(guest.id);
    setEditName(guest.name);
    setEditEmail(guest.email);
    setEditPhone(guest.phone);
  };

  const saveEdit = (id: string) => {
    onEditGuest(id, { name: editName, email: editEmail, phone: editPhone });
    setEditingId(null);
  };

  const formatBookingStatus = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      CONFIRMED: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      CHECKED_IN: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      CHECKED_OUT: 'bg-slate-700/50 text-slate-400 border-slate-600',
      CANCELLED: 'bg-red-500/10 text-red-300 border-red-500/30',
    };
    return map[status] || 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Guests</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage guest profiles and view booking history.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Guest</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Guests Table */}
      <div className="rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6"></th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Phone</th>
                <th className="py-3.5 px-6 text-center">VIP</th>
                <th className="py-3.5 px-6 text-center">Bookings</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filtered.map((guest) => {
                const isExpanded = expandedId === guest.id;
                return (
                  <React.Fragment key={guest.id}>
                    <tr
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : guest.id)}
                    >
                      <td className="py-4 px-3 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 inline" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 inline" />
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === guest.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center border border-slate-700 flex-shrink-0">
                              {guest.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <span className="font-bold text-sm text-white">{guest.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === guest.id ? (
                          <input
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        ) : (
                          <span className="text-slate-300 text-[11px]">{guest.email}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === guest.id ? (
                          <input
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        ) : (
                          <span className="text-slate-300 text-[11px] font-mono">{guest.phone}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {guest.isVip && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                            <Crown className="w-2.5 h-2.5" />
                            VIP
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                          {guest.bookingsCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {editingId === guest.id ? (
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => saveEdit(guest.id)}
                              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(guest);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-900/40">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
                            <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Booking History</h4>
                            {guest.bookings && guest.bookings.length > 0 ? (
                              <div className="space-y-2">
                                {guest.bookings.map((b) => (
                                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                                    <div className="flex items-center gap-4">
                                      <div className="text-[11px] text-slate-300">
                                        <span className="font-semibold">{b.roomNumber}</span> · {b.roomType}
                                      </div>
                                      <div className="text-[11px] text-slate-400 font-mono">
                                        {b.checkIn} → {b.checkOut}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${formatBookingStatus(b.status)}`}>
                                        {b.status.replace('_', ' ')}
                                      </span>
                                      <span className="font-bold text-white">${b.total.toLocaleString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500">No booking history</p>
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
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No guests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#151921] border border-slate-700 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Add Guest</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 234 567 890"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-300">VIP Status</label>
                <button
                  type="button"
                  onClick={() => setNewIsVip(!newIsVip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    newIsVip
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Crown className="w-3 h-3 inline mr-1" />
                  {newIsVip ? 'VIP' : 'Standard'}
                </button>
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
                  Add Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
