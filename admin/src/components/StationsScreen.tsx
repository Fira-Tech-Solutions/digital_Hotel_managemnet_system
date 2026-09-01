import React, { useState } from 'react';
import {
  Monitor,
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Wifi,
  WifiOff,
  Cpu,
} from 'lucide-react';
import { Station, Department } from '../types';

interface StationsScreenProps {
  stations: Station[];
  departments: Department[];
  onAddStation: (data: Omit<Station, 'id' | 'lastSeen'>) => void;
  onEditStation: (id: string, data: Partial<Station>) => void;
  onDeleteStation: (id: string) => void;
}

export const StationsScreen: React.FC<StationsScreenProps> = ({
  stations,
  departments,
  onAddStation,
  onEditStation,
  onDeleteStation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDeptId, setNewDeptId] = useState('');
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDeptId, setEditDeptId] = useState('');

  const filtered = stations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || s.departmentId === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newCode && newDeptId) {
      const dept = departments.find((d) => d.id === newDeptId);
      onAddStation({
        name: newName,
        code: newCode,
        departmentId: newDeptId,
        departmentName: dept?.name || '',
        isOnline: false,
      });
      setNewName('');
      setNewCode('');
      setNewDeptId('');
      setIsAddModalOpen(false);
    }
  };

  const startEdit = (station: Station) => {
    setEditingId(station.id);
    setEditName(station.name);
    setEditCode(station.code);
    setEditDeptId(station.departmentId);
  };

  const saveEdit = (id: string) => {
    const dept = departments.find((d) => d.id === editDeptId);
    onEditStation(id, { name: editName, code: editCode, departmentId: editDeptId, departmentName: dept?.name || '' });
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Stations</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor station connectivity and manage device assignments.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Station</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((station) => (
          <div
            key={station.id}
            className="rounded-xl bg-[#16191F] border border-slate-800/90 p-4 shadow-lg hover:border-slate-700 transition-all"
          >
            {editingId === station.id ? (
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(station.id)}
                    className="flex-1 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1" />Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg border border-slate-700 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        station.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                      }`}
                    />
                    <span className="font-bold text-sm text-white">{station.name}</span>
                  </div>
                  {station.isOnline ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="space-y-2 text-[11px] mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Code</span>
                    <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{station.code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department</span>
                    <span className="text-slate-300">{station.departmentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Seen</span>
                    <span className="text-slate-300 font-mono">{station.lastSeen}</span>
                  </div>
                  {station.deviceInfo && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Device</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />{station.deviceInfo}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => startEdit(station)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-amber-500/20 hover:text-amber-400 border border-slate-700 hover:border-amber-500/30 transition-all flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />Edit
                  </button>
                  {deleteConfirmId === station.id ? (
                    <>
                      <button
                        onClick={() => {
                          onDeleteStation(station.id);
                          setDeleteConfirmId(null);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 hover:bg-red-500/30 transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-400 text-xs border border-slate-700 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(station.id)}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold hover:bg-red-500/20 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            <Monitor className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No stations found
          </div>
        )}
      </div>

      {/* Add Station Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#151921] border border-slate-700 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Add Station</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kitchen Terminal 1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KT-01"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  required
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
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
                  Create Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
