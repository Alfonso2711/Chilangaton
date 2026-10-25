import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Market,
  Stall,
  Product,
  CartItem,
  Order,
  WhatsAppMessage,
  ActiveAppView,
  DayOfWeek,
  VoiceInventoryParseResult,
  TrustProfile,
  User,
  UserRole,
  PickupProgress,
  StopStatus,
  CLIENTE_VIEWS,
  VENDEDOR_VIEWS,
  FrequentBasket,
} from '../types';
import {
  INITIAL_MARKETS,
  INITIAL_STALLS,
  INITIAL_PRODUCTS,
  INITIAL_WHATSAPP_MESSAGES,
} from '../data/mockData';
import { parseMerchantAudioOrText } from '../services/geminiNlp';

export const MOCK_USERS: Record<UserRole, User> = {
  admin: {
    id: 'user-admin-1',
    name: 'Lic. Roberto Armenta',
    email: 'admin@sedeco.cdmx.gob.mx',
    role: 'admin',
    title: 'Dirección General de Abasto y Comercio Popular',
    organization: 'SEDECO CDMX',
    badgeText: 'Administrador SEDECO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  },
  cliente: {
    id: 'user-cliente-1',
    name: 'Sofía Morales',
    email: 'sofia.morales@gmail.com',
    role: 'cliente',
    title: 'Consumidora Barrial',
    organization: 'Comunidad Roma-Condesa',
    badgeText: 'Usuario Cliente',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  },
  vendedor: {
    id: 'user-vendedor-1',
    name: 'Doña Mary Hernández',
    email: 'mary.frutas@mercadomedellin.mx',
    role: 'vendedor',
    title: 'Locataria Puesto 42 · Frutas y Legumbres',
    organization: 'Mercado Medellín (Cuauhtémoc)',
    badgeText: 'Usuario Vendedor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  },
};

interface AppContextType {
  currentUser: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  markets: Market[];
  selectedMarketId: string;
  selectedMarket: Market | undefined;
  setSelectedMarketId: (id: string) => void;
  selectedDay: DayOfWeek | 'todos';
  setSelectedDay: (day: DayOfWeek | 'todos') => void;
  selectedAlcaldia: string;
  setSelectedAlcaldia: (alcaldia: string) => void;

  stalls: Stall[];
  selectedStallId: string | null;
  setSelectedStallId: (id: string | null) => void;
  selectedStall: Stall | undefined;

  products: Product[];
  updateProductPrice: (productId: string, newPrice: number) => void;
  toggleProductStock: (productId: string, inStock?: boolean) => void;
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCanastaLocal: number;
  cartTotalSupermercado: number;
  cartTotalConvenience: number;
  cartSavingsPesos: number;
  cartSavingsPercent: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  frequentBaskets: FrequentBasket[];
  loadFrequentBasket: (basketId: string) => void;
  saveCurrentCartAsBasket: (name: string, emoji?: string) => void;
  deleteFrequentBasket: (basketId: string) => void;

  orders: Order[];
  createOrder: (
    deliveryType: 'bici' | 'pickup',
    paymentMethod: 'efectivo' | 'codi_dimo' | 'spei',
    customerName: string,
    customerPhone: string,
    deliveryAddress?: string,
    extras?: { notes?: string; cashTendered?: number }
  ) => Order;
  // Pedido de recolección que el cliente sigue en el croquis (RF-08)
  activeOrderId: string | null;
  setActiveOrderId: (orderId: string | null) => void;
  activeOrder: Order | undefined;
  // true cuando el croquis se abre desde el carrito como vista previa (sin ficha generada)
  croquisPreview: boolean;
  setCroquisPreview: (preview: boolean) => void;
  // Avance de cada puesto dentro de una ficha de recolección (compartido cliente ↔ vendedor)
  pickupProgress: Record<string, PickupProgress>;
  setStopStatus: (orderId: string, stallId: string, status: StopStatus) => void;
  reportStopIncident: (orderId: string, stallId: string, reason: string | null) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  activeView: ActiveAppView;
  setActiveView: (view: ActiveAppView) => void;

  whatsAppMessages: WhatsAppMessage[];
  sendMerchantMessage: (content: string, isAudio?: boolean, audioDuration?: string) => Promise<VoiceInventoryParseResult>;

  merchantStall: Stall;
  updateTrustProfile: (updates: Partial<TrustProfile>) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  recentNotification: string | null;
  setRecentNotification: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted products or default
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_products_v1');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [markets] = useState<Market[]>(INITIAL_MARKETS);
  const [selectedMarketId, setSelectedMarketId] = useState<string>('m-medellin');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'todos'>('todos');
  const [selectedAlcaldia, setSelectedAlcaldia] = useState<string>('todas');

  const [stalls, setStalls] = useState<Stall[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_stalls_v1');
      return saved ? JSON.parse(saved) : INITIAL_STALLS;
    } catch {
      return INITIAL_STALLS;
    }
  });
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_cart_v1');
      return saved ? JSON.parse(saved) : [
        { product: INITIAL_PRODUCTS[0], quantity: 2 }, // 2kg Jitomate
        { product: INITIAL_PRODUCTS[1], quantity: 1 }, // 1kg Aguacate
        { product: INITIAL_PRODUCTS[7], quantity: 1 }, // 1kg Pechuga
      ];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_orders_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('canasta_current_user_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<ActiveAppView>(() => {
    try {
      const savedUser = localStorage.getItem('canasta_current_user_v1');
      if (savedUser) {
        const u = JSON.parse(savedUser) as User;
        if (u.role === 'admin') return 'gobierno_b2g';
        if (u.role === 'vendedor') return 'locatario';
      }
    } catch {
      // fallback
    }
    return 'comprador';
  });

  const login = (role: UserRole) => {
    const user = MOCK_USERS[role];
    setCurrentUser(user);
    try {
      localStorage.setItem('canasta_current_user_v1', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    if (role === 'admin') {
      setActiveView('gobierno_b2g');
    } else if (role === 'vendedor') {
      setActiveView('locatario');
    } else {
      setActiveView('comprador');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsCartOpen(false);
    try {
      localStorage.removeItem('canasta_current_user_v1');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin' && activeView !== 'gobierno_b2g' && activeView !== 'admin_territorial') {
      setActiveView('gobierno_b2g');
    } else if (currentUser.role === 'cliente' && !CLIENTE_VIEWS.includes(activeView)) {
      setActiveView('comprador');
    } else if (currentUser.role === 'vendedor' && !VENDEDOR_VIEWS.includes(activeView)) {
      setActiveView('locatario');
    }
  }, [currentUser, activeView]);
  const DEFAULT_FREQUENT_BASKETS: FrequentBasket[] = [
    {
      id: 'basket-basicos',
      name: 'Básicos de la Semana',
      tagline: 'Jitomate, cebolla, limón y aguacate para la cocina diaria',
      emoji: '🧺',
      items: [
        { productId: 'prod-jitomate-saladet', quantity: 1.5 },
        { productId: 'prod-cebolla-blanca', quantity: 1 },
        { productId: 'prod-limon-colima', quantity: 1 },
        { productId: 'prod-aguacate-hass', quantity: 1 },
      ],
      approxTotal: 138,
      savingsVsSuper: 88,
    },
    {
      id: 'basket-saludable',
      name: 'Fruta y Verdura Fresca',
      tagline: 'Hortalizas, plátano, manzana y cilantro de Xochimilco',
      emoji: '🥗',
      items: [
        { productId: 'prod-jitomate-saladet', quantity: 1 },
        { productId: 'prod-platano-tabasco', quantity: 1.5 },
        { productId: 'prod-manzana-golden', quantity: 1 },
        { productId: 'prod-cilantro-chinampa', quantity: 2 },
      ],
      approxTotal: 103,
      savingsVsSuper: 62,
    },
    {
      id: 'basket-comida',
      name: 'Comida y Proteína del Mercado',
      tagline: 'Pechuga fresca, bistec de res suave y queso Oaxaca artesanal',
      emoji: '🥩',
      items: [
        { productId: 'prod-pechuga-pollo', quantity: 1 },
        { productId: 'prod-bistec-res', quantity: 1 },
        { productId: 'prod-queso-oaxaca', quantity: 0.5 },
      ],
      approxTotal: 375,
      savingsVsSuper: 148,
    },
  ];

  const [customBaskets, setCustomBaskets] = useState<FrequentBasket[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_custom_baskets_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('canasta_custom_baskets_v1', JSON.stringify(customBaskets));
    } catch (e) {
      console.error(e);
    }
  }, [customBaskets]);

  const frequentBaskets: FrequentBasket[] = useMemo(() => {
    return [...customBaskets, ...DEFAULT_FREQUENT_BASKETS];
  }, [customBaskets]);

  const loadFrequentBasket = (basketId: string) => {
    const basket = frequentBaskets.find((b: FrequentBasket) => b.id === basketId);
    if (!basket) return;
    const newCartItems: CartItem[] = [];
    basket.items.forEach(({ productId, quantity }: { productId: string; quantity: number }) => {
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        newCartItems.push({ product: prod, quantity });
      }
    });
    if (newCartItems.length > 0) {
      setCart(newCartItems);
      setIsCartOpen(true);
      setRecentNotification(`🧺 Canasta cargada: "${basket.name}" (${newCartItems.length} productos)`);
      window.setTimeout(() => setRecentNotification(null), 3500);
    }
  };

  const saveCurrentCartAsBasket = (name: string, emoji = '⭐') => {
    if (cart.length === 0) return;
    const newBasket: FrequentBasket = {
      id: `basket-custom-${Date.now()}`,
      name: name || 'Mi Canasta Favorita',
      tagline: `Guardada con ${cart.length} productos recurrentes`,
      emoji,
      items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity })),
      approxTotal: Math.round(cartTotalCanastaLocal),
      savingsVsSuper: Math.round(cartSavingsPesos),
    };
    setCustomBaskets((prev) => [newBasket, ...prev]);
    setRecentNotification(`⭐ Canasta "${newBasket.name}" guardada para reordenar en 1 clic`);
    window.setTimeout(() => setRecentNotification(null), 3500);
  };

  const deleteFrequentBasket = (basketId: string) => {
    setCustomBaskets((prev) => prev.filter((b) => b.id !== basketId));
  };

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [croquisPreview, setCroquisPreview] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('canasta_active_order_v1');
    } catch {
      return null;
    }
  });
  const [pickupProgress, setPickupProgress] = useState<Record<string, PickupProgress>>(() => {
    try {
      const saved = localStorage.getItem('canasta_pickup_progress_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessage[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_whatsapp_v1');
      return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_MESSAGES;
    } catch {
      return INITIAL_WHATSAPP_MESSAGES;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('canasta_products_v1', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('canasta_stalls_v1', JSON.stringify(stalls));
  }, [stalls]);

  useEffect(() => {
    localStorage.setItem('canasta_cart_v1', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('canasta_orders_v1', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('canasta_whatsapp_v1', JSON.stringify(whatsAppMessages));
  }, [whatsAppMessages]);

  useEffect(() => {
    try {
      if (activeOrderId) localStorage.setItem('canasta_active_order_v1', activeOrderId);
      else localStorage.removeItem('canasta_active_order_v1');
    } catch {
      // almacenamiento no disponible
    }
  }, [activeOrderId]);

  useEffect(() => {
    try {
      localStorage.setItem('canasta_pickup_progress_v1', JSON.stringify(pickupProgress));
    } catch {
      // almacenamiento no disponible
    }
  }, [pickupProgress]);

  const selectedMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];
  const selectedStall = stalls.find((s) => s.id === selectedStallId);
  const merchantStall = stalls.find((s) => s.id === 'stall-dona-mary') || stalls[0];
  const activeOrder = orders.find((o) => o.id === activeOrderId);

  const setStopStatus = (orderId: string, stallId: string, status: StopStatus) => {
    setPickupProgress((prev) => {
      const current = prev[orderId] || { statuses: {}, incidents: {} };
      const incidents = { ...current.incidents };
      if (status !== 'incidencia') delete incidents[stallId];
      return { ...prev, [orderId]: { statuses: { ...current.statuses, [stallId]: status }, incidents } };
    });
  };

  const reportStopIncident = (orderId: string, stallId: string, reason: string | null) => {
    setPickupProgress((prev) => {
      const current = prev[orderId] || { statuses: {}, incidents: {} };
      const incidents = { ...current.incidents };
      const statuses = { ...current.statuses };
      if (reason) {
        incidents[stallId] = reason;
        statuses[stallId] = 'incidencia';
      } else {
        delete incidents[stallId];
        statuses[stallId] = 'listo';
      }
      return { ...prev, [orderId]: { statuses, incidents } };
    });
  };

  // Cart calculations
  const cartTotalCanastaLocal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartTotalSupermercado = cart.reduce((acc, item) => acc + item.product.supermarketPrice * item.quantity, 0);
  const cartTotalConvenience = cart.reduce((acc, item) => acc + item.product.conveniencePrice * item.quantity, 0);
  const cartSavingsPesos = Math.max(0, cartTotalSupermercado - cartTotalCanastaLocal);
  const cartSavingsPercent = cartTotalSupermercado > 0 ? Math.round((cartSavingsPesos / cartTotalSupermercado) * 100) : 0;

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setRecentNotification(`+${quantity} ${product.unit} de ${product.name} agregado a tu canasta`);
    setTimeout(() => setRecentNotification(null), 3500);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const addProduct = (product: Omit<Product, 'id' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now().toString(36)}`,
      updatedAt: 'Justo ahora',
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, price: newPrice, updatedAt: 'Justo ahora' }
          : p
      )
    );
    // Also update in cart if present
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, product: { ...item.product, price: newPrice } }
          : item
      )
    );
  };

  const toggleProductStock = (productId: string, inStock?: boolean) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = inStock !== undefined ? inStock : !p.inStock;
          return {
            ...p,
            inStock: nextStock,
            badge: nextStock ? (p.badge === 'Agotándose' ? 'Fresco de Hoy' : p.badge) : 'Agotándose',
            updatedAt: 'Justo ahora',
          };
        }
        return p;
      })
    );
  };

  const updateTrustProfile = (updates: Partial<TrustProfile>) => {
    setStalls((prev) =>
      prev.map((s) => {
        if (s.id === 'stall-dona-mary') {
          return {
            ...s,
            trustProfile: { ...s.trustProfile, ...updates },
          };
        }
        return s;
      })
    );
  };

  const createOrder = (
    deliveryType: 'bici' | 'pickup',
    paymentMethod: 'efectivo' | 'codi_dimo' | 'spei',
    customerName: string,
    customerPhone: string,
    deliveryAddress?: string,
    extras?: { notes?: string; cashTendered?: number }
  ): Order => {
    const deliveryFee = deliveryType === 'bici' ? 25 : 0;
    const newOrder: Order = {
      id: `ML-${Date.now().toString().slice(-4)}`,
      // Ficha única de retiro (RF-14): solo aplica a recolección en cubículo
      pickupToken: deliveryType === 'pickup' ? `CDMX-${Date.now().toString().slice(-8, -4)}` : undefined,
      notes: extras?.notes?.trim() || undefined,
      cashTendered: paymentMethod === 'efectivo' ? extras?.cashTendered : undefined,
      createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      deliveryType,
      pickupStalls: Array.from(new Set(cart.map((c) => c.product.stallName))),
      status: 'recibido',
      paymentMethod,
      totalCanastaLocal: cartTotalCanastaLocal + deliveryFee,
      totalSupermercado: cartTotalSupermercado,
      totalSavings: cartSavingsPesos,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryFee,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Ficha de recolección: estado inicial de cada puesto (lo actualiza el locatario o la simulación)
    if (deliveryType === 'pickup') {
      const stallIds = Array.from(new Set(cart.map((c) => c.product.stallId)));
      const statuses: Record<string, StopStatus> = {};
      stallIds.forEach((sid, i) => {
        statuses[sid] = sid === merchantStall.id ? 'preparando' : i % 2 === 1 ? 'en_bascula' : 'listo';
      });
      setPickupProgress((prev) => ({ ...prev, [newOrder.id]: { statuses, incidents: {} } }));
    }

    // Update merchant recorded sales & trust score
    const merchantSalesIncrease = cart
      .filter((c) => c.product.stallId === 'stall-dona-mary')
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    if (merchantSalesIncrease > 0) {
      updateTrustProfile({
        registeredSalesMonth: merchantStall.trustProfile.registeredSalesMonth + merchantSalesIncrease,
        monthlyOrdersCount: merchantStall.trustProfile.monthlyOrdersCount + 1,
        score: Math.min(100, merchantStall.trustProfile.score + 2),
      });
    }

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // WhatsApp and Voice NLP interaction
  const sendMerchantMessage = async (
    content: string,
    isAudio = false,
    audioDuration?: string
  ): Promise<VoiceInventoryParseResult> => {
    const timestamp = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg-${Date.now()}`;

    const newMsg: WhatsAppMessage = {
      id: userMsgId,
      sender: 'locatario',
      timestamp,
      type: isAudio ? 'audio' : 'text',
      content,
      audioDuration,
      status: 'procesando',
    };

    setWhatsAppMessages((prev) => [...prev, newMsg]);

    // Parse with NLP / Gemini
    const existingStallProducts = products
      .filter((p) => p.stallId === 'stall-dona-mary')
      .map((p) => ({ id: p.id, name: p.name }));

    const parsedResult = await parseMerchantAudioOrText(content, existingStallProducts);

    // Apply mutation based on parsed result
    if (parsedResult.matchedProductId) {
      if (parsedResult.action === 'MARCAR_AGOTADO') {
        toggleProductStock(parsedResult.matchedProductId, false);
      } else if (parsedResult.action === 'MARCAR_DISPONIBLE') {
        toggleProductStock(parsedResult.matchedProductId, true);
      } else if (parsedResult.price !== undefined) {
        updateProductPrice(parsedResult.matchedProductId, parsedResult.price);
      }
    } else if (parsedResult.productName) {
      // Find by matching name
      const matched = products.find(
        (p) =>
          p.stallId === 'stall-dona-mary' &&
          p.name.toLowerCase().includes(parsedResult.productName.toLowerCase())
      );
      if (matched) {
        if (parsedResult.action === 'MARCAR_AGOTADO') {
          toggleProductStock(matched.id, false);
        } else if (parsedResult.action === 'MARCAR_DISPONIBLE') {
          toggleProductStock(matched.id, true);
        } else if (parsedResult.price !== undefined) {
          updateProductPrice(matched.id, parsedResult.price);
        }
      }
    }

    // Bot automated response
    const botMsgId = `bot-${Date.now()}`;
    const botResponseText = parsedResult.ambiguityDetected
      ? `🤔 Doña Mary, detecté varias variedades de ${parsedResult.productName}: ¿quiere actualizar ${parsedResult.ambiguousOptions?.map((o) => o.name).join(' o ')}?`
      : `✅ ${parsedResult.explanation}\n\nLos compradores en la Roma y Condesa ya pueden ver este cambio en vivo en CanastaLocal. ⭐`;

    const botMsg: WhatsAppMessage = {
      id: botMsgId,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      content: botResponseText,
      parsedData: parsedResult,
    };

    setWhatsAppMessages((prev) =>
      prev.map((m) => (m.id === userMsgId ? { ...m, status: 'actualizado' as const, parsedData: parsedResult } : m)).concat(botMsg)
    );

    // Update stall last update
    setStalls((prev) =>
      prev.map((s) =>
        s.id === 'stall-dona-mary'
          ? { ...s, lastVoiceUpdate: `Actualizado hoy a las ${timestamp} vía WhatsApp` }
          : s
      )
    );

    return parsedResult;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        markets,
        selectedMarketId,
        selectedMarket,
        setSelectedMarketId,
        selectedDay,
        setSelectedDay,
        selectedAlcaldia,
        setSelectedAlcaldia,
        stalls,
        selectedStallId,
        setSelectedStallId,
        selectedStall,
        products,
        updateProductPrice,
        toggleProductStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCanastaLocal,
        cartTotalSupermercado,
        cartTotalConvenience,
        cartSavingsPesos,
        cartSavingsPercent,
        isCartOpen,
        setIsCartOpen,
        frequentBaskets,
        loadFrequentBasket,
        saveCurrentCartAsBasket,
        deleteFrequentBasket,
        orders,
        createOrder,
        updateOrderStatus,
        activeOrderId,
        setActiveOrderId,
        activeOrder,
        croquisPreview,
        setCroquisPreview,
        pickupProgress,
        setStopStatus,
        reportStopIncident,
        addProduct,
        activeView,
        setActiveView,
        whatsAppMessages,
        sendMerchantMessage,
        merchantStall,
        updateTrustProfile,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        recentNotification,
        setRecentNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
