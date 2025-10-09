// src/hooks/useCollectionsData.js
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export function useCollectionsData() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchCollection = async (colName, setter) => {
      const snapshot = await getDocs(collection(db, colName));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setter(list);
    };

    fetchCollection("brands", setBrands);
    fetchCollection("categories", setCategories);
    fetchCollection("subcategories", setSubcategories);
    fetchCollection("groups", setGroups);
  }, []);

  return { brands, categories, subcategories, groups };
}
