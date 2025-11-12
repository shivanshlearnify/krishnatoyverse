import { db } from "@/lib/firebase";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";

// ✅ Helper to check if cache expired (6 hours)
const isCacheExpired = (timestamp) => {
  if (!timestamp) return true;
  const now = Date.now();
  return now - timestamp > 6 * 60 * 60 * 1000; // 6 hours
};

export const fetchAllData = createAsyncThunk(
  "data/fetchAll",
  async (forceRefresh = false, { getState }) => {
    const state = getState().adminProducts;

    // ✅ Skip Firestore reads only if cache valid & not forced
    if (!forceRefresh && !isCacheExpired(state.lastFetchedAt)) {
      console.log("🟡 Using cached admin data — no Firestore reads");
      return { cached: true, data: state };
    }

    console.log("🔥 Fetching admin data from Firestore...");
    const collections = [
      "brands",
      "categories",
      "groups",
      "subcategories",
      "productCollection",
    ];

    const data = {};
    for (const col of collections) {
      const snap = await getDocs(collection(db, col));
      data[col] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    return { cached: false, data };
  }
);
const adminProductSlice = createSlice({
  name: "adminProductData",
  initialState: {
    brands: [],
    categories: [],
    groups: [],
    subcategories: [],
    productCollection: [],
    lastFetchedAt: null,
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

        // Skip if cached
        if (action.payload.cached) return;

        Object.assign(state, action.payload.data);
        state.lastFetchedAt = Date.now();

        console.log("✅ Admin data stored in Redux + persisted");
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default adminProductSlice.reducer;
