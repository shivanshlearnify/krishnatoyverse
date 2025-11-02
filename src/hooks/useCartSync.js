// app/hooks/useCartSync.js
"use client";

/**
 * useCartSync (commented)
 * - 15s batch sync
 * - merge on login (add quantities)
 * - check expiry (30 days) and soft warning at 25 days (react-hot-toast)
 * - write expiry timestamp to Firestore as `updatedAt` (Firestore Timestamp)
 *
 * Firestore doc path used: users/{uid}/cart  (single doc)
 */

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";
import {
  replaceCartFromServer,
  markSynced,
  setSyncing,
  clearCart,
  setCartAndTimestamp,
} from "@/redux/cartSlice";

import toast from "react-hot-toast";

const INTERVAL_MS = 15000; // 15 seconds
const EXPIRY_DAYS = 30;
const WARNING_DAYS = 25;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Helper: mergeCarts(local, server) -> add quantities
 */
const mergeCarts = (local = [], server = []) => {
  const map = new Map();

  for (const it of server) {
    map.set(it.id, { ...it });
  }
  for (const it of local) {
    if (map.has(it.id)) {
      const existing = map.get(it.id);
      existing.quantity = (existing.quantity || 0) + (it.quantity || 0);
      existing.name = existing.name || it.name;
      existing.price = existing.price ?? it.price;
      existing.image = existing.image || it.image;
      map.set(it.id, existing);
    } else {
      map.set(it.id, { ...it });
    }
  }
  return Array.from(map.values());
};

/**
 * Firestore helpers
 */
const cartDocRef = (uid) => doc(db, "users", uid, "cart");

/**
 * Convert Firestore Timestamp to epoch ms safely
 */
const tsToMs = (ts) => {
  if (!ts) return null;
  if (ts.toMillis) return ts.toMillis();
  // fallback if stored as number
  return Number(ts) || null;
};

