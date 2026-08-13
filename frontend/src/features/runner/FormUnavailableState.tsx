"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface FormUnavailableStateProps {
  slug: string;
  reason?: string;
}

export const FormUnavailableState: React.FC<FormUnavailableStateProps> = ({
  slug,
  reason = "This form is not currently accepting responses or does not exist.",
}) => {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-6 shadow-xs">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
        Form Unavailable
      </h1>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        {reason}
      </p>

      <Link href="/dashboard">
        <Button variant="outline" size="md">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
