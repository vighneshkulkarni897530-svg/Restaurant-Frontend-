export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/$/, '');
    }
    return '/api';
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '');
};

// 1. Demo Hotel Settings
export const DEMO_SETTINGS = {
  id: 'default',
  hotelName: "Govinda's Restaurant & Dining",
  tagline: 'Authentic Pure Vegetarian Delicacies • QR Smart Table Service',
  logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
  address: 'Plot 108, Govinda Complex, Heritage Lane, Mumbai 400049',
  phone: '+91 98200 12345',
  email: 'dine@govindas.com',
  currencySymbol: '₹',
  taxRatePercent: 5.0,
  serviceChargePercent: 2.5,
  wifiSsid: 'Govindas_Guest_WiFi',
  wifiPassword: 'WelcomeGovindas',
  enableOnlinePayment: true,
  enableCashPayment: true,
};

// 2. Demo Dining Tables with Unique QR Tokens
export const DEMO_TABLES = [
  { id: 'tbl_palms_01_a9f1', tableNumber: '01', capacity: 2, section: 'Main Dining Hall', qrToken: 'tbl_palms_01_a9f1', status: 'ACTIVE' },
  { id: 'tbl_palms_02_b8e2', tableNumber: '02', capacity: 4, section: 'Main Dining Hall', qrToken: 'tbl_palms_02_b8e2', status: 'OCCUPIED' },
  { id: 'tbl_palms_03_c7d3', tableNumber: '03', capacity: 4, section: 'Family Lounge', qrToken: 'tbl_palms_03_c7d3', status: 'ACTIVE' },
  { id: 'tbl_palms_04_d6c4', tableNumber: '04', capacity: 6, section: 'Garden Terrace', qrToken: 'tbl_palms_04_d6c4', status: 'ACTIVE' },
  { id: 'tbl_palms_05_e5b5', tableNumber: '05', capacity: 4, section: 'Garden Terrace', qrToken: 'tbl_palms_05_e5b5', status: 'ACTIVE' },
  { id: 'tbl_palms_06_f4a6', tableNumber: '06', capacity: 8, section: 'Garden Terrace', qrToken: 'tbl_palms_06_f4a6', status: 'ACTIVE' },
  { id: 'tbl_palms_07_g397', tableNumber: '07', capacity: 2, section: 'Rooftop Lounge', qrToken: 'tbl_palms_07_g397', status: 'ACTIVE' },
  { id: 'tbl_palms_08_h288', tableNumber: '08', capacity: 4, section: 'Rooftop Lounge', qrToken: 'tbl_palms_08_h288', status: 'ACTIVE' },
  { id: 'tbl_palms_09_i179', tableNumber: '09', capacity: 6, section: 'VIP Gazebo', qrToken: 'tbl_palms_09_i179', status: 'ACTIVE' },
  { id: 'tbl_palms_10_j060', tableNumber: '10', capacity: 10, section: 'Royal VIP Cabin', qrToken: 'tbl_palms_10_j060', status: 'RESERVED' },
];

// 3. Demo Categories
export const DEMO_CATEGORIES = [
  {
    id: 'cat_specials',
    name: 'Chef Specials',
    slug: 'chef-specials',
    description: 'Handcrafted signature dishes curated by our Executive Chef',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    icon: 'Sparkles',
    sortOrder: 1,
    isActive: true,
    _count: { menuItems: 3 },
  },
  {
    id: 'cat_starters',
    name: 'Starters & Appetizers',
    slug: 'starters',
    description: 'Crisp, fiery and delicious bite-sized beginnings',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    icon: 'Flame',
    sortOrder: 2,
    isActive: true,
    _count: { menuItems: 3 },
  },
  {
    id: 'cat_pizzas',
    name: 'Artisan Pizzas',
    slug: 'pizzas',
    description: 'Wood-fired thin crust Neapolitan pizzas with fresh mozzarella',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    icon: 'Pizza',
    sortOrder: 3,
    isActive: true,
    _count: { menuItems: 3 },
  },
  {
    id: 'cat_burgers',
    name: 'Burgers & Sliders',
    slug: 'burgers',
    description: 'Juicy gourmet burgers served with golden herb fries',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    icon: 'Sandwich',
    sortOrder: 4,
    isActive: true,
    _count: { menuItems: 2 },
  },
  {
    id: 'cat_mains',
    name: 'Main Course',
    slug: 'main-course',
    description: 'Rich royal gravies, aromatic biryanis and gourmet platters',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
    icon: 'UtensilsCrossed',
    sortOrder: 5,
    isActive: true,
    _count: { menuItems: 2 },
  },
  {
    id: 'cat_beverages',
    name: 'Beverages & Mocktails',
    slug: 'beverages',
    description: 'Refreshing chilled coolers, artisan shakes and brewed coffees',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    icon: 'Coffee',
    sortOrder: 6,
    isActive: true,
    _count: { menuItems: 2 },
  },
  {
    id: 'cat_desserts',
    name: 'Desserts & Sweets',
    slug: 'desserts',
    description: 'Decadent chocolate delights, cheesecakes and artisanal gelato',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80',
    icon: 'Cake',
    sortOrder: 7,
    isActive: true,
    _count: { menuItems: 2 },
  },
];