export default function useCartSync() {
  const dispatch = useDispatch();

  // selectors
  const items = useSelector((s) => (s.cart ? s.cart.items : []));
  const hasPendingChanges = useSelector((s) =>
    s.cart ? s.cart.hasPendingChanges : false
  );
  const isSyncing = useSelector((s) => (s.cart ? s.cart.isSyncing : false));
  const lastUpdatedAt = useSelector((s) =>
    s.cart ? s.cart.lastUpdatedAt : null
  ); // epoch ms

  // refs for interval closures
  const itemsRef = useRef(items);
  const pendingRef = useRef(hasPendingChanges);
  const syncingRef = useRef(isSyncing);
  const lastUpdatedRef = useRef(lastUpdatedAt);
  const currentUserRef = useRef(null);
  const flushingRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    pendingRef.current = hasPendingChanges;
  }, [hasPendingChanges]);
  useEffect(() => {
    syncingRef.current = isSyncing;
  }, [isSyncing]);
  useEffect(() => {
    lastUpdatedRef.current = lastUpdatedAt;
  }, [lastUpdatedAt]);

  /**
   * fetch server cart doc (returns { items, updatedAt: epochMs|null })
   */
  const fetchServerCart = async (uid) => {
    if (!uid) return { items: [], updatedAt: null };
    try {
      const docRef = cartDocRef(uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return { items: [], updatedAt: null };
      const data = snap.data();
      const itemsArr = Array.isArray(data.items) ? data.items : [];
      const updatedAt = tsToMs(data.updatedAt);
      return { items: itemsArr, updatedAt };
    } catch (err) {
      console.error("[useCartSync] fetchServerCart error:", err);
      return { items: [], updatedAt: null };
    }
  };

  /**
   * write cart to server using transaction + set updatedAt timestamp
   */
  const writeCartToServer = async (uid, cartItems) => {
    if (!uid) return;
    const ref = cartDocRef(uid);

    try {
      dispatch(setSyncing(true));
      // runTransaction ensures atomic write (we simply set/replace)
      await runTransaction(db, async (tx) => {
        tx.set(ref, {
          items: cartItems || [],
          updatedAt: Timestamp.now(),
        });
      });
      dispatch(markSynced());
    } catch (err) {
      console.error("[useCartSync] writeCartToServer error:", err);
      dispatch(setSyncing(false));
    }
  };

  /**
   * clear server cart (used when expired)
   */
  const clearServerCart = async (uid) => {
    if (!uid) return;
    try {
      const ref = cartDocRef(uid);
      await runTransaction(db, async (tx) => {
        tx.set(ref, {
          items: [],
          updatedAt: Timestamp.now(),
        });
      });
      // also clear local
      dispatch(replaceCartFromServer([]));
    } catch (err) {
      console.error("[useCartSync] clearServerCart error:", err);
    }
  };

  /**
   * flushPending - best-effort flush (used on beforeunload)
   */
  const flushPending = async (uid) => {
    if (flushingRef.current) return;
    if (!uid) return;
    flushingRef.current = true;
    try {
      if (pendingRef.current) {
        await writeCartToServer(uid, itemsRef.current);
      }
    } catch (err) {
      console.error("[useCartSync] flushPending error:", err);
    } finally {
      flushingRef.current = false;
    }
  };

  /**
   * showExpiryWarningIfNeeded: check local and show toast if close to expiry
   */
  const showExpiryWarningIfNeeded = (localMs, serverMs) => {
    // Prefer the more recent timestamp to compute time-to-expiry
    const ts = Math.max(localMs || 0, serverMs || 0);
    if (!ts) return;

    const ageDays = (Date.now() - ts) / MS_PER_DAY;
    if (ageDays >= WARNING_DAYS && ageDays < EXPIRY_DAYS) {
      // show fun toy-store themed toast (non-blocking)
      toast((t) => (
        <div className="max-w-xs">
          <strong>⚠️ Toys are getting restless!</strong>
          <div className="mt-1 text-sm">
            Your cart will expire soon — secure them before they escape!
          </div>
          <div className="mt-2 text-xs opacity-80">Click to view your cart</div>
        </div>
      ), {
        id: "cart-expiry-warning",
        duration: 12000,
        // onClick could navigate to cart page if you add support here
      });
    }
  };

  /**
   * Auth listener: on login -> fetch server cart -> check expiry -> merge -> replace local -> push merged to server
   */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid || null;
      currentUserRef.current = uid;

      if (uid) {
        try {
          // 1) fetch server cart
          const server = await fetchServerCart(uid);
          const serverItems = server.items || [];
          const serverUpdatedAt = server.updatedAt || null;

          // 2) check server expiry
          if (serverUpdatedAt && Date.now() - serverUpdatedAt > EXPIRY_DAYS * MS_PER_DAY) {
            // server cart expired -> clear both server & local
            await clearServerCart(uid);
            toast.success("Your previous cart expired and was cleared.");
            return;
          }

          // 3) local expiry check (soft warning)
          showExpiryWarningIfNeeded(lastUpdatedRef.current, serverUpdatedAt);

          // 4) merge carts (add quantities)
          const merged = mergeCarts(itemsRef.current || [], serverItems || []);

          // 5) replace local with merged
          dispatch(replaceCartFromServer(merged));

          // 6) push merged to server to have consistent server state
          await writeCartToServer(uid, merged);
        } catch (err) {
          console.error("[useCartSync] auth merge error:", err);
        }
      } else {
        // user logged out - keep local cart
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Interval-based sync
   */
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const uid = currentUserRef.current;
      if (!uid) return;
      if (!pendingRef.current) return;
      if (syncingRef.current) return;
      try {
        await writeCartToServer(uid, itemsRef.current);
      } catch (err) {
        console.error("[useCartSync] interval sync error:", err);
      }
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * beforeunload flush (best-effort)
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      const uid = currentUserRef.current;
      if (uid && pendingRef.current) {
        flushPending(uid);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /**
   * Soft warning for guests on first mount (if lastUpdated local near expiry)
   * This runs once on mount (we use lastUpdatedRef which was initialized from Redux/localStorage)
   */
  useEffect(() => {
    // If not logged in and local cart exists, show soft warning if needed
    (async () => {
      const uid = currentUserRef.current;
      if (!uid) {
        showExpiryWarningIfNeeded(lastUpdatedRef.current, null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
