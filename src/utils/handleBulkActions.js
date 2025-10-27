import { bulkUpdatePreview } from "@/utils/bulkUpdatePreview";
import { fetchAllData } from "@/redux/productSlice";

export const handlePreview = async ({
  activeTab,
  searchWord,
  fieldToUpdate,
  newValue,
  setUpdating,
  setPreviewResults,
}) => {
  if (!searchWord.trim()) return alert("Enter a word to search");
  if (!fieldToUpdate.trim()) return alert("Select a field to update");
  setUpdating(true);
  try {
    const results = await bulkUpdatePreview(
      [activeTab],
      searchWord,
      fieldToUpdate,
      newValue
    );
    setPreviewResults(results);
  } finally {
    setUpdating(false);
  }
};

export const handleConfirmUpdate = async ({
  activeTab,
  searchWord,
  fieldToUpdate,
  newValue,
  previewResults,
  setUpdating,
  dispatch,
  setPreviewResults,
}) => {
  if (previewResults.length === 0) return alert("No previewed docs found.");
  if (!confirm("Are you sure you want to update these documents?")) return;
  setUpdating(true);
  try {
    await bulkUpdatePreview(
      [activeTab],
      searchWord,
      fieldToUpdate,
      newValue,
      true
    );
    alert("✅ Update complete!");
    dispatch(fetchAllData());
    setPreviewResults([]);
  } finally {
    setUpdating(false);
  }
};
