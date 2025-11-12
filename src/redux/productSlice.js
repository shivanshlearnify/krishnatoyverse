import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, limit, startAfter, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ lastVisibleId = null, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const productRef = collection(db, "productCollection");
      let q = query(productRef, limit(pageSize));

      if (lastVisibleId) {
        const lastDocRef = doc(db, "productCollection", lastVisibleId);
        const lastDocSnap = await getDoc(lastDocRef);
        q = query(productRef, startAfter(lastDocSnap), limit(pageSize));
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        products,
        lastVisibleId: lastVisibleDoc ? lastVisibleDoc.id : null,
        fetchedAt: Date.now(),
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    data: [],
    lastVisibleId: null,
    loading: false,
    error: null,
    lastFetchedAt: 0,
  },
  reducers: {
    clearProducts: (state) => {
      state.data = [];
      state.lastVisibleId = null;
      state.lastFetchedAt = 0;
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
        state.lastVisibleId = action.payload.lastVisibleId;
        state.lastFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProducts } = productSlice.actions;
export default productSlice.reducer;
