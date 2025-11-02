"use client";

import { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  getAuth,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PhoneAuth() {
  const [phone, setPhone] = useState("+91"); // ✅ Default prefix
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const auth = getAuth();

  // Initialize invisible reCAPTCHA once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "sign-in-button", {
        size: "invisible",
        callback: () => console.log("reCAPTCHA verified ✅"),
        "expired-callback": () => console.warn("reCAPTCHA expired"),
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // ignore cleanup errors
        }
        delete window.recaptchaVerifier;
      }
    };
  }, [auth]);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!phone || !phone.startsWith("+91") || phone.length < 13) {
      setError("Please enter a valid Indian phone number (+91XXXXXXXXXX)");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) throw new Error("reCAPTCHA not initialized");

      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setMessage("OTP sent successfully ✅");
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /**
   * waitForCartMerge:
   * Polls the Firestore cart doc for a recent updatedAt timestamp (>= signInTime).
   * - If cart doc updatedAt >= signInTime => assume merge + write done.
   * - If no cart doc exists, resolve immediately (fresh user).
   * - Times out after timeoutMs.
   */
  const waitForCartMerge = async (uid, signInTime, timeoutMs = 15000, pollInterval = 600) => {
    if (!uid) return; // defensive
    const cartDocRef = doc(db, "users", uid, "cart");

    const start = Date.now();
    while (true) {
      try {
        const snap = await getDoc(cartDocRef);
        if (!snap.exists()) {
          // no server cart — treat as OK (first-time user)
          return true;
        }
        const data = snap.data();
        const updatedAt = data?.updatedAt;
        if (updatedAt && typeof updatedAt.toMillis === "function") {
          const ts = updatedAt.toMillis();
          // if server updatedAt is at-or-after signInTime (minus small margin), consider merged
          if (ts >= signInTime - 1000) {
            return true;
          }
        } else if (updatedAt && typeof updatedAt === "number") {
          // fallback if stored as epoch
          if (updatedAt >= signInTime - 1000) return true;
        } else {
          // if updatedAt missing, but doc exists, consider it OK
          return true;
        }
      } catch (err) {
        console.error("waitForCartMerge getDoc error:", err);
        // swallow and continue polling until timeout
      }

      if (Date.now() - start > timeoutMs) {
        // timed out
        return false;
      }
      // wait then retry
      await new Promise((r) => setTimeout(r, pollInterval));
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    if (!otp) {
      setError("Please enter the OTP");
      setLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // ensure user doc exists
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            phone: user.phoneNumber,
            createdAt: new Date(),
          });
        }
      } catch (dbErr) {
        console.error("Error ensuring user doc:", dbErr);
      }

      setMessage("Login successful 🎉");
      toast.success("Logged in — syncing your cart...");

      // Wait for the cart merge to complete.
      // Record signInTime to compare with server cart updatedAt
      const signInTime = Date.now();

      // Wait for merge (use 15s timeout). If merge completes, navigate; otherwise fallback after timeout.
      const merged = await waitForCartMerge(user.uid, signInTime, 15000, 600);

      if (merged) {
        // merged successfully (server cart has updatedAt >= signInTime)
        toast.success("Cart synced. Redirecting…");
      } else {
        // timed out — still proceed but inform user
        toast("Cart sync timed out. It will finish in background.", { icon: "⏳" });
      }

      // Finally navigate to home (or change path to your desired landing page)
      router.push("/");
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Invalid OTP. Please try again ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login with Phone
        </h1>

        {message && (
          <p className="text-green-600 text-center text-sm mb-3">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-center text-sm mb-3">{error}</p>
        )}

        {!confirmationResult ? (
          <>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
            />
            <button
              id="sign-in-button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-lg py-2 transition-all"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 transition-all"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
