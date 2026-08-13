"use client";

import React, { useState } from "react";
import { Form } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface ThankYouSettingsProps {
  form: Form;
  onSave: (themeSettings: any) => Promise<void>;
}

export const ThankYouSettings: React.FC<ThankYouSettingsProps> = ({ form, onSave }) => {
  const currentTheme = (form.theme_settings || {}) as any;
  const [headline, setHeadline] = useState(
    currentTheme.thankyou_headline || "Thank you for your feedback!"
  );
  const [subtext, setSubtext] = useState(
    currentTheme.thankyou_subtext || "Your response has been successfully recorded."
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...currentTheme,
        thankyou_headline: headline.trim(),
        thankyou_subtext: subtext.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Thank-You Screen Settings</h3>
        <p className="text-xs text-slate-500 mt-0.5">Customize post-submission confirmation messaging.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Headline Text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Thank you for your time!"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            Subtext / Description
          </label>
          <textarea
            rows={2}
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            placeholder="e.g. We will review your answers shortly."
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <Button type="submit" size="sm" isLoading={isSaving} className="self-start">
        Save Thank-You Settings
      </Button>
    </form>
  );
};
