import React from 'react';
import { X, Check, Bell, AlertTriangle, ChefHat, CheckCircle2, Trash2 } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllRead,
  onClearAll,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        id="notification-drawer"
        className="w-full max-w-md bg-[#13171D] h-full border-l border-slate-800 flex flex-col shadow-2xl animate-slideLeft"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Notifications</h2>
              <p className="text-xs text-slate-400">
                {notifications.filter((n) => !n.isRead).length} unread alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/80 border-b border-slate-800/80 text-xs">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear list</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No active notifications</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onMarkAsRead(item.id);
                  if (item.orderId && onSelectOrder) {
                    onSelectOrder(item.orderId);
                    onClose();
                  }
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  item.isRead
                    ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                    : 'bg-slate-900/90 border-amber-500/30 text-slate-200 shadow-sm'
                }`}
              >
                {!item.isRead && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400" />
                )}

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.type === 'order' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {item.type === 'kitchen' && <ChefHat className="w-4 h-4 text-emerald-400" />}
                    {item.type === 'system' && <Bell className="w-4 h-4 text-blue-400" />}
                    {item.type === 'staff' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className={`text-xs font-semibold ${item.isRead ? 'text-slate-300' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
