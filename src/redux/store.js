// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import adminProductReducer from "./adminProductSlice";
import productReducer from "./productSlice";
import cartReducer from "./cartSlice";
import cartDrawerReducer from "./cartDrawerSlice";

const rootReducer = combineReducers({
  adminProducts: adminProductReducer,
  products: productReducer,
  cart: cartReducer,
  cartDrawer: cartDrawerReducer,
});

const CACHE_KEY = "persist:root";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Purge expired cache (run once at startup)
// The persisted structure stores serialized reducers; we expect `products.lastFetchedAt` to be present.
const checkCacheExpiry = () => {
  try {
    const persisted = localStorage.getItem(CACHE_KEY);
    if (!persisted) return;

    const state = JSON.parse(persisted);

    // The persisted structure may nest the reducer state under "products" key or in serialized string.
    // Try a couple ways to find a timestamp robustly.

    // Case 1: direct object (modern redux-persist)
    const maybeProducts = state.products ?? null;

    // If it's a string (because persist stores nested JSON as string), parse it
    let productsState = null;
    if (typeof maybeProducts === "string") {
      try {
        productsState = JSON.parse(maybeProducts);
      } catch (err) {
        productsState = null;
      }
    } else {
      productsState = maybeProducts;
    }

    const timestamp = productsState?.lastFetchedAt || 0;
    if (!timestamp) return; // nothing fetched yet — don't purge

    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      // also remove the old redux-persist keys to avoid partial rehydrates
      try {
        localStorage.removeItem("persist:root");
      } catch (e) {
        // ignore
      }
    }
  } catch (err) {
    console.warn("Failed to parse persisted state:", err);
  }
};

if (typeof window !== "undefined") {
  checkCacheExpiry();
}


const persistConfig = {
  key: "root",
  storage,
  whitelist: ["products", "cart", "adminProducts"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
