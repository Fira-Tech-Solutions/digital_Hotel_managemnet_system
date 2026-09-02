import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_HOTEL_PROFILE,
  INITIAL_MENU_ITEMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_TABLES,
  INITIAL_THEME,
  INITIAL_USERS,
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
  UserProfile,
  Department,
  Station,
  Booking,
  BookingStatus,
  Guest,
  Role,
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
import { LoginPage } from './components/LoginPage';
import { StationLogin } from './components/StationLogin';
import { ExecutiveCommandCenter } from './components/ExecutiveCommandCenter';
import { KitchenDisplayScreen } from './components/KitchenDisplayScreen';
import { FrontDeskScreen } from './components/FrontDeskScreen';
import { HousekeepingScreen } from './components/HousekeepingScreen';
import { BarScreen } from './components/BarScreen';
import { NotificationDrawer } from './components/NotificationDrawer';
import { GuestMenuPreviewModal } from './components/GuestMenuPreviewModal';
import { DepartmentsScreen } from './components/DepartmentsScreen';
import { StationsScreen } from './components/StationsScreen';
import { BookingsScreen } from './components/BookingsScreen';
import { GuestsScreen } from './components/GuestsScreen';
import { RolesScreen } from './components/RolesScreen';
import { playKitchenChime } from './utils/audio';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apiRequest } from './lib/api';
import { getSocket, connectSocket } from './lib/socket';

const statusMap: Record<string, OrderStatus> = {
  PENDING: 'new',
  ACCEPTED: 'preparing',
  READY: 'ready',
  SERVED: 'completed',
  CANCELLED: 'completed',
};

const reverseStatusMap: Record<string, string> = {
  new: 'PENDING',
  preparing: 'ACCEPTED',
  ready: 'READY',
  completed: 'SERVED',
};

function mapApiOrder(raw: any): Order {
  const status = statusMap[raw.status] || 'new';
  const timeAgo = raw.createdAt
    ? formatTimeAgo(new Date(raw.createdAt))
    : 'Just now';

  const startedTimeAgo =
    status === 'preparing' && raw.acceptedAt
      ? `Started ${formatTimeAgo(new Date(raw.acceptedAt))}`
      : status === 'preparing'
        ? 'Started just now'
        : undefined;

  const timeCompleted =
    raw.servedAt
      ? new Date(raw.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;

  return {
    id: raw.id,
    orderNumber: raw.id.slice(-6).toUpperCase(),
    tableNumber: raw.table?.number || 'N/A',
    isVip: raw.table?.zone === 'VIP_LOUNGE' || false,
    timeAgo,
    timestamp: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
    timeCompleted,
    status,
    startedTimeAgo,
    totalRevenue: Number(raw.total) || 0,
    items: (raw.items || []).map((it: any) => ({
      id: it.id,
      name: it.nameSnapshot || it.name || 'Item',
      qty: it.quantity || 1,
      price: Number(it.priceSnapshot) || 0,
      specialAlert: it.itemNotes || undefined,
      prepChecked: false,
    })),
  };
}

function mapApiMenuItem(raw: any): MenuItem {
  return {
    id: raw.id,
    name: raw.name,
    category: (raw.category?.name || 'Mains') as MenuItem['category'],
    price: Number(raw.price) || 0,
    image: raw.imageUrl || raw.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    isAvailable: raw.isAvailable !== false,
    isSoldOut: raw.isAvailable === false,
    station: raw.customizationGroups?.[0]?.name || 'Garde Manger',
    description: raw.description || '',
    allergens: raw.dietaryTags || [],
    tags: raw.isChefSpecial ? ['Chef Signature'] : [],
    ordersCount: 0,
  };
}

function mapApiCategory(raw: any): CategoryInfo {
  return {
    id: raw.id,
    name: raw.name as CategoryInfo['name'],
    count: raw._count?.items || 0,
  };
}

function mapApiTable(raw: any): TableQR {
  return {
    id: raw.id,
    tableNumber: raw.number || `Table ${raw.id.slice(-2)}`,
    zone: (raw.zone || 'MAIN_DINING') as TableQR['zone'],
    status: raw.isActive !== false ? 'Active' : 'Inactive',
    codeGenerated: !!raw.qrToken,
    scansToday: 0,
  };
}

function mapApiStaff(raw: any): UserProfile {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: mapStaffRole(raw.role),
    department: raw.role || 'Staff',
    avatar: '',
    initials: raw.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    status: raw.isActive !== false ? 'Active' : 'Inactive',
    lastLogin: raw.createdAt
      ? `Since ${new Date(raw.createdAt).toLocaleDateString()}`
      : 'Never (Invited)',
  };
}

