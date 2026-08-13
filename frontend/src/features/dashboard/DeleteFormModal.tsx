"use client";

import React, { useState } from "react";
import { Form } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface DeleteFormModalProps {
  isOpen: boolean;
  form: Form | null;
  onClose: () => void;
  onConfirm: (formId: string) => Promise<void>;
}

export const DeleteFormModal: React.FC<DeleteFormModalProps> = ({
  isOpen,
  form,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!form) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(form.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Form?"
      description="This action cannot be undone. All questions, options, and submitted responses will be permanently deleted."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>
            Delete Form
          </Button>
        </>
      }
    >
      <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-lg text-xs text-red-700">
        You are about to delete <span className="font-semibold text-red-900">"{form.title}"</span> ({form.response_count || 0} response entries).
      </div>
    </Modal>
  );
};
