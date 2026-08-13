"use client";

import React from "react";
import { Question, QuestionType, ChoiceOption } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface QuestionEditorProps {
  question: Question;
  onChange: (updatedQuestion: Question) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onChange }) => {
  const { type, question_text, description, required, config, choice_options } = question;

  const handleFieldChange = (field: keyof Question, value: any) => {
    onChange({ ...question, [field]: value });
  };

  const handleConfigChange = (key: string, value: any) => {
    onChange({
      ...question,
      config: { ...(question.config || {}), [key]: value },
    });
  };

  // Choice Option handlers
  const handleOptionChange = (idx: number, newLabel: string) => {
    const updatedOptions = [...(choice_options || [])];
    updatedOptions[idx] = {
      ...updatedOptions[idx],
      label: newLabel,
      value: newLabel.toLowerCase().replace(/\s+/g, "_"),
    };
    onChange({ ...question, choice_options: updatedOptions });
  };

  const handleAddOption = () => {
    const currentOptions = choice_options || [];
    const newIdx = currentOptions.length + 1;
    const newOpt: ChoiceOption = {
      label: `Option ${newIdx}`,
      value: `option_${newIdx}`,
      order: newIdx,
    };
    onChange({ ...question, choice_options: [...currentOptions, newOpt] });
  };

  const handleRemoveOption = (idx: number) => {
    const updatedOptions = (choice_options || []).filter((_, i) => i !== idx);
    onChange({ ...question, choice_options: updatedOptions });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
      {/* Question Header & Type Badge */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Question Settings
          </span>
          <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md capitalize">
            {type.replace("_", " ")}
          </span>
        </div>

        {/* Required Switch */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <span className="text-xs font-medium text-slate-600">Required</span>
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => handleFieldChange("required", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 cursor-pointer"
          />
        </label>
      </div>

      {/* Main Fields */}
      <div className="flex flex-col gap-4">
        <Input
          label="Question Prompt"
          value={question_text}
          onChange={(e) => handleFieldChange("question_text", e.target.value)}
          placeholder="e.g. What is your email address?"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            Description / Help Text (optional)
          </label>
          <input
            type="text"
            value={description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Add subtle guidance for respondents..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* TYPE-SPECIFIC SETTINGS SECTION */}
      {/* 1. MULTIPLE CHOICE / DROPDOWN OPTIONS */}
      {(type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.DROPDOWN) && (
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 tracking-wide">
              Choice Options ({choice_options?.length || 0})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {choice_options?.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  disabled={choice_options.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="self-start mt-1 text-xs"
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Option
          </Button>
        </div>
      )}

      {/* 2. RATING SCALE CONFIG */}
      {type === QuestionType.RATING && (
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 tracking-wide">Rating Scale Settings</span>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Maximum Score</label>
              <select
                value={config?.max || 5}
                onChange={(e) => handleConfigChange("max", Number(e.target.value))}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              >
                <option value={3}>1 to 3</option>
                <option value={5}>1 to 5</option>
                <option value={7}>1 to 7</option>
                <option value={10}>1 to 10</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Minimum Score</label>
              <input
                type="number"
                value={config?.min ?? 1}
                disabled
                className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Low Rating Label"
              value={config?.low_label || ""}
              onChange={(e) => handleConfigChange("low_label", e.target.value)}
              placeholder="e.g. Poor"
              className="text-xs"
            />
            <Input
              label="High Rating Label"
              value={config?.high_label || ""}
              onChange={(e) => handleConfigChange("high_label", e.target.value)}
              placeholder="e.g. Excellent"
              className="text-xs"
            />
          </div>
        </div>
      )}

      {/* 3. NUMBER CONFIG */}
      {type === QuestionType.NUMBER && (
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 tracking-wide">Numeric Bounds (optional)</span>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Value"
              type="number"
              value={config?.min ?? ""}
              onChange={(e) => handleConfigChange("min", e.target.value === "" ? undefined : Number(e.target.value))}
              placeholder="e.g. 0"
              className="text-xs"
            />
            <Input
              label="Maximum Value"
              type="number"
              value={config?.max ?? ""}
              onChange={(e) => handleConfigChange("max", e.target.value === "" ? undefined : Number(e.target.value))}
              placeholder="e.g. 100"
              className="text-xs"
            />
          </div>
        </div>
      )}

      {/* 4. TEXT & EMAIL PLACEHOLDER CONFIG */}
      {(type === QuestionType.SHORT_TEXT || type === QuestionType.LONG_TEXT || type === QuestionType.EMAIL) && (
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <Input
            label="Input Placeholder Text"
            value={config?.placeholder || ""}
            onChange={(e) => handleConfigChange("placeholder", e.target.value)}
            placeholder="e.g. Type your answer here..."
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
};
