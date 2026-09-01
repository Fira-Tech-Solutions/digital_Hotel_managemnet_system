import { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  Dish,
  CartItem,
  Order,
  ConciergeRequest,
  DietaryTag,
  OrderStatusStep,
  TimelineStep,
  ApiCustomizationRef,
} from './types';
import {
  getPublicMenu,
  createOrder as apiCreateOrder,
  getOrderStatus,
  resolveTable,
  ApiCategory,
  ApiMenuItem,
} from './lib/api';
import { connectSocket, trackOrder, untrackOrder, getSocket } from './lib/socket';

const DIETARY_MAP: Record<string, DietaryTag> = {
  VEGETARIAN: 'VG',
  VEGAN: 'V',
  GLUTEN_FREE: 'GF',
  SPICY: 'SIGNATURE',
  NUT_FREE: 'NF',
  HALAL: 'DF',
};

const CATEGORY_NAME_MAP: Record<string, string> = {
  starters: 'starters',
  mains: 'mains',
  'wine cellar': 'wine',
  wine: 'wine',
  desserts: 'desserts',
  cocktails: 'cocktails',
  beverages: 'cocktails',
};

function mapCategoryName(name: string): string {
  const lower = name.toLowerCase().trim();
  return CATEGORY_NAME_MAP[lower] || lower;
}

function mapApiDish(item: ApiMenuItem, categoryName: string): Dish {
  const dietaryTags: DietaryTag[] = (item.dietaryTags || [])
    .map((t) => DIETARY_MAP[t])
    .filter(Boolean) as DietaryTag[];

  const apiCustomizations: ApiCustomizationRef[] = (item.customizationGroups || []).map(
    (g) => ({
      groupId: g.id,
      groupName: g.name,
      options: g.options.map((o) => ({
        id: o.id,
        label: o.label,
        priceDelta: Number(o.priceDelta),
      })),
    })
  );

  // Derive cutSizes from customization groups that look like size/portion/cut
  let cutSizes: Dish['cutSizes'] = undefined;
  const sizeGroup = (item.customizationGroups || []).find(
    (g) =>
      g.name.toLowerCase().includes('size') ||
      g.name.toLowerCase().includes('portion') ||
      g.name.toLowerCase().includes('cut') ||
      g.name.toLowerCase().includes('glass') ||
      g.name.toLowerCase().includes('bottle')
  );
  if (sizeGroup && sizeGroup.options.length > 0) {
    cutSizes = sizeGroup.options.map((o) => ({
      id: o.id,
      name: o.label,
      extraPrice: Number(o.priceDelta),
    }));
  }

  // Derive cooking temps from preparation/customization groups
  let cookingTemps: string[] | undefined = undefined;
  const tempGroup = (item.customizationGroups || []).find(
    (g) =>
      g.name.toLowerCase().includes('temp') ||
      g.name.toLowerCase().includes('preparation') ||
      g.name.toLowerCase().includes('cook') ||
      g.name.toLowerCase().includes('doneness')
  );
  if (tempGroup && tempGroup.options.length > 0) {
    cookingTemps = tempGroup.options.map((o) => o.label);
  }

  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    longDescription: item.description || '',
    price: Number(item.price),
    category: mapCategoryName(categoryName) as any,
    image: item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
    dietaryTags: dietaryTags.length > 0 ? dietaryTags : undefined,
    cutSizes,
    cookingTemps,
    isPopular: item.isChefSpecial,
    apiCustomizations: apiCustomizations.length > 0 ? apiCustomizations : undefined,
  };
}

function mapApiCategoriesToDishes(categories: ApiCategory[]): {
  dishes: Dish[];
  categoryList: { id: string; name: string }[];
} {
  const dishes: Dish[] = [];
  const categoryList: { id: string; name: string }[] = [];

  for (const cat of categories) {
    const catId = mapCategoryName(cat.name);
    categoryList.push({ id: catId, name: cat.name });
    for (const item of cat.items) {
      dishes.push(mapApiDish(item, cat.name));
    }
  }

  return { dishes, categoryList };
}

const STATUS_MAP: Record<string, OrderStatusStep> = {
  PENDING: 'received',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'ready',
  SERVED: 'served',
  COMPLETED: 'served',
  CANCELLED: 'received',
  REJECTED: 'received',
};

