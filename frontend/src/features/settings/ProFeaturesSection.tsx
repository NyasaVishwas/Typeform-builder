"use client";

import React from "react";

const PRO_FEATURES = [
  {
    title: "Logic Jumps & Branching",
    description: "Route respondents dynamically based on previous answers.",
    icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: "Webhooks & Integrations",
    description: "Stream submissions to Zapier, Slack, or custom API endpoints in real-time.",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Stripe Payment Collect",
    description: "Accept credit card payments & deposits directly inside your form.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "File Upload Question Type",
    description: "Allow respondents to upload PDFs, images, and documents.",
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    title: "Custom Domain & Branding",
    description: "Remove Typeform branding and host forms on your custom domain.",
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: "Team Collaboration & Sharing",
    description: "Invite workspace members with role-based editing permissions.",
    icon: (
      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export const ProFeaturesSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800">
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Advanced & Enterprise Modules</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded uppercase tracking-wider">
              PRO / COMING SOON
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Planned enterprise capabilities reserved for future releases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {PRO_FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 relative overflow-hidden group"
          >
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 shrink-0">
              {feat.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-slate-100">{feat.title}</h4>
                <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
