"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// -------------------- FETCH META --------------------
export const fetchMeta = createAsyncThunk(
  "products/fetchMeta",
  async (colName) => {
    const snap = await getDocs(collection(db, colName));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { colName, data };
  }
);

// -------------------- FETCH PRODUCTS BY FILTER --------------------
export const fetchProductsByFilter = createAsyncThunk(
  "products/fetchByFilter",
  async ({ field, value, pageSize = 20 }, { getState }) => {
    const safeValue = value && value.trim() !== "" ? value : "__empty__";
    const state = getState();

    const cached = state.products.filtered?.[field]?.[safeValue];
    const lastFetched = cached?.lastFetched || 0;
    const lastVisibleId = cached?.lastVisibleId || null;

    // Return cache if valid
    if (cached && Date.now() - lastFetched < CACHE_DURATION) {
      return {
        field,
        value: safeValue,
        products: cached.products,
        lastVisibleId,
        fromCache: true,
      };
    }

    // Query Firestore
    const productRef = collection(db, "productCollection");
    let q = query(productRef, where(field, "==", value), limit(pageSize));

    if (lastVisibleId) {
      const lastDocRef = doc(db, "productCollection", lastVisibleId);
      const lastDocSnap = await getDoc(lastDocRef);
      q = query(
        productRef,
        where(field, "==", value),
        startAfter(lastDocSnap),
        limit(pageSize)
      );
    }

    const snap = await getDocs(q);
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const newLastVisibleId = snap.docs[snap.docs.length - 1]?.id || null;

    return {
      field,
      value: safeValue,
      products,
      lastVisibleId: newLastVisibleId,
      fetchedAt: Date.now(),
    };
  }
);

// -------------------- SEARCH PRODUCTS --------------------
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async ({ term }) => {
    if (!term?.trim()) return { data: [] };

    const snap = await getDocs(collection(db, "productCollection"));
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const lowerTerm = term.toLowerCase();
    const filtered = all.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const barcode = p.barcode?.toLowerCase() || "";
      return name.includes(lowerTerm) || barcode.includes(lowerTerm);
    });

    return { data: filtered };
  }
);

// -------------------- SLICE --------------------
const productSlice = createSlice({
  name: "products",
  initialState: {
    meta: {
      brands: [],
      categories: [],
      subcategories: [],
      groups: [],
    },
    filtered: {
      brand: {},
      category: {},
      subCategory: {},
      group: {},
      search: { last: [] },
    },
    searchResults: [],
    loadingMeta: false,
    loadingFiltered: false,
    loadingSearch: false,
    error: null,
  },
  reducers: {
    clearFilteredForField: (state, action) => {
      const field = action.payload;
      state.filtered[field] = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------------- META ----------------
      .addCase(fetchMeta.pending, (state) => {
        state.loadingMeta = true;
      })
      .addCase(fetchMeta.fulfilled, (state, action) => {
        const { colName, data } = action.payload;
        state.meta[colName] = data || [];
        state.loadingMeta = false;
      })
      .addCase(fetchMeta.rejected, (state, action) => {
        state.error = action.error.message;
        state.loadingMeta = false;
      })

      // ---------------- FILTERED PRODUCTS ----------------
      .addCase(fetchProductsByFilter.pending, (state) => {
        state.loadingFiltered = true;
      })
      .addCase(fetchProductsByFilter.fulfilled, (state, action) => {
        const { field, value, products, lastVisibleId, fetchedAt, fromCache } =
          action.payload;
        if (!field) return;

        // Initialize only if first-time load for this filter
        if (!state.filtered[field][value]) {
          state.filtered[field][value] = {
            products: [],
            lastVisibleId: null,
            lastFetched: 0,
          };
        }

        state.filtered[field][value].products = [
          ...state.filtered[field][value].products,
          ...products,
        ];
        state.filtered[field][value].lastVisibleId = lastVisibleId;
        state.filtered[field][value].lastFetched = fetchedAt || Date.now();
        state.loadingFiltered = false;
      })
      .addCase(fetchProductsByFilter.rejected, (state, action) => {
        state.error = action.error.message;
        state.loadingFiltered = false;
      })

      // ---------------- SEARCH ----------------
      .addCase(searchProducts.pending, (state) => {
        state.loadingSearch = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.filtered.search.last = action.payload.data || [];
        state.loadingSearch = false;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loadingSearch = false;
      });
  },
});

export const { clearFilteredForField } = productSlice.actions;
export default productSlice.reducer;
