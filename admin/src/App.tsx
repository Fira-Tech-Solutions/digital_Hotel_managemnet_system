import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_HOTEL_PROFILE, 
  INITIAL_MENU_ITEMS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ORDERS, 
  INITIAL_TABLES, 
  INITIAL_THEME, 
  INITIAL_USERS 
} from './mockData';
import { 
  CategoryInfo, 
  HotelProfileConfig, 
  MenuItem, 
  NotificationItem, 
  Order, 
  OrderStatus, 
  ScreenType, 
  TableQR, 
  ThemeConfig, 
  UserProfile 
} from './types';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { LiveOrdersScreen } from './components/LiveOrdersScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { MenuScreen } from './components/MenuScreen';
import { ThemeScreen } from './components/ThemeScreen';
import { QrCodeScreen } from './components/QrCodeScreen';
import { StaffScreen } from './components/StaffScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { GuestMenuPreviewModal } from './components/GuestMenuPreviewModal';
import { playKitchenChime } from './utils/audio';

export default function App() {
  // Navigation & UI State
  const [activeScreen, setActiveScreen] = useState<ScreenType>('live-orders');
  const [collapsedSidebar, setCollapsedSidebar] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Core Data State with Local Persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('hotel_admin_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('hotel_admin_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    const saved = localStorage.getItem('hotel_admin_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [tables, setTables] = useState<TableQR[]>(() => {
    const saved = localStorage.getItem('hotel_admin_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('hotel_admin_theme');
    return saved ? JSON.parse(saved) : INITIAL_THEME;
  });

  const [hotelProfile, setHotelProfile] = useState<HotelProfileConfig>(() => {
    const saved = localStorage.getItem('hotel_admin_profile');
    return saved ? JSON.parse(saved) : INITIAL_HOTEL_PROFILE;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('hotel_admin_staff');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('hotel_admin_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Settings & Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isOrdersPaused, setIsOrdersPaused] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  
  // Guest Menu Modal Preview
  const [isGuestPreviewOpen, setIsGuestPreviewOpen] = useState<boolean>(false);
  const [guestPreviewTable, setGuestPreviewTable] = useState<string>('Table 12 (VIP)');

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('hotel_admin_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hotel_admin_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('hotel_admin_theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hotel_admin_profile', JSON.stringify(hotelProfile));
  }, [hotelProfile]);

  useEffect(() => {
    localStorage.setItem('hotel_admin_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('hotel_admin_staff', JSON.stringify(users));
  }, [users]);

  // Order Handlers
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: nextStatus,
            startedTimeAgo: nextStatus === 'preparing' ? 'Just started' : o.startedTimeAgo,
            timeCompleted: nextStatus === 'completed' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : o.timeCompleted,
          };
        }
        return o;
      })
    );

    if (nextStatus === 'ready') {
      if (soundEnabled) playKitchenChime();
      const targetOrder = orders.find((o) => o.id === orderId);
      if (targetOrder) {
        const newNotif: NotificationItem = {
          id: `n-${Date.now()}`,
          title: `Order #${targetOrder.orderNumber} Ready!`,
          description: `Table ${targetOrder.tableNumber} is ready for runner pickup.`,
          time: 'Just now',
          type: 'kitchen',
          isRead: false,
          orderId,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }
  };

  const handleToggleItemPrep = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            items: o.items.map((i) =>
              i.id === itemId ? { ...i, prepChecked: !i.prepChecked } : i
            ),
          };
        }
        return o;
      })
    );
  };

  const handleSimulateNewOrder = () => {
    if (isOrdersPaused) return;

    const sampleDishes = [
      { name: 'Wagyu Beef Tartare', price: 24, special: 'No onions' },
      { name: 'Truffle Pappardelle', price: 38, special: 'Extra parmesan' },
      { name: 'Lobster Tail Thermidor', price: 56, special: 'Gluten Free' },
      { name: 'Signature Martini', price: 22 },
      { name: 'Gold Leaf Dome', price: 26 },
      { name: 'Truffle Burrata', price: 28 },
    ];

    const randomTable = `Table ${String(Math.floor(Math.random() * 16) + 1).padStart(2, '0')}`;
    const dish1 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
    const dish2 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];

    const orderNum = String(Math.floor(Math.random() * 800) + 4100);
    const newOrder: Order = {
      id: `ord-${orderNum}`,
      orderNumber: orderNum,
      tableNumber: randomTable,
      isVip: Math.random() > 0.6,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      status: 'new',
      totalRevenue: dish1.price + dish2.price,
      items: [
        { id: `it-${Date.now()}-1`, name: dish1.name, qty: 1, specialAlert: dish1.special, price: dish1.price },
        { id: `it-${Date.now()}-2`, name: dish2.name, qty: 1, price: dish2.price },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title: `New Order #${orderNum}`,
      description: `${randomTable} placed a new order ($${(dish1.price + dish2.price).toFixed(2)})`,
      time: 'Just now',
      type: 'order',
      isRead: false,
      orderId: newOrder.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (soundEnabled) playKitchenChime();
  };

  const handleGuestPlaceOrder = (orderData: {
    tableNumber: string;
    items: { name: string; qty: number; specialAlert?: string; price: number }[];
    totalRevenue: number;
    isVip: boolean;
  }) => {
    const orderNum = String(Math.floor(Math.random() * 800) + 4100);
    const newOrder: Order = {
      id: `ord-${orderNum}`,
      orderNumber: orderNum,
      tableNumber: orderData.tableNumber,
      isVip: orderData.isVip,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      status: 'new',
      totalRevenue: orderData.totalRevenue,
      items: orderData.items.map((i, idx) => ({
        id: `git-${Date.now()}-${idx}`,
        name: i.name,
        qty: i.qty,
        specialAlert: i.specialAlert,
        price: i.price,
      })),
    };

    setOrders((prev) => [newOrder, ...prev]);

    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title: `Guest Order #${orderNum} Placed!`,
      description: `${orderData.tableNumber} ordered ${orderData.items.length} dishes ($${orderData.totalRevenue.toFixed(2)})`,
      time: 'Just now',
      type: 'order',
      isRead: false,
      orderId: newOrder.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (soundEnabled) playKitchenChime();
  };

  // Menu Handlers
  const handleToggleMenuAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, isAvailable: !i.isAvailable, isSoldOut: i.isAvailable }
          : i
      )
    );
  };

  const handleSaveMenuItem = (itemData: Partial<MenuItem> & { id?: string }) => {
    if (itemData.id) {
      setMenuItems((prev) =>
        prev.map((i) => (i.id === itemData.id ? ({ ...i, ...itemData } as MenuItem) : i))
      );
    } else {
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        name: itemData.name || 'New Dish',
        category: itemData.category || 'Appetizers',
        price: itemData.price || 20,
        image: itemData.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        isAvailable: true,
        station: itemData.station || 'Garde Manger',
        description: itemData.description,
        allergens: itemData.allergens,
        tags: itemData.tags,
      };
      setMenuItems((prev) => [newItem, ...prev]);
    }
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleAddCategory = (categoryName: string) => {
    const newCat: CategoryInfo = {
      id: `cat-${Date.now()}`,
      name: categoryName as any,
      count: 0,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Table QR Handlers
  const handleAddTable = (tableNumber: string, zone: TableQR['zone']) => {
    const newTable: TableQR = {
      id: `tbl-${Date.now()}`,
      tableNumber,
      zone,
      status: 'Active',
      codeGenerated: true,
      scansToday: 0,
    };
    setTables((prev) => [...prev, newTable]);
  };

  const handleToggleTableStatus = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' }
          : t
      )
    );
  };

  const handleRegenerateQR = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, codeGenerated: true, status: 'Active' }
          : t
      )
    );
  };

  // Staff Handlers
  const handleAddUser = (userData: Omit<UserProfile, 'id' | 'lastLogin'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastLogin: 'Never (Invited)',
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121417] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop & Collapsible Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={setActiveScreen}
          collapsed={collapsedSidebar}
          onToggleCollapse={() => setCollapsedSidebar(!collapsedSidebar)}
          pendingOrdersCount={newOrdersCount}
          onOpenAuth={() => setIsAuthOpen(true)}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-64 h-full bg-[#111317]">
            <Sidebar
              activeScreen={activeScreen}
              onSelectScreen={(s) => {
                setActiveScreen(s);
                setMobileSidebarOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
              pendingOrdersCount={newOrdersCount}
              onOpenAuth={() => {
                setIsAuthOpen(true);
                setMobileSidebarOpen(false);
              }}
              isLoggedIn={isLoggedIn}
            />
          </div>
          <div 
            className="flex-1 h-full" 
            onClick={() => setMobileSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          activeScreen={activeScreen}
          currentUser={currentUser}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenGuestPreview={() => {
            setGuestPreviewTable('Table 12 (VIP)');
            setIsGuestPreviewOpen(true);
          }}
          onAddTestOrder={handleSimulateNewOrder}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />

        {/* Screen Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeScreen === 'live-orders' && (
            <LiveOrdersScreen
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onToggleItemPrep={handleToggleItemPrep}
              onAddNewOrder={handleSimulateNewOrder}
              isPaused={isOrdersPaused}
              onTogglePause={() => setIsOrdersPaused(!isOrdersPaused)}
            />
          )}

          {activeScreen === 'dashboard' && (
            <DashboardScreen
              orders={orders}
              menuItems={menuItems}
              onNavigateToMenu={() => setActiveScreen('menu')}
            />
          )}

          {activeScreen === 'menu' && (
            <MenuScreen
              categories={categories}
              menuItems={menuItems}
              onToggleAvailability={handleToggleMenuAvailability}
              onSaveMenuItem={handleSaveMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onAddCategory={handleAddCategory}
            />
          )}

          {activeScreen === 'theme' && (
            <ThemeScreen
              theme={theme}
              onUpdateTheme={(newTheme) => setTheme({ ...theme, ...newTheme })}
              menuItems={menuItems}
              onPlaceGuestOrder={(items) => {
                handleGuestPlaceOrder({
                  tableNumber: 'Table 12 (VIP)',
                  items,
                  totalRevenue: items.reduce((s, i) => s + i.price * i.qty, 0),
                  isVip: true,
                });
              }}
            />
          )}

          {activeScreen === 'qr-codes' && (
            <QrCodeScreen
              tables={tables}
              onAddTable={handleAddTable}
              onToggleTableStatus={handleToggleTableStatus}
              onRegenerateQR={handleRegenerateQR}
              onOpenGuestPreviewForTable={(tbl) => {
                setGuestPreviewTable(tbl);
                setIsGuestPreviewOpen(true);
              }}
            />
          )}

          {activeScreen === 'staff' && (
            <StaffScreen
              users={users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              onSwitchToUser={(user) => {
                setCurrentUser(user);
              }}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsScreen
              hotelProfile={hotelProfile}
              onSaveProfile={(prof) => setHotelProfile(prof)}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          );
        }}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }}
        onClearAll={() => setNotifications([])}
        onSelectOrder={() => {
          setActiveScreen('live-orders');
        }}
      />

      <GuestMenuPreviewModal
        isOpen={isGuestPreviewOpen}
        onClose={() => setIsGuestPreviewOpen(false)}
        tableNumber={guestPreviewTable}
        theme={theme}
        menuItems={menuItems}
        onPlaceOrder={handleGuestPlaceOrder}
      />
    </div>
  );
}