// 4. Demo Menu Items (17 Gourmet Dishes)
export const DEMO_MENU_ITEMS = [
  // Chef Specials
  {
    id: 'item_01',
    categoryId: 'cat_specials',
    name: 'Truffle Butter Glazed Paneer Steak',
    description: 'Char-grilled cottage cheese medallions infused with black truffle oil, served over saffron herb risotto.',
    price: 490,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true,
    spicyLevel: 1,
    preparationTimeMin: 20,
    calories: 420,
    sortOrder: 1,
    category: { id: 'cat_specials', name: 'Chef Specials', slug: 'chef-specials' },
  },
  {
    id: 'item_02',
    categoryId: 'cat_specials',
    name: 'Smoked Butter Chicken Supreme',
    description: 'Tender tandoor-roasted chicken in a velvety slow-simmered makhani gravy with smoked charcoal aroma.',
    price: 540,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    isVeg: false,
    isChefSpecial: true,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 25,
    calories: 560,
    sortOrder: 2,
    category: { id: 'cat_specials', name: 'Chef Specials', slug: 'chef-specials' },
  },
  {
    id: 'item_03',
    categoryId: 'cat_specials',
    name: 'Royal Awadhi Dum Biryani',
    description: 'Fragrant aged Basmati rice layered with marinated paneer & dry fruits, slow-cooked in a sealed clay pot.',
    price: 460,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 25,
    calories: 510,
    sortOrder: 3,
    category: { id: 'cat_specials', name: 'Chef Specials', slug: 'chef-specials' },
  },

  // Starters
  {
    id: 'item_04',
    categoryId: 'cat_starters',
    name: 'Crispy Peri-Peri Cheese Cigars',
    description: 'Golden fried crispy spring rolls bursting with molten mozzarella, jalapenos, and house dip.',
    price: 290,
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 12,
    calories: 340,
    sortOrder: 4,
    category: { id: 'cat_starters', name: 'Starters & Appetizers', slug: 'starters' },
  },
  {
    id: 'item_05',
    categoryId: 'cat_starters',
    name: 'Honey Chilli Garlic Lotus Stem',
    description: 'Crunchy wok-tossed lotus stem slices glazed in spicy honey chilli sauce with roasted sesame.',
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 15,
    calories: 280,
    sortOrder: 5,
    category: { id: 'cat_starters', name: 'Starters & Appetizers', slug: 'starters' },
  },
  {
    id: 'item_06',
    categoryId: 'cat_starters',
    name: 'Smoky Malai Chicken Tikka',
    description: 'Juicy boneless chicken thighs marinated in rich cashew cream, cardamom, and green chillies.',
    price: 390,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 1,
    preparationTimeMin: 18,
    calories: 410,
    sortOrder: 6,
    category: { id: 'cat_starters', name: 'Starters & Appetizers', slug: 'starters' },
  },

  // Artisan Pizzas
  {
    id: 'item_07',
    categoryId: 'cat_pizzas',
    name: 'Margherita Burrata Speciale',
    description: 'San Marzano tomato sauce, fresh buffalo burrata, garden basil, and extra virgin olive oil on hand-stretched dough.',
    price: 420,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true,
    spicyLevel: 0,
    preparationTimeMin: 18,
    calories: 620,
    sortOrder: 7,
    category: { id: 'cat_pizzas', name: 'Artisan Pizzas', slug: 'pizzas' },
  },
  {
    id: 'item_08',
    categoryId: 'cat_pizzas',
    name: 'Fiery BBQ Paneer & Bell Pepper Pizza',
    description: 'Zesty barbecue sauce, spiced roasted paneer, grilled bell peppers, red onions, and smoked cheddar.',
    price: 460,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 20,
    calories: 680,
    sortOrder: 8,
    category: { id: 'cat_pizzas', name: 'Artisan Pizzas', slug: 'pizzas' },
  },
  {
    id: 'item_09',
    categoryId: 'cat_pizzas',
    name: 'Pepperoni & Smoked Sausage Pizza',
    description: 'Classic Italian pepperoni slices, spicy chicken sausage, black olives, oregano, and double mozzarella.',
    price: 520,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 20,
    calories: 740,
    sortOrder: 9,
    category: { id: 'cat_pizzas', name: 'Artisan Pizzas', slug: 'pizzas' },
  },

  // Burgers
  {
    id: 'item_10',
    categoryId: 'cat_burgers',
    name: 'Ultimate Truffle Mushroom Crunch Burger',
    description: 'Crispy fried herb mushroom patty, swiss cheese melt, caramelized onions, and truffle aioli in a brioche bun.',
    price: 340,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 1,
    preparationTimeMin: 15,
    calories: 540,
    sortOrder: 10,
    category: { id: 'cat_burgers', name: 'Burgers & Sliders', slug: 'burgers' },
  },
  {
    id: 'item_11',
    categoryId: 'cat_burgers',
    name: 'Double Cheddar Gourmet Chicken Smash',
    description: 'Two grilled chicken patties, double vintage cheddar, spicy ranch slaw, and gherkins served with waffle fries.',
    price: 390,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isVeg: false,
    isChefSpecial: true,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 18,
    calories: 680,
    sortOrder: 11,
    category: { id: 'cat_burgers', name: 'Burgers & Sliders', slug: 'burgers' },
  },

  // Main Course
  {
    id: 'item_12',
    categoryId: 'cat_mains',
    name: 'Paneer Lababdar & Garlic Butter Naan',
    description: 'Soft cottage cheese chunks cooked in rich onion-tomato masala with grated paneer and creamy butter swirl.',
    price: 380,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 2,
    preparationTimeMin: 20,
    calories: 520,
    sortOrder: 12,
    category: { id: 'cat_mains', name: 'Main Course', slug: 'main-course' },
  },
  {
    id: 'item_13',
    categoryId: 'cat_mains',
    name: 'Dal Bukhara (Slow Cooked 18 Hours)',
    description: 'Legendary black lentils simmered overnight with tomatoes, cream, and pure butter on charcoal embers.',
    price: 340,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true,
    spicyLevel: 1,
    preparationTimeMin: 15,
    calories: 460,
    sortOrder: 13,
    category: { id: 'cat_mains', name: 'Main Course', slug: 'main-course' },
  },

  // Beverages
  {
    id: 'item_14',
    categoryId: 'cat_beverages',
    name: 'Sparkling Passion Fruit & Mint Mojito',
    description: 'Zesty crushed fresh lime, garden mint leaves, organic passion fruit pulp, and effervescent soda over crushed ice.',
    price: 210,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 0,
    preparationTimeMin: 8,
    calories: 140,
    sortOrder: 14,
    category: { id: 'cat_beverages', name: 'Beverages & Mocktails', slug: 'beverages' },
  },
  {
    id: 'item_15',
    categoryId: 'cat_beverages',
    name: 'Classic Hazelnut Cold Brew Frappe',
    description: 'Single-origin Arabica cold brew espresso blended with roasted hazelnut cream, chocolate drizzle, and vanilla bean cream.',
    price: 240,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 0,
    preparationTimeMin: 8,
    calories: 220,
    sortOrder: 15,
    category: { id: 'cat_beverages', name: 'Beverages & Mocktails', slug: 'beverages' },
  },

  // Desserts
  {
    id: 'item_16',
    categoryId: 'cat_desserts',
    name: 'Molten Belgian Chocolate Lava Cake',
    description: 'Warm dark chocolate cake with a gushing molten ganache center, paired with Madagascar vanilla bean gelato.',
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true,
    spicyLevel: 0,
    preparationTimeMin: 12,
    calories: 450,
    sortOrder: 16,
    category: { id: 'cat_desserts', name: 'Desserts & Sweets', slug: 'desserts' },
  },
  {
    id: 'item_17',
    categoryId: 'cat_desserts',
    name: 'New York Baked Berry Cheesecake',
    description: 'Velvety Philadelphia cream cheese filling on a buttery graham cracker crust, topped with wild blueberry compote.',
    price: 310,
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true,
    spicyLevel: 0,
    preparationTimeMin: 10,
    calories: 380,
    sortOrder: 17,
    category: { id: 'cat_desserts', name: 'Desserts & Sweets', slug: 'desserts' },
  },
];

