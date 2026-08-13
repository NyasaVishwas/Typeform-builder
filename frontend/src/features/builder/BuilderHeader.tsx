"use client";

import React from "react";
import { Form } from "@/types";
import { FormNavHeader } from "@/components/layout/FormNavHeader";

export interface BuilderHeaderProps {
  form: Form;
  saveStatus: "saved" | "saving" | "unsaved";
  onTitleChange: (newTitle: string) => void;
  onPublish: () => void;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  form,
  saveStatus,
  onTitleChange,
  onPublish,
  isPreviewOpen,
  onTogglePreview,
}) => {
  return (
    <FormNavHeader
      form={form}
      saveStatus={saveStatus}
      onTitleChange={onTitleChange}
      onPublish={onPublish}
      isPreviewOpen={isPreviewOpen}
      onTogglePreview={onTogglePreview}
    />
  );
};
