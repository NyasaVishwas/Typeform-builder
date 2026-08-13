"use client";

import React, { useState, useEffect } from "react";
import { Question, QuestionType } from "@/types";

export interface QuestionRendererProps {
  question: Question;
  questionNumber?: number;
  value?: any;
  onChange?: (value: any) => void;
  onSubmit?: () => void;
  isReadOnly?: boolean;
  error?: string | null;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionNumber = 1,
  value,
  onChange,
  onSubmit,
  isReadOnly = false,
  error,
}) => {
  const { type, question_text, description, required, config, choice_options } = question;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) onChange(e.target.value);
  };

  const handleSelectOption = (optValue: string) => {
    if (onChange) onChange(optValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-4 px-2 transition-all duration-200">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="flex items-center justify-center shrink-0 w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-xs mt-1 shadow-xs">
          {questionNumber}
        </span>
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            {question_text || "Untitled Question"}
            {required && <span className="text-red-500 ml-1.5" title="Required question">*</span>}
          </h2>
          {description && (
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Input Field Body by Question Type */}
      <div className="mt-2 pl-10">
        {/* 1. SHORT TEXT */}
        {type === QuestionType.SHORT_TEXT && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={value || ""}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={isReadOnly}
              placeholder={config?.placeholder || "Type your answer here..."}
              className="w-full text-lg py-2.5 px-1 border-b-2 border-slate-300 focus:border-slate-900 bg-transparent text-slate-900 focus:outline-none transition-colors placeholder:text-slate-300"
            />
          </div>
        )}

        {/* 2. LONG TEXT */}
        {type === QuestionType.LONG_TEXT && (
          <div className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={value || ""}
              onChange={handleTextChange}
              disabled={isReadOnly}
              placeholder={config?.placeholder || "Type your detailed answer here..."}
              className="w-full text-base p-3.5 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-white text-slate-900 focus:outline-none transition-all placeholder:text-slate-300 shadow-xs"
            />
          </div>
        )}

        {/* 3. MULTIPLE CHOICE */}
        {type === QuestionType.MULTIPLE_CHOICE && (
          <div className="flex flex-col gap-2.5">
            {choice_options && choice_options.length > 0 ? (
              choice_options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D...
                const isSelected = value === opt.label || value === opt.value;
                return (
                  <button
                    key={opt.id || idx}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`flex items-center gap-3.5 w-full p-3.5 rounded-xl border-2 text-left font-medium text-sm transition-all duration-150 ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-md scale-[1.01]"
                        : "border-slate-200/90 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0 transition-colors ${
                        isSelected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-base">{opt.label}</span>
                    {isSelected && (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No choice options added yet.</p>
            )}
          </div>
        )}

        {/* 4. DROPDOWN */}
        {type === QuestionType.DROPDOWN && (
          <div className="flex flex-col gap-3">
            <select
              value={value || ""}
              onChange={(e) => handleSelectOption(e.target.value)}
              disabled={isReadOnly}
              className="w-full text-base p-3.5 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-white text-slate-900 focus:outline-none transition-all shadow-xs cursor-pointer"
            >
              <option value="" disabled>
                Select an option...
              </option>
              {choice_options?.map((opt, idx) => (
                <option key={opt.id || idx} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 5. EMAIL */}
        {type === QuestionType.EMAIL && (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="email"
                value={value || ""}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                disabled={isReadOnly}
                placeholder={config?.placeholder || "name@example.com"}
                className="w-full text-lg py-2.5 pl-8 pr-1 border-b-2 border-slate-300 focus:border-slate-900 bg-transparent text-slate-900 focus:outline-none transition-colors placeholder:text-slate-300"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-0 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}

        {/* 6. NUMBER */}
        {type === QuestionType.NUMBER && (
          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={value !== undefined && value !== null ? value : ""}
              min={config?.min}
              max={config?.max}
              onChange={(e) => onChange && onChange(e.target.value === "" ? "" : Number(e.target.value))}
              onKeyDown={handleKeyDown}
              disabled={isReadOnly}
              placeholder={config?.placeholder || "0"}
              className="w-48 text-2xl font-semibold py-2 px-1 border-b-2 border-slate-300 focus:border-slate-900 bg-transparent text-slate-900 focus:outline-none transition-colors"
            />
            {(config?.min !== undefined || config?.max !== undefined) && (
              <span className="text-xs text-slate-400">
                Range: {config?.min ?? "Any"} to {config?.max ?? "Any"}
              </span>
            )}
          </div>
        )}

        {/* 7. YES / NO */}
        {type === QuestionType.YES_NO && (
          <div className="flex items-center gap-4">
            {["Yes", "No"].map((opt) => {
              const isSelected = (value || "").toLowerCase() === opt.toLowerCase();
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handleSelectOption(opt)}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold text-base transition-all duration-150 shadow-xs flex items-center justify-center gap-2 ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-md scale-105"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${isSelected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-500"}`}>
                    {opt[0]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* 8. RATING */}
        {type === QuestionType.RATING && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: (config?.max || 5) - (config?.min || 1) + 1 }).map((_, i) => {
                const score = (config?.min || 1) + i;
                const isSelected = Number(value) === score;
                return (
                  <button
                    key={score}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSelectOption(score.toString())}
                    className={`w-12 h-12 rounded-xl border-2 font-bold text-base transition-all duration-150 flex items-center justify-center ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-md scale-110"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
            {(config?.low_label || config?.high_label) && (
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-1 max-w-sm">
                <span>{config?.low_label}</span>
                <span>{config?.high_label}</span>
              </div>
            )}
          </div>
        )}

        {/* Validation Error Banner */}
        {error && (
          <div className="mt-3 text-xs font-semibold text-red-500 flex items-center gap-1.5 animate-in fade-in">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* OK / Next Button CTA for runner flow */}
        {onSubmit && (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onSubmit}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-all shadow-sm flex items-center gap-2"
            >
              <span>OK</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[10px] font-mono text-slate-600">Enter ↵</kbd>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
