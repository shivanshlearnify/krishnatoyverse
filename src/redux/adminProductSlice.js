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

    if (
      cached?.lastFetched &&
      Date.now() - cached.lastFetched < CACHE_DURATION
    ) {
      return { field, value: safeValue, data: cached.products, fromCache: true };
    }

    // Fetch from Firestore
    const q = query(
      collection(db, "productCollection"),
      where(field, "==", value)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return { field, value: safeValue, data };
  }
);

// ----------------------------
// NORMAL SEARCH: NAME + BARCODE
// ----------------------------
export const searchProductsByNameOrBarcode = createAsyncThunk(
  "admin/searchProducts",
  async ({ term }) => {
    if (!term?.trim()) return { data: [] };

    // Fetch all products only once
    const snap = await getDocs(collection(db, "productCollection"));
    const allProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const lowerTerm = term.toLowerCase();

    // Local filtering
    const filtered = allProducts.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const barcode = p.barcode?.toLowerCase() || "";

      return (
        name.includes(lowerTerm) ||
        barcode.includes(lowerTerm)
      );
    });

    return { data: filtered };
  }
);


// ----------------------------
// BULK SEARCH (NEW)
// ----------------------------
export const bulkSearchProducts = createAsyncThunk(
  "admin/bulkSearchProducts",
  async ({ term }) => {
    if (!term?.trim()) return { data: [] };

    // Fetch all products once
    const snap = await getDocs(collection(db, "productCollection"));
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const lowerTerm = term.toLowerCase();

    // Local filtering
    const filtered = all.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const barcode = p.barcode?.toLowerCase() || "";
      return name.includes(lowerTerm) || barcode.includes(lowerTerm);
    });
    console.log(filtered);
    

    return { data: filtered };
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

  bulkSearchResults: [],        // NEW
  loadingBulkSearch: false,     // NEW

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
      state.filtered[field] = {};
    },

    // Clear specific value
    clearFilteredValue: (state, action) => {
      const { field, value } = action.payload;
      if (state.filtered[field]?.[value]) delete state.filtered[field][value];
    },
  },

  extraReducers: (builder) => {
    builder
      // ---------------- META ----------------
      .addCase(fetchMeta.fulfilled, (state, action) => {
        const { colName, data } = action.payload;
        state.meta[colName] = data || [];
        state.loadingMeta = false;
      })
      .addCase(fetchMeta.rejected, (state, action) => {
        state.loadingMeta = false;
        state.error = action.error.message;
      })

      // ---------------- FILTERED FIELD ----------------
      .addCase(fetchProductsByField.pending, (state) => {
        state.loadingFiltered = true;
      })
      .addCase(fetchProductsByField.fulfilled, (state, action) => {
        const { field, value, data } = action.payload;
        if (!field) return;

        state.filtered[field][value] = {
          products: data || [],
          lastFetched: Date.now(),
        };

        state.loadingFiltered = false;
      })

      // ---------------- NORMAL SEARCH ----------------
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
      })

      // ---------------- BULK SEARCH (NEW) ----------------
      .addCase(bulkSearchProducts.pending, (state) => {
        state.loadingBulkSearch = true;
      })
      .addCase(bulkSearchProducts.fulfilled, (state, action) => {
        state.bulkSearchResults = action.payload.data || [];
        state.loadingBulkSearch = false;
      })
      .addCase(bulkSearchProducts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loadingBulkSearch = false;
      });
  },
});

export const { clearFilteredForField, clearFilteredValue } =
  adminProductSlice.actions;

export default adminProductSlice.reducer;
