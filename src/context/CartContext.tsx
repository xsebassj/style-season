"use client";
import { createContext, useContext, useState, ReactNode } from "react";

// 1. Definimos exactamente qué forma tiene un producto en el carrito
export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image_url?: string; // Lo agregamos como opcional para solucionar el error de page.tsx
}

// 2. Definimos las funciones disponibles
interface CartContextType {
  cart: CartItem[];
  isOpen: boolean; // Soluciona el error de "isOpen does not exist"
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, amount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      // Comprobamos si ya existe el MISMO producto en el MISMO talle
      const existingItem = prev.find((i) => i.id === newItem.id && i.size === newItem.size);
      if (existingItem) {
        return prev.map((i) =>
          i.id === newItem.id && i.size === newItem.size
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string, size: string) => {
    // Filtramos usando ID y Talle
    setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
  };

  const updateQuantity = (id: string, size: string, amount: number) => {
    if (amount < 1) return;
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity: amount } : i
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, isOpen, openCart, closeCart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}