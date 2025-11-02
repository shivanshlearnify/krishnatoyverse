// app/components/CartSyncProvider.jsx
"use client";

import useCartSync from "@/hooks/useCartSync";
import React from "react";
import { Toaster } from "react-hot-toast";

export default function CartSyncProvider({ children }) {
  useCartSync();

  return (
    <>
      {/* Toast container (position/right) */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 6000,
        }}
      />
      {children}
    </>
  );
}
