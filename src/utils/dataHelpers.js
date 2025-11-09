export const getActiveData = (activeTab, dataState) => {
  if (!dataState) return [];

  const { brands, categories, groups, subcategories, productCollection } = dataState;

  switch (activeTab) {
    case "brands":
      return brands || [];
    case "categories":
      return categories || [];
    case "groups":
      return groups || [];
    case "subcategories":
      return subcategories || [];
    case "productCollection":
    default:
      return productCollection || [];
  }
};


// ✅ Since you store names directly — just return the value safely
export const getNameById = (_, value) => value || "-";

// ✅ Count helper for badges/tabs
export const getTabCounts = (dataState = {}) => ({
  productCollection: dataState.productCollection?.length || 0,
  brands: dataState.brands?.length || 0,
  categories: dataState.categories?.length || 0,
  groups: dataState.groups?.length || 0,
  subcategories: dataState.subcategories?.length || 0,
});
