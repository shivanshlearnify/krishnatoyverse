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

// Purge expired cache
const checkCacheExpiry = () => {
  const persisted = localStorage.getItem(CACHE_KEY);
  if (!persisted) return;
  try {
    const state = JSON.parse(persisted);
    const timestamp = state.products?.lastFetchedAt || 0;
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch (err) {
    console.warn("Failed to parse persisted state:", err);
  }
};

checkCacheExpiry();

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
