"use client";

import { createElement } from "react";
import { icons } from "lucide-react";

type CategoryIconProps = {
  iconKey?: string | null;
  className?: string;
};

function getCategoryIcon(iconKey?: string | null) {
  const iconName = iconKey
    ? iconKey
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
    : "Utensils";

  return icons[iconName as keyof typeof icons] || icons.Utensils;
}

export function CategoryIcon({ iconKey, className }: CategoryIconProps) {
  const IconComponent = getCategoryIcon(iconKey);

  return createElement(IconComponent, { className });
}
