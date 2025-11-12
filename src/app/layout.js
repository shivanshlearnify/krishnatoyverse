import CartDrawer from "@/components/CartDrawer";
import "./globals.css";
import Providers from "./providers";
import CartSyncProvider from "@/components/CartSyncProvider";
import Navbar from "@/components/Navbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CartSyncProvider>
            <Navbar />
            <main className="min-h-screen pt-20">{children}</main>
            <CartDrawer />
            <ScrollToTopButton />
          </CartSyncProvider>
          {/* ✅ Toastify container for global notifications */}
          <ToastContainer
            position="top-center"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored" // optional: gives nice color styling
          />
        </Providers>
      </body>
    </html>
  );
}
