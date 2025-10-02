
"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BarcodeScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10, // scans per second
        qrbox: { width: 250, height: 150 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText); // send scanned code to parent
        scanner.clear(); // stop scanner after success
      },
      (error) => {
        console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear scanner", err));
    };
  }, [onScan]);

  return <div id="reader" className="w-full h-64" />;
}