function buildTimelineFromApi(order: {
  status: string;
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
}): TimelineStep[] {
  const fmt = (d?: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  };

  const currentStatus = STATUS_MAP[order.status] || 'received';
  const steps: OrderStatusStep[] = ['received', 'accepted', 'preparing', 'ready'];
  const currentIdx = steps.indexOf(currentStatus);

  const timeForStep = (step: OrderStatusStep): string => {
    switch (step) {
      case 'received': return fmt(order.createdAt);
      case 'accepted': return fmt(order.acceptedAt);
      case 'preparing': return fmt(order.preparingAt);
      case 'ready': return fmt(order.readyAt);
      case 'served': return fmt(order.servedAt);
      default: return '';
    }
  };

  const subtitleForStep = (step: OrderStatusStep): string => {
    switch (step) {
      case 'received': return 'Order submitted to kitchen';
      case 'accepted': return 'Sourcing ingredients & prep';
      case 'preparing': return 'Binchotan charcoal searing';
      case 'ready': return 'Table delivery by head waiter';
      default: return '';
    }
  };

  return steps.map((step, idx) => ({
    step,
    title: step === 'received' ? 'Received' :
           step === 'accepted' ? 'Accepted by Chef' :
           step === 'preparing' ? 'Preparing' : 'Ready to Serve',
    subtitle: subtitleForStep(step),
    time: idx <= currentIdx ? timeForStep(step) : undefined,
    completed: idx < currentIdx,
    active: idx === currentIdx,
  }));
}

