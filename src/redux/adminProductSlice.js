"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ----------------------------
// CONSTANTS
// ----------------------------
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const FIELDS = ["brand", "category", "subCategory", "group", "supplier", "suppinvo"];

// ----------------------------
// FETCH META COLLECTIONS
// ----------------------------
export const fetchMeta = createAsyncThunk(
  "admin/fetchMeta",
  async (colName) => {
    const snap = await getDocs(collection(db, colName));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { colName, data };
  }
);

// ----------------------------
// FETCH PRODUCTS BY FIELD WITH CACHE
// ----------------------------
export const fetchProductsByField = createAsyncThunk(
  "admin/fetchProductsByField",
  async ({ field, value }, { getState }) => {
    if (!field) return { field, value, data: [] };

    const safeValue = value && value.trim() !== "" ? value : "__empty__";

    // Check cached data
    const state = getState();
    const cached = state.adminProducts.filtered?.[field]?.[safeValue];

    if (cached?.lastFetched && Date.now() - cached.lastFetched < CACHE_DURATION) {
      return { field, value: safeValue, data: cached.products, fromCache: true };
    }

    // Fetch from Firestore
    const q = query(collection(db, "productCollection"), where(field, "==", value));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return { field, value: safeValue, data };
  }
);

// ----------------------------
// SEARCH PRODUCTS BY NAME OR BARCODE
// ----------------------------
export const searchProductsByNameOrBarcode = createAsyncThunk(
  "admin/searchProducts",
  async ({ term, limitResults = 50 }) => {
    if (!term?.trim()) return { data: [] };
    const results = new Map();

    // Barcode exact match
    const barcodeQ = query(
      collection(db, "productCollection"),
      where("barcode", "==", term),
      limit(limitResults)
    );
    const barcodeSnap = await getDocs(barcodeQ);
    barcodeSnap.forEach((doc) =>
      results.set(doc.id, { id: doc.id, ...doc.data() })
    );

    // Name prefix match
    const start = term;
    const end = term + "\uf8ff";
    try {
      const nameQ = query(
        collection(db, "productCollection"),
        orderBy("name"),
        where("name", ">=", start),
        where("name", "<=", end),
        limit(limitResults)
      );
      const nameSnap = await getDocs(nameQ);
      nameSnap.forEach((doc) =>
        results.set(doc.id, { id: doc.id, ...doc.data() })
      );
    } catch (err) {
      console.warn("Prefix query failed:", err.message);
    }

    return { data: [...results.values()] };
  }
);

// ----------------------------
// INITIAL STATE
// ----------------------------
const initialState = {
  meta: {
    brands: [],
    categories: [],
    subcategories: [],
    groups: [],
    supplierCollection: [],
    suppinvoCollection: [],
  },
  filtered: {
    brand: {},
    category: {},
    subCategory: {},
    group: {},
    supplier: {},
    suppinvo: {},
    search: { last: [] },
  },
  loadingMeta: false,
  loadingFiltered: false,
  error: null,
};

// ----------------------------
// SLICE
// ----------------------------
const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    // Clear entire field
    clearFilteredForField: (state, action) => {
      const field = action.payload;
      if (!state.filtered[field]) state.filtered[field] = {};
      state.filtered[field] = {};
    },

    // ✅ Clear a specific value in a field
    clearFilteredValue: (state, action) => {
      const { field, value } = action.payload;
      if (state.filtered[field]?.[value]) {
        delete state.filtered[field][value];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------------- META ----------------
      .addCase(fetchMeta.fulfilled, (state, action) => {
        const { colName, data } = action.payload;
        state.meta = state.meta || {};
        state.meta[colName] = data || [];
        state.loadingMeta = false;
      })
      .addCase(fetchMeta.rejected, (state, action) => {
        state.loadingMeta = false;
        state.error = action.error.message;
      })

      // ---------------- FILTERED ----------------
      .addCase(fetchProductsByField.pending, (state) => {
        state.loadingFiltered = true;
      })
      .addCase(fetchProductsByField.fulfilled, (state, action) => {
        const { field, value, data } = action.payload;
        if (!field) return;

        state.filtered = state.filtered || {};
        if (!state.filtered[field]) state.filtered[field] = {};

        state.filtered[field][value] = {
          products: Array.isArray(data) ? data : [],
          lastFetched: Date.now(),
        };

        state.loadingFiltered = false;
      })

      // ---------------- SEARCH ----------------
      .addCase(searchProductsByNameOrBarcode.pending, (state) => {
        state.loadingFiltered = true;
      })
      .addCase(searchProductsByNameOrBarcode.fulfilled, (state, action) => {
        state.filtered.search = { last: action.payload.data || [] };
        state.loadingFiltered = false;
      })
      .addCase(searchProductsByNameOrBarcode.rejected, (state, action) => {
        state.error = action.error.message;
        state.loadingFiltered = false;
      });
  },
});

export const { clearFilteredForField, clearFilteredValue } = adminProductSlice.actions;
export default adminProductSlice.reducer;
