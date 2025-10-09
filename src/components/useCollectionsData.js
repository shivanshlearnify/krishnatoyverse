import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useCollectionsData() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const collections = [
        { name: "brands", setter: setBrands },
        { name: "categories", setter: setCategories },
        { name: "subcategories", setter: setSubcategories },
        { name: "groups", setter: setGroups },
      ];

      for (const c of collections) {
        const snapshot = await getDocs(collection(db, c.name));
        c.setter(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    };
    fetchData();
  }, []);

  return { brands, categories, subcategories, groups };
}
