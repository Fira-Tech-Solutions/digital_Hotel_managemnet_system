import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, Sparkles, Check } from 'lucide-react';
import { Dish, CategoryId } from '../types';
import { CATEGORIES } from '../data/menuData';

interface ExploreViewProps {
  dishes: Dish[];
  onSelectDish: (dish: Dish) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export function ExploreView({
  dishes,
  onSelectDish,
  onOpenFilters,
  activeFilterCount,
}: ExploreViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('mains');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory =
        searchQuery.trim().length > 0 ? true : dish.category === selectedCategory;

      const matchesSearch =
        searchQuery.trim().length === 0 ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.longDescription &&
          dish.longDescription.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [dishes, selectedCategory, searchQuery]);

  return (
    <div id="adama-explore-view" className="min-h-screen pb-28 pt-3 px-4 max-w-md mx-auto">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7e6d]" />
        <input
          id="input-menu-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search the menu..."
          className="w-full pl-11 pr-4 py-3 bg-[#171411] border border-[#2d271f] rounded-full text-sm text-[#f0eadf] placeholder-[#7d7160] focus:outline-none focus:border-[#d4af37]/70 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9d8e78] hover:text-[#e5c365]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters Button */}
      <div className="mb-4">
        <button
          id="btn-open-filters"
          onClick={onOpenFilters}
          className="w-full py-2.5 px-4 bg-[#171411] hover:bg-[#211d18] active:scale-[0.99] border border-[#2d271f] rounded-full text-xs font-medium text-[#d9c3a3] flex items-center justify-center gap-2 transition-all shadow-sm group"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#e5c365] group-hover:scale-110 transition-transform" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 w-4 h-4 bg-[#e5be52] text-[#0e0d0b] rounded-full text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="mb-5 overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-2.5">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.id && !searchQuery;
          return (
            <button
              key={category.id}
              id={`cat-btn-${category.id}`}
              onClick={() => {
                setSelectedCategory(category.id as CategoryId);
                setSearchQuery('');
              }}
              className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#e5be52] text-[#0e0d0b] font-semibold shadow-md ring-1 ring-[#f3da8e]/40 scale-105'
                  : 'bg-[#181512] text-[#b8a791] border border-[#312b23] hover:border-[#524637] hover:text-[#eae0d2]'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Search results banner if searching */}
      {searchQuery && (
        <div className="mb-4 px-2 flex items-center justify-between text-xs text-[#a0907a]">
          <span>Found {filteredDishes.length} items for "{searchQuery}"</span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[#e5c365] hover:underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Dish List */}
      <div className="space-y-5">
        {filteredDishes.length === 0 ? (
          <div className="py-16 text-center text-[#8d7e6c] space-y-2">
            <p className="text-sm font-medium">No dishes match your selection.</p>
            <p className="text-xs text-[#706456]">Try adjusting your search or dietary filters.</p>
          </div>
        ) : (
          filteredDishes.map((dish) => (
            <div
              key={dish.id}
              id={`dish-card-${dish.id}`}
              onClick={() => onSelectDish(dish)}
              className="group cursor-pointer rounded-2xl bg-[#171411] border border-[#29241d] overflow-hidden hover:border-[#4d4233] transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              {/* Image Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#110f0d]">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171411] via-transparent to-black/30" />

                {/* Dietary Tags (Top Left) */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  {dish.dietaryTags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-[#f0e4d0] tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                  {dish.isPopular && (
                    <span className="px-2 py-0.5 rounded bg-[#996e1b]/80 backdrop-blur-md border border-[#f3d37a]/30 text-[10px] font-medium text-[#fff3cf] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#ffeaa8]" />
                      Signature
                    </span>
                  )}
                </div>
              </div>

              {/* Content Box */}
              <div className="p-4 pt-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-luxury text-xl sm:text-[22px] font-bold text-[#f7f2ea] group-hover:text-[#f8df95] transition-colors leading-tight">
                    {dish.name}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#a89984] mt-1.5 line-clamp-2 leading-relaxed font-sans">
                    {dish.description}
                  </p>
                </div>

                {/* Price and Action Button */}
                <div className="flex items-center justify-between mt-4 pt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif-luxury text-xl font-bold text-[#e5be52]">
                      ${dish.price}
                    </span>
                    {dish.cutSizes && (
                      <span className="text-[10px] text-[#8e806e]">from</span>
                    )}
                  </div>

                  <button
                    id={`btn-add-${dish.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDish(dish);
                    }}
                    aria-label={`Customize ${dish.name}`}
                    className="w-10 h-10 rounded-full bg-[#e5be52] text-[#0e0d0b] flex items-center justify-center hover:bg-[#f3cc5e] active:scale-90 transition-all shadow-md group-hover:shadow-[0_0_12px_rgba(229,190,82,0.4)]"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
