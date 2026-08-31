import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  UploadCloud, 
  Smartphone, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Plus, 
  ShoppingBag,
  Heart,
  ChevronRight
} from 'lucide-react';
import { MenuItem, ThemeConfig } from '../types';
import { HotelLogo } from './HotelLogo';

interface ThemeScreenProps {
  theme: ThemeConfig;
  onUpdateTheme: (newTheme: Partial<ThemeConfig>) => void;
  menuItems: MenuItem[];
  onPlaceGuestOrder?: (items: { name: string; qty: number; price: number }[]) => void;
}

export const ThemeScreen: React.FC<ThemeScreenProps> = ({
  theme,
  onUpdateTheme,
  menuItems,
  onPlaceGuestOrder,
}) => {
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string>('Appetizers');
  const [guestCart, setGuestCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [saveToast, setSaveToast] = useState(false);
  const [orderedToast, setOrderedToast] = useState(false);

  const fontOptions = [
    { label: 'Inter (Default Sans)', value: 'Inter (Default)' },
    { label: 'Playfair Display (Luxury Serif)', value: 'Playfair Display' },
    { label: 'Cormorant Garamond (Fine Dining)', value: 'Cormorant Garamond' },
    { label: 'Cinzel (Classical Roman)', value: 'Cinzel' },
  ];

  const handleSaveTheme = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleResetDefaults = () => {
    onUpdateTheme({
      primaryColor: '#D4AF37',
      backgroundColor: '#F8FAFC',
      primaryFont: 'Inter (Default)',
      layoutTemplate: 'luxury-cards',
      restaurantName: 'The Grand Dining',
      tagline: 'Table 12 • Dinner Menu',
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    setGuestCart((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (existing) {
        return prev.map((p) => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handlePlaceOrder = () => {
    if (guestCart.length === 0) return;
    if (onPlaceGuestOrder) {
      onPlaceGuestOrder(
        guestCart.map((c) => ({
          name: c.item.name,
          qty: c.qty,
          price: c.item.price,
        }))
      );
    }
    setGuestCart([]);
    setOrderedToast(true);
    setTimeout(() => setOrderedToast(false), 3000);
  };

  // Get active items for preview
  const displayItems = menuItems.filter((i) => 
    selectedMobileCategory === 'All' || i.category === selectedMobileCategory
  ).slice(0, 3);

  // Font family css mapping
  const getFontFamilyStyle = () => {
    if (theme.primaryFont.includes('Playfair')) return "'Playfair Display', serif";
    if (theme.primaryFont.includes('Cormorant')) return "'Cormorant Garamond', serif";
    if (theme.primaryFont.includes('Cinzel')) return "'Cinzel', serif";
    return "'Plus Jakarta Sans', sans-serif";
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Guest Experience & Branding
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize colors, typography, logos, and visual layout rendered on diners' mobile devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-fadeIn">
              ✓ Theme Published to Guest Devices!
            </span>
          )}
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save & Publish</span>
          </button>
        </div>
      </div>

      {/* Split view: Config Panels on Left, iPhone Mockup on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Brand Colors */}
          <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white pb-3 border-b border-slate-800">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Brand Colors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Accent Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Accent Color
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                    className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Used for highlight buttons, badges, and prices
                </span>
              </div>

              {/* Background Canvas Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Guest Canvas Background
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
                    className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Background for mobile dining menu
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Typography & Identity */}
          <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white pb-3 border-b border-slate-800">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Typography & Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Display Font
                </label>
                <select
                  value={theme.primaryFont}
                  onChange={(e) => onUpdateTheme({ primaryFont: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {fontOptions.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Guest Header Restaurant Name
                </label>
                <input
                  type="text"
                  value={theme.restaurantName}
                  onChange={(e) => onUpdateTheme({ restaurantName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Table Header Tagline
              </label>
              <input
                type="text"
                value={theme.tagline}
                onChange={(e) => onUpdateTheme({ tagline: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Layout Templates matching Image 12.png */}
          <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white pb-3 border-b border-slate-800">
              <Layout className="w-4 h-4 text-amber-400" />
              <span>Layout Template</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'luxury-cards', title: 'Luxury Cards', desc: 'Full image hero cards with gold accents' },
                { id: 'classic-bistro', title: 'Classic Bistro', desc: 'Refined editorial typography with prices' },
                { id: 'modern-grid', title: 'Modern Grid', desc: 'Compact dual-column photo layout' },
              ].map((template) => {
                const isSelected = theme.layoutTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onUpdateTheme({ layoutTemplate: template.id as any })}
                    className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block mb-1">{template.title}</span>
                      <span className="text-[10px] leading-tight text-slate-500 block">{template.desc}</span>
                    </div>
                    {isSelected && (
                      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Realistic Live Mobile Phone Simulation Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Interactive Mobile Guest Preview</span>
          </div>

          {/* Phone Frame */}
          <div 
            id="mobile-preview-frame"
            className="w-[340px] sm:w-[360px] h-[640px] bg-black rounded-[44px] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border-[6px] border-slate-700 relative overflow-hidden flex flex-col select-none"
          >
            {/* Dynamic Island / Speaker Notch */}
            <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
              <div className="w-2 h-2 rounded-full bg-blue-900/40" />
            </div>

            {/* Inner Guest Screen with User Theme Applied */}
            <div 
              className="flex-1 rounded-[32px] overflow-y-auto flex flex-col text-slate-900 transition-colors relative"
              style={{ 
                backgroundColor: theme.backgroundColor,
                fontFamily: getFontFamilyStyle()
              }}
            >
              {/* Mobile Top Navigation & Brand Header */}
              <div className="p-4 text-center border-b border-black/5 bg-white/70 backdrop-blur-md sticky top-0 z-10">
                <HotelLogo variant="badge" size="sm" className="scale-90 mb-1" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {theme.restaurantName}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {theme.tagline}
                </p>

                {/* Categories Pills */}
                <div className="flex items-center justify-center gap-1.5 mt-3 overflow-x-auto no-scrollbar py-1">
                  {['Appetizers', 'Mains', 'Desserts', 'Drinks'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedMobileCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${
                        selectedMobileCategory === cat
                          ? 'text-slate-950 shadow-sm'
                          : 'bg-black/5 text-slate-600'
                      }`}
                      style={{
                        backgroundColor: selectedMobileCategory === cat ? theme.primaryColor : undefined,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dishes list */}
              <div className="p-4 space-y-3.5 flex-1">
                {displayItems.map((dish) => (
                  <div 
                    key={dish.id} 
                    className="p-3 bg-white rounded-2xl shadow-sm border border-black/5 flex gap-3 items-center group"
                  >
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {dish.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {dish.description || 'Prepared fresh by Chef de Cuisine'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span 
                          className="text-xs font-extrabold font-mono"
                          style={{ color: theme.primaryColor }}
                        >
                          ${dish.price.toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleAddToCart(dish)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm active:scale-90 transition-transform"
                          style={{ backgroundColor: theme.primaryColor }}
                          title="Add to order"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Guest Cart Floating Banner */}
              {guestCart.length > 0 && (
                <div className="sticky bottom-2 mx-3 p-3 rounded-2xl bg-slate-950 text-white shadow-xl flex items-center justify-between animate-fadeIn z-20">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">
                      {guestCart.reduce((sum, c) => sum + c.qty, 0)} items
                    </span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1 shadow"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <span>Place Order</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Order Success Toast inside Phone */}
              {orderedToast && (
                <div className="absolute inset-x-4 top-20 bg-emerald-500 text-slate-950 p-3 rounded-2xl text-center shadow-2xl animate-bounce z-30">
                  <span className="text-xs font-extrabold block">✓ Order Sent to Kitchen!</span>
                  <span className="text-[10px] text-slate-900 font-medium">Check Live Orders Queue tab</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
