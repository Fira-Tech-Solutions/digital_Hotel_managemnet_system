import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { LandingView } from './components/LandingView';
import { ExploreView } from './components/ExploreView';
import { DishDetailModal } from './components/DishDetailModal';
import { CartView } from './components/CartView';
import { OrdersView } from './components/OrdersView';
import { ConciergeView } from './components/ConciergeView';
import { FilterModal } from './components/FilterModal';
import { SidebarDrawer } from './components/SidebarDrawer';
import { TableModal } from './components/TableModal';
import { MENU_ITEMS, INITIAL_ORDER } from './data/menuData';
import { Dish, CartItem, Order, ConciergeRequest, DietaryTag, OrderStatusStep, TimelineStep } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('landing');
  const [tableNumber, setTableNumber] = useState('Table 12');
  const [suiteNumber, setSuiteNumber] = useState('Suite 402');

  // Selected dish for customization modal (Screen 3)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTag[]>([]);
  const [priceSort, setPriceSort] = useState<'all' | 'under50' | 'under100' | 'high'>('all');

  // Sidebar Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Table switcher modal state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Cart state pre-loaded with curated selections matching Screen 4
  const [cart, setCart] = useState<CartItem[]>([
    {
      cartId: 'cart-init-1',
      dish: MENU_ITEMS[0], // Reserve Wagyu Fillet
      quantity: 1,
      selectedCutSize: MENU_ITEMS[0].cutSizes?.[0], // 6 oz
      selectedTemp: 'Medium Rare',
      unitPrice: 120.0,
    },
    {
      cartId: 'cart-init-2',
      dish: MENU_ITEMS[1], // Truffle-Glazed Sea Bass
      quantity: 1,
      unitPrice: 65.0,
    },
    {
      cartId: 'cart-init-3',
      dish: MENU_ITEMS[4], // Vintage Bordeaux
      quantity: 1,
      selectedCutSize: MENU_ITEMS[4].cutSizes?.[0], // Glass
      unitPrice: 35.0,
    },
  ]);

  // Active Order state matching Screen 5
  const [currentOrder, setCurrentOrder] = useState<Order | null>(INITIAL_ORDER);

  // Concierge requests state
  const [conciergeRequests, setConciergeRequests] = useState<ConciergeRequest[]>([
    {
      id: 'req-1',
      type: 'water',
      title: 'Water Service',
      details: 'Sparkling San Pellegrino with lemon',
      status: 'fulfilled',
      timestamp: '19:35',
    },
  ]);

  // Total cart items count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle dish detail click
  const handleOpenDish = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDetailModalOpen(true);
  };

  // Add customized item to cart
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      // Check if identical item already exists in cart
      const existingIdx = prev.findIndex(
        (i) =>
          i.dish.id === item.dish.id &&
          i.selectedCutSize?.id === item.selectedCutSize?.id &&
          i.selectedTemp === item.selectedTemp &&
          i.specialInstructions === item.specialInstructions
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  // Update item quantity in cart
  const handleUpdateCartQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((i) => i.cartId !== cartId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.cartId === cartId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  // Remove cart item
  const handleRemoveCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  // Submit cart order (Transitions to Orders tab Screen 5)
  const handleSubmitOrder = (specialRequests: string) => {
    const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const serviceCharge = subtotal * 0.125;
    const total = subtotal + serviceCharge;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: timeStr,
      tableNumber,
      suiteNumber,
      items: [...cart],
      subtotal,
      serviceCharge,
      total,
      specialRequests: specialRequests || 'None provided',
      status: 'accepted',
      estimatedMinutes: '15-20 minutes',
      timeline: [
        {
          step: 'received',
          title: 'Received',
          subtitle: 'Order submitted to kitchen',
          time: timeStr,
          completed: true,
          active: false,
        },
        {
          step: 'accepted',
          title: 'Accepted by Chef',
          subtitle: 'Sourcing ingredients & prep',
          time: `${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes() + 2
          ).padStart(2, '0')}`,
          completed: false,
          active: true,
        },
        {
          step: 'preparing',
          title: 'Preparing',
          subtitle: 'Binchotan charcoal searing',
          time: 'Estimated in 10 mins',
          completed: false,
          active: false,
        },
        {
          step: 'ready',
          title: 'Ready to Serve',
          subtitle: 'Table delivery by head waiter',
          time: 'Estimated in 18 mins',
          completed: false,
          active: false,
        },
      ],
    };

    setCurrentOrder(newOrder);
    setCart([]);
    setCurrentTab('orders');
  };

  // Advance Kitchen Order status for simulation demo
  const handleAdvanceOrderStatus = () => {
    if (!currentOrder) return;
    const steps: OrderStatusStep[] = ['received', 'accepted', 'preparing', 'ready', 'served'];
    const currentIdx = steps.indexOf(currentOrder.status);
    const nextIdx = (currentIdx + 1) % steps.length;
    const nextStatus = steps[nextIdx];

    const updatedTimeline: TimelineStep[] = currentOrder.timeline.map((item, idx) => {
      if (idx < nextIdx) {
        return { ...item, completed: true, active: false };
      } else if (idx === nextIdx) {
        return { ...item, completed: false, active: true };
      } else {
        return { ...item, completed: false, active: false };
      }
    });

    setCurrentOrder({
      ...currentOrder,
      status: nextStatus,
      timeline: updatedTimeline,
    });
  };

  // Send Concierge request
  const handleSendConcierge = (type: string, title: string, details?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newReq: ConciergeRequest = {
      id: `req-${Date.now()}`,
      type,
      title,
      details,
      status: 'sent',
      timestamp: timeStr,
    };
    setConciergeRequests((prev) => [...prev, newReq]);
  };

  // Filter menu items by dietary tags and price sort
  const filteredMenuItems = MENU_ITEMS.filter((dish) => {
    if (selectedDietaryTags.length > 0) {
      const hasMatch = selectedDietaryTags.every((t) =>
        dish.dietaryTags?.includes(t)
      );
      if (!hasMatch) return false;
    }

    if (priceSort === 'under50' && dish.price >= 50) return false;
    if (priceSort === 'under100' && (dish.price < 50 || dish.price > 100)) return false;
    if (priceSort === 'high' && dish.price < 100) return false;

    return true;
  });

  const toggleDietaryTag = (tag: DietaryTag) => {
    setSelectedDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleResetFilters = () => {
    setSelectedDietaryTags([]);
    setPriceSort('all');
  };

  return (
    <div className="min-h-screen bg-[#090807] text-[#eae5db] flex justify-center selection:bg-[#d4af37]/30 selection:text-[#f7e096]">
      {/* Mobile-Framed Container that centers nicely on all displays */}
      <div className="w-full max-w-md min-h-screen bg-[#0e0d0b] relative flex flex-col shadow-2xl overflow-x-hidden border-x border-[#1c1813]">
        {/* Persistent Top Header */}
        <Header
          currentTab={currentTab}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenCart={() => setCurrentTab('cart')}
          cartCount={cartCount}
          tableNumber={tableNumber}
          onTableClick={() => setIsTableModalOpen(true)}
          showCartButton={currentTab === 'explore'}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 w-full relative">
          {currentTab === 'landing' && (
            <LandingView onViewMenu={() => setCurrentTab('explore')} />
          )}

          {currentTab === 'explore' && (
            <ExploreView
              dishes={filteredMenuItems}
              onSelectDish={handleOpenDish}
              onOpenFilters={() => setIsFilterModalOpen(true)}
              activeFilterCount={
                selectedDietaryTags.length + (priceSort !== 'all' ? 1 : 0)
              }
            />
          )}

          {currentTab === 'cart' && (
            <CartView
              cart={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={() => setCart([])}
              onSubmitOrder={handleSubmitOrder}
              onBackToMenu={() => setCurrentTab('explore')}
              suiteNumber={suiteNumber}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              order={currentOrder}
              onOrderMore={() => setCurrentTab('explore')}
              onAdvanceStatus={handleAdvanceOrderStatus}
            />
          )}

          {currentTab === 'concierge' && (
            <ConciergeView
              tableNumber={tableNumber}
              suiteNumber={suiteNumber}
              requests={conciergeRequests}
              onSendRequest={handleSendConcierge}
            />
          )}
        </main>

        {/* Bottom Navigation (Visible on all tabs; on landing it sits over subtle gradient) */}
        {currentTab !== 'landing' && (
          <BottomNav
            activeTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            cartCount={cartCount}
            hasActiveOrder={currentOrder !== null}
          />
        )}

        {/* Dish Detail Customization Modal (Screen 3) */}
        <DishDetailModal
          dish={selectedDish}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onAddToCart={handleAddToCart}
        />

        {/* Dietary & Price Filter Modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          selectedTags={selectedDietaryTags}
          onToggleTag={toggleDietaryTag}
          onResetFilters={handleResetFilters}
          priceSort={priceSort}
          onSelectPriceSort={setPriceSort}
        />

        {/* Left Side Drawer Menu */}
        <SidebarDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={(tab) => setCurrentTab(tab)}
          tableNumber={tableNumber}
          suiteNumber={suiteNumber}
          onOpenTableModal={() => setIsTableModalOpen(true)}
        />

        {/* Table & Suite Folio Modal */}
        <TableModal
          isOpen={isTableModalOpen}
          onClose={() => setIsTableModalOpen(false)}
          currentTable={tableNumber}
          currentSuite={suiteNumber}
          onSave={(tbl, ste) => {
            setTableNumber(tbl);
            setSuiteNumber(ste);
          }}
        />
      </div>
    </div>
  );
}
