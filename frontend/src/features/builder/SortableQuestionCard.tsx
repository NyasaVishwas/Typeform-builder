"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "@/types";

export interface SortableQuestionCardProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: (question: Question) => void;
  onDuplicate: (question: Question) => void;
  onDelete: (question: Question) => void;
}

export const SortableQuestionCard: React.FC<SortableQuestionCardProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(question)}
      className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? "border-slate-900 bg-slate-900 text-white shadow-md"
          : "border-slate-200/90 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className={`p-1 rounded cursor-grab active:cursor-grabbing transition-colors ${
            isSelected ? "text-slate-400 hover:text-white" : "text-slate-300 hover:text-slate-600"
          }`}
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Index number badge */}
        <span
          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${
            isSelected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-600"
          }`}
        >
          {index + 1}
        </span>

        {/* Question details */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold truncate leading-tight">
            {question.question_text || "Untitled Question"}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[10px] capitalize font-medium ${
                isSelected ? "text-slate-300" : "text-slate-400"
              }`}
            >
              {question.type.replace("_", " ")}
            </span>
            {question.required && (
              <span className="text-red-500 text-xs leading-none font-bold" title="Required">*</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Controls (Duplicate & Delete) */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(question);
          }}
          className={`p-1 rounded transition-colors ${
            isSelected ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-400"
          }`}
          title="Duplicate question"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question);
          }}
          className={`p-1 rounded transition-colors ${
            isSelected ? "hover:bg-red-950 text-red-300" : "hover:bg-red-50 text-slate-400 hover:text-red-600"
          }`}
          title="Delete question"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
