"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../services/products';
import { useTenant } from './TenantContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { tenant } = useTenant();

  // Charger le panier depuis le localStorage lors de l'initialisation
  useEffect(() => {
    if (typeof window !== 'undefined' && tenant) {
      const storedCart = localStorage.getItem(`cart_${tenant.id}`);
      if (storedCart) {
        try {
          setItems(JSON.parse(storedCart));
        } catch (e) {
          console.error('Erreur lors du chargement du panier:', e);
          setItems([]);
        }
      }
    }
  }, [tenant]);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined' && tenant && items.length >= 0) {
      localStorage.setItem(`cart_${tenant.id}`, JSON.stringify(items));
    }
  }, [items, tenant]);

  // Vider le panier quand le tenant change
  useEffect(() => {
    setItems([]);
  }, [tenant?.id]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const addItem = (product: Product, quantity = 1) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex > -1) {
        // Mettre à jour la quantité si le produit existe déjà
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Ajouter un nouveau produit au panier
        return [...currentItems, { product, quantity }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.product.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart doit être utilisé à l\'intérieur d\'un CartProvider');
  }
  return context;
};

export default CartContext; 