function mapStaffRole(role: string): UserProfile['role'] {
  const m: Record<string, UserProfile['role']> = {
    OWNER: 'Manager',
    MANAGER: 'Manager',
    KITCHEN: 'Kitchen',
    WAITER: 'Waiter',
    SOMMELIER: 'Sommelier',
    HOST: 'Host',
  };
  return m[role] || 'Kitchen';
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AppInner() {
  const { isAuthenticated, user: currentUser, switchUser } = useAuth();
  const [activeScreen, setActiveScreen] = useState<ScreenType>('live-orders');
  const [collapsedSidebar, setCollapsedSidebar] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'email' | 'station'>('email');

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Core data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState<CategoryInfo[]>(INITIAL_CATEGORIES);
  const [tables, setTables] = useState<TableQR[]>(INITIAL_TABLES);
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('hotel_admin_theme');
    return saved ? JSON.parse(saved) : INITIAL_THEME;
  });
  const [hotelProfile, setHotelProfile] = useState<HotelProfileConfig>(INITIAL_HOTEL_PROFILE);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isOrdersPaused, setIsOrdersPaused] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const [isGuestPreviewOpen, setIsGuestPreviewOpen] = useState<boolean>(false);
  const [guestPreviewTable, setGuestPreviewTable] = useState<string>('Table 12 (VIP)');

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('hotel_admin_theme', JSON.stringify(theme));
  }, [theme]);

  // Fetch all data on auth
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [ordersRes, categoriesRes, itemsRes, tablesRes, hotelRes, staffRes, departmentsRes, stationsRes, bookingsRes, guestsRes, rolesRes] =
        await Promise.allSettled([
          apiRequest<any[]>('/api/admin/orders'),
          apiRequest<any[]>('/api/admin/menu/categories'),
          apiRequest<any[]>('/api/admin/menu/items'),
          apiRequest<any[]>('/api/admin/tables'),
          apiRequest<any>('/api/admin/hotel'),
          apiRequest<any[]>('/api/admin/auth/staff'),
          apiRequest<any[]>('/api/admin/departments').catch(() => []),
          apiRequest<any[]>('/api/admin/stations').catch(() => []),
          apiRequest<any[]>('/api/admin/bookings').catch(() => []),
          apiRequest<any[]>('/api/admin/guests').catch(() => []),
          apiRequest<any[]>('/api/admin/auth/roles').catch(() => []),
        ]);

      if (ordersRes.status === 'fulfilled') {
        const mapped = ordersRes.value.map(mapApiOrder).reverse();
        setOrders(mapped);
      }
      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value.map(mapApiCategory));
      }
      if (itemsRes.status === 'fulfilled') {
        setMenuItems(itemsRes.value.map(mapApiMenuItem));
      }
      if (tablesRes.status === 'fulfilled') {
        setTables(tablesRes.value.map(mapApiTable));
      }
      if (hotelRes.status === 'fulfilled') {
        const h = hotelRes.value;
        setHotelProfile({
          hotelName: h.name || 'Adama Hotel',
          slogan: h.description || '',
          primaryAddress: h.address || '',
          officialWebsite: h.contactEmail || '',
          operatingHours: INITIAL_HOTEL_PROFILE.operatingHours,
          contactInfo: {
            reservationsPhone: h.contactPhone || '',
            conciergeEmail: h.contactEmail || '',
            emergencyManager: '',
            socialHandle: '',
          },
          languages: INITIAL_HOTEL_PROFILE.languages,
        });
        if (h.theme) {
          setTheme({
            primaryColor: h.theme.primaryColor || '#D4AF37',
            backgroundColor: h.theme.backgroundColor || '#F8FAFC',
            primaryFont: h.theme.fontFamily || 'Inter (Default)',
            guestMenuLogo: h.name || 'Adama Hotel Dining',
            layoutTemplate: (h.theme.templateId as any) || 'luxury-cards',
            restaurantName: h.name || 'Adama Hotel Dining',
            tagline: 'Table 12 • Dinner Menu',
          });
        }
      }
      if (staffRes.status === 'fulfilled') {
        setUsers(staffRes.value.map(mapApiStaff));
      }
      if (departmentsRes.status === 'fulfilled') {
        setDepartments(departmentsRes.value.map((d: any) => ({
          id: d.id,
          name: d.name,
          code: d.code || '',
          description: d.description || '',
          isActive: d.isActive !== false,
          stationCount: d._count?.stations || 0,
        })));
      }
      if (stationsRes.status === 'fulfilled') {
        setStations(stationsRes.value.map((s: any) => ({
          id: s.id,
          name: s.name,
          code: s.code || '',
          departmentId: s.departmentId || '',
          departmentName: s.department?.name || '',
          isOnline: s.isOnline !== false,
          lastSeen: s.lastSeen ? formatTimeAgo(new Date(s.lastSeen)) : 'Never',
          deviceInfo: s.deviceInfo || undefined,
        })));
      }
      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.map((b: any) => ({
          id: b.id,
          guestId: b.guestId || '',
          guestName: b.guest?.name || b.guestName || 'Guest',
          roomId: b.roomId || '',
          roomNumber: b.room?.number || b.roomNumber || 'N/A',
          roomType: b.room?.type || b.roomType || 'Standard',
          checkIn: b.checkIn ? new Date(b.checkIn).toLocaleDateString() : '',
          checkOut: b.checkOut ? new Date(b.checkOut).toLocaleDateString() : '',
          status: b.status || 'PENDING',
          total: Number(b.total) || 0,
          specialRequests: b.specialRequests || '',
          createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '',
        })));
      }
      if (guestsRes.status === 'fulfilled') {
        setGuests(guestsRes.value.map((g: any) => ({
          id: g.id,
          name: `${g.firstName || ''} ${g.lastName || ''}`.trim() || g.name || 'Guest',
          email: g.email || '',
          phone: g.phone || '',
          isVip: g.isVip === true,
          bookingsCount: g._count?.bookings || 0,
          createdAt: g.createdAt ? new Date(g.createdAt).toLocaleDateString() : '',
          bookings: (g.bookings || []).map((b: any) => ({
            id: b.id,
            guestId: g.id,
            guestName: `${g.firstName || ''} ${g.lastName || ''}`.trim() || g.name || 'Guest',
            roomId: b.roomId || '',
            roomNumber: b.room?.number || 'N/A',
            roomType: b.room?.type || 'Standard',
            checkIn: b.checkIn ? new Date(b.checkIn).toLocaleDateString() : '',
            checkOut: b.checkOut ? new Date(b.checkOut).toLocaleDateString() : '',
            status: b.status || 'PENDING',
            total: Number(b.total) || 0,
            specialRequests: b.specialRequests || '',
            createdAt: '',
          })),
        })));
      }
      if (rolesRes.status === 'fulfilled') {
        setRoles(rolesRes.value.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          isSystem: r.isSystem === true,
          permissionCount: r.permissions?.length || r._count?.permissions || 0,
          permissions: (r.permissions || []).map((p: any) => ({
            id: p.id || `${p.resource}:${p.action}`,
            resource: p.resource,
            action: p.action,
            description: p.description || `${p.action} ${p.resource}`,
          })),
        })));
      }
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      connectSocket();
    }
  }, [isAuthenticated, fetchAllData]);

  // Set default screen based on role after login
  useEffect(() => {
    if (!currentUser) return;
    const dept = (currentUser as any).department || currentUser.role;
    switch (dept) {
      case 'OWNER':
      case 'MANAGER':
        setActiveScreen('command-center');
        break;
      case 'KITCHEN':
        setActiveScreen('kitchen-display');
        break;
      case 'WAITER':
        setActiveScreen('live-orders');
        break;
      default:
        setActiveScreen('live-orders');
    }
  }, [currentUser?.id]); // only on login/user change

  // Socket.IO listeners
  useEffect(() => {
    const socket = getSocket();

    const handleNewOrder = (order: any) => {
      setOrders((prev) => [mapApiOrder(order), ...prev]);
      if (soundEnabled) playKitchenChime();
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: `New Order #${order.id.slice(-6).toUpperCase()}`,
          description: `Table ${order.table?.number || 'N/A'} placed a new order`,
          time: 'Just now',
          type: 'order' as const,
          isRead: false,
          orderId: order.id,
        },
        ...prev,
      ]);
    };

    const handleOrderUpdate = (order: any) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === order.id);
        const mapped = mapApiOrder(order);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = mapped;
          return next;
        }
        return [mapped, ...prev];
      });
      if (order.status === 'READY' && soundEnabled) {
        playKitchenChime();
      }
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', handleOrderUpdate);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:updated', handleOrderUpdate);
    };
  }, [soundEnabled]);

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const apiStatus = reverseStatusMap[nextStatus];
    if (!apiStatus) return;

    try {
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: apiStatus },
      });
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: nextStatus,
              startedTimeAgo: nextStatus === 'preparing' ? 'Just started' : o.startedTimeAgo,
              timeCompleted:
                nextStatus === 'completed'
                  ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : o.timeCompleted,
            };
          }
          return o;
        })
      );

      if (nextStatus === 'ready') {
        if (soundEnabled) playKitchenChime();
        const targetOrder = orders.find((o) => o.id === orderId);
        if (targetOrder) {
          setNotifications((prev) => [
            {
              id: `n-${Date.now()}`,
              title: `Order #${targetOrder.orderNumber} Ready!`,
              description: `Table ${targetOrder.tableNumber} is ready for runner pickup.`,
              time: 'Just now',
              type: 'kitchen',
              isRead: false,
              orderId,
            },
            ...prev,
          ]);
        }
      }
    } catch {
      // failed silently
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
    // This creates a local simulation for demo purposes
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
      id: `sim-${orderNum}`,
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
  const handleToggleMenuAvailability = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;
    const newAvail = !item.isAvailable;

    setMenuItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, isAvailable: newAvail, isSoldOut: !newAvail } : i
      )
    );

    try {
      await apiRequest(`/api/admin/menu/items/${itemId}/availability`, {
        method: 'PATCH',
        body: { isAvailable: newAvail },
      });
    } catch {
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, isAvailable: !newAvail, isSoldOut: newAvail } : i
        )
      );
    }
  };

  const handleSaveMenuItem = async (itemData: Partial<MenuItem> & { id?: string }) => {
    if (itemData.id) {
      // Update existing
      setMenuItems((prev) =>
        prev.map((i) => (i.id === itemData.id ? ({ ...i, ...itemData } as MenuItem) : i))
      );
      try {
        const cat = categories.find((c) => c.name === (itemData.category || 'Mains'));
        await apiRequest(`/api/admin/menu/items/${itemData.id}`, {
          method: 'PATCH',
          body: {
            name: itemData.name,
            price: itemData.price,
            description: itemData.description,
            imageUrl: itemData.image,
            categoryId: cat?.id,
          },
        });
      } catch {
        fetchAllData();
      }
    } else {
      const cat = categories.find((c) => c.name === (itemData.category || 'Mains'));
      try {
        const res = await apiRequest<any>('/api/admin/menu/items', {
          method: 'POST',
          body: {
            name: itemData.name || 'New Dish',
            price: itemData.price || 20,
            description: itemData.description || '',
            imageUrl: itemData.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
            categoryId: cat?.id || categories[0]?.id,
            isAvailable: true,
          },
        });
        setMenuItems((prev) => [mapApiMenuItem(res), ...prev]);
      } catch {
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
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await apiRequest(`/api/admin/menu/items/${itemId}`, { method: 'DELETE' });
    } catch {
      fetchAllData();
    }
  };

  const handleAddCategory = async (categoryName: string) => {
    const newCat: CategoryInfo = {
      id: `cat-${Date.now()}`,
      name: categoryName as any,
      count: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    try {
      const res = await apiRequest<any>('/api/admin/menu/categories', {
        method: 'POST',
        body: { name: categoryName, sortOrder: categories.length },
      });
      setCategories((prev) => prev.map((c) => (c.id === newCat.id ? mapApiCategory(res) : c)));
    } catch {
      // keep local
    }
  };

  // Table QR Handlers
  const handleAddTable = async (tableNumber: string, zone: TableQR['zone']) => {
    const newTable: TableQR = {
      id: `tbl-${Date.now()}`,
      tableNumber,
      zone,
      status: 'Active',
      codeGenerated: true,
      scansToday: 0,
    };
    setTables((prev) => [...prev, newTable]);
    try {
      const res = await apiRequest<any>('/api/admin/tables', {
        method: 'POST',
        body: { number: tableNumber },
      });
      setTables((prev) => prev.map((t) => (t.id === newTable.id ? mapApiTable(res) : t)));
    } catch {
      fetchAllData();
    }
  };

  const handleToggleTableStatus = async (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' }
          : t
      )
    );
  };

  const handleRegenerateQR = async (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, codeGenerated: true, status: 'Active' } : t
      )
    );
    try {
      await apiRequest(`/api/admin/tables/${tableId}/regenerate`, { method: 'POST' });
    } catch {
      fetchAllData();
    }
  };

  // Staff Handlers
  const handleAddUser = async (userData: Omit<UserProfile, 'id' | 'lastLogin'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastLogin: 'Never (Invited)',
    };
    setUsers((prev) => [newUser, ...prev]);
    try {
      const roleMap: Record<string, string> = {
        Kitchen: 'KITCHEN',
        Manager: 'MANAGER',
        Waiter: 'WAITER',
        Sommelier: 'KITCHEN',
        Host: 'WAITER',
      };
      const res = await apiRequest<any>('/api/admin/auth/staff', {
        method: 'POST',
        body: {
          name: userData.name,
          email: userData.email,
          password: 'TemporaryPass1!',
          role: roleMap[userData.role] || 'KITCHEN',
        },
      });
      setUsers((prev) => prev.map((u) => (u.id === newUser.id ? mapApiStaff(res) : u)));
    } catch {
      // keep local
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus as any } : u))
    );
    try {
      await apiRequest(`/api/admin/auth/staff/${userId}`, {
        method: 'PATCH',
        body: { isActive: newStatus === 'Active' },
      });
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: (newStatus === 'Active' ? 'Inactive' : 'Active') as any } : u
        )
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Department Handlers
  const handleAddDepartment = async (dept: Omit<Department, 'id' | 'stationCount'>) => {
    const newDept: Department = { ...dept, id: `dept-${Date.now()}`, stationCount: 0 };
    setDepartments((prev) => [...prev, newDept]);
    try {
      const res = await apiRequest<any>('/api/admin/departments', {
        method: 'POST',
        body: { name: dept.name, code: dept.code, description: dept.description },
      });
      setDepartments((prev) => prev.map((d) => d.id === newDept.id ? { ...d, id: res.id, stationCount: res._count?.stations || 0 } : d));
    } catch {
      fetchAllData();
    }
  };

  const handleEditDepartment = async (id: string, data: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => d.id === id ? { ...d, ...data } : d));
    try {
      await apiRequest(`/api/admin/departments/${id}`, { method: 'PATCH', body: data });
    } catch {
      fetchAllData();
    }
  };

  const handleToggleDepartment = async (id: string) => {
    setDepartments((prev) => prev.map((d) => d.id === id ? { ...d, isActive: !d.isActive } : d));
    try {
      const dept = departments.find((d) => d.id === id);
      await apiRequest(`/api/admin/departments/${id}`, { method: 'PATCH', body: { isActive: !dept?.isActive } });
    } catch {
      fetchAllData();
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    try {
      await apiRequest(`/api/admin/departments/${id}`, { method: 'DELETE' });
    } catch {
      fetchAllData();
    }
  };

  // Station Handlers
  const handleAddStation = async (data: Omit<Station, 'id' | 'lastSeen'>) => {
    const newStation: Station = { ...data, id: `st-${Date.now()}`, lastSeen: 'Never' };
    setStations((prev) => [...prev, newStation]);
    try {
      const res = await apiRequest<any>('/api/admin/stations', {
        method: 'POST',
        body: { name: data.name, code: data.code, departmentId: data.departmentId },
      });
      setStations((prev) => prev.map((s) => s.id === newStation.id ? { ...s, id: res.id } : s));
    } catch {
      fetchAllData();
    }
  };

  const handleEditStation = async (id: string, data: Partial<Station>) => {
    setStations((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s));
    try {
      await apiRequest(`/api/admin/stations/${id}`, { method: 'PATCH', body: data });
    } catch {
      fetchAllData();
    }
  };

  const handleDeleteStation = async (id: string) => {
    setStations((prev) => prev.filter((s) => s.id !== id));
    try {
      await apiRequest(`/api/admin/stations/${id}`, { method: 'DELETE' });
    } catch {
      fetchAllData();
    }
  };

  // Booking Handlers
  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    try {
      await apiRequest(`/api/admin/bookings/${id}/status`, { method: 'PATCH', body: { status } });
    } catch {
      fetchAllData();
    }
  };

  const handleAddBooking = async (data: { guestId: string; roomId: string; checkIn: string; checkOut: string; specialRequests: string }) => {
    const guest = guests.find((g) => g.id === data.guestId);
    const table = tables.find((t) => t.id === data.roomId);
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      guestId: data.guestId,
      guestName: guest?.name || 'Guest',
      roomId: data.roomId,
      roomNumber: table?.tableNumber || 'N/A',
      roomType: table?.zone || 'Standard',
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: 'PENDING',
      total: 0,
      specialRequests: data.specialRequests,
      createdAt: new Date().toLocaleDateString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
    try {
      const res = await apiRequest<any>('/api/admin/bookings', {
        method: 'POST',
        body: data,
      });
      setBookings((prev) => prev.map((b) => b.id === newBooking.id ? {
        ...b,
        id: res.id,
        total: Number(res.total) || 0,
        status: res.status || 'PENDING',
      } : b));
    } catch {
      fetchAllData();
    }
  };

  // Guest Handlers
  const handleAddGuest = async (data: Omit<Guest, 'id' | 'bookingsCount' | 'createdAt' | 'bookings'>) => {
    const newGuest: Guest = { ...data, id: `gst-${Date.now()}`, bookingsCount: 0, createdAt: new Date().toLocaleDateString(), bookings: [] };
    setGuests((prev) => [...prev, newGuest]);
    try {
      const res = await apiRequest<any>('/api/admin/guests', {
        method: 'POST',
        body: data,
      });
      setGuests((prev) => prev.map((g) => g.id === newGuest.id ? { ...g, id: res.id } : g));
    } catch {
      fetchAllData();
    }
  };

  const handleEditGuest = async (id: string, data: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, ...data } : g));
    try {
      await apiRequest(`/api/admin/guests/${id}`, { method: 'PATCH', body: data });
    } catch {
      fetchAllData();
    }
  };

  // Role Handlers
  const handleCreateRole = async (data: Omit<Role, 'id' | 'permissionCount' | 'permissions'>) => {
    const newRole: Role = { ...data, id: `role-${Date.now()}`, permissionCount: 0, permissions: [] };
    setRoles((prev) => [...prev, newRole]);
    try {
      const res = await apiRequest<any>('/api/admin/auth/roles', {
        method: 'POST',
        body: { name: data.name, description: data.description },
      });
      setRoles((prev) => prev.map((r) => r.id === newRole.id ? { ...r, id: res.id } : r));
    } catch {
      fetchAllData();
    }
  };

  const handleUpdateRolePermissions = async (roleId: string, permissionIds: string[]) => {
    setRoles((prev) => prev.map((r) => {
      if (r.id === roleId) {
        const perms = permissionIds.map((id) => {
          const [resource, action] = id.split(':');
          return { id, resource, action, description: `${action} ${resource}` };
        });
        return { ...r, permissions: perms, permissionCount: perms.length };
      }
      return r;
    }));
    try {
      await apiRequest(`/api/admin/auth/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: { permissionIds },
      });
    } catch {
      fetchAllData();
    }
  };

  const handleDeleteRole = async (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    try {
      await apiRequest(`/api/admin/auth/roles/${id}`, { method: 'DELETE' });
    } catch {
      fetchAllData();
    }
  };

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  if (!isAuthenticated) {
    if (loginMode === 'station') {
      return (
        <div>
          <StationLogin onLogin={() => {}} />
          <button
            onClick={() => setLoginMode('email')}
            className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            Use Email Login
          </button>
        </div>
      );
    }
    return (
      <div>
        <LoginPage />
        <button
          onClick={() => setLoginMode('station')}
          className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/20 transition-all"
        >
          Station Login (PIN)
        </button>
      </div>
    );
  }

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
          isLoggedIn={isAuthenticated}
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
              isLoggedIn={isAuthenticated}
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
          currentUser={currentUser!}
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
          {activeScreen === 'command-center' && (
            <ExecutiveCommandCenter />
          )}

          {activeScreen === 'kitchen-display' && (
            <KitchenDisplayScreen />
          )}

          {activeScreen === 'front-desk' && (
            <FrontDeskScreen />
          )}

          {activeScreen === 'housekeeping' && (
            <HousekeepingScreen />
          )}

          {activeScreen === 'bar' && (
            <BarScreen />
          )}

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
              currentUser={currentUser!}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              onSwitchToUser={(user) => {
                switchUser(user);
              }}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsScreen
              hotelProfile={hotelProfile}
              onSaveProfile={(prof) => setHotelProfile(prof)}
            />
          )}

          {activeScreen === 'departments' && (
            <DepartmentsScreen
              departments={departments}
              onAddDepartment={handleAddDepartment}
              onEditDepartment={handleEditDepartment}
              onToggleDepartment={handleToggleDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}

          {activeScreen === 'stations' && (
            <StationsScreen
              stations={stations}
              departments={departments}
              onAddStation={handleAddStation}
              onEditStation={handleEditStation}
              onDeleteStation={handleDeleteStation}
            />
          )}

          {activeScreen === 'bookings' && (
            <BookingsScreen
              bookings={bookings}
              guests={guests}
              tables={tables}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onAddBooking={handleAddBooking}
            />
          )}

          {activeScreen === 'guests' && (
            <GuestsScreen
              guests={guests}
              onAddGuest={handleAddGuest}
              onEditGuest={handleEditGuest}
            />
          )}

          {activeScreen === 'roles' && (
            <RolesScreen
              roles={roles}
              onCreateRole={handleCreateRole}
              onUpdateRolePermissions={handleUpdateRolePermissions}
              onDeleteRole={handleDeleteRole}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser!}
        onSelectUser={(user) => {
          switchUser(user);
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

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
