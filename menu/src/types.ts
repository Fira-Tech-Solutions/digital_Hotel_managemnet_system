export type CategoryId = 'starters' | 'mains' | 'wine' | 'desserts' | 'cocktails';

export type DietaryTag = 'GF' | 'DF' | 'VG' | 'V' | 'NF' | 'SIGNATURE';

export interface DishOption {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Dish {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  longDescription?: string;
  price: number;
  category: CategoryId;
  image: string;
  dietaryTags?: DietaryTag[];
  cutSizes?: DishOption[];
  cookingTemps?: string[];
  pairing?: string;
  calories?: number;
  isPopular?: boolean;
}

export interface CartItem {
  cartId: string;
  dish: Dish;
  quantity: number;
  selectedCutSize?: DishOption;
  selectedTemp?: string;
  specialInstructions?: string;
  unitPrice: number;
}

export type OrderStatusStep = 'received' | 'accepted' | 'preparing' | 'ready' | 'served';

export interface TimelineStep {
  step: OrderStatusStep;
  title: string;
  subtitle: string;
  time?: string;
  completed: boolean;
  active: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  tableNumber: string;
  suiteNumber: string;
  items: CartItem[];
  subtotal: number;
  serviceCharge: number;
  total: number;
  specialRequests: string;
  status: OrderStatusStep;
  estimatedMinutes: string;
  timeline: TimelineStep[];
}

export interface ConciergeRequest {
  id: string;
  type: string;
  title: string;
  details?: string;
  status: 'sent' | 'attending' | 'fulfilled';
  timestamp: string;
}
