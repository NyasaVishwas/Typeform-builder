"use client";

import React from "react";
import { FormStatus } from "@/types";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: "published" | "draft" | "neutral" | "brand";
  status?: FormStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, status, className = "" }) => {
  let resolvedVariant = variant || "neutral";

  if (status) {
    resolvedVariant = status === FormStatus.PUBLISHED || status === "published" ? "published" : "draft";
  }

  const variantStyles = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
    brand: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const displayText = children || (status ? (status === FormStatus.PUBLISHED ? "Published" : "Draft") : "");

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium border rounded-full ${variantStyles[resolvedVariant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          resolvedVariant === "published"
            ? "bg-emerald-500"
            : resolvedVariant === "draft"
            ? "bg-slate-400"
            : "bg-blue-500"
        }`}
      />
      {displayText}
    </span>
  );
};
