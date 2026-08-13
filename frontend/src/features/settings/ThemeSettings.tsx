"use client";

import React, { useState } from "react";
import { Form } from "@/types";
import { Button } from "@/components/ui/Button";

export interface ThemeSettingsProps {
  form: Form;
  onSave: (themeSettings: any) => Promise<void>;
}

const COLOR_PALETTE = [
  { name: "Slate", hex: "#0F172A" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Rose", hex: "#EF4444" },
];

const FONTS = [
  { name: "Inter (Default)", value: "Inter" },
  { name: "System Sans", value: "system-ui" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Monospace", value: "monospace" },
];

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ form, onSave }) => {
  const currentTheme = form.theme_settings || { accent_color: "#0F172A", font_family: "Inter" };
  const [accentColor, setAccentColor] = useState(currentTheme.accent_color || "#0F172A");
  const [fontFamily, setFontFamily] = useState(currentTheme.font_family || "Inter");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        accent_color: accentColor,
        font_family: fontFamily,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Theme & Visual Styling</h3>
        <p className="text-xs text-slate-500 mt-0.5">Customize the respondent runner colors and typography.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Color Palette */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            Accent Color
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {COLOR_PALETTE.map((color) => {
              const isSelected = accentColor === color.hex;
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setAccentColor(color.hex)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Selection */}
        <div className="flex flex-col gap-2 max-w-sm">
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          >
            {FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" size="sm" isLoading={isSaving} className="self-start">
        Save Theme Settings
      </Button>
    </form>
  );
};
