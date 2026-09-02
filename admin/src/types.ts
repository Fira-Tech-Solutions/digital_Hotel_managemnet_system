export type ScreenType =
  | 'command-center'
  | 'kitchen-display'
  | 'front-desk'
  | 'housekeeping'
  | 'bar'
  | 'live-orders'
  | 'dashboard' 
  | 'menu' 
  | 'theme' 
  | 'qr-codes' 
  | 'staff' 
  | 'settings'
  | 'departments'
  | 'stations'
  | 'bookings'
  | 'guests'
  | 'roles';

export type UserRole = 'Manager' | 'Kitchen' | 'Waiter' | 'Sommelier' | 'Host';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  avatar: string;
  initials?: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  notes?: string;
  specialAlert?: string;
  prepChecked?: boolean;
  price?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  isVip?: boolean;
  timeAgo: string;
  timestamp: number;
  timeCompleted?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalRevenue: number;
  startedTimeAgo?: string;
  runnerWaiting?: boolean;
  isAlert?: boolean;
  category?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Appetizers' | 'Mains' | 'Sides' | 'Desserts' | 'Drinks';
  price: number;
  image: string;
  isAvailable: boolean;
  isSoldOut?: boolean;
  station: string;
  description?: string;
  allergens?: string[];
  tags?: string[];
  ordersCount?: number;
}

export interface CategoryInfo {
  id: string;
  name: 'Appetizers' | 'Mains' | 'Sides' | 'Desserts' | 'Drinks';
  count: number;
}

export interface TableQR {
  id: string;
  tableNumber: string;
  zone: 'TERRACE' | 'MAIN DINING' | 'BAR AREA' | 'VIP LOUNGE';
  status: 'Active' | 'Inactive';
  previewType?: 'table' | 'tablet' | 'minimal';
  qrUrl?: string;
  codeGenerated: boolean;
  scansToday?: number;
}

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  primaryFont: string;
  guestMenuLogo: string;
  layoutTemplate: 'luxury-cards' | 'classic-bistro' | 'modern-grid';
  restaurantName: string;
  tagline: string;
}

export interface HotelProfileConfig {
  hotelName: string;
  slogan: string;
  primaryAddress: string;
  officialWebsite: string;
  operatingHours: {
    day: string;
    openTime: string;
    closeTime: string;
    kitchenCutoff: string;
    isOpen: boolean;
  }[];
  contactInfo: {
    reservationsPhone: string;
    conciergeEmail: string;
    emergencyManager: string;
    socialHandle: string;
  };
  languages: {
    code: string;
    name: string;
    flag: string;
    isEnabled: boolean;
    isDefault?: boolean;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'kitchen' | 'system' | 'staff';
  isRead: boolean;
  orderId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  stationCount: number;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  isOnline: boolean;
  lastSeen: string;
  deviceInfo?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  total: number;
  specialRequests: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVip: boolean;
  bookingsCount: number;
  createdAt: string;
  bookings: Booking[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
  permissions: Permission[];
}
