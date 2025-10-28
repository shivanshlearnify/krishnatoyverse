"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BarcodeScanner({ onScan }) {
  useEffect(() => {
    let scanner;

    const initScanner = () => {
      const container = document.getElementById("reader");
      if (!container || container.offsetWidth === 0) {
        // Retry after a short delay if not yet visible
        setTimeout(initScanner, 500);
        return;
      }

      scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear().catch(() => {});
        },
        (error) => {
          // Only log serious errors, not frame read failures
          if (!error.includes("IndexSizeError")) console.warn(error);
        }
      );
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScan]);

  return <div id="reader" className="w-full h-64" />;
}
