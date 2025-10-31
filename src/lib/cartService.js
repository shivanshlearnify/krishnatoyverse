import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Save cart to Firebase
export const saveCartToFirebase = async (userId, cartItems) => {
  await setDoc(doc(db, "carts", userId), { items: cartItems });
};

// Load cart from Firebase
export const loadCartFromFirebase = async (userId) => {
  const snap = await getDoc(doc(db, "carts", userId));
  return snap.exists() ? snap.data().items : [];
};
