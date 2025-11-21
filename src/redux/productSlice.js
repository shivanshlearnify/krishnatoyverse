// productSlice.js
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

// -------------------- CONSTANTS --------------------
const DEFAULT_PAGE_SIZE = 20;
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

// -------------------- FETCH PRODUCTS BY FILTER (CACHED + PAGINATED) --------------------
export const fetchProductsByFilter = createAsyncThunk(
  "products/fetchByFilter",
  async ({ field, value, pageSize = DEFAULT_PAGE_SIZE }, { getState }) => {
    const safeValue = (value?.trim && value.trim()) || "__empty__";
    const state = getState();
    try {
      const snapTest = await getDocs(
        query(
          collection(db, "productCollection"),
          where("visible", "==", true),
          orderBy("createdAt", "desc"),
          limit(20)
        )
      );
      console.log(
        "snapTest:",
        snapTest.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    } catch (err) {
      console.error("Error fetching snapTest:", err);
    }

    // Check cache
    const cached = state.products.filtered?.[field]?.[safeValue];
    const cacheValid =
      cached?.lastFetched && Date.now() - cached.lastFetched < CACHE_DURATION;

    // If cache exists AND no need for next page → return cached data
    if (cacheValid && !cached?.lastVisibleId) {
      return {
        field,
        value: safeValue,
        fromCache: true,
        products: cached.products,
        lastVisibleId: cached.lastVisibleId,
        isNextPage: false,
      };
    }

    const isNextPage = Boolean(cached?.lastVisibleId);
    const productRef = collection(db, "productCollection");

    let q = query(
      productRef,
      where(field, "==", value),
      where("visible", "==", true),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // For pagination: load next page using startAfter()
    if (isNextPage) {
      const lastDocRef = doc(db, "productCollection", cached.lastVisibleId);
      const lastDocSnap = await getDoc(lastDocRef);

      if (lastDocSnap.exists()) {
        q = query(
          productRef,
          where(field, "==", value),
          where("visible", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(lastDocSnap),
          limit(pageSize)
        );
      }
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
      isNextPage,
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
      const barcode = (p.barcode || "").toLowerCase();
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
      state.filtered[action.payload] = {};
    },
    clearFilteredValue: (state, action) => {
      const { field, value } = action.payload;
      const safeValue = value?.toString().trim() || "__empty__";
      if (state.filtered[field]?.[safeValue]) {
        delete state.filtered[field][safeValue];
      }
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
        state.error = null;
      })
      .addCase(fetchProductsByFilter.fulfilled, (state, action) => {
        const {
          field,
          value,
          products,
          lastVisibleId,
          fetchedAt,
          isNextPage,
          fromCache,
        } = action.payload;

        if (!field) return;

        // If result came from cache → do nothing
        if (fromCache) {
          state.loadingFiltered = false;
          return;
        }

        if (!state.filtered[field]) state.filtered[field] = {};

        if (!state.filtered[field][value]) {
          state.filtered[field][value] = {
            products: [],
            lastVisibleId: null,
            lastFetched: 0,
          };
        }

        if (isNextPage) {
          const existing = state.filtered[field][value].products || [];
          const ids = new Set(existing.map((x) => x.id));
          const toAdd = products.filter((p) => !ids.has(p.id));
          state.filtered[field][value].products = [...existing, ...toAdd];
        } else {
          state.filtered[field][value].products = products;
        }

        state.filtered[field][value].lastVisibleId = lastVisibleId;
        state.filtered[field][value].lastFetched = fetchedAt;
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

export const { clearFilteredForField, clearFilteredValue } =
  productSlice.actions;

export default productSlice.reducer;
