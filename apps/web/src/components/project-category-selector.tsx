"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { PROJECT_CATEGORIES, formatProjectCategoryName } from "@/lib/project-categories";

type ProjectCategorySelectorProps = {
  value: string[];
  onChange: (nextValue: string[]) => void;
  allowEmpty?: boolean;
  className?: string;
};

export function ProjectCategorySelector({
  value,
  onChange,
  allowEmpty = false,
  className,
}: ProjectCategorySelectorProps) {
  const normalizedValue = React.useMemo(() => [...new Set(value)], [value]);

  const toggleCategory = (slug: string, checked: boolean) => {
    if (checked) {
      onChange([...normalizedValue, slug]);
      return;
    }

    const nextValue = normalizedValue.filter((currentSlug) => currentSlug !== slug);
    if (!allowEmpty && nextValue.length === 0) {
      return;
    }

    onChange(nextValue);
  };

  return (
    <div className={className}>
      <div className="grid gap-2 sm:grid-cols-2">
        {PROJECT_CATEGORIES.map((category) => {
          const checked = normalizedValue.includes(category.slug);
          return (
            <label
              key={category.slug}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(nextChecked) =>
                  toggleCategory(category.slug, Boolean(nextChecked))
                }
              />
              <span>{formatProjectCategoryName(category.slug)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
