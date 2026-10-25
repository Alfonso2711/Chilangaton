import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  INITIAL_MARKETS,
  INITIAL_STALLS,
  INITIAL_PRODUCTS,
  INITIAL_WHATSAPP_MESSAGES,
} from '../data/mockData';
import { parseMerchantAudioOrText } from '../services/geminiNlp';

interface AppContextType {
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

  orders: Order[];
  createOrder: (deliveryType: 'bici' | 'pickup', paymentMethod: 'efectivo' | 'codi_dimo' | 'spei', customerName: string, customerPhone: string, deliveryAddress?: string) => Order;
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

  const [activeView, setActiveView] = useState<ActiveAppView>('comprador');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
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

  const selectedMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];
  const selectedStall = stalls.find((s) => s.id === selectedStallId);
  const merchantStall = stalls.find((s) => s.id === 'stall-dona-mary') || stalls[0];

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
    deliveryAddress?: string
  ): Order => {
    const deliveryFee = deliveryType === 'bici' ? 25 : 0;
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
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
        orders,
        createOrder,
        updateOrderStatus,
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
