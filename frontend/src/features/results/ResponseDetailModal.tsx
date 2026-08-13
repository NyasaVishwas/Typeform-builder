"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface ResponseAnswerDetail {
  id: string;
  question_id: string;
  question_text: string;
  question_type: string;
  value_text?: string | null;
  value_number?: number | null;
  value_json?: any;
}

export interface ResponseDetailData {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time_seconds?: number | null;
  answers: ResponseAnswerDetail[];
}

export interface ResponseDetailModalProps {
  isOpen: boolean;
  responseData: ResponseDetailData | null;
  onClose: () => void;
}

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  isOpen,
  responseData,
  onClose,
}) => {
  if (!responseData) return null;

  const formattedDate = new Date(responseData.submitted_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Response #${responseData.id.substring(0, 8)}`}
      description={`Submitted on ${formattedDate} (${responseData.completion_time_seconds || 0}s completion time)`}
      footer={
        <Button size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {responseData.answers && responseData.answers.length > 0 ? (
          responseData.answers.map((ans, idx) => {
            const displayValue =
              ans.value_text !== null && ans.value_text !== undefined && ans.value_text !== ""
                ? ans.value_text
                : ans.value_number !== null && ans.value_number !== undefined
                ? String(ans.value_number)
                : ans.value_json
                ? JSON.stringify(ans.value_json)
                : <span className="text-slate-400 italic">No answer provided</span>;

            return (
              <div
                key={ans.id || idx}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="font-semibold text-slate-900">
                    {idx + 1}. {ans.question_text}
                  </span>
                  <span className="capitalize text-[10px] px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded">
                    {ans.question_type ? ans.question_type.replace("_", " ") : "Question"}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-900 leading-normal pl-4 border-l-2 border-slate-900 mt-1">
                  {displayValue}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No answer payload found for this submission.
          </p>
        )}
      </div>
    </Modal>
  );
};
