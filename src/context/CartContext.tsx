import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product } from '../data/products';
import type { OfferWaterSize } from '../lib/offerSizes';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: OfferWaterSize;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: OfferWaterSize) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalCartons: number;
  totalPrice: number;
}

function getProductCartonCount(product: Product) {
  return product.category === 'offer' ? Math.max(product.quantity, 1) : 1;
}

function isFixedPriceProduct(product: Product): product is Product & { price: number } {
  return product.pricingMode === 'fixed' && typeof product.price === 'number';
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_SESSION_KEY = 'riq_offer_cart_session';

function readSessionCart(): CartItem[] {
  try {
    const saved = sessionStorage.getItem(CART_SESSION_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readSessionCart);

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify(items));
    } catch {
      // The in-memory cart remains fully functional when storage is unavailable.
    }
  }, [items]);

  const addToCart = useCallback((product: Product, quantity: number = 1, selectedSize?: OfferWaterSize) => {
    if (!product.isPurchasable || !isFixedPriceProduct(product)) {
      return;
    }

    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, selectedSize: selectedSize ?? item.selectedSize }
            : item
        );
      }
      return [...prev, { product, quantity, selectedSize: product.category === 'offer' ? selectedSize : undefined }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartons = items.reduce(
    (sum, item) => sum + getProductCartonCount(item.product) * item.quantity,
    0
  );
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalCartons,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
