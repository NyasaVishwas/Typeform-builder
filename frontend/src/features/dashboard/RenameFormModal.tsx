"use client";

import React, { useState, useEffect } from "react";
import { Form } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface RenameFormModalProps {
  isOpen: boolean;
  form: Form | null;
  onClose: () => void;
  onConfirm: (formId: string, newTitle: string, newDescription?: string) => Promise<void>;
}

export const RenameFormModal: React.FC<RenameFormModalProps> = ({
  isOpen,
  form,
  onClose,
  onConfirm,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
    }
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !title.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(form.id, title.trim(), description.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename Form"
      description="Update title and description for this form."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting} disabled={!title.trim()}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Form Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Customer Satisfaction Survey"
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the form's objective..."
            rows={3}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>
      </form>
    </Modal>
  );
};
