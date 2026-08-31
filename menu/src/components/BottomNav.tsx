import { UtensilsCrossed, ShoppingBag, QrCode, BellRing } from 'lucide-react';

export type TabType = 'landing' | 'explore' | 'cart' | 'orders' | 'concierge';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  cartCount: number;
  hasActiveOrder?: boolean;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  cartCount,
  hasActiveOrder = true,
}: BottomNavProps) {
  const tabs = [
    {
      id: 'explore' as TabType,
      label: 'Explore',
      icon: UtensilsCrossed,
    },
    {
      id: 'cart' as TabType,
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'orders' as TabType,
      label: 'Orders',
      icon: QrCode,
      hasDot: hasActiveOrder,
    },
    {
      id: 'concierge' as TabType,
      label: 'Concierge',
      icon: BellRing,
    },
  ];

  return (
    <nav
      id="adama-bottom-navigation"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e0d0b]/98 backdrop-blur-lg border-t border-[#231e17] px-3 py-2 max-w-md mx-auto"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[68px] rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'text-[#e5c365]'
                  : 'text-[#847867] hover:text-[#c4b39b]'
              }`}
            >
              {/* Highlight background pill for active tab */}
              {isActive && (
                <div className="absolute inset-0 bg-[#251f15]/70 rounded-xl -z-10 border border-[#443825]/40" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.6] group-hover:scale-105'
                  }`}
                />

                {/* Number Badge */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#e5be52] text-[#0e0d0b] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {tab.badge}
                  </span>
                )}

                {/* Dot for active order status */}
                {tab.hasDot && !tab.badge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-[#e5c365] rounded-full ring-2 ring-[#0e0d0b] animate-pulse" />
                )}
              </div>

              <span
                className={`text-[11px] mt-1 font-medium tracking-wide transition-colors ${
                  isActive ? 'text-[#f7e096] font-semibold' : 'text-[#847867]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
