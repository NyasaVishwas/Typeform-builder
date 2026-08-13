"use client";

import React from "react";
import Link from "next/link";
import { Form, FormStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu, MenuItem } from "@/components/ui/DropdownMenu";

export interface FormCardProps {
  form: Form;
  onRename: (form: Form) => void;
  onDuplicate: (form: Form) => void;
  onTogglePublish: (form: Form) => void;
  onDelete: (form: Form) => void;
}

export const FormCard: React.FC<FormCardProps> = ({
  form,
  onRename,
  onDuplicate,
  onTogglePublish,
  onDelete,
}) => {
  const formattedDate = new Date(form.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const menuItems: MenuItem[] = [
    {
      label: "Edit in Builder",
      onClick: () => (window.location.href = `/builder/${form.id}`),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      label: form.status === FormStatus.PUBLISHED ? "Preview Public Link" : "Public Link (Draft)",
      onClick: () => {
        if (form.status === FormStatus.PUBLISHED) {
          window.open(`/f/${form.slug}`, "_blank");
        } else {
          alert("Publish this form to access its public runner link!");
        }
      },
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
    },
    {
      label: "View Responses & Stats",
      onClick: () => (window.location.href = `/analytics/${form.id}`),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Rename",
      onClick: () => onRename(form),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      label: "Duplicate",
      onClick: () => onDuplicate(form),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: form.status === FormStatus.PUBLISHED ? "Unpublish Form" : "Publish Form",
      onClick: () => onTogglePublish(form),
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: "Delete",
      onClick: () => onDelete(form),
      danger: true,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  ];

  return (
    <Card hoverable className="flex flex-col justify-between group">
      <div>
        {/* Header Row: Status Badge + Actions Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge status={form.status} />
          <DropdownMenu items={menuItems} />
        </div>

        {/* Title & Description */}
        <Link href={`/builder/${form.id}`} className="block group-hover:text-blue-600 transition-colors">
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1">
            {form.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[2rem]">
          {form.description || "No description provided."}
        </p>
      </div>

      {/* Footer Metrics Row */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5" title="Questions count">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {form.questions ? form.questions.length : 0} Qs
          </span>

          <span className="flex items-center gap-1.5" title="Submissions count">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {form.response_count || 0} responses
          </span>
        </div>

        <span className="text-slate-400 text-[11px]">Updated {formattedDate}</span>
      </div>
    </Card>
  );
};
