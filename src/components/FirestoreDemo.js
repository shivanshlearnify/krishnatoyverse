"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function FirestoreDemo() {
  const [users, setUsers] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  // Add data
  const addUser = async () => {
    try {
      await addDoc(collection(db, "users"), {
        name: "Shivansh",
        role: "Frontend Developer",
        createdAt: new Date(),
      });
      alert("User Added!");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={addUser}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add User
      </button>

      <h2 className="mt-4 font-bold">Users from Firestore:</h2>
      <ul className="list-disc pl-6">
        {users.map((u) => (
          <li key={u.id}>{u.name} - {u.role}</li>
        ))}
      </ul>
    </div>
  );
}
