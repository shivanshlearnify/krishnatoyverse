import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    productData: productReducer,
    cart: cartReducer,
    products: productReducer,
  },
});
