import React from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  Menu as MenuIcon, 
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { NotificationItem, ScreenType, UserProfile } from '../types';

interface TopNavbarProps {
  activeScreen: ScreenType;
  currentUser: UserProfile;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenGuestPreview: () => void;
  onAddTestOrder: () => void;
  onToggleMobileSidebar: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeScreen,
  currentUser,
  notifications,
  onOpenNotifications,
  onOpenAuth,
  onOpenGuestPreview,
  onAddTestOrder,
  onToggleMobileSidebar,
  soundEnabled,
  onToggleSound,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const screenTitles: Record<ScreenType, { title: string; subtitle: string }> = {
    'live-orders': {
      title: 'Kitchen Display & Live Orders',
      subtitle: 'Real-time order queue synchronized with tables and POS stations',
    },
    'dashboard': {
      title: 'Performance Overview',
      subtitle: 'Real-time revenue, order turnaround metrics, and popular dishes',
    },
    'menu': {
      title: 'Menu & Inventory Management',
      subtitle: 'Manage seasonal items, 86 status, stations, and dietary allergens',
    },
    'theme': {
      title: 'Guest Experience & Theme Customizer',
      subtitle: 'Design the guest mobile menu colors, luxury typography, and branding',
    },
    'qr-codes': {
      title: 'Table QR Code Generator',
      subtitle: 'Generate, test, and print high-resolution branded table QR codes',
    },
    'staff': {
      title: 'Staff Roster & Access Control',
      subtitle: 'Manage kitchen chefs, sommeliers, waitstaff, and managerial access',
    },
    'settings': {
      title: 'Adama Hotel & Restaurant Settings',
      subtitle: 'Configure hotel profile, service hours, languages, and reservations',
    },
    'departments': {
      title: 'Departments Management',
      subtitle: 'Manage organizational departments and their station assignments',
    },
    'stations': {
      title: 'Stations Overview',
      subtitle: 'Monitor station connectivity and manage device assignments',
    },
    'bookings': {
      title: 'Bookings & Reservations',
      subtitle: 'Manage reservations, check-ins, and guest bookings',
    },
    'guests': {
      title: 'Guest Directory',
      subtitle: 'Manage guest profiles and view booking history',
    },
    'roles': {
      title: 'Roles & Permissions',
      subtitle: 'Manage role-based access control and permission assignments',
    },
  };

  const currentInfo = screenTitles[activeScreen];

  return (
    <header 
      id="top-navbar"
      className="sticky top-0 z-20 flex items-center justify-between h-[76px] px-6 bg-[#111317]/95 backdrop-blur-md border-b border-slate-800/80"
    >
      {/* Left side: Hamburger (on mobile) and Screen Title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-400 truncate hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Quick Guest Mobile Preview button */}
        <button
          id="btn-guest-preview"
          onClick={onOpenGuestPreview}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          title="Open Live Guest Digital Menu Preview"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Guest View</span>
        </button>

        {/* Live Audio Chime Toggle */}
        <button
          id="btn-sound-toggle"
          onClick={onToggleSound}
          className={`p-2 rounded-lg text-xs transition-colors ${
            soundEnabled 
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
          }`}
          title={soundEnabled ? 'Order sound alerts: Enabled' : 'Order sound alerts: Muted'}
          aria-label="Toggle sound alerts"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Quick Simulate Order button (always accessible) */}
        <button
          id="btn-simulate-order"
          onClick={onAddTestOrder}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate Order</span>
        </button>

        {/* Notifications button with badge */}
        <button
          id="btn-notifications-trigger"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#111317] animate-pulse" />
          )}
        </button>

        {/* User profile capsule */}
        <div 
          id="user-profile-capsule"
          onClick={onOpenAuth}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-full cursor-pointer transition-all group"
        >
          {currentUser.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/40">
              {currentUser.initials || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-[100px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-amber-400 font-medium tracking-wide">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
