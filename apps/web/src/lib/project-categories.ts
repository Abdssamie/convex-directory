export const PROJECT_CATEGORIES = [
  { name: "Developer Tools", slug: "developer-tools" },
  { name: "Productivity", slug: "productivity" },
  { name: "Finance", slug: "finance" },
  { name: "Health", slug: "health" },
  { name: "AI", slug: "ai" },
  { name: "Analytics", slug: "analytics" },
  { name: "Marketing", slug: "marketing" },
  { name: "Sales", slug: "sales" },
  { name: "Customer Support", slug: "customer-support" },
  { name: "Design", slug: "design" },
  { name: "Collaboration", slug: "collaboration" },
  { name: "Education", slug: "education" },
  { name: "E-commerce", slug: "e-commerce" },
  { name: "Security", slug: "security" },
  { name: "Infrastructure", slug: "infrastructure" },
  { name: "Operations", slug: "operations" },
  { name: "HR", slug: "hr" },
  { name: "Legal", slug: "legal" },
  { name: "Real Estate", slug: "real-estate" },
  { name: "Travel", slug: "travel" },
  { name: "Media", slug: "media" },
  { name: "Open Source", slug: "open-source" },
  { name: "Components", slug: "components" },
] as const;

export type ProjectCategorySlug = (typeof PROJECT_CATEGORIES)[number]["slug"];

export function formatProjectCategoryName(slug: string) {
  return (
    PROJECT_CATEGORIES.find((category) => category.slug === slug)?.name ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function normalizeCategoryValue(value: string) {
  return value.trim().toLowerCase();
}

export function resolveProjectCategorySlug(value: string) {
  const normalizedValue = normalizeCategoryValue(value);
  if (!normalizedValue) {
    return "";
  }

  const matchedCategory = PROJECT_CATEGORIES.find((category) => {
    return (
      normalizeCategoryValue(category.name) === normalizedValue ||
      normalizeCategoryValue(category.slug) === normalizedValue
    );
  });

  return matchedCategory?.slug ?? "";
}

export function resolveProjectCategorySlugs(value: string) {
  const categorySlugs = value
    .split(",")
    .map((part) => resolveProjectCategorySlug(part))
    .filter(Boolean);

  return [...new Set(categorySlugs)];
}
