import { useState, useId } from 'react';
import { X, Minus, Plus, Hourglass, Wine, Sparkles } from 'lucide-react';
import { Dish, CartItem, DishOption } from '../types';

interface DishDetailModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export function DishDetailModal({
  dish,
  isOpen,
  onClose,
  onAddToCart,
}: DishDetailModalProps) {
  if (!isOpen || !dish) return null;

  const defaultCut = dish.cutSizes ? dish.cutSizes[0] : undefined;
  const [selectedCut, setSelectedCut] = useState<DishOption | undefined>(defaultCut);
  const [selectedTemp, setSelectedTemp] = useState<string | undefined>(
    dish.cookingTemps ? dish.cookingTemps[1] || dish.cookingTemps[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const basePrice = dish.price;
  const extraCutPrice = selectedCut ? selectedCut.extraPrice : 0;
  const unitPrice = basePrice + extraCutPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const cartItem: CartItem = {
      cartId: `${dish.id}-${Date.now()}`,
      dish,
      quantity,
      selectedCutSize: selectedCut,
      selectedTemp,
      specialInstructions: specialInstructions.trim() || undefined,
      unitPrice,
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Container */}
      <div
        id="modal-dish-detail"
        className="relative z-10 w-full max-w-md bg-[#13110e] border-t border-[#31291f] rounded-t-3xl overflow-hidden shadow-2xl max-h-[92dvh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Top Drag Handle & Close */}
        <div className="pt-3 pb-1 px-4 flex items-center justify-between">
          <div className="w-12 h-1 bg-[#3a3227] rounded-full mx-auto" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#201c16] text-[#b8a791] hover:text-white flex items-center justify-center border border-[#3a3227]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 pt-2 pb-6 space-y-5 flex-1">
          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden bg-[#1a1714] shadow-md border border-[#2b251d] aspect-[16/11]">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#13110e]/60 via-transparent to-black/20" />
            
            {/* Dietary Badge */}
            {dish.dietaryTags && dish.dietaryTags.length > 0 && (
              <div className="absolute top-3 left-3 flex gap-1.5">
                {dish.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-[#f5ebd9]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title and Sensory Description */}
          <div className="space-y-2">
            <h2
              id="dish-detail-title"
              className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#f5ebd6] tracking-tight leading-tight"
            >
              {dish.name}
            </h2>
            <p className="text-xs sm:text-[13px] text-[#baa892] leading-relaxed font-sans">
              {dish.longDescription || dish.description}
            </p>
          </div>

          {/* Sommelier Pairing Note if available */}
          {dish.pairing && (
            <div className="p-3 rounded-xl bg-[#1b1712] border border-[#332b21] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2a2217] flex items-center justify-center text-[#e5be52] shrink-0">
                <Wine className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-[#8e7e6b] font-medium text-[11px] uppercase tracking-wider">
                  Sommelier Pairing Suggestion
                </p>
                <p className="text-[#e8dac7] font-medium mt-0.5">{dish.pairing}</p>
              </div>
            </div>
          )}

          {/* Option: Cut Size Selector */}
          {dish.cutSizes && dish.cutSizes.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#9f8f7a] uppercase">
                <Hourglass className="w-3.5 h-3.5 text-[#e5c365]" />
                <span>Cut Size</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dish.cutSizes.map((cut) => {
                  const isSelected = selectedCut?.id === cut.id;
                  return (
                    <button
                      key={cut.id}
                      type="button"
                      onClick={() => setSelectedCut(cut)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all text-center border ${
                        isSelected
                          ? 'bg-[#292218] border-[#e5be52] text-[#f7e096] ring-1 ring-[#e5be52]/50'
                          : 'bg-[#181511] border-[#2c261e] text-[#b0a08c] hover:border-[#473c2f]'
                      }`}
                    >
                      <span>{cut.name}</span>
                      {cut.extraPrice > 0 && (
                        <span className="block text-[10px] text-[#d4af37] mt-0.5">
                          +${cut.extraPrice}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Option: Cooking Temperature Selector */}
          {dish.cookingTemps && dish.cookingTemps.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#9f8f7a] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#e5c365]" />
                <span>Preparation / Temperature</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {dish.cookingTemps.map((temp) => {
                  const isSelected = selectedTemp === temp;
                  return (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setSelectedTemp(temp)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-center border ${
                        isSelected
                          ? 'bg-[#292218] border-[#e5be52] text-[#f7e096] ring-1 ring-[#e5be52]/50'
                          : 'bg-[#181511] border-[#2c261e] text-[#b0a08c] hover:border-[#473c2f]'
                      }`}
                    >
                      {temp}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Requests input */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-medium tracking-wider text-[#8a7a67] uppercase">
              Chef Notes & Allergies (Optional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. sauce on the side, no chives..."
              className="w-full px-3.5 py-2.5 bg-[#171411] border border-[#2d261e] rounded-xl text-xs text-[#eae2d5] placeholder-[#6e6354] focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-[#100e0c] border-t border-[#262018] flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#1b1713] border border-[#31291f] rounded-xl px-2 py-1 h-12">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-full flex items-center justify-center text-[#b8a791] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-[#f0e7d8]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-full flex items-center justify-center text-[#b8a791] hover:text-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add To Cart Gold Button */}
          <button
            id="btn-confirm-add-cart"
            onClick={handleAdd}
            className="flex-1 h-12 rounded-xl bg-[#e5be52] hover:bg-[#f3cc5e] active:scale-[0.98] text-[#0e0d0b] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#e5be52]/20 font-sans tracking-wide"
          >
            <span>Add to Cart</span>
            <span className="opacity-40">|</span>
            <span className="font-bold">${totalPrice.toFixed(0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
