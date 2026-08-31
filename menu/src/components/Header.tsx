import { Menu, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onOpenDrawer: () => void;
  onOpenCart?: () => void;
  cartCount: number;
  tableNumber: string;
  onTableClick?: () => void;
  showCartButton?: boolean;
}

export function Header({
  currentTab,
  onOpenDrawer,
  onOpenCart,
  cartCount,
  tableNumber,
  onTableClick,
  showCartButton = false,
}: HeaderProps) {
  const isLanding = currentTab === 'landing';

  return (
    <header
      id="adama-app-header"
      className={`w-full z-40 px-5 py-4 flex items-center justify-between transition-colors duration-300 ${
        isLanding
          ? 'absolute top-0 left-0 right-0 bg-gradient-to-b from-[#0a0908]/90 via-[#0a0908]/40 to-transparent'
          : 'sticky top-0 bg-[#0e0d0b]/95 backdrop-blur-md border-b border-[#25201a]'
      }`}
    >
      {/* Hamburger menu button */}
      <button
        id="btn-header-menu"
        onClick={onOpenDrawer}
        aria-label="Open navigation menu"
        className="w-10 h-10 -ml-1 flex items-center justify-center text-[#e5c365] hover:text-[#f7e096] transition-colors active:scale-95 focus:outline-none"
      >
        <Menu className="w-6 h-6 stroke-[1.8]" />
      </button>

      {/* Brand Title */}
      <div className="flex flex-col items-center justify-center">
        <h1
          id="header-brand-logo"
          className="font-cinzel text-xl md:text-2xl font-bold tracking-[0.28em] text-[#e5c365] select-none pl-1"
        >
          ADAMA
        </h1>
      </div>

      {/* Right Table / Cart indicator */}
      <div className="flex items-center gap-2">
        <button
          id="btn-table-indicator"
          onClick={onTableClick}
          className="px-3.5 py-1.5 rounded-full bg-[#1e1a14]/90 border border-[#3d3427] text-xs font-medium text-[#d9c3a3] hover:border-[#d4af37]/60 hover:text-[#f7e096] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Change Table or View Suite"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#e5c365] animate-pulse"></span>
          <span>{tableNumber}</span>
        </button>

        {showCartButton && cartCount > 0 && onOpenCart && (
          <button
            id="btn-header-cart"
            onClick={onOpenCart}
            aria-label="View Cart"
            className="relative p-2 text-[#e5c365] hover:text-[#f7e096] transition-colors active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e5be52] text-[#0e0d0b] text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
              {cartCount}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
