// /redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * Cart slice with:
 * - localStorage persistence
 * - lastUpdatedAt for expiry
 * - hasPendingChanges / isSyncing flags for sync hook
 *
 * LocalStorage keys:
 * - cart -> JSON array of items
 * - cart_lastUpdated -> ISO string of last update time
 */

const EXPIRY_DAYS = 30;
const WARNING_DAYS = 25;

const CART_KEY = "cart";
const CART_UPDATED_KEY = "cart_lastUpdated";

const now = () => Date.now();

const loadCartFromLocalStorage = () => {
  if (typeof window === "undefined") return { items: [], lastUpdatedAt: null };

  try {
    const saved = localStorage.getItem(CART_KEY);
    const lastUpdated = localStorage.getItem(CART_UPDATED_KEY);

    const items = saved ? JSON.parse(saved) : [];
    const lastUpdatedAt = lastUpdated ? Number(lastUpdated) : null;

    // If expired, return empty (auto-clear on load)
    if (lastUpdatedAt) {
      const ageMs = Date.now() - lastUpdatedAt;
      if (ageMs > EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
        // expired
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(CART_UPDATED_KEY);
        return { items: [], lastUpdatedAt: null };
      }
    }

    return { items, lastUpdatedAt };
  } catch (err) {
    console.error("Error loading cart from localStorage:", err);
    return { items: [], lastUpdatedAt: null };
  }
};

const saveCartToLocalStorage = (items, lastUpdatedAt) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items || []));
    if (lastUpdatedAt) {
      localStorage.setItem(CART_UPDATED_KEY, String(lastUpdatedAt));
    }
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
  }
};

const initialFromLocal =
  typeof window !== "undefined"
    ? loadCartFromLocalStorage()
    : { items: [], lastUpdatedAt: null };

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: initialFromLocal.items || [], // { id, name, price, quantity, image }
    lastUpdatedAt: initialFromLocal.lastUpdatedAt || null, // epoch ms
    hasPendingChanges: false,
    lastSyncedAt: null,
    isSyncing: false,
  },
  reducers: {
    _updateTimestamp(state) {
      state.lastUpdatedAt = now();
    },

    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      state.hasPendingChanges = true;
      state.lastUpdatedAt = now();
      saveCartToLocalStorage(state.items, state.lastUpdatedAt);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.hasPendingChanges = true;
      state.lastUpdatedAt = now();
      saveCartToLocalStorage(state.items, state.lastUpdatedAt);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
      state.hasPendingChanges = true;
      state.lastUpdatedAt = now();
      saveCartToLocalStorage(state.items, state.lastUpdatedAt);
    },

    clearCart: (state) => {
      state.items = [];
      state.hasPendingChanges = true;
      state.lastUpdatedAt = null;
      saveCartToLocalStorage([], null);
    },

    // Called AFTER Firestore sync is completed
    markSynced: (state) => {
      state.hasPendingChanges = false;
      state.lastSyncedAt = Date.now();
      state.isSyncing = false;
    },

    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
    },

    // Replace local cart with server-provided cart (merge already performed upstream)
    replaceCartFromServer: (state, action) => {
      const payload = action.payload || [];
      state.items = payload;
      state.hasPendingChanges = false;
      state.lastUpdatedAt = Date.now();
      saveCartToLocalStorage(state.items, state.lastUpdatedAt);
    },

    // Helper to explicitly set cart + timestamp (used by expiry logic)
    setCartAndTimestamp: (state, action) => {
      const { items, lastUpdatedAt } = action.payload;
      state.items = items || [];
      state.lastUpdatedAt = lastUpdatedAt || Date.now();
      state.hasPendingChanges = true;
      saveCartToLocalStorage(state.items, state.lastUpdatedAt);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  markSynced,
  setSyncing,
  replaceCartFromServer,
  setCartAndTimestamp,
  _updateTimestamp,
} = cartSlice.actions;

export default cartSlice.reducer;
