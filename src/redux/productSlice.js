// productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, limit, startAfter, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ lastVisibleId = null, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const productRef = collection(db, "productCollection");
      let q = query(productRef, limit(pageSize));

      // If we have lastVisibleId, fetch its snapshot to use for pagination
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

      console.log("✅ Fetched from DB:", products);

      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        products,
        lastVisibleId: lastVisibleDoc ? lastVisibleDoc.id : null,
      };
    } catch (err) {
      console.error("❌ Firestore Fetch Error:", err.message);
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
  },
  reducers: {
    clearProducts: (state) => {
      console.log("🧹 Products Cleared");
      state.data = [];
      state.lastVisibleId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        console.log("⏳ Fetching products...");
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [...state.data, ...action.payload.products];
        state.lastVisibleId = action.payload.lastVisibleId;

        console.log("📦 Stored in Redux:", state.data);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        console.error("❌ Fetch Failed:", action.payload);
      });
  },
});

export const { clearProducts } = productSlice.actions;
export default productSlice.reducer;
