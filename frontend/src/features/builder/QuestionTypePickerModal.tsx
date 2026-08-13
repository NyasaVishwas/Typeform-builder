"use client";

import React from "react";
import { QuestionType } from "@/types";
import { Modal } from "@/components/ui/Modal";

export interface QuestionTypePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: QuestionType) => void;
}

const QUESTION_TYPES_CONFIG = [
  {
    type: QuestionType.SHORT_TEXT,
    title: "Short Text",
    description: "Single-line text answer for names or brief text.",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
      </svg>
    ),
  },
  {
    type: QuestionType.LONG_TEXT,
    title: "Long Text",
    description: "Multi-line text area for feedback or paragraphs.",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h10" />
      </svg>
    ),
  },
  {
    type: QuestionType.MULTIPLE_CHOICE,
    title: "Multiple Choice",
    description: "Select one choice option from a visual list.",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    type: QuestionType.DROPDOWN,
    title: "Dropdown",
    description: "Select one option from a compact select menu.",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
  },
  {
    type: QuestionType.EMAIL,
    title: "Email",
    description: "Validated email input for contact details.",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: QuestionType.NUMBER,
    title: "Number",
    description: "Numeric input with optional min/max bounds.",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
  },
  {
    type: QuestionType.YES_NO,
    title: "Yes / No",
    description: "Dual choice card for binary decisions.",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    type: QuestionType.RATING,
    title: "Rating",
    description: "Interactive rating scale (e.g., 1 to 5 or 1 to 10).",
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export const QuestionTypePickerModal: React.FC<QuestionTypePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Question Type"
      description="Select the question format for your respondents."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {QUESTION_TYPES_CONFIG.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => {
              onSelectType(item.type);
              onClose();
            }}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white text-left hover:border-slate-900 hover:bg-slate-50 transition-all duration-150 group"
          >
            <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};