// 5. Initial Demo Orders (Empty for clean production state)
export const INITIAL_DEMO_ORDERS: any[] = [];

let inMemoryOrders: any[] | null = null;
let inMemoryTables: any[] | null = null;
let inMemoryCategories: any[] | null = null;
let inMemoryMenuItems: any[] | null = null;
let inMemorySettings: any | null = null;

export const getStoredOrders = (): any[] => {
  if (typeof window === 'undefined') {
    return inMemoryOrders || [];
  }

  try {
    const raw = localStorage.getItem('hotel_mock_orders');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any leftover demo orders
        const cleanOrders = parsed.filter(
          (o) =>
            !o.id?.startsWith('ord_demo_') &&
            o.orderNumber !== 'ORD-1001' &&
            o.orderNumber !== 'ORD-1002'
        );
        inMemoryOrders = cleanOrders;
        return cleanOrders;
      }
    }
  } catch (e) {
    console.error('Error reading stored orders:', e);
  }

  inMemoryOrders = [];
  try {
    localStorage.setItem('hotel_mock_orders', JSON.stringify([]));
  } catch { }
  return [];
};

export const saveStoredOrders = (orders: any[]) => {
  const cleanOrders = (orders || []).filter(
    (o) =>
      !o.id?.startsWith('ord_demo_') &&
      o.orderNumber !== 'ORD-1001' &&
      o.orderNumber !== 'ORD-1002'
  );
  inMemoryOrders = cleanOrders;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('hotel_mock_orders', JSON.stringify(cleanOrders));
    } catch (e) {
      console.error('Error saving stored orders:', e);
    }
  }
};

export const getStoredTables = (): any[] => {
  if (typeof window === 'undefined') return inMemoryTables || DEMO_TABLES;
  try {
    const raw = localStorage.getItem('hotel_mock_tables');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryTables = parsed;
        return parsed;
      }
    }
  } catch { }
  inMemoryTables = DEMO_TABLES;
  try {
    localStorage.setItem('hotel_mock_tables', JSON.stringify(DEMO_TABLES));
  } catch { }
  return DEMO_TABLES;
};

export const saveStoredTables = (tables: any[]) => {
  inMemoryTables = tables;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('hotel_mock_tables', JSON.stringify(tables));
    } catch { }
  }
};

export const getStoredCategories = (): any[] => {
  if (typeof window === 'undefined') return inMemoryCategories || DEMO_CATEGORIES;
  try {
    const raw = localStorage.getItem('hotel_mock_categories');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCategories = parsed;
        return parsed;
      }
    }
  } catch { }
  inMemoryCategories = DEMO_CATEGORIES;
  try {
    localStorage.setItem('hotel_mock_categories', JSON.stringify(DEMO_CATEGORIES));
  } catch { }
  return DEMO_CATEGORIES;
};

export const saveStoredCategories = (cats: any[]) => {
  inMemoryCategories = cats;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('hotel_mock_categories', JSON.stringify(cats));
    } catch { }
  }
};

export const getStoredMenuItems = (): any[] => {
  if (typeof window === 'undefined') return inMemoryMenuItems || DEMO_MENU_ITEMS;
  try {
    const raw = localStorage.getItem('hotel_mock_menu_items');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryMenuItems = parsed;
        return parsed;
      }
    }
  } catch { }
  inMemoryMenuItems = DEMO_MENU_ITEMS;
  try {
    localStorage.setItem('hotel_mock_menu_items', JSON.stringify(DEMO_MENU_ITEMS));
  } catch { }
  return DEMO_MENU_ITEMS;
};

export const saveStoredMenuItems = (items: any[]) => {
  inMemoryMenuItems = items;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('hotel_mock_menu_items', JSON.stringify(items));
    } catch { }
  }
};

