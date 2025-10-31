// productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ lastDoc = null, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const productRef = collection(db, "products");
      let q = query(productRef, limit(pageSize));

      if (lastDoc) q = query(productRef, startAfter(lastDoc), limit(pageSize));

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        products,
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const uiProductSLice = createSlice({
  name: "products",
  initialState: {
    data: [],
    lastVisible: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProducts: (state) => {
      state.data = [];
      state.lastVisible = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [...state.data, ...action.payload.products];
        state.lastVisible = action.payload.lastVisible;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProducts } = uiProductSLice.actions;
export default uiProductSLice.reducer;
