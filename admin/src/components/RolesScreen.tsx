import React, { useState } from 'react';
import {
  Shield,
  Search,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Role, Permission } from '../types';

interface RolesScreenProps {
  roles: Role[];
  onCreateRole: (data: Omit<Role, 'id' | 'permissionCount' | 'permissions'>) => void;
  onUpdateRolePermissions: (roleId: string, permissionIds: string[]) => void;
  onDeleteRole: (id: string) => void;
}

const permissionResources = [
  'orders',
  'menu',
  'tables',
  'staff',
  'bookings',
  'guests',
  'departments',
  'stations',
  'settings',
  'reports',
];

const permissionActions = ['read', 'create', 'update', 'delete'];

const defaultPermissions: Permission[] = permissionResources.flatMap((resource) =>
  permissionActions.map((action) => ({
    id: `${resource}:${action}`,
    resource,
    action,
    description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
  }))
);

export const RolesScreen: React.FC<RolesScreenProps> = ({
  roles,
  onCreateRole,
  onUpdateRolePermissions,
  onDeleteRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isEditingPerms, setIsEditingPerms] = useState(false);

  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName) {
      onCreateRole({ name: newName, description: newDescription, isSystem: false });
      setNewName('');
      setNewDescription('');
      setIsAddModalOpen(false);
    }
  };

  const startEditPermissions = (role: Role) => {
    setEditingPermissions(role.permissions.map((p) => p.id));
    setIsEditingPerms(true);
    setExpandedId(role.id);
  };

  const togglePermission = (permId: string) => {
    setEditingPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const savePermissions = (roleId: string) => {
    onUpdateRolePermissions(roleId, editingPermissions);
    setIsEditingPerms(false);
  };

  const toggleResourcePerms = (resource: string) => {
    const resourcePerms = defaultPermissions
      .filter((p) => p.resource === resource)
      .map((p) => p.id);
    const allSelected = resourcePerms.every((id) => editingPermissions.includes(id));
    if (allSelected) {
      setEditingPermissions((prev) => prev.filter((id) => !resourcePerms.includes(id)));
    } else {
      setEditingPermissions((prev) => [...new Set([...prev, ...resourcePerms])]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Roles & Permissions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage role-based access control and permission assignments.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Role</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roles..."
          className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Roles Table */}
      <div className="rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6"></th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6 text-center">System</th>
                <th className="py-3.5 px-6 text-center">Permissions</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filtered.map((role) => {
                const isExpanded = expandedId === role.id;
                return (
                  <React.Fragment key={role.id}>
                    <tr
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : role.id)}
                    >
                      <td className="py-4 px-3 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 inline" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 inline" />
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-white">{role.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-400 text-[11px]">{role.description}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {role.isSystem ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                            <Lock className="w-2.5 h-2.5" />
                            System
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                          {role.permissionCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!role.isSystem && (
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => startEditPermissions(role)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors"
                              title="Manage Permissions"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                            {deleteConfirmId === role.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    onDeleteRole(role.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(role.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Permissions Matrix */}
                    {isExpanded && (
                      <tr className="bg-slate-900/40">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                                Permission Matrix
                              </h4>
                              {!role.isSystem && (
                                <div className="flex gap-2">
                                  {isEditingPerms ? (
                                    <>
                                      <button
                                        onClick={() => savePermissions(role.id)}
                                        className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30"
                                      >
                                        Save Permissions
                                      </button>
                                      <button
                                        onClick={() => setIsEditingPerms(false)}
                                        className="px-3 py-1 bg-slate-800 text-slate-400 text-[11px] font-bold rounded-lg border border-slate-700 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => startEditPermissions(role)}
                                      className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded-lg border border-amber-500/30 hover:bg-amber-500/30"
                                    >
                                      <Edit3 className="w-3 h-3 inline mr-1" />Edit Permissions
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="border-b border-slate-800">
                                    <th className="py-2 px-3 text-left text-slate-400 font-semibold">Resource</th>
                                    {permissionActions.map((action) => (
                                      <th key={action} className="py-2 px-3 text-center text-slate-400 font-semibold capitalize">
                                        {action}
                                      </th>
                                    ))}
                                    <th className="py-2 px-3 text-center">
                                      {!role.isSystem && isEditingPerms && (
                                        <span className="text-[10px] text-slate-500">Toggle All</span>
                                      )}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                  {permissionResources.map((resource) => {
                                    const resourcePerms = defaultPermissions.filter((p) => p.resource === resource);
                                    const allSelected = resourcePerms.every((p) =>
                                      (isEditingPerms ? editingPermissions : role.permissions.map((p) => p.id)).includes(p.id)
                                    );
                                    return (
                                      <tr key={resource} className="hover:bg-slate-800/30">
                                        <td className="py-2 px-3 font-semibold text-slate-200 capitalize">{resource}</td>
                                        {permissionActions.map((action) => {
                                          const permId = `${resource}:${action}`;
                                          const permList = isEditingPerms ? editingPermissions : role.permissions.map((p) => p.id);
                                          const isChecked = permList.includes(permId);
                                          return (
                                            <td key={action} className="py-2 px-3 text-center">
                                              {isEditingPerms && !role.isSystem ? (
                                                <button
                                                  onClick={() => togglePermission(permId)}
                                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                    isChecked
                                                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                                      : 'bg-slate-800 border-slate-700 text-transparent'
                                                  }`}
                                                >
                                                  {isChecked && <Check className="w-3 h-3" />}
                                                </button>
                                              ) : (
                                                <span
                                                  className={`inline-block w-5 h-5 rounded border items-center justify-center ${
                                                    isChecked
                                                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 flex mx-auto'
                                                      : 'bg-slate-800 border-slate-700 flex mx-auto'
                                                  }`}
                                                >
                                                  {isChecked && <Check className="w-3 h-3" />}
                                                </span>
                                              )}
                                            </td>
                                          );
                                        })}
                                        <td className="py-2 px-3 text-center">
                                          {!role.isSystem && isEditingPerms && (
                                            <button
                                              onClick={() => toggleResourcePerms(resource)}
                                              className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
                                            >
                                              {allSelected ? 'None' : 'All'}
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No roles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Role Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#151921] border border-slate-700 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Create Role</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front Desk"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  placeholder="Describe the role..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
