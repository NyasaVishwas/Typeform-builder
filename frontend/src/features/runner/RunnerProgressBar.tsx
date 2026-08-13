"use client";

import React from "react";

export interface RunnerProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
}

export const RunnerProgressBar: React.FC<RunnerProgressBarProps> = ({
  currentIndex,
  totalQuestions,
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, Math.round(((currentIndex + 1) / totalQuestions) * 100))
  );

  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Top thin progress line */}
      <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-slate-900 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Subtle Step Counter */}
      <div className="px-6 py-2 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>
          Question <strong className="text-slate-700">{currentIndex + 1}</strong> of {totalQuestions}
        </span>
        <span>{percentage}% completed</span>
      </div>
    </div>
  );
};
