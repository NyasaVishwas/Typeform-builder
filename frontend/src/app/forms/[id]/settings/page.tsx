"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Form } from "@/types";
import { getForm, updateForm } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { FormNavHeader } from "@/components/layout/FormNavHeader";
import { GeneralSettings } from "@/features/settings/GeneralSettings";
import { ThemeSettings } from "@/features/settings/ThemeSettings";
import { ThankYouSettings } from "@/features/settings/ThankYouSettings";
import { ProFeaturesSection } from "@/features/settings/ProFeaturesSection";

export default function FormSettingsPage() {
  const params = useParams();
  const { toast } = useToast();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const data = await getForm(formId);
      setForm(data);
    } catch (err: any) {
      toast(err.message || "Failed to load form settings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchFormData();
    }
  }, [formId]);

  const handleGeneralSave = async (payload: { title?: string; description?: string; slug?: string }) => {
    try {
      const updated = await updateForm(formId, payload);
      setForm((prev) => (prev ? { ...prev, ...updated } : null));
      toast("General settings updated successfully.");
    } catch (err: any) {
      toast(err.message || "Failed to save general settings.", "error");
      throw err;
    }
  };

  const handleThemeSave = async (themeSettings: any) => {
    try {
      const updated = await updateForm(formId, { theme_settings: themeSettings });
      setForm((prev) => (prev ? { ...prev, theme_settings: updated.theme_settings } : null));
      toast("Theme settings updated successfully.");
    } catch (err: any) {
      toast(err.message || "Failed to save theme settings.", "error");
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Form Settings...</span>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FormNavHeader form={form} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Form Settings</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure URL, visual styling, thank-you message, and pro module status.
          </p>
        </div>

        <GeneralSettings form={form} onSave={handleGeneralSave} />

        <ThemeSettings form={form} onSave={handleThemeSave} />

        <ThankYouSettings form={form} onSave={handleThemeSave} />

        <ProFeaturesSection />
      </main>
    </div>
  );
}
