"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ResponseData } from "@/types";
import { getForm, getFormStatistics, getFormResponses } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SummaryTab } from "@/features/results/SummaryTab";
import { ResponsesTab } from "@/features/results/ResponsesTab";

export default function FormResultsPage() {
  const params = useParams();
  const { toast } = useToast();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "responses">("summary");

  const fetchResultsData = async () => {
    setIsLoading(true);
    try {
      const [formData, statsData, respData] = await Promise.all([
        getForm(formId),
        getFormStatistics(formId),
        getFormResponses(formId),
      ]);
      setForm(formData);
      setStatistics(statsData);
      setResponses(respData);
    } catch (err: any) {
      toast(err.message || "Failed to load form analytics.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchResultsData();
    }
  }, [formId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Form Results & Analytics...</span>
        </div>
      </div>
    );
  }

  if (!form) return null;

  const totalResponses = statistics?.total_responses ?? responses.length;
  const avgCompletionSeconds = statistics?.avg_completion_seconds ?? 0;
  const formattedAvgTime =
    avgCompletionSeconds > 60
      ? `${Math.floor(avgCompletionSeconds / 60)}m ${Math.round(avgCompletionSeconds % 60)}s`
      : `${avgCompletionSeconds}s`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{form.title}</h1>
                <Badge status={form.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Results & Analytics Overview</p>
            </div>
          </div>

          {/* Metrics summary + Action button */}
          <div className="flex items-center gap-4 self-start sm:self-center">
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium text-[10px] uppercase">Responses</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{totalResponses}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium text-[10px] uppercase">Avg Time</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{formattedAvgTime}</span>
              </div>
            </div>

            <Link href={`/forms/${form.id}/edit`}>
              <Button variant="outline" size="sm">
                Edit in Builder
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all duration-150 ${
              activeTab === "summary"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Question Analytics Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("responses")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all duration-150 ${
              activeTab === "responses"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Individual Submissions ({responses.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "summary" ? (
          <SummaryTab questionStats={statistics?.question_stats || []} />
        ) : (
          <ResponsesTab formId={form.id} responses={responses} />
        )}
      </main>
    </div>
  );
}