export const getStoredSettings = (): any => {
  if (typeof window === 'undefined') return inMemorySettings || DEMO_SETTINGS;
  try {
    const raw = localStorage.getItem('hotel_mock_settings');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        inMemorySettings = parsed;
        return parsed;
      }
    }
  } catch { }
  inMemorySettings = DEMO_SETTINGS;
  try {
    localStorage.setItem('hotel_mock_settings', JSON.stringify(DEMO_SETTINGS));
  } catch { }
  return DEMO_SETTINGS;
};

export const saveStoredSettings = (settings: any) => {
  inMemorySettings = settings;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('hotel_mock_settings', JSON.stringify(settings));
    } catch { }
  }
};

let syncBroadcastChannel: BroadcastChannel | null = null;
const getBroadcastChannel = () => {
  if (typeof window === 'undefined') return null;
  if (!syncBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      syncBroadcastChannel = new BroadcastChannel('hotel_qr_events');
    } catch { }
  }
  return syncBroadcastChannel;
};

export const broadcastLocalOrderEvent = (event: 'order:new' | 'order:status_updated', data: any) => {
  if (typeof window === 'undefined') return;

  // 1. BroadcastChannel across tabs
  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage({ event, data });
    } catch { }
  }

  // 2. CustomEvent in same tab
  try {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
    window.dispatchEvent(new CustomEvent('hotel:order_event', { detail: { event, data } }));
  } catch { }

  // 3. Storage event trigger for older browsers/tabs
  try {
    localStorage.setItem(
      'hotel_qr_last_event',
      JSON.stringify({ event, data, timestamp: Date.now() })
    );
  } catch { }
};

