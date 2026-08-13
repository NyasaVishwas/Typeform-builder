"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface ThankYouScreenProps {
  formTitle: string;
  onRestart: () => void;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ formTitle, onRestart }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Checkmark Circle */}
      <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mb-6 shadow-xl animate-in zoom-in-50 duration-300">
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
        Thank you for your feedback!
      </h1>
      <p className="text-base text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Your response to <strong className="text-slate-900">"{formTitle}"</strong> has been successfully recorded.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="md" onClick={onRestart}>
          Submit another response
        </Button>
      </div>

      <div className="mt-16 text-xs text-slate-400 font-medium">
        Powered by <span className="font-semibold text-slate-700">Typeform Builder</span>
      </div>
    </div>
  );
};
