import { db } from "@/lib/firebase";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";

// Async thunk to fetch all data
export const fetchAllData = createAsyncThunk("data/fetchAll", async () => {
  const collections = ["brands", "categories", "groups", "subcategories", "productCollection"];

  const data = {};
  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    data[col] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  return data;
});

const productSlice = createSlice({
  name: "productData",
  initialState: {
    brands: [],
    categories: [],
    groups: [],
    subcategories: [],
    productCollection: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
