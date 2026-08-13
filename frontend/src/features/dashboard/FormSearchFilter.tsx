"use client";

import React from "react";
import { Input } from "@/components/ui/Input";

export interface FormSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  totalForms: number;
}

export const FormSearchFilter: React.FC<FormSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  totalForms,
}) => {
  const tabs = [
    { id: "all", label: "All Forms" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Drafts" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      {/* Status Filter Tabs */}
      <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 self-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onStatusChange(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
              selectedStatus === tab.id
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-72">
        <div className="relative">
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-xs"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
