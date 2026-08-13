"use client";

import React, { useState } from "react";
import { Question } from "@/types";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";

export interface LivePreviewPanelProps {
  questions: Question[];
  activeQuestion: Question | null;
  onClosePreview?: () => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  questions,
  activeQuestion,
  onClosePreview,
}) => {
  const [previewValue, setPreviewValue] = useState<any>(null);

  const activeIndex = activeQuestion
    ? questions.findIndex((q) => q.id === activeQuestion.id)
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-100/80 border-l border-slate-200/80 p-6 overflow-y-auto">
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Live Respondent Preview
          </span>
        </div>
        {onClosePreview && (
          <button
            onClick={onClosePreview}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/50"
            title="Close Preview"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Preview Device Canvas Frame */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 min-h-[420px] flex flex-col justify-between">
          {activeQuestion ? (
            <QuestionRenderer
              question={activeQuestion}
              questionNumber={activeIndex + 1}
              value={previewValue}
              onChange={setPreviewValue}
              onSubmit={() => setPreviewValue("")}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 my-auto py-16">
              <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-xs font-medium">Select a question from the list to preview</p>
            </div>
          )}

          {/* Footer Navigation Bar in Preview */}
          {questions.length > 0 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs text-slate-400">
              <span>
                Question {activeIndex + 1} of {questions.length}
              </span>
              <span>Powered by Typeform Builder</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
