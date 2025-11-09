import { configureStore } from "@reduxjs/toolkit";
import adminProductReducer from "./adminProductSlice";
import productReducer from "./productSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    adminProducts: adminProductReducer, // Admin data
    products: productReducer, // Customer products list
    cart: cartReducer,
  },
});