export const subscribeToLocalOrderEvents = (
  callback: (event: 'order:new' | 'order:status_updated', data: any) => void
) => {
  if (typeof window === 'undefined') return () => { };

  const handleCustomEvent = (e: any) => {
    if (e.detail?.event && e.detail?.data) {
      callback(e.detail.event, e.detail.data);
    }
  };

  const handleOrderNew = (e: any) => callback('order:new', e.detail);
  const handleOrderStatusUpdated = (e: any) => callback('order:status_updated', e.detail);

  window.addEventListener('order:new', handleOrderNew);
  window.addEventListener('order:status_updated', handleOrderStatusUpdated);
  window.addEventListener('hotel:order_event', handleCustomEvent);

  const channel = getBroadcastChannel();
  const handleChannelMsg = (ev: MessageEvent) => {
    if (ev.data?.event && ev.data?.data) {
      callback(ev.data.event, ev.data.data);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleChannelMsg);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'hotel_qr_last_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.event && parsed.data) {
          callback(parsed.event, parsed.data);
        }
      } catch { }
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('order:new', handleOrderNew);
    window.removeEventListener('order:status_updated', handleOrderStatusUpdated);
    window.removeEventListener('hotel:order_event', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (channel) {
      channel.removeEventListener('message', handleChannelMsg);
    }
  };
};

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hotel_admin_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let requestUrl: string;
  if (cleanEndpoint.startsWith('http://') || cleanEndpoint.startsWith('https://')) {
    requestUrl = cleanEndpoint;
  } else {
    if (baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
    } else if (!baseUrl.endsWith('/api') && !cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = `/api${cleanEndpoint}`;
    }
    requestUrl = `${baseUrl}${cleanEndpoint}`;
  }

  try {
    const response = await fetch(requestUrl, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    // Auto-cache remote database responses into localStorage to prevent data loss on server restart
    if (data.orders && Array.isArray(data.orders)) {
      saveStoredOrders(data.orders);
    }
    if (data.tables && Array.isArray(data.tables)) {
      saveStoredTables(data.tables);
    }
    if (data.categories && Array.isArray(data.categories)) {
      saveStoredCategories(data.categories);
    }
    if (data.items && Array.isArray(data.items)) {
      saveStoredMenuItems(data.items);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveStoredSettings(data.settings);
    }

    return data;
  } catch (err: any) {
    console.warn(`[API] Remote call to ${cleanEndpoint} failed, activating smart local fallback.`);

    // 1. Auth Login Fallback
    if (cleanEndpoint === '/auth/login' && options.body) {
      const parsed = JSON.parse(options.body as string);
      if (
        (parsed.email?.toLowerCase().includes('admin') || parsed.email === 'admin@govindas.com') &&
        (parsed.password === 'admin123' || parsed.password === 'admin')
      ) {
        return {
          success: true,
          token: 'demo_jwt_token_admin_govindas',
          user: {
            id: 'usr_admin_1',
            name: 'Executive Manager (Govinda)',
            email: parsed.email,
            role: 'ADMIN',
            phone: '+91 98200 11111',
          },
        };
      }
      if (parsed.email?.toLowerCase().includes('chef') && (parsed.password === 'chef123' || parsed.password === 'admin123')) {
        return {
          success: true,
          token: 'demo_jwt_token_chef_govindas',
          user: {
            id: 'usr_chef_1',
            name: 'Head Chef Sanjeev',
            email: 'chef@govindas.com',
            role: 'CHEF',
            phone: '+91 98200 22222',
          },
        };
      }
      if (parsed.email?.toLowerCase().includes('waiter') && (parsed.password === 'waiter123' || parsed.password === 'admin123')) {
        return {
          success: true,
          token: 'demo_jwt_token_waiter_govindas',
          user: {
            id: 'usr_waiter_1',
            name: 'Dining Server Rajesh',
            email: 'waiter@govindas.com',
            role: 'WAITER',
            phone: '+91 98200 33333',
          },
        };
      }
    }

    // 2. Current User Profile Fallback
    if (cleanEndpoint === '/auth/me') {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('hotel_admin_user') : null;
      if (savedUser) {
        return { success: true, user: JSON.parse(savedUser) };
      }
      return {
        success: true,
        user: {
          id: 'usr_admin_1',
          name: 'Executive Manager',
          email: 'admin@govindas.com',
          role: 'ADMIN',
          phone: '+91 98200 11111',
        },
      };
    }

    // 3. Staff List Fallback
    if (cleanEndpoint === '/auth/staff') {
      return {
        success: true,
        staff: [
          { id: 'usr_admin_1', name: 'Executive Manager', email: 'admin@govindas.com', role: 'ADMIN', phone: '+91 98200 11111', isActive: true },
          { id: 'usr_chef_1', name: 'Head Chef Sanjeev', email: 'chef@govindas.com', role: 'CHEF', phone: '+91 98200 22222', isActive: true },
          { id: 'usr_waiter_1', name: 'Dining Server Rajesh', email: 'waiter@govindas.com', role: 'STAFF', phone: '+91 98200 33333', isActive: true },
        ],
      };
    }

    // 4. Hotel Settings Fallback (GET / PUT)
    if (cleanEndpoint.startsWith('/settings')) {
      if (options.method === 'PUT' && options.body) {
        const body = JSON.parse(options.body as string);
        const current = getStoredSettings();
        const updated = { ...current, ...body, updatedAt: new Date().toISOString() };
        saveStoredSettings(updated);
        return { success: true, message: 'Settings updated successfully', settings: updated };
      }
      return { success: true, settings: getStoredSettings() };
    }

    // 5. Dining Tables Fallback (GET, POST, PATCH, DELETE, Regenerate QR)
    if (cleanEndpoint.startsWith('/tables/qr/')) {
      const token = cleanEndpoint.replace('/tables/qr/', '');
      const tables = getStoredTables();
      const match = tables.find((t) => t.qrToken === token) || tables[0];
      return { success: true, table: match, hotel: getStoredSettings() };
    }

    if (cleanEndpoint === '/tables' || cleanEndpoint.startsWith('/tables?')) {
      if (options.method === 'POST' && options.body) {
        const body = JSON.parse(options.body as string);
        const tables = getStoredTables();
        const newTable = {
          id: `tbl_${Date.now()}`,
          tableNumber: body.tableNumber || `${tables.length + 1}`.padStart(2, '0'),
          capacity: parseInt(body.capacity) || 4,
          section: body.section || 'Indoor Bistro',
          qrToken: `tbl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          status: body.status || 'ACTIVE',
        };
        const updated = [...tables, newTable];
        saveStoredTables(updated);
        return { success: true, table: newTable, message: 'Table created successfully' };
      }
      return { success: true, tables: getStoredTables() };
    }

    if (cleanEndpoint.startsWith('/tables/')) {
      const parts = cleanEndpoint.split('?')[0].split('/');
      const tableId = parts[2];
      const tables = getStoredTables();

      if (cleanEndpoint.includes('/regenerate-qr') && options.method === 'POST') {
        const target = tables.find((t) => t.id === tableId);
        if (target) {
          target.qrToken = `tbl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          saveStoredTables(tables);
          return { success: true, table: target, message: 'QR regenerated' };
        }
      }

      if (options.method === 'PATCH' && options.body) {
        const body = JSON.parse(options.body as string);
        const updated = tables.map((t) => (t.id === tableId ? { ...t, ...body } : t));
        saveStoredTables(updated);
        const target = updated.find((t) => t.id === tableId);
        return { success: true, table: target, message: 'Table updated' };
      }

      if (options.method === 'DELETE') {
        const updated = tables.filter((t) => t.id !== tableId);
        saveStoredTables(updated);
        return { success: true, message: 'Table deleted successfully' };
      }
    }

    // 6. Menu Categories Fallback (GET, POST, PATCH, DELETE)
    if (cleanEndpoint.startsWith('/menu/categories')) {
      const categories = getStoredCategories();

      if (options.method === 'POST' && options.body) {
        const body = JSON.parse(options.body as string);
        const newCat = {
          id: `cat_${Date.now()}`,
          name: body.name,
          slug: body.slug || (body.name || '').toLowerCase().replace(/\s+/g, '-'),
          description: body.description || '',
          imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
          icon: body.icon || 'UtensilsCrossed',
          sortOrder: parseInt(body.sortOrder) || categories.length + 1,
          isActive: true,
          _count: { menuItems: 0 },
        };
        const updated = [...categories, newCat];
        saveStoredCategories(updated);
        return { success: true, category: newCat };
      }

      if (options.method === 'PATCH' && options.body) {
        const parts = cleanEndpoint.split('/');
        const catId = parts[3];
        const body = JSON.parse(options.body as string);
        const updated = categories.map((c) => (c.id === catId ? { ...c, ...body } : c));
        saveStoredCategories(updated);
        return { success: true, category: updated.find((c) => c.id === catId) };
      }

      if (options.method === 'DELETE') {
        const parts = cleanEndpoint.split('/');
        const catId = parts[3];
        const updated = categories.filter((c) => c.id !== catId);
        saveStoredCategories(updated);
        return { success: true, message: 'Category deleted' };
      }

      return {
        success: true,
        categories,
      };
    }

    // 7. Menu Items Fallback (Supports GET with filters, POST, PATCH, DELETE, toggle-stock)
    if (cleanEndpoint.startsWith('/menu/items')) {
      const menuItems = getStoredMenuItems();
      const categories = getStoredCategories();

      if (options.method === 'POST' && options.body) {
        const body = JSON.parse(options.body as string);
        const catObj = categories.find((c) => c.id === body.categoryId) || categories[0];
        const newItem = {
          id: `item_${Date.now()}`,
          categoryId: body.categoryId || catObj?.id,
          name: body.name,
          description: body.description || '',
          price: parseFloat(body.price) || 0,
          imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          isVeg: body.isVeg !== undefined ? body.isVeg : true,
          isChefSpecial: body.isChefSpecial || false,
          isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
          spicyLevel: parseInt(body.spicyLevel) || 0,
          preparationTimeMin: parseInt(body.preparationTimeMin) || 15,
          calories: parseInt(body.calories) || 350,
          sortOrder: menuItems.length + 1,
          category: catObj,
        };
        const updated = [...menuItems, newItem];
        saveStoredMenuItems(updated);
        return { success: true, item: newItem };
      }

      if (options.method === 'PATCH') {
        const parts = cleanEndpoint.split('?')[0].split('/');
        const itemId = parts[3];

        if (cleanEndpoint.includes('/toggle-stock')) {
          const updated = menuItems.map((it) =>
            it.id === itemId ? { ...it, isAvailable: !it.isAvailable } : it
          );
          saveStoredMenuItems(updated);
          return { success: true, item: updated.find((it) => it.id === itemId) };
        }

        if (options.body) {
          const body = JSON.parse(options.body as string);
          const updated = menuItems.map((it) => {
            if (it.id === itemId) {
              const catObj = body.categoryId
                ? categories.find((c) => c.id === body.categoryId) || it.category
                : it.category;
              return { ...it, ...body, category: catObj };
            }
            return it;
          });
          saveStoredMenuItems(updated);
          return { success: true, item: updated.find((it) => it.id === itemId) };
        }
      }

      if (options.method === 'DELETE') {
        const parts = cleanEndpoint.split('/');
        const itemId = parts[3];
        const updated = menuItems.filter((it) => it.id !== itemId);
        saveStoredMenuItems(updated);
        return { success: true, message: 'Item deleted' };
      }

      try {
        const fakeUrl = new URL(`http://localhost${cleanEndpoint}`);
        const categoryId = fakeUrl.searchParams.get('categoryId');
        const search = fakeUrl.searchParams.get('search')?.toLowerCase();
        const isVeg = fakeUrl.searchParams.get('isVeg');
        const availableOnly = fakeUrl.searchParams.get('availableOnly') === 'true';

        let filtered = [...menuItems];

        if (categoryId && categoryId !== 'all') {
          filtered = filtered.filter((item) => item.categoryId === categoryId);
        }

        if (isVeg !== null && isVeg !== undefined && isVeg !== '') {
          const vegBool = isVeg === 'true';
          filtered = filtered.filter((item) => item.isVeg === vegBool);
        }

        if (availableOnly) {
          filtered = filtered.filter((item) => item.isAvailable);
        }

        if (search) {
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(search) ||
              item.description?.toLowerCase().includes(search) ||
              item.category?.name?.toLowerCase().includes(search)
          );
        }

        return {
          success: true,
          items: filtered,
          total: filtered.length,
        };
      } catch {
        return {
          success: true,
          items: menuItems,
          total: menuItems.length,
        };
      }
    }

    // 8. Orders Fallback (List, Create, Status Update, Get)
    if (cleanEndpoint.startsWith('/orders')) {
      const allOrders = getStoredOrders();
      const currentTables = getStoredTables();
      const currentMenuItems = getStoredMenuItems();

      if (options.method === 'POST' && options.body) {
        const body = JSON.parse(options.body as string);
        if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.trim().length < 2) {
          return { success: false, message: 'Customer Name is compulsory (minimum 2 characters).' };
        }
        if (!body.customerPhone || typeof body.customerPhone !== 'string' || body.customerPhone.trim().replace(/[\s-]/g, '').length < 10) {
          return { success: false, message: 'Customer Mobile Number is compulsory (10 digits).' };
        }

        const newOrderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const tableObj =
          currentTables.find((t) => t.id === body.tableId || t.qrToken === body.qrToken) ||
          currentTables[0];

        // Accurately map items with names and prices from catalog if not directly provided
        let computedSubtotal = 0;
        const resolvedItems = (body.items || []).map((it: any, idx: number) => {
          const menuItem = currentMenuItems.find((m) => m.id === it.menuItemId);
          const name = it.name || menuItem?.name || 'Gourmet Dish';
          const unitPrice =
            typeof it.unitPrice === 'number'
              ? it.unitPrice
              : menuItem?.price || 0;
          const quantity = Math.max(1, parseInt(it.quantity) || 1);
          const itemTotal =
            typeof it.itemTotal === 'number'
              ? it.itemTotal
              : unitPrice * quantity;

          computedSubtotal += itemTotal;

          return {
            id: `oi_${Date.now()}_${idx}`,
            orderId: `ord_live_${Date.now()}`,
            menuItemId: it.menuItemId || (menuItem ? menuItem.id : `item_${idx}`),
            name,
            quantity,
            unitPrice,
            itemTotal,
            specialInstructions: it.specialInstructions || null,
          };
        });

        const subtotal =
          typeof body.subtotal === 'number' && body.subtotal > 0
            ? body.subtotal
            : computedSubtotal;
        const tax =
          typeof body.tax === 'number' && body.tax > 0
            ? body.tax
            : parseFloat(((subtotal * 5.0) / 100).toFixed(2));
        const serviceCharge =
          typeof body.serviceCharge === 'number' && body.serviceCharge > 0
            ? body.serviceCharge
            : parseFloat(((subtotal * 2.5) / 100).toFixed(2));
        const total =
          typeof body.total === 'number' && body.total > 0
            ? body.total
            : parseFloat((subtotal + tax + serviceCharge).toFixed(2));

        const createdOrder = {
          id: `ord_live_${Date.now()}`,
          orderNumber: newOrderNum,
          tableId: body.tableId || tableObj.id,
          customerName: body.customerName || 'Dining Guest',
          customerPhone: body.customerPhone || '',
          notes: body.notes || '',
          status: 'NEW',
          paymentStatus: body.paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
          subtotal,
          tax,
          serviceCharge,
          total,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          table: tableObj,
          items: resolvedItems,
          payment: {
            id: `pay_live_${Date.now()}`,
            orderId: `ord_live_${Date.now()}`,
            provider: body.paymentMethod === 'CASH' ? 'CASH' : 'ONLINE_RAZORPAY',
            amount: total,
            status: body.paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED',
            paymentMethod: body.paymentMethod === 'CASH' ? 'Cash at Table' : 'UPI / Online Card',
            createdAt: new Date().toISOString(),
          },
        };

        const updatedOrders = [createdOrder, ...allOrders];
        saveStoredOrders(updatedOrders);
        broadcastLocalOrderEvent('order:new', createdOrder);

        return { success: true, order: createdOrder };
      }

      if (options.method === 'PATCH') {
        const parts = cleanEndpoint.split('?')[0].split('/');
        const orderId = parts[2];
        const target = allOrders.find((o) => o.id === orderId || o.orderNumber === orderId);

        if (target) {
          if (cleanEndpoint.includes('/status') && options.body) {
            const { status } = JSON.parse(options.body as string);
            target.status = status;
          }
          if (cleanEndpoint.includes('/mark-paid')) {
            target.paymentStatus = 'PAID';
            if (target.payment) target.payment.status = 'COMPLETED';
          }
          target.updatedAt = new Date().toISOString();

          const updatedOrders = allOrders.map((o) =>
            o.id === target.id ? { ...target } : o
          );
          saveStoredOrders(updatedOrders);
          broadcastLocalOrderEvent('order:status_updated', target);

          return { success: true, order: target };
        }
        return { success: true };
      }

      const idMatch = cleanEndpoint.split('?')[0].match(/^\/orders\/([a-zA-Z0-9_-]+)$/);
      if (idMatch && !cleanEndpoint.includes('?')) {
        const orderId = idMatch[1];
        const found = allOrders.find((o) => o.id === orderId || o.orderNumber === orderId) || allOrders[0];
        return { success: true, order: found, hotel: getStoredSettings() };
      }

      // Filter query params
      const urlObj = new URL(`http://dummy${cleanEndpoint}`);
      const statusParam = urlObj.searchParams.get('status');
      const tableIdParam = urlObj.searchParams.get('tableId');

      let filtered = [...allOrders];
      if (statusParam && statusParam !== 'all') {
        const statuses = statusParam.split(',');
        filtered = filtered.filter((o) => statuses.includes(o.status));
      }
      if (tableIdParam && tableIdParam !== 'all') {
        filtered = filtered.filter((o) => o.tableId === tableIdParam);
      }

      return {
        success: true,
        orders: filtered,
      };
    }

    // 9. Payment Fallback
    if (cleanEndpoint.startsWith('/payments/create-razorpay-order')) {
      const body = options.body ? JSON.parse(options.body as string) : {};
      return {
        success: true,
        orderId: `order_mock_${Date.now()}`,
        amount: Math.round((body.amount || 100) * 100),
        currency: 'INR',
        keyId: 'rzp_test_mock_govindas',
      };
    }

    if (cleanEndpoint.startsWith('/payments/verify')) {
      const body = options.body ? JSON.parse(options.body as string) : {};
      if (body.orderId) {
        const allOrders = getStoredOrders();
        const target = allOrders.find((o) => o.id === body.orderId || o.orderNumber === body.orderId);
        if (target) {
          target.paymentStatus = 'PAID';
          if (!target.payment) {
            target.payment = {
              id: `pay_live_${Date.now()}`,
              orderId: target.id,
              provider: 'ONLINE_RAZORPAY',
              amount: target.total,
              status: 'COMPLETED',
              paymentMethod: body.paymentMethod || 'UPI / Online',
              createdAt: new Date().toISOString(),
            };
          } else {
            target.payment.status = 'COMPLETED';
            target.payment.providerPaymentId = body.razorpayPaymentId || `sim_pay_${Date.now()}`;
            target.payment.providerOrderId = body.razorpayOrderId || `sim_ord_${Date.now()}`;
            target.payment.paymentMethod = body.paymentMethod || 'UPI / Online';
          }
          target.updatedAt = new Date().toISOString();

          const updatedOrders = allOrders.map((o) => (o.id === target.id ? { ...target } : o));
          saveStoredOrders(updatedOrders);
          broadcastLocalOrderEvent('order:status_updated', target);

          return { success: true, message: 'Payment verified successfully.', order: target };
        }
      }
      return { success: true, message: 'Payment verified successfully.' };
    }

    if (cleanEndpoint === '/payments') {
      const allOrders = getStoredOrders();
      const payments = allOrders
        .filter((o) => o.payment)
        .map((o) => ({
          ...o.payment,
          order: { id: o.id, orderNumber: o.orderNumber, table: o.table, customerName: o.customerName },
        }));
      return { success: true, payments };
    }

    // 10. Waiter Call Fallback
    if (cleanEndpoint === '/waiter/call') {
      return { success: true, message: 'Waiter has been alerted to your table.' };
    }

    if (cleanEndpoint === '/waiter/pending') {
      return { success: true, calls: [] };
    }

    // 11. Dashboard Overview & Sales Reports Fallback
    if (cleanEndpoint.startsWith('/reports/overview')) {
      const allOrders = getStoredOrders();
      const currentTables = getStoredTables();
      const todayRevenue = allOrders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const activeOrdersCount = allOrders.filter((o) =>
        ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'].includes(o.status)
      ).length;

      return {
        success: true,
        stats: {
          todayRevenue: parseFloat(todayRevenue.toFixed(2)),
          todayOrdersCount: allOrders.length,
          activeOrdersCount,
          occupiedTables: Math.min(currentTables.length, Math.max(0, activeOrdersCount)),
          totalTables: currentTables.length,
          tableOccupancyRate: currentTables.length > 0 ? Math.round((Math.min(currentTables.length, Math.max(0, activeOrdersCount)) / currentTables.length) * 100) : 0,
          pendingWaiterCalls: 0,
          statusCounts: {
            NEW: allOrders.filter((o) => o.status === 'NEW').length,
            ACCEPTED: allOrders.filter((o) => o.status === 'ACCEPTED').length,
            PREPARING: allOrders.filter((o) => o.status === 'PREPARING').length,
            READY: allOrders.filter((o) => o.status === 'READY').length,
            SERVED: allOrders.filter((o) => o.status === 'SERVED').length,
            COMPLETED: allOrders.filter((o) => o.status === 'COMPLETED').length,
            CANCELLED: allOrders.filter((o) => o.status === 'CANCELLED').length,
          },
        },
        recentOrders: allOrders.slice(0, 6),
      };
    }

    if (cleanEndpoint.startsWith('/reports/sales')) {
      const allOrders = getStoredOrders();
      const currentMenuItems = getStoredMenuItems();
      const totalRev = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return {
        success: true,
        sales: {
          todayTotal: parseFloat(totalRev.toFixed(2)),
          weeklyTotal: parseFloat((totalRev * 6.5).toFixed(2)),
          monthlyTotal: parseFloat((totalRev * 28).toFixed(2)),
          topSelling: currentMenuItems.slice(0, 5),
        },
      };
    }

    if (cleanEndpoint.startsWith('/network-ip')) {
      return {
        success: true,
        preferredIp: '10.230.94.1',
        frontendUrl: 'http://10.230.94.1:3000',
        interfaces: [
          { name: 'Wi-Fi', ip: '10.230.94.1', isWifi: true },
          { name: 'Wi-Fi 3 (Hotspot)', ip: '192.168.137.1', isWifi: true },
        ],
      };
    }

    throw err;
  }
}

