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
import { toast } from "react-toastify"; // ✅ Toastify import

export default function PhoneAuth() {
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  
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
        } catch (e) {}
        delete window.recaptchaVerifier;
      }
    };
  }, [auth]);

  const handleSendOtp = async () => {
    if (!phone || !phone.startsWith("+91") || phone.length < 13) {
      toast.error("Enter valid Indian number (+91XXXXXXXXXX)");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );
      setConfirmationResult(confirmation);
      toast.success("OTP sent 📩");
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter OTP");

    setLoading(true);
    toast.dismiss(); // close previous toasts

    const verifyPromise = (async () => {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Create user if not exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          phone: user.phoneNumber,
          createdAt: new Date(),
        });
      }

      return user;
    })();

    toast.promise(
      verifyPromise,
      {
        pending: "Verifying OTP...",
        success: "Login successful 🎉 Redirecting...",
        error: "Invalid OTP. Try again ❌",
      },
      { autoClose: 2000 }
    );

    try {
      await verifyPromise;
      setTimeout(() => router.push("/"), 2000); // redirect after toast
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
