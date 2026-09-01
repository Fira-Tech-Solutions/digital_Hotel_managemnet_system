import { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, BedDouble, Utensils, Loader2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (cartId: string, newQuantity: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (specialRequests: string) => void | Promise<void>;
  onBackToMenu: () => void;
  suiteNumber: string;
}

export function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  onBackToMenu,
  suiteNumber,
}: CartViewProps) {
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const serviceChargeRate = 0.125;
  const serviceCharge = subtotal * serviceChargeRate;
  const total = subtotal + serviceCharge;

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmitOrder(specialRequests);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div
        id="adama-cart-empty-view"
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center pb-24 max-w-md mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-[#1c1813] border border-[#362e22] flex items-center justify-center text-[#e5be52] mb-4">
          <Utensils className="w-7 h-7 stroke-[1.6]" />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold text-[#f5ebd6]">
          Your Tasting List is Empty
        </h2>
        <p className="text-xs text-[#a0907c] mt-2 max-w-xs leading-relaxed">
          Explore our seasonal menu to select your culinary courses, wines, and pairing experiences.
        </p>
        <button
          onClick={onBackToMenu}
          className="mt-6 px-6 py-3 rounded-full bg-[#e5be52] text-[#0e0d0b] font-semibold text-xs tracking-wider uppercase hover:bg-[#f3cc5e] transition-all shadow-md active:scale-95"
        >
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div id="adama-cart-view" className="min-h-screen pb-32 pt-2 px-4 max-w-md mx-auto space-y-5">
      <div className="pt-2">
        <h2
          id="cart-title"
          className="font-serif-luxury text-3xl font-bold text-[#f7eedc] tracking-tight"
        >
          Order Review
        </h2>
        <p className="text-xs text-[#9e8f7c] mt-1 font-sans">
          Curated selections for your dining experience.
        </p>
      </div>

      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.cartId}
            id={`cart-item-${item.cartId}`}
            className="p-3.5 rounded-2xl bg-[#161310] border border-[#2b251d] flex items-center gap-3.5 shadow-md"
          >
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#201b15] shrink-0 border border-[#382f24]">
              <img
                src={item.dish.image}
                alt={item.dish.name}
                className="w-full h-full object-cover object-center filter brightness-95"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#f3ebde] truncate leading-tight">
                {item.dish.name}
              </h3>

              <div className="text-[11px] text-[#9c8e7b] mt-0.5 space-y-0.5">
                {item.selectedCutSize && (
                  <p>{item.selectedCutSize.name}</p>
                )}
                {item.selectedTemp && (
                  <p>{item.selectedTemp}</p>
                )}
                {item.specialInstructions && (
                  <p className="italic text-[#baa890] truncate">
                    "{item.specialInstructions}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end justify-between shrink-0 h-full py-0.5 gap-2">
              <span className="font-serif-luxury text-base font-bold text-[#e5be52]">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>

              <div className="flex items-center bg-[#201b16] border border-[#362e24] rounded-lg px-1.5 py-0.5">
                <button
                  onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                  className="p-1 text-[#b8a791] hover:text-white transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-xs font-semibold text-[#f0e7d8]">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                  className="p-1 text-[#b8a791] hover:text-white transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-[#161310] border border-[#2b251d] space-y-2">
        <label
          htmlFor="textarea-special-requests"
          className="block text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans"
        >
          Special Requests
        </label>
        <textarea
          id="textarea-special-requests"
          rows={3}
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Dietary requirements or preferences..."
          className="w-full p-3 bg-[#110e0c] border border-[#2d261e] rounded-xl text-xs text-[#eae2d5] placeholder-[#6e6354] focus:outline-none focus:border-[#d4af37]/60 resize-none font-sans"
        />
      </div>

      <div className="p-5 rounded-2xl bg-[#161310] border border-[#2b251d] space-y-4 shadow-xl">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#a0907c]">
            <span>Subtotal</span>
            <span className="font-medium text-[#d9cebe]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-[#a0907c]">
            <span>Service Charge (12.5%)</span>
            <span className="font-medium text-[#d9cebe]">${serviceCharge.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#29231b] flex items-baseline justify-between">
          <span className="font-serif-luxury text-2xl font-bold text-[#f5ebd6]">
            Total
          </span>
          <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#e5be52]">
            ${total.toFixed(2)}
          </span>
        </div>

        <button
          id="btn-submit-order"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-[#e5be52] hover:bg-[#f3cc5e] active:scale-[0.98] text-[#0e0d0b] font-serif-luxury font-bold text-xl tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#e5be52]/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Transmitting to Kitchen...</span>
            </>
          ) : (
            <>
              <span>Submit Order</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] tracking-widest text-[#9e8f7a] uppercase font-medium pt-1">
          <BedDouble className="w-3.5 h-3.5 text-[#e5c365]" />
          <span>Charged to {suiteNumber}</span>
        </div>
      </div>
    </div>
  );
}
