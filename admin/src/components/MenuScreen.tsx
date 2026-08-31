import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X, 
  Tag, 
  UtensilsCrossed, 
  Image as ImageIcon,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { CategoryInfo, MenuItem } from '../types';

interface MenuScreenProps {
  categories: CategoryInfo[];
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
  onSaveMenuItem: (item: Partial<MenuItem> & { id?: string }) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onAddCategory: (categoryName: string) => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  categories,
  menuItems,
  onToggleAvailability,
  onSaveMenuItem,
  onDeleteMenuItem,
  onAddCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Appetizers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem({
      name: '',
      category: selectedCategory === 'All' ? 'Appetizers' : (selectedCategory as any),
      price: 24.00,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
      station: 'Garde Manger',
      description: '',
      allergens: [],
      tags: ['Chef Signature'],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.name) {
      onSaveMenuItem(editingItem);
      setIsEditModalOpen(false);
      setEditingItem(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121417] text-slate-100 overflow-hidden">
      {/* Top Search and Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-[#111317]/50">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="input-menu-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items, ingredients, stations..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-add-menu-item"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Item</span>
          </button>
        </div>
      </div>

      {/* Main split view: Categories on Left, Items Grid on Right */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Categories Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#14181F] p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Categories
            </span>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 text-xs"
              title="Add Category"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 flex-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span>All Categories</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                selectedCategory === 'All' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {menuItems.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              const count = menuItems.filter((i) => i.category === cat.name).length;

              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.name.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedCategory}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage items, 86 availability, stations, and allergens in the {selectedCategory} category.
              </p>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {filteredItems.length} items found
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const isSoldOut = !item.isAvailable || item.isSoldOut;

              return (
                <div
                  key={item.id}
                  id={`menu-card-${item.id}`}
                  className={`rounded-2xl bg-[#16191F] border overflow-hidden transition-all flex flex-col justify-between group ${
                    isSoldOut 
                      ? 'border-red-500/30 opacity-80' 
                      : 'border-slate-800/90 hover:border-amber-500/40 hover:shadow-lg'
                  }`}
                >
                  {/* Image Container with Badge and SOLD OUT overlay */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    
                    {/* Category pill */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-amber-500/20">
                      {item.category}
                    </span>

                    {/* Quick Edit/Delete buttons on hover */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-950/80 text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition-colors shadow-sm"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMenuItem(item.id)}
                        className="p-1.5 rounded-lg bg-slate-950/80 text-slate-300 hover:text-red-400 hover:bg-slate-900 transition-colors shadow-sm"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* SOLD OUT Banner Overlay */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <div className="px-4 py-1.5 rounded-xl bg-red-600/90 border border-red-400 text-white font-extrabold text-xs tracking-widest uppercase shadow-lg transform -rotate-6">
                          SOLD OUT (86)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {item.name}
                        </h3>
                        <span className="text-sm font-extrabold text-amber-400 font-mono">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {item.description || 'Artisanal preparation by head kitchen staff using premium seasonal ingredients.'}
                      </p>

                      {/* Station and tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-300">
                          {item.station}
                        </span>
                        {item.allergens && item.allergens.map((alg) => (
                          <span key={alg} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-300 border border-amber-500/20">
                            {alg}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Availability Switch Toggle */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        Availability Status
                      </span>

                      <button
                        onClick={() => onToggleAvailability(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          !isSoldOut
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${!isSoldOut ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span>{!isSoldOut ? 'Available' : 'Sold Out'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit / Add Item Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#151921] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingItem.id ? 'Edit Menu Dish' : 'Create New Menu Dish'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Wagyu Beef Tartare"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingItem.category || 'Appetizers'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Mains">Mains</option>
                    <option value="Sides">Sides</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingItem.price || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={editingItem.image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Station</label>
                <input
                  type="text"
                  value={editingItem.station || 'Garde Manger'}
                  onChange={(e) => setEditingItem({ ...editingItem, station: e.target.value })}
                  placeholder="e.g. Grill Station, Fryer, Pastry"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Culinary Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Describe ingredients, cooking techniques, and flavors..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#151921] border border-slate-700 rounded-2xl p-5 text-slate-200">
            <h3 className="text-sm font-bold text-white mb-3">Add Menu Category</h3>
            <input
              type="text"
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Tasting Menus, Caviar Service"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white mb-4 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newCatName.trim()) {
                    onAddCategory(newCatName.trim());
                    setNewCatName('');
                    setIsCategoryModalOpen(false);
                  }
                }}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
