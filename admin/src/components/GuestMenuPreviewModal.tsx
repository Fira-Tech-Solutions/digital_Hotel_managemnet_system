import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  Sparkles, 
  Crown, 
  UtensilsCrossed, 
  Clock, 
  AlertCircle,
  Smartphone,
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MenuItem, ThemeConfig } from '../types';
import { HotelLogo } from './HotelLogo';

interface GuestMenuPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  theme: ThemeConfig;
  menuItems: MenuItem[];
  onPlaceOrder: (orderData: {
    tableNumber: string;
    items: { name: string; qty: number; specialAlert?: string; price: number }[];
    totalRevenue: number;
    isVip: boolean;
  }) => void;
}

export const GuestMenuPreviewModal: React.FC<GuestMenuPreviewModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  theme,
  menuItems,
  onPlaceOrder,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('Appetizers');
  const [cart, setCart] = useState<{ item: MenuItem; qty: number; notes: string }[]>([]);
  const [isOrdered, setIsOrdered] = useState(false);
  const [noteItem, setNoteItem] = useState<{ id: string; note: string } | null>(null);

  if (!isOpen) return null;

  const categories = ['Appetizers', 'Mains', 'Sides', 'Desserts', 'Drinks'];
  const filtered = menuItems.filter((i) => selectedCat === 'All' || i.category === selectedCat);

  const isVipTable = tableNumber.toLowerCase().includes('vip') || tableNumber.includes('12') || tableNumber.includes('05');

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (existing) {
        return prev.map((p) => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { item, qty: 1, notes: '' }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((p) => {
          if (p.item.id === itemId) {
            const next = p.qty + delta;
            return next > 0 ? { ...p, qty: next } : null;
          }
          return p;
        })
        .filter(Boolean) as { item: MenuItem; qty: number; notes: string }[];
    });
  };

  const handleSetItemNote = (itemId: string, note: string) => {
    setCart((prev) => prev.map((p) => p.item.id === itemId ? { ...p, notes: note } : p));
    setNoteItem(null);
  };

  const totalAmount = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    onPlaceOrder({
      tableNumber: tableNumber || '12',
      isVip: isVipTable,
      items: cart.map((c) => ({
        name: c.item.name,
        qty: c.qty,
        specialAlert: c.notes || undefined,
        price: c.item.price,
      })),
      totalRevenue: totalAmount,
    });

    setIsOrdered(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#E5B83B', '#F59E0B', '#10B981'],
    });

    setTimeout(() => {
      setIsOrdered(false);
      setCart([]);
      onClose();
    }, 2200);
  };

  const getFontFamilyStyle = () => {
    if (theme.primaryFont.includes('Playfair')) return "'Playfair Display', serif";
    if (theme.primaryFont.includes('Cormorant')) return "'Cormorant Garamond', serif";
    if (theme.primaryFont.includes('Cinzel')) return "'Cinzel', serif";
    return "'Plus Jakarta Sans', sans-serif";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Container simulating smartphone modal */}
      <div 
        id="guest-menu-preview-modal"
        className="w-full max-w-md h-[92vh] max-h-[780px] rounded-[36px] overflow-hidden flex flex-col shadow-2xl border-4 border-slate-700 relative text-slate-900"
        style={{ 
          backgroundColor: theme.backgroundColor || '#F8FAFC',
          fontFamily: getFontFamilyStyle()
        }}
      >
        {/* Top Floating App Bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/5 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HotelLogo variant="icon" size="sm" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                {theme.restaurantName}
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                {isVipTable && <Crown className="w-3 h-3 text-amber-500" />}
                {tableNumber || 'Table 12'} • Guest Order Menu
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2.5 bg-white/50 border-b border-black/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedCat === cat
                  ? 'text-slate-950 shadow-sm'
                  : 'bg-black/5 text-slate-600 hover:bg-black/10'
              }`}
              style={{
                backgroundColor: selectedCat === cat ? theme.primaryColor : undefined,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {filtered.map((item) => {
            const inCart = cart.find((c) => c.item.id === item.id);
            const isSoldOut = !item.isAvailable || item.isSoldOut;

            return (
              <div 
                key={item.id} 
                className={`p-3.5 bg-white rounded-2xl border shadow-sm flex gap-3.5 items-start ${
                  isSoldOut ? 'opacity-60 border-red-200' : 'border-black/5'
                }`}
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-black text-white uppercase">
                      Sold Out
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.name}
                    </h4>
                    <span 
                      className="text-xs font-extrabold font-mono"
                      style={{ color: theme.primaryColor }}
                    >
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                    {item.description || 'Prepared fresh by Chef de Cuisine with seasonal produce.'}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      {item.allergens && item.allergens.slice(0, 2).map((a) => (
                        <span key={a} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/5 text-slate-600">
                          {a}
                        </span>
                      ))}
                    </div>

                    {!isSoldOut && (
                      <div className="flex items-center gap-1.5">
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-black/5 px-2 py-0.5 rounded-full">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {inCart.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="px-3 py-1 rounded-full text-xs font-bold text-slate-950 flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Special Note pill if added */}
                  {inCart && (
                    <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {inCart.notes ? `Note: "${inCart.notes}"` : '+ Special culinary notes (e.g. No onion)'}
                      </span>
                      <button
                        onClick={() => setNoteItem({ id: item.id, note: inCart.notes })}
                        className="text-[10px] text-amber-600 font-bold hover:underline"
                      >
                        {inCart.notes ? 'Edit' : 'Add Note'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note Prompt Popup */}
        {noteItem && (
          <div className="absolute inset-x-4 bottom-24 bg-white p-4 rounded-2xl shadow-2xl border border-black/10 z-40 animate-slideUp">
            <h5 className="text-xs font-bold text-slate-900 mb-1">Special Preparation Instructions</h5>
            <input
              type="text"
              autoFocus
              defaultValue={noteItem.note}
              id="guest-item-note-input"
              placeholder="e.g. Medium Rare, Dressing on side, Gluten allergy"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl mb-3 focus:outline-none focus:border-amber-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetItemNote(noteItem.id, (e.target as HTMLInputElement).value);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNoteItem(null)}
                className="px-3 py-1 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('guest-item-note-input') as HTMLInputElement;
                  handleSetItemNote(noteItem.id, input ? input.value : '');
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold text-slate-950"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Floating Cart / Checkout Bar */}
        {cart.length > 0 && !isOrdered && (
          <div className="p-4 bg-white border-t border-black/5 shadow-2xl z-30">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-500">
                {cart.reduce((s, c) => s + c.qty, 0)} Items Selected
              </span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleSubmitOrder}
              className="w-full py-3 rounded-2xl text-xs font-extrabold text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm & Send Order to Kitchen</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Order Confirmed Screen Animation */}
        {isOrdered && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center z-50 animate-fadeIn">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-bounce"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Check className="w-8 h-8 text-slate-950" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Order Received!
            </h3>
            <p className="text-xs text-slate-600 max-w-xs mb-4">
              Your order for {tableNumber || 'Table 12'} has been routed directly to the kitchen display screen.
            </p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              Estimated Prep: 12 - 15 mins
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
