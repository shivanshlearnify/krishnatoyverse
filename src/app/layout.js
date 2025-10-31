"use client";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import Navbar from "@/components/Navbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <Navbar />
          <ScrollToTopButton/>
          {children}
        </Provider>
      </body>
    </html>
  );
}
