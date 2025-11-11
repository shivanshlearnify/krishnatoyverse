"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // ✅ Redirect when user not logged in
  useEffect(() => {
    if (!user) {
      toast.info("Please log in to access your profile.", { autoClose: 2000 });
      const timeout = setTimeout(() => router.push("/"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully 👋", { autoClose: 2000 });
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout. Please try again.", { autoClose: 2500 });
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading or user not logged in...</p>
      </div>
    );
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <p className="mb-2">UID: {user.uid}</p>
        <p className="mb-4">Phone: {user.phoneNumber}</p>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
