"use client";

import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PhoneAuth() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
  if (typeof window === "undefined") return;

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: (response) => {
        console.log("reCAPTCHA verified ✅", response);
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired. Please try again.");
      },
    });
  }
}, []);

  // ✅ Send OTP to the phone number
  const handleSendOtp = async () => {
    if (!phone) return alert("Enter your phone number");
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        alert("Recaptcha not ready. Please refresh.");
        return;
      }
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );
      setConfirmationResult(confirmation);
      alert("OTP sent ✅");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP and handle login logic
  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter OTP");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      // Create user if new
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          phone: user.phoneNumber,
          role: "customer",
          createdAt: new Date(),
        });
        alert("Welcome new customer 🎉");
        router.push("/home");
        return;
      }

      // Redirect existing users based on role
      const role = snap.data().role;
      if (role === "admin") {
        alert("Welcome Admin 👑");
        router.push("/admin/dashboard");
      } else {
        alert("Welcome back 🛍️");
        router.push("/home");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP ❌");
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

        {/* Phone Number Input */}
        {!confirmationResult && (
          <>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-lg py-2 transition-all"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* OTP Input */}
        {confirmationResult && (
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

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
