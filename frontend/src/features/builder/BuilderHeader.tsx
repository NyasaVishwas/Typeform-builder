"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form, FormStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface BuilderHeaderProps {
  form: Form;
  saveStatus: "saved" | "saving" | "unsaved";
  onTitleChange: (newTitle: string) => void;
  onPublish: () => void;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  form,
  saveStatus,
  onTitleChange,
  onPublish,
  isPreviewOpen,
  onTogglePreview,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(form.title);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleText.trim() && titleText !== form.title) {
      onTitleChange(titleText.trim());
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left Section: Navigation & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title="Back to Dashboard"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        <div className="h-4 w-px bg-slate-200 shrink-0" />

        {/* Editable Title */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
            autoFocus
            className="text-sm font-bold text-slate-900 border-b border-slate-900 focus:outline-none bg-transparent"
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer transition-colors"
            title="Click to rename form title"
          >
            {form.title}
          </h1>
        )}

        <Badge status={form.status} />

        {/* Autosave Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          {saveStatus === "saving" && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Saving changes...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Saved</span>
            </>
          )}
          {saveStatus === "unsaved" && (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>Unsaved</span>
            </>
          )}
        </div>
      </div>

      {/* Right Section: Preview Toggle & Publish Button */}
      <div className="flex items-center gap-3">
        <Button
          variant={isPreviewOpen ? "primary" : "outline"}
          size="sm"
          onClick={onTogglePreview}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        >
          {isPreviewOpen ? "Hide Preview" : "Live Preview"}
        </Button>

        <Button
          size="sm"
          onClick={onPublish}
          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        >
          Publish
        </Button>
      </div>
    </header>
  );
};
