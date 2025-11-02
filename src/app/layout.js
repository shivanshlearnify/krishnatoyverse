// app/layout.js
import "./globals.css";
import Providers from "./providers";
import CartSyncProvider from "@/components/CartSyncProvider";
import Navbar from "@/components/Navbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CartSyncProvider>
            <Navbar />
            <main className="min-h-screen pt-20">{children}</main>
            <ScrollToTopButton />
          </CartSyncProvider>
        </Providers>
      </body>
    </html>
  );
}
