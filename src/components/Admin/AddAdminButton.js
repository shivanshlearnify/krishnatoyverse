// Example: components/Admin/AddAdminButton.js
"use client";

import { useState } from "react";

export default function AddAdminButton() {
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState("");
  const [phone, setPhone] = useState("");

  const handleAddAdmin = async () => {
    if (!uid || !phone) return alert("Enter both UID and phone");

    setLoading(true);
    try {
      const res = await fetch("/api/setAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          phoneNumber: phone,
          secret: "toyStoreAdminKey2025", // use ENV variable if possible
        }),
      });

      const data = await res.json();
      if (data.success) alert("✅ Admin added successfully!");
      else alert("❌ Failed: " + data.error);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h2 className="text-xl mb-2">Add Admin</h2>
      <input
        type="text"
        placeholder="User UID"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
        className="p-2 text-black rounded mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="p-2 text-black rounded mb-2 w-full"
      />
      <button
        onClick={handleAddAdmin}
        disabled={loading}
        className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700"
      >
        {loading ? "Adding..." : "Add Admin"}
      </button>
    </div>
  );
}
