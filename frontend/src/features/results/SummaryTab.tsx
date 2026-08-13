"use client";

import React from "react";
import { QuestionType } from "@/types";

export interface QuestionStat {
  question_id: string;
  question_text: string;
  type: string;
  required: boolean;
  total_answers: number;
  options?: Array<{ label: string; count: number; percentage: number }>;
  summary?: {
    avg?: number;
    min?: number;
    max?: number;
    count?: number;
    average?: number;
    min_scale?: number;
    max_scale?: number;
    total_ratings?: number;
    distribution?: Array<{ score: number; count: number; percentage: number }>;
  };
  recent_responses?: string[];
}

export interface SummaryTabProps {
  questionStats: QuestionStat[];
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ questionStats }) => {
  if (!questionStats || questionStats.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        No question analytics available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {questionStats.map((stat, idx) => {
        const { question_id, question_text, type, required, total_answers } = stat;

        return (
          <div
            key={question_id || idx}
            className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-4"
          >
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h3 className="font-semibold text-slate-900 text-base">
                  {question_text}
                  {required && <span className="text-red-500 ml-1" title="Required">*</span>}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-full capitalize">
                  {type.replace("_", " ")}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {total_answers} {total_answers === 1 ? "answer" : "answers"}
                </span>
              </div>
            </div>

            {/* 1. CHOICE / DROPDOWN / YES_NO HORIZONTAL BARS */}
            {(type === QuestionType.MULTIPLE_CHOICE ||
              type === QuestionType.DROPDOWN ||
              type === QuestionType.YES_NO) &&
              stat.options && (
                <div className="flex flex-col gap-3 pt-1">
                  {stat.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span>{opt.label}</span>
                        <span className="text-slate-500 font-mono">
                          {opt.count} ({opt.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-300"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* 2. RATING SUMMARY & SCORE DISTRIBUTION */}
            {type === QuestionType.RATING && stat.summary && (
              <div className="flex flex-col gap-4 pt-1">
                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-slate-900 leading-none">
                      {stat.summary.average ?? 0}{" "}
                      <span className="text-xs text-slate-400 font-normal">
                        / {stat.summary.max_scale || 5}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-slate-500 mt-1">Average Score</span>
                  </div>
                </div>

                {stat.summary.distribution && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-700 tracking-wide">
                      Score Breakdown
                    </span>
                    {stat.summary.distribution.map((dist) => (
                      <div key={dist.score} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-semibold text-slate-700 font-mono">
                          {dist.score} ★
                        </span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${dist.percentage}%` }}
                          />
                        </div>
                        <span className="w-16 text-right font-mono text-slate-500">
                          {dist.count} ({dist.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. NUMBER SUMMARY CARDS */}
            {type === QuestionType.NUMBER && stat.summary && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                  <span className="text-xs text-slate-500 font-medium block">Average</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block font-mono">
                    {stat.summary.avg ?? 0}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                  <span className="text-xs text-slate-500 font-medium block">Minimum</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block font-mono">
                    {stat.summary.min ?? 0}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                  <span className="text-xs text-slate-500 font-medium block">Maximum</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block font-mono">
                    {stat.summary.max ?? 0}
                  </span>
                </div>
              </div>
            )}

            {/* 4. SHORT / LONG TEXT / EMAIL RECENT RESPONSES */}
            {(type === QuestionType.SHORT_TEXT ||
              type === QuestionType.LONG_TEXT ||
              type === QuestionType.EMAIL) && (
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 tracking-wide">
                  Recent Text Answers ({stat.recent_responses?.length || 0})
                </span>
                {stat.recent_responses && stat.recent_responses.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {stat.recent_responses.map((txt, textIdx) => (
                      <div
                        key={textIdx}
                        className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-800 leading-relaxed"
                      >
                        "{txt}"
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No text answers submitted yet.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