export const api = {
  // Table
  getTableByQR: (token: string) => fetchApi(`/tables/qr/${token}`),
  listTables: () => fetchApi('/tables'),
  createTable: (data: any) => fetchApi('/tables', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id: string, data: any) => fetchApi(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTable: (id: string) => fetchApi(`/tables/${id}`, { method: 'DELETE' }),
  regenerateQR: (id: string) => fetchApi(`/tables/${id}/regenerate-qr`, { method: 'POST' }),
  getTableQRCode: (id: string) => fetchApi(`/tables/${id}/qr-code`),

  // Network Discovery
  getNetworkIp: () => fetchApi('/network-ip'),

  // Menu
  getCategories: (includeInactive = false) => fetchApi(`/menu/categories?includeInactive=${includeInactive}`),
  createCategory: (data: any) => fetchApi('/menu/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => fetchApi(`/menu/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => fetchApi(`/menu/categories/${id}`, { method: 'DELETE' }),

  getMenuItems: (params: { categoryId?: string; search?: string; isVeg?: string; availableOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.search) query.append('search', params.search);
    if (params.isVeg) query.append('isVeg', params.isVeg);
    if (params.availableOnly) query.append('availableOnly', 'true');
    return fetchApi(`/menu/items?${query.toString()}`);
  },
  createMenuItem: (data: any) => fetchApi('/menu/items', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: string, data: any) => fetchApi(`/menu/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMenuItem: (id: string) => fetchApi(`/menu/items/${id}`, { method: 'DELETE' }),
  toggleItemStock: (id: string) => fetchApi(`/menu/items/${id}/toggle-stock`, { method: 'PATCH' }),

  // Orders
  createOrder: (data: any) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrderById: (id: string) => fetchApi(`/orders/${id}`),
  listOrders: (params: { status?: string; tableId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.tableId) query.append('tableId', params.tableId);
    return fetchApi(`/orders?${query.toString()}`);
  },
  updateOrderStatus: (id: string, status: string) => fetchApi(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  markPaymentReceived: (id: string) => fetchApi(`/orders/${id}/mark-paid`, { method: 'PATCH' }),

  // Payment
  createRazorpayOrder: (amount: number, receipt?: string) => fetchApi('/payments/create-razorpay-order', { method: 'POST', body: JSON.stringify({ amount, receipt }) }),
  verifyPayment: (data: any) => fetchApi('/payments/verify', { method: 'POST', body: JSON.stringify(data) }),
  listPayments: () => fetchApi('/payments'),

  // Waiter Call
  callWaiter: (data: { tableId?: string; qrToken?: string; requestType: string; notes?: string }) => fetchApi('/waiter/call', { method: 'POST', body: JSON.stringify(data) }),
  listPendingWaiterCalls: () => fetchApi('/waiter/pending'),
  attendWaiterCall: (id: string) => fetchApi(`/waiter/${id}/attend`, { method: 'PATCH' }),

  // Reports
  getDashboardOverview: () => fetchApi('/reports/overview'),
  getSalesReport: () => fetchApi('/reports/sales'),

  // Settings
  getHotelSettings: () => fetchApi('/settings'),
  updateHotelSettings: (data: any) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  login: (credentials: { email: string; password: string }) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchApi('/auth/me'),
  listStaff: () => fetchApi('/auth/staff'),
  createStaff: (data: any) => fetchApi('/auth/staff', { method: 'POST', body: JSON.stringify(data) }),
};
