import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  LogIn,
  KeyRound
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface StaffScreenProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onAddUser: (user: Omit<UserProfile, 'id' | 'lastLogin'>) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchToUser: (user: UserProfile) => void;
}

export const StaffScreen: React.FC<StaffScreenProps> = ({
  users,
  currentUser,
  onAddUser,
  onToggleUserStatus,
  onDeleteUser,
  onSwitchToUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('Kitchen');
  const [newStaffDept, setNewStaffDept] = useState('Hot Line');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaffName && newStaffEmail) {
      onAddUser({
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
        department: newStaffDept,
        avatar: '',
        initials: newStaffName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
        status: 'Active',
      });
      setNewStaffName('');
      setNewStaffEmail('');
      setIsInviteModalOpen(false);
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Manager':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Kitchen':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Waiter':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'Sommelier':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'Host':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Team Roster & Access Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage restaurant personnel, role credentials, station assignments, and terminal permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-invite-staff"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Invite Staff</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="input-staff-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, station..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Waiter">Waiter</option>
            <option value="Sommelier">Sommelier</option>
          </select>
        </div>
      </div>

      {/* Staff Table matching Image 14.png */}
      <div className="rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Name & Details</th>
                <th className="py-3.5 px-6">Role & Department</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6">Last Login</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filteredUsers.map((user) => {
                const isCurrent = currentUser.id === user.id;

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* User Profile Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-9 h-9 rounded-full object-cover border border-amber-500/30" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center border border-slate-700">
                            {user.initials || user.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeStyle(user.role)}`}>
                          {user.role}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {user.department}
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onToggleUserStatus(user.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          user.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span>{user.status}</span>
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {user.lastLogin}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Switch to this user */}
                        <button
                          onClick={() => onSwitchToUser(user)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors"
                          title="Switch active session to this user"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#151921] border border-slate-700 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chef Antoine Dupont"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. antoine.d@adama.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Kitchen">Kitchen Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Waiter">Waiter / Runner</option>
                    <option value="Sommelier">Sommelier</option>
                    <option value="Host">Host / Reception</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Station / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Garde Manger"
                    value={newStaffDept}
                    onChange={(e) => setNewStaffDept(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Send Invite & Key PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
