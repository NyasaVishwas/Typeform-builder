"use client";

import React, { useState } from "react";
import { Form } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface PublishSuccessModalProps {
  isOpen: boolean;
  form: Form | null;
  onClose: () => void;
}

export const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({
  isOpen,
  form,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!form) return null;

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/f/${form.slug}`
    : `/f/${form.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎉 Form is Published & Live!"
      description="Your conversational form is ready for respondents."
      footer={
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-xs font-mono text-slate-700 truncate">{publicUrl}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="shrink-0 text-xs"
            leftIcon={
              copied ? (
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )
            }
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>Test live runner in new tab</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </Modal>
  );
};
