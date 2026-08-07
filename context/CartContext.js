"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "rani_cart_v2";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      localStorage.removeItem(STORAGE_KEY);
    }

    setHydrated(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [items, hydrated]);

  function getProductImage(product) {
    // media: [{ url, publicId }]
    if (product?.media?.[0]) {
      const media = product.media[0];

      if (typeof media === "string") {
        return media;
      }

      if (media?.url) {
        return media.url;
      }
    }

    // images: [{ url, publicId }]
    if (product?.images?.[0]) {
      const image = product.images[0];

      if (typeof image === "string") {
        return image;
      }

      if (image?.url) {
        return image.url;
      }
    }

    return "";
  }

  function addItem(product, quantity = 1) {
    if (!product?._id) {
      console.error("Invalid product:", product);
      return;
    }

    const image = getProductImage(product);

    console.log("Adding product to cart:", {
      id: product._id,
      name: product.name,
      image,
    });

    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product._id
      );

      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                // Update image if old cart item doesn't have one
                image: item.image || image,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name || "",
          price: Number(product.price) || 0,
          unit: product.unit || "",
          image,
          stock: Number(product.stock) || 0,
          quantity,
        },
      ];
    });
  }

  // Alias so ProductCard can use addToCart
  const addToCart = addItem;

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function removeItem(productId) {
    setItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const count = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        count,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}