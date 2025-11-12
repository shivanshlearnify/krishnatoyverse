"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {/* PersistGate delays rendering until redux-persist rehydrates state */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
