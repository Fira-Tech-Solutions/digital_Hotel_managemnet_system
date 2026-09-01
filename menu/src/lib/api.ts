const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message || body.error || `Request failed: ${res.status}`);
  }

  return body;
}

// --- Public API ---

export interface PublicHotel {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

export function getPublicHotel() {
  return request<{ success: boolean; data: PublicHotel }>('/api/public/hotel');
}

export interface ApiCustomizationOption {
  id: string;
  label: string;
  priceDelta: number | string;
}

export interface ApiCustomizationGroup {
  id: string;
  name: string;
  isRequired: boolean;
  allowMultiple: boolean;
  options: ApiCustomizationOption[];
}

export interface ApiMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  isAvailable: boolean;
  isChefSpecial: boolean;
  dietaryTags: string[];
  sortOrder: number;
  customizationGroups: ApiCustomizationGroup[];
}

export interface ApiCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  items: ApiMenuItem[];
}

export function getPublicMenu() {
  return request<{ success: boolean; data: ApiCategory[] }>('/api/public/menu');
}

export interface TableResolveResult {
  tableId: string;
  tableNumber: string;
  hotel: { id: string; name: string; slug: string; logoUrl?: string };
}

export function resolveTable(qrToken: string) {
  return request<{ success: boolean; data: TableResolveResult }>(
    `/api/public/tables/${qrToken}`
  );
}

export interface CreateOrderItem {
  menuItemId: string;
  quantity: number;
  itemNotes?: string;
  optionIds: string[];
}

export interface CreateOrderPayload {
  tableId: string;
  notes?: string;
  items: CreateOrderItem[];
}

export interface ApiOrderItem {
  id: string;
  menuItemId: string;
  nameSnapshot: string;
  priceSnapshot: number | string;
  quantity: number;
  itemNotes?: string;
  customizations: {
    id: string;
    optionId: string;
    labelSnapshot: string;
    priceDeltaSnapshot: number | string;
  }[];
}

export interface ApiOrder {
  id: string;
  tableId: string;
  status: string;
  notes?: string;
  subtotal: number | string;
  total: number | string;
  guestSessionId?: string;
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  table: { id: string; number: string };
  items: ApiOrderItem[];
}

export function createOrder(data: CreateOrderPayload) {
  return request<{ success: boolean; data: ApiOrder }>('/api/public/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getOrderStatus(id: string, guestSessionId?: string) {
  const params = guestSessionId ? `?guestSessionId=${guestSessionId}` : '';
  return request<{ success: boolean; data: ApiOrder }>(
    `/api/public/orders/${id}${params}`
  );
}
