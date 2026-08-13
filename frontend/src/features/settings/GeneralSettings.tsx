"use client";

import React, { useState } from "react";
import { Form } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface GeneralSettingsProps {
  form: Form;
  onSave: (payload: { title?: string; description?: string; slug?: string }) => Promise<void>;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ form, onSave }) => {
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");
  const [slug, setSlug] = useState(form.slug);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900">General Form Settings</h3>
        <p className="text-xs text-slate-500 mt-0.5">Manage basic details and shareable URL identifier.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Form Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Customer Satisfaction Survey"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add an internal summary or respondent subtitle..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            label="Public Link Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="e.g. customer-survey"
            required
            helperText={`Public URL preview: http://localhost:3001/f/${slug}`}
          />
        </div>
      </div>

      <Button type="submit" size="sm" isLoading={isSaving} className="self-start">
        Save General Settings
      </Button>
    </form>
  );
};