function mapApiOrderToOrder(apiOrder: {
  id: string;
  status: string;
  notes?: string;
  subtotal: number | string;
  total: number | string;
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  table: { number: string };
  items: {
    id: string;
    nameSnapshot: string;
    priceSnapshot: number | string;
    quantity: number;
    itemNotes?: string;
  }[];
}, tableNumber: string, suiteNumber: string): Order {
  const subtotal = Number(apiOrder.subtotal);
  const total = Number(apiOrder.total);
  const serviceCharge = total - subtotal;

  return {
    id: apiOrder.id,
    createdAt: (() => {
      const d = new Date(apiOrder.createdAt);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    })(),
    tableNumber: apiOrder.table?.number || tableNumber,
    suiteNumber,
    items: apiOrder.items.map((item, idx) => ({
      cartId: item.id || `item-${idx}`,
      dish: {
        id: item.id,
        name: item.nameSnapshot,
        description: '',
        price: Number(item.priceSnapshot),
        category: 'mains' as const,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
      },
      quantity: item.quantity,
      specialInstructions: item.itemNotes || undefined,
      unitPrice: Number(item.priceSnapshot),
    })),
    subtotal,
    serviceCharge,
    total,
    specialRequests: apiOrder.notes || 'None provided',
    status: STATUS_MAP[apiOrder.status] || 'received',
    estimatedMinutes: '15-20 minutes',
    timeline: buildTimelineFromApi(apiOrder),
  };
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('landing');
  const [tableNumber, setTableNumber] = useState('Table 12');
  const [suiteNumber, setSuiteNumber] = useState('Suite 402');
  const [tableId, setTableId] = useState<string | null>(null);

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTag[]>([]);
  const [priceSort, setPriceSort] = useState<'all' | 'under50' | 'under100' | 'high'>('all');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const [menuDishes, setMenuDishes] = useState<Dish[]>(MENU_ITEMS);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  const [conciergeRequests, setConciergeRequests] = useState<ConciergeRequest[]>([]);

  const trackedOrderIdRef = useRef<string | null>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch menu from API on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchMenu() {
      setMenuLoading(true);
      setMenuError(null);
      try {
        const res = await getPublicMenu();
        if (!cancelled && res.success && res.data) {
          const { dishes } = mapApiCategoriesToDishes(res.data);
          if (dishes.length > 0) {
            setMenuDishes(dishes);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setMenuError(err.message || 'Failed to load menu');
          // Keep using fallback MENU_ITEMS
        }
      } finally {
        if (!cancelled) setMenuLoading(false);
      }
    }
    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  // Connect socket on mount
  useEffect(() => {
    connectSocket();
  }, []);

  // Socket listener for order updates
  useEffect(() => {
    const socket = getSocket();

    const handleOrderUpdate = (data: any) => {
      if (!trackedOrderIdRef.current) return;
      if (data.id === trackedOrderIdRef.current) {
        const mapped = mapApiOrderToOrder(data, tableNumber, suiteNumber);
        setCurrentOrder(mapped);
      }
    };

    socket.on('order:updated', handleOrderUpdate);
    return () => {
      socket.off('order:updated', handleOrderUpdate);
    };
  }, [tableNumber, suiteNumber]);

  // Cleanup socket tracking on unmount
  useEffect(() => {
    return () => {
      if (trackedOrderIdRef.current) {
        untrackOrder(trackedOrderIdRef.current);
      }
    };
  }, []);

  const handleOpenDish = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDetailModalOpen(true);
  };

  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
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

  const handleUpdateCartQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((i) => i.cartId !== cartId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.cartId === cartId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const handleSubmitOrder = async (specialRequests: string) => {
    if (cart.length === 0 || !tableId) return;

    const apiItems = cart.map((item) => ({
      menuItemId: item.dish.id,
      quantity: item.quantity,
      itemNotes: item.specialInstructions || undefined,
      optionIds: item.selectedOptionIds || [],
    }));

    try {
      const res = await apiCreateOrder({
        tableId,
        notes: specialRequests || undefined,
        items: apiItems,
      });

      if (res.success && res.data) {
        const mappedOrder = mapApiOrderToOrder(res.data, tableNumber, suiteNumber);
        setCurrentOrder(mappedOrder);
        setGuestSessionId(res.data.guestSessionId || null);
        setCart([]);

        // Track via socket
        trackedOrderIdRef.current = res.data.id;
        trackOrder(res.data.id);

        setCurrentTab('orders');
      }
    } catch (err: any) {
      // Fallback: create local order if API fails
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const serviceCharge = subtotal * 0.125;
      const total = subtotal + serviceCharge;

      const fallbackOrder: Order = {
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
            time: timeStr,
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

      setCurrentOrder(fallbackOrder);
      setCart([]);
      setCurrentTab('orders');
    }
  };

  const handleAdvanceOrderStatus = async () => {
    // If we have a real order, try to fetch latest status
    if (currentOrder && trackedOrderIdRef.current && guestSessionId) {
      try {
        const res = await getOrderStatus(trackedOrderIdRef.current, guestSessionId);
        if (res.success && res.data) {
          const mapped = mapApiOrderToOrder(res.data, tableNumber, suiteNumber);
          setCurrentOrder(mapped);
          return;
        }
      } catch {
        // Fall through to local simulation
      }
    }

    // Local simulation fallback
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

  const handleSendConcierge = (type: string, title: string, details?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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

  const handleTableResolved = useCallback(
    (resolvedTableId: string, resolvedTableNumber: string, resolvedSuite?: string) => {
      setTableId(resolvedTableId);
      setTableNumber(`Table ${resolvedTableNumber}`);
      if (resolvedSuite) setSuiteNumber(resolvedSuite);
    },
    []
  );

  const filteredMenuItems = menuDishes.filter((dish) => {
    if (selectedDietaryTags.length > 0) {
      const hasMatch = selectedDietaryTags.every((t) => dish.dietaryTags?.includes(t));
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
      <div className="w-full max-w-md min-h-screen bg-[#0e0d0b] relative flex flex-col shadow-2xl overflow-x-hidden border-x border-[#1c1813]">
        <Header
          currentTab={currentTab}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenCart={() => setCurrentTab('cart')}
          cartCount={cartCount}
          tableNumber={tableNumber}
          onTableClick={() => setIsTableModalOpen(true)}
          showCartButton={currentTab === 'explore'}
        />

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

        {currentTab !== 'landing' && (
          <BottomNav
            activeTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            cartCount={cartCount}
            hasActiveOrder={currentOrder !== null}
          />
        )}

        <DishDetailModal
          dish={selectedDish}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onAddToCart={handleAddToCart}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          selectedTags={selectedDietaryTags}
          onToggleTag={toggleDietaryTag}
          onResetFilters={handleResetFilters}
          priceSort={priceSort}
          onSelectPriceSort={setPriceSort}
        />

        <SidebarDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={(tab) => setCurrentTab(tab)}
          tableNumber={tableNumber}
          suiteNumber={suiteNumber}
          onOpenTableModal={() => setIsTableModalOpen(true)}
        />

        <TableModal
          isOpen={isTableModalOpen}
          onClose={() => setIsTableModalOpen(false)}
          currentTable={tableNumber}
          currentSuite={suiteNumber}
          onSave={(tbl, ste) => {
            setTableNumber(tbl);
            setSuiteNumber(ste);
          }}
          onTableResolved={handleTableResolved}
        />
      </div>
    </div>
  );
}
