"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    alert("Logged out successfully 👋");
    router.push("/login"); // or your login page
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading or not logged in...</p>
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
