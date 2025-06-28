import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '@shared/schema';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'UPDATE_QUANTITY'; productId: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
} | null>(null);

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + parseFloat(item.product.price) * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.product.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + (action.quantity || 1) }
            : item
        );
      } else {
        newItems = [...state.items, {
          id: Date.now(),
          product: action.product,
          quantity: action.quantity || 1
        }];
      }
      
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.productId);
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    }
    
    case 'CLEAR_CART': {
      return {
        items: [],
        total: 0,
        itemCount: 0
      };
    }
    
    case 'LOAD_CART': {
      return {
        items: action.items,
        total: calculateTotal(action.items),
        itemCount: calculateItemCount(action.items)
      };
    }
    
    default:
      return state;
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('actionProtectionCart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', items: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('actionProtectionCart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity });
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => state.total;

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}