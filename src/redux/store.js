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

// ✅ Combine reducers
const rootReducer = combineReducers({
  adminProducts: adminProductReducer,
  products: productReducer,
  cart: cartReducer,
  cartDrawer: cartDrawerReducer,
});

// ✅ Persist Config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["products", "cart", "adminProducts"],
 // only persist these
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure store with persist middleware
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
