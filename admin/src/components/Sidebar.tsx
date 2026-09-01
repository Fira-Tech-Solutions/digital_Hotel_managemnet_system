import React from 'react';
import { 
  UtensilsCrossed, 
  LayoutDashboard, 
  BookOpen, 
  Palette, 
  QrCode, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sparkles,
  Building2,
  Monitor,
  CalendarCheck,
  Shield
} from 'lucide-react';
import { ScreenType } from '../types';
import { HotelLogo } from './HotelLogo';

interface SidebarProps {
  activeScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingOrdersCount: number;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onSelectScreen,
  collapsed,
  onToggleCollapse,
  pendingOrdersCount,
  onOpenAuth,
  isLoggedIn,
}) => {
  const menuItems: {
    id: ScreenType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    section?: string;
  }[] = [
    { id: 'live-orders', label: 'Live Orders', icon: UtensilsCrossed, badge: pendingOrdersCount },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: BookOpen },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2, section: 'enterprise' },
    { id: 'stations', label: 'Stations', icon: Monitor, section: 'enterprise' },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, section: 'enterprise' },
    { id: 'guests', label: 'Guests', icon: Users, section: 'enterprise' },
    { id: 'roles', label: 'Roles', icon: Shield, section: 'enterprise' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      id="main-sidebar"
      className={`relative flex flex-col h-screen bg-[#111317] border-r border-slate-800/80 transition-all duration-300 select-none z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/80 min-h-[76px]">
        {collapsed ? (
          <div className="mx-auto">
            <HotelLogo variant="icon" size="sm" />
          </div>
        ) : (
          <HotelLogo variant="full" size="md" />
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          const showEnterpriseHeader = item.section === 'enterprise' && (index === 0 || menuItems[index - 1]?.section !== 'enterprise');

          return (
            <React.Fragment key={item.id}>
              {showEnterpriseHeader && !collapsed && (
                <div className="pt-4 pb-1.5 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Enterprise
                  </span>
                </div>
              )}
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onSelectScreen(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(217,119,6,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                {/* Active gold left indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_#f59e0b]" />
                )}

                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {/* Badge for notifications or active count */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`flex items-center justify-center text-xs font-bold rounded-full transition-all ${
                      collapsed 
                        ? 'absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px]' 
                        : 'px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Live Sync / System status badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Kitchen Link
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">LIVE 60fps</span>
          </div>
        </div>
      )}

      {/* Footer controls: Collapse button & Auth button */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          id="btn-sidebar-auth"
          onClick={onOpenAuth}
          className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${
            isLoggedIn
              ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
          }`}
          title={isLoggedIn ? 'Sign Out / Switch Profile' : 'Authenticate'}
        >
          {isLoggedIn ? (
            <>
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Switch Role</span>}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {!collapsed && <span>Login</span>}
            </>
          )}
        </button>

        <button
          id="btn-sidebar-toggle"
          onClick={onToggleCollapse}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
