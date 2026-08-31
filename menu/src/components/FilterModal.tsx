import { X, Check } from 'lucide-react';
import { DietaryTag } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: DietaryTag[];
  onToggleTag: (tag: DietaryTag) => void;
  onResetFilters: () => void;
  priceSort: 'all' | 'under50' | 'under100' | 'high';
  onSelectPriceSort: (val: 'all' | 'under50' | 'under100' | 'high') => void;
}

export function FilterModal({
  isOpen,
  onClose,
  selectedTags,
  onToggleTag,
  onResetFilters,
  priceSort,
  onSelectPriceSort,
}: FilterModalProps) {
  if (!isOpen) return null;

  const dietaryOptions: { tag: DietaryTag; label: string; desc: string }[] = [
    { tag: 'GF', label: 'Gluten-Free (GF)', desc: 'Prepared with zero gluten-containing ingredients' },
    { tag: 'DF', label: 'Dairy-Free (DF)', desc: 'Free of milk, butter & lactose derivatives' },
    { tag: 'VG', label: 'Vegetarian (VG)', desc: 'Plant-forward & ethical gourmet selections' },
    { tag: 'SIGNATURE', label: "Chef's Signature", desc: 'Adama Michelin-grade culinary highlights' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#14110e] border-t border-[#362d22] rounded-t-3xl p-5 pb-8 space-y-6 max-h-[85dvh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#29221a] pb-3">
          <h3 className="font-serif-luxury text-2xl font-bold text-[#f5ebd6]">
            Filter Menu
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#201b16] text-[#b8a791] hover:text-white flex items-center justify-center border border-[#3a3227]"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-3">
          <label className="block text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
            Dietary Guidelines
          </label>
          <div className="space-y-2">
            {dietaryOptions.map((opt) => {
              const isChecked = selectedTags.includes(opt.tag);
              return (
                <button
                  key={opt.tag}
                  type="button"
                  onClick={() => onToggleTag(opt.tag)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-[#292015] border-[#e5be52] text-[#f7e096]'
                      : 'bg-[#181410] border-[#2d261e] text-[#a89985] hover:border-[#42372a]'
                  }`}
                >
                  <div>
                    <span className="font-medium text-xs text-[#ebdcc8] block">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-[#7d705e] block">
                      {opt.desc}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-[#e5be52] border-[#e5be52] text-[#0e0d0b]'
                        : 'border-[#473b2d] bg-[#1a1612]'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Tier */}
        <div className="space-y-3">
          <label className="block text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'All Selections' },
              { id: 'under50', label: 'Under $50' },
              { id: 'under100', label: '$50 – $100' },
              { id: 'high', label: '$100+ Reserve' },
            ].map((p) => {
              const isSelected = priceSort === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPriceSort(p.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    isSelected
                      ? 'bg-[#292015] border-[#e5be52] text-[#f7e096]'
                      : 'bg-[#181410] border-[#2d261e] text-[#a89985] hover:border-[#42372a]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onResetFilters}
            className="px-4 py-3 rounded-xl bg-[#1d1813] hover:bg-[#282119] text-[#ab9a85] text-xs font-semibold tracking-wider uppercase transition-colors border border-[#362c20]"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#e5be52] hover:bg-[#f3cc5e] text-[#0e0d0b] text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
