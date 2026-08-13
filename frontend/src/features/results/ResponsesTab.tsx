"use client";

import React, { useState } from "react";
import { ResponseData } from "@/types";
import { getResponseDetail } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ResponseDetailModal, ResponseDetailData } from "./ResponseDetailModal";

export interface ResponsesTabProps {
  formId: string;
  responses: ResponseData[];
}

export const ResponsesTab: React.FC<ResponsesTabProps> = ({ formId, responses }) => {
  const [selectedResponse, setSelectedResponse] = useState<ResponseDetailData | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleViewDetail = async (responseId: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await getResponseDetail(formId, responseId);
      setSelectedResponse(detail);
    } catch (err: any) {
      alert("Failed to load response details.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (!responses || responses.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-900 text-base mb-1">No responses submitted yet</h3>
        <p className="text-xs text-slate-500 mb-4">
          Share your published form link to start collecting conversational responses.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-5">Submission ID</th>
              <th className="py-3.5 px-5">Submitted Date & Time</th>
              <th className="py-3.5 px-5">Completion Time</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {responses.map((resp) => {
              const formattedDate = new Date(resp.submitted_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={resp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-medium text-slate-900">
                    #{resp.id.substring(0, 8)}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">{formattedDate}</td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono">
                    {resp.completion_time_seconds ? `${resp.completion_time_seconds}s` : "N/A"}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(resp.id)}
                      className="text-xs py-1"
                    >
                      View Answers
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Response Detail Modal */}
      <ResponseDetailModal
        isOpen={!!selectedResponse}
        responseData={selectedResponse}
        onClose={() => setSelectedResponse(null)}
      />
    </div>
  );
};
