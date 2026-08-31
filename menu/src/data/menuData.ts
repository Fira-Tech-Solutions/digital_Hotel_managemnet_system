import { Dish } from '../types';

export const CATEGORIES = [
  { id: 'starters', name: 'Starters' },
  { id: 'mains', name: 'Mains' },
  { id: 'wine', name: 'Wine Cellar' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'cocktails', name: 'Cocktails' },
] as const;

export const MENU_ITEMS: Dish[] = [
  {
    id: 'wagyu-fillet',
    name: 'Reserve Wagyu Fillet',
    tagline: 'A5 Miyazaki Wagyu charcoal seared',
    description: 'A5 Miyazaki wagyu, smoked bone marrow, and bordelaise sauce',
    longDescription:
      'A masterpiece of texture and flavor. Our A5 Miyazaki Wagyu is seared to perfection over binchotan charcoal, accompanied by a rich, 48-hour bone marrow jus and finished with fleur de sel.',
    price: 110,
    category: 'mains',
    image:
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=85',
    dietaryTags: ['GF', 'SIGNATURE'],
    cutSizes: [
      { id: '6oz', name: '6 oz', extraPrice: 0 },
      { id: '8oz', name: '8 oz', extraPrice: 40 },
      { id: '10oz', name: '10 oz', extraPrice: 75 },
    ],
    cookingTemps: ['Rare', 'Medium Rare', 'Medium', 'Medium Well'],
    pairing: 'Château Margaux 2015 Bordeaux',
    isPopular: true,
  },
  {
    id: 'sea-bass',
    name: 'Truffle-Glazed Sea Bass',
    tagline: 'Hand-dived Atlantic sea bass',
    description: 'Hand-dived sea bass with black winter truffle and silk parsnip puree',
    longDescription:
      'Wild Atlantic sea bass pan-seared with a crisp skin, glazed with Norcia black winter truffle honey, served on a velvet bed of silk parsnip puree and glazed baby heirloom carrots.',
    price: 48,
    category: 'mains',
    image:
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=85',
    dietaryTags: ['GF'],
    cutSizes: [
      { id: 'standard', name: 'Regular Portion (7 oz)', extraPrice: 0 },
      { id: 'imperial', name: 'Imperial Cut (10 oz)', extraPrice: 22 },
    ],
    pairing: 'Puligny-Montrachet 1er Cru 2020',
    isPopular: true,
  },
  {
    id: 'wagyu-tartare',
    name: 'Wagyu A5 Tartare',
    tagline: 'Imperial Oscietra & Cured Quail Egg',
    description: 'Truffle emulsion, oscietra caviar, cured quail egg, and golden brioche crisps',
    longDescription:
      'Hand-cut raw A5 Wagyu tenderloin gently seasoned with shallot confit, house-made truffle emulsion, topped with royal oscietra caviar and a cured golden egg yolk.',
    price: 38,
    category: 'starters',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
    dietaryTags: ['SIGNATURE'],
    pairing: 'Dom Pérignon Vintage 2012',
    isPopular: true,
  },
  {
    id: 'scallops-tartare',
    name: 'Pan-Seared Hokkaido Scallops',
    tagline: 'Diver Scallops with Cauliflower Velouté',
    description: 'Caramelized scallops, cauliflower velouté, imperial oscietra caviar, brown butter foam',
    longDescription:
      'Sweet Hokkaido diver scallops caramelized in cultured butter, nestled in a velvety cauliflower purée with golden capers, brown butter foam, and fresh micro herbs.',
    price: 42,
    category: 'starters',
    image:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=85',
    dietaryTags: ['GF'],
    pairing: 'Sancerre Domaine Vacheron 2021',
  },
  {
    id: 'vintage-bordeaux',
    name: 'Vintage Bordeaux',
    tagline: 'Château Margaux Grand Cru',
    description: 'Château Margaux Premier Grand Cru, dark fruit, cedar and velvety tannins',
    longDescription:
      'An exceptional vintage characterized by profound complexity, notes of cassis, black truffle, cigar box, and supple, velvety tannins with extraordinary length.',
    price: 35,
    category: 'wine',
    image:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=85',
    cutSizes: [
      { id: 'glass', name: 'Glass (150ml)', extraPrice: 0 },
      { id: 'bottle', name: 'Bottle (750ml)', extraPrice: 195 },
    ],
    dietaryTags: ['VG'],
    isPopular: true,
  },
  {
    id: 'dom-perignon',
    name: 'Dom Pérignon 2012',
    tagline: 'Épernay, France — Brut Champagne',
    description: 'Vintage Champagne with vibrant freshness, white flowers, and silky brioche finish',
    longDescription:
      'A legendary champagne with supreme balance of intense minerality, toasted brioche, almond, candied citrus, and a silky, persistent effervescence.',
    price: 65,
    category: 'wine',
    image:
      'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=1200&q=85',
    cutSizes: [
      { id: 'glass', name: 'Flute Glass', extraPrice: 0 },
      { id: 'bottle', name: 'Full Bottle', extraPrice: 320 },
    ],
    dietaryTags: ['VG', 'SIGNATURE'],
  },
  {
    id: 'duck-orange',
    name: 'Roasted Duck Breast à l’Orange',
    tagline: 'Challans Duck Breast with Candied Kumquats',
    description: 'Aged Challans duck breast, spiced orange glaze, fondant potato, and thyme reduction',
    longDescription:
      'Dry-aged duck breast roasted with crispy skin, lacquered in a spiced blood orange and Grand Marnier glaze, paired with pomme fondant and baby winter leeks.',
    price: 56,
    category: 'mains',
    image:
      'https://images.unsplash.com/photo-1514944298352-f674997184e9?auto=format&fit=crop&w=1200&q=85',
    cookingTemps: ['Medium Rare', 'Medium'],
    dietaryTags: ['GF'],
    pairing: 'Pinot Noir Domaine Dujac 2019',
  },
  {
    id: 'chocolate-sphere',
    name: 'Valrhona Gold Chocolate Sphere',
    tagline: 'Grand Cru Dark Chocolate & Salted Caramel',
    description: 'Smoked hazelnut praline, 24k gold leaf, with warm table-poured salted caramel',
    longDescription:
      'A delicate 70% Guanaja chocolate sphere encasing Piedmont hazelnut praline mousse and passionfruit gelée, melted open table-side with warm Madagascar vanilla bean caramel.',
    price: 26,
    category: 'desserts',
    image:
      'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=85',
    dietaryTags: ['VG', 'SIGNATURE'],
  },
  {
    id: 'smoked-cocktail',
    name: 'Smoked Oak Old Fashioned',
    tagline: 'Bourbon Infused with Charred Applewood',
    description: 'Small-batch reserve bourbon, Angostura bitters, orange oil, smoked cherrywood',
    longDescription:
      'Crafted with 12-year reserve bourbon, clarified demerara, aromatic bitters, served inside a bell jar with captured Applewood smoke over a hand-carved crystal ice sphere.',
    price: 28,
    category: 'cocktails',
    image:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=85',
    dietaryTags: ['VG'],
  },
];

