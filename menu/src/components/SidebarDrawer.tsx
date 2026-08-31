import { X, UtensilsCrossed, Wine, ChefHat, BedDouble, PhoneCall, Info, MapPin, Sparkles } from 'lucide-react';
import { TabType } from './BottomNav';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
  tableNumber: string;
  suiteNumber: string;
  onOpenTableModal: () => void;
}

export function SidebarDrawer({
  isOpen,
  onClose,
  onNavigate,
  tableNumber,
  suiteNumber,
  onOpenTableModal,
}: SidebarDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        id="adama-sidebar-drawer"
        className="relative z-10 w-4/5 max-w-xs h-full bg-[#110f0d] border-r border-[#2d251c] text-[#eae2d5] flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-left duration-300"
      >
        {/* Top Section */}
        <div className="space-y-6">
          {/* Header & Brand */}
          <div className="flex items-center justify-between border-b border-[#262018] pb-4">
            <div>
              <h2 className="font-cinzel text-xl font-bold tracking-[0.24em] text-[#e5c365]">
                ADAMA
              </h2>
              <p className="text-[10px] tracking-[0.22em] text-[#8e806f] uppercase mt-0.5">
                Adama Hotel
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1e1914] text-[#a89884] hover:text-white flex items-center justify-center border border-[#332b21]"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Table & Suite Card */}
          <div
            onClick={() => {
              onClose();
              onOpenTableModal();
            }}
            className="p-3.5 rounded-xl bg-[#1a1612] border border-[#382d20] hover:border-[#e5be52]/60 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#d9c3a3] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e5c365]" />
                {tableNumber}
              </span>
              <span className="text-[10px] text-[#e5be52] font-semibold group-hover:underline">
                Switch Table
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#8e7e6c]">
              <BedDouble className="w-3.5 h-3.5 text-[#9e8f7d]" />
              <span>Room Folio: {suiteNumber}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-wider text-[#91816e] uppercase px-2 mb-2 font-sans">
              Dining Companion
            </p>

            <button
              onClick={() => {
                onNavigate('landing');
                onClose();
              }}
              className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#d5c7b3] hover:bg-[#1f1a14] hover:text-[#f8df95] transition-colors flex items-center gap-2.5"
            >
              <Sparkles className="w-4 h-4 text-[#e5c365]" />
              <span>Welcome Portal</span>
            </button>

            <button
              onClick={() => {
                onNavigate('explore');
                onClose();
              }}
              className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#d5c7b3] hover:bg-[#1f1a14] hover:text-[#f8df95] transition-colors flex items-center gap-2.5"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#e5c365]" />
              <span>Explore Tasting Menu</span>
            </button>

            <button
              onClick={() => {
                onNavigate('orders');
                onClose();
              }}
              className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#d5c7b3] hover:bg-[#1f1a14] hover:text-[#f8df95] transition-colors flex items-center gap-2.5"
            >
              <ChefHat className="w-4 h-4 text-[#e5c365]" />
              <span>Kitchen Progress & Timeline</span>
            </button>

            <button
              onClick={() => {
                onNavigate('concierge');
                onClose();
              }}
              className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#d5c7b3] hover:bg-[#1f1a14] hover:text-[#f8df95] transition-colors flex items-center gap-2.5"
            >
              <PhoneCall className="w-4 h-4 text-[#e5c365]" />
              <span>Butler & Concierge</span>
            </button>
          </div>

          {/* Culinary Team Brief */}
          <div className="pt-2 border-t border-[#231e17] space-y-2">
            <p className="text-[10px] font-semibold tracking-wider text-[#91816e] uppercase font-sans">
              Culinary Direction
            </p>
            <div className="p-3 rounded-xl bg-[#16120e] border border-[#2d251c] space-y-1">
              <p className="font-serif-luxury text-sm font-bold text-[#f5ebd6]">
                Chef Antoine Laurent
              </p>
              <p className="text-[11px] text-[#938371] leading-relaxed">
                2 Michelin Star Laureate blending modern French technique with Japanese binchotan charcoal gastronomy.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-[#231e17] text-center space-y-1">
          <p className="text-[10px] tracking-widest text-[#786b5c] uppercase">
            Service Hours • 17:30 – 23:00
          </p>
          <p className="text-[10px] text-[#5e5346]">
            Adama Grand Salon © Adama Hotel
          </p>
        </div>
      </div>
    </div>
  );
}
