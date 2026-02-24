import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    console.log("ADD TO CART CALLED WITH:", product);
  if (cart.length && cart[0].storeId !== product.storeId) {
    alert("You can only order from one store at a time.");
    return;
  }

  const existing = cart.find(p => p.id === product.id);

  if (existing) {
    setCart(
      cart.map(p =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      )
    );
  } else {
    setCart([...cart, { ...product, quantity: 1 }]);
  }
};

  const removeFromCart = (id) => {
    setCart(cart.filter(p => p.id !== id));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (id, qty) => {
  if (qty <= 0) {
    removeFromCart(id);
    return;
  }

  setCart((prev) =>
    prev.map((item) =>
      item.id === id
        ? { ...item, quantity: qty }
        : item
    )
  );
};

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}