export const INITIAL_ORDER = {
  id: 'ORD-8942',
  createdAt: '19:42',
  tableNumber: 'Table 12',
  suiteNumber: 'Suite 402',
  items: [
    {
      cartId: 'item-1',
      dish: MENU_ITEMS[2], // Wagyu A5 Tartare
      quantity: 1,
      unitPrice: 38,
    },
    {
      cartId: 'item-2',
      dish: MENU_ITEMS[5], // Dom Perignon
      quantity: 2,
      unitPrice: 65,
    },
  ],
  subtotal: 168.0,
  serviceCharge: 21.0,
  total: 189.0,
  specialRequests: 'Please pour champagne upon seating. Guest has mild walnut allergy.',
  status: 'accepted' as const,
  estimatedMinutes: '15-20 minutes',
  timeline: [
    {
      step: 'received' as const,
      title: 'Received',
      subtitle: 'Order submitted to system',
      time: '19:42',
      completed: true,
      active: false,
    },
    {
      step: 'accepted' as const,
      title: 'Accepted by Chef',
      subtitle: 'Sourcing ingredients & prep',
      time: '19:44',
      completed: false,
      active: true,
    },
    {
      step: 'preparing' as const,
      title: 'Preparing',
      subtitle: 'Binchotan charcoal searing',
      time: 'Estimated 19:55',
      completed: false,
      active: false,
    },
    {
      step: 'ready' as const,
      title: 'Ready to Serve',
      subtitle: 'Table delivery by head waiter',
      time: 'Estimated 20:02',
      completed: false,
      active: false,
    },
  ],
};
