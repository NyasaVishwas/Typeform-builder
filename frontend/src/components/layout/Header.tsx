"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface HeaderProps {
  onCreateForm?: () => void;
  isCreating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onCreateForm, isCreating = false }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-slate-800 transition-colors">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm tracking-tight leading-none">
              Typeform Builder
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
              Conversational Form Platform
            </span>
          </div>
        </Link>

        {/* Right Section: Creator Context & Action */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-full border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">Default Creator</span>
          </div>

          {onCreateForm && (
            <Button
              onClick={onCreateForm}
              isLoading={isCreating}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create form
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
