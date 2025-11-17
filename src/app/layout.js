"use client"; // <-- Add this at the top

import CartDrawer from "@/components/CartDrawer";
import "./globals.css";
import Providers from "./providers";
import CartSyncProvider from "@/components/CartSyncProvider";
import Navbar from "@/components/Navbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <Providers>
          <CartSyncProvider>
            <Navbar/>
            <main className="min-h-screen max-w-[1360px] mx-auto">{children}</main>
            <Footer/>
            <CartDrawer/>
            <ScrollToTopButton />
          </CartSyncProvider>

          <ToastContainer
            position="top-center"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </Providers>
      </body>
    </html>
  );
}
