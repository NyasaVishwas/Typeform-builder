"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Question, QuestionType } from "@/types";
import {
  getForm,
  updateForm,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  publishForm,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { BuilderHeader } from "@/features/builder/BuilderHeader";
import { QuestionList } from "@/features/builder/QuestionList";
import { QuestionEditor } from "@/features/builder/QuestionEditor";
import { LivePreviewPanel } from "@/features/builder/LivePreviewPanel";
import { QuestionTypePickerModal } from "@/features/builder/QuestionTypePickerModal";
import { PublishSuccessModal } from "@/features/builder/PublishSuccessModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // Modals state
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<Question | null>(null);

  // Debounced autosave ref timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFormDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getForm(formId);
      setForm(data);
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setSelectedQuestion(data.questions[0]);
      }
    } catch (err: any) {
      toast(err.message || "Failed to load form.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchFormDetails();
    }
  }, [formId]);

  // Handle Form Title Change
  const handleTitleChange = async (newTitle: string) => {
    if (!form) return;
    setForm({ ...form, title: newTitle });
    setSaveStatus("saving");
    try {
      const updated = await updateForm(formId, { title: newTitle });
      setForm((prev) => (prev ? { ...prev, title: updated.title } : null));
      setSaveStatus("saved");
      toast("Form title updated.");
    } catch (err: any) {
      setSaveStatus("unsaved");
      toast(err.message || "Failed to save title.", "error");
    }
  };

  // Debounced Autosave for Question Editing
  const handleQuestionChange = (updatedQ: Question) => {
    // 1. Update local state immediately for instant feedback
    setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
    if (selectedQuestion?.id === updatedQ.id) {
      setSelectedQuestion(updatedQ);
    }
    setSaveStatus("unsaved");

    // 2. Debounce API save call by 800ms
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const savedQ = await updateQuestion(updatedQ.id, {
          question_text: updatedQ.question_text,
          description: updatedQ.description,
          required: updatedQ.required,
          type: updatedQ.type,
          config: updatedQ.config,
          choice_options: updatedQ.choice_options,
        });
        setQuestions((prev) => prev.map((q) => (q.id === savedQ.id ? savedQ : q)));
        setSaveStatus("saved");
      } catch (err: any) {
        setSaveStatus("unsaved");
        toast(err.message || "Autosave failed.", "error");
      }
    }, 800);
  };

  // Optimistic Drag-and-Drop Reorder Handler
  const handleReorder = async (newOrderedQuestions: Question[]) => {
    const previousQuestions = [...questions];
    // Optimistic local update
    setQuestions(newOrderedQuestions);
    setSaveStatus("saving");

    try {
      const orderedIds = newOrderedQuestions.map((q) => q.id);
      await reorderQuestions(formId, orderedIds);
      setSaveStatus("saved");
      toast("Question order saved.");
    } catch (err: any) {
      // Rollback on failure
      setQuestions(previousQuestions);
      setSaveStatus("unsaved");
      toast(err.message || "Failed to persist new order. Rolled back.", "error");
    }
  };

  // Add Question Handler
  const handleAddQuestionType = async (type: QuestionType) => {
    if (!form) return;
    setSaveStatus("saving");
    try {
      const defaultPayload: any = {
        type,
        question_text: `New ${type.replace("_", " ")} question`,
        required: false,
      };

      if (type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.DROPDOWN) {
        defaultPayload.choice_options = [
          { label: "Option 1", value: "option_1", order: 1 },
          { label: "Option 2", value: "option_2", order: 2 },
        ];
      }

      if (type === QuestionType.RATING) {
        defaultPayload.config = { min: 1, max: 5, low_label: "Low", high_label: "High" };
      }

      const newQ = await addQuestion(formId, defaultPayload);
      setQuestions((prev) => [...prev, newQ]);
      setSelectedQuestion(newQ);
      setSaveStatus("saved");
      toast("Question added.");
    } catch (err: any) {
      setSaveStatus("unsaved");
      toast(err.message || "Failed to add question.", "error");
    }
  };

  // Duplicate Question Handler
  const handleDuplicateQuestion = async (q: Question) => {
    setSaveStatus("saving");
    try {
      const payload: any = {
        type: q.type,
        question_text: `Copy of ${q.question_text}`,
        description: q.description,
        required: q.required,
        config: q.config,
        choice_options: q.choice_options?.map((opt) => ({
          label: opt.label,
          value: opt.value,
          order: opt.order,
        })),
      };
      const duplicatedQ = await addQuestion(formId, payload);
      setQuestions((prev) => [...prev, duplicatedQ]);
      setSelectedQuestion(duplicatedQ);
      setSaveStatus("saved");
      toast("Question duplicated.");
    } catch (err: any) {
      setSaveStatus("unsaved");
      toast(err.message || "Failed to duplicate question.", "error");
    }
  };

  // Delete Question Handler
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmQuestion) return;
    const qId = deleteConfirmQuestion.id;
    setSaveStatus("saving");
    try {
      await deleteQuestion(qId);
      const remaining = questions.filter((q) => q.id !== qId);
      setQuestions(remaining);
      if (selectedQuestion?.id === qId) {
        setSelectedQuestion(remaining[0] || null);
      }
      setDeleteConfirmQuestion(null);
      setSaveStatus("saved");
      toast("Question deleted.");
    } catch (err: any) {
      setSaveStatus("unsaved");
      toast(err.message || "Failed to delete question.", "error");
    }
  };

  // Publish Form Handler
  const handlePublish = async () => {
    if (!form) return;
    try {
      const published = await publishForm(form.id);
      setForm(published);
      setIsPublishModalOpen(true);
      toast("Form published successfully!");
    } catch (err: any) {
      toast(err.message || "Failed to publish form.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Form Builder...</span>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/50">
      {/* Builder Header Bar */}
      <BuilderHeader
        form={form}
        saveStatus={saveStatus}
        onTitleChange={handleTitleChange}
        onPublish={handlePublish}
        isPreviewOpen={isPreviewOpen}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
      />

      {/* Main 3-Area Builder Layout */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* AREA 1: Question Structure List (Left Sidebar) */}
        <div className="w-72 md:w-80 shrink-0 h-full">
          <QuestionList
            questions={questions}
            selectedQuestionId={selectedQuestion?.id || null}
            onSelectQuestion={setSelectedQuestion}
            onReorder={handleReorder}
            onAddQuestionClick={() => setIsTypePickerOpen(true)}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDeleteQuestion={setDeleteConfirmQuestion}
          />
        </div>

        {/* AREA 2: Active Question Editor (Center Panel) */}
        <div className="flex-1 h-full overflow-y-auto p-6 lg:p-8">
          <div className="max-w-xl mx-auto">
            {selectedQuestion ? (
              <QuestionEditor question={selectedQuestion} onChange={handleQuestionChange} />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center">
                <p className="text-sm text-slate-500 mb-4">No questions added to this form yet.</p>
                <Button size="sm" onClick={() => setIsTypePickerOpen(true)}>
                  Add First Question
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* AREA 3: Live Preview Panel (Right Split View) */}
        {isPreviewOpen && (
          <div className="w-96 lg:w-[460px] shrink-0 h-full hidden md:block">
            <LivePreviewPanel
              questions={questions}
              activeQuestion={selectedQuestion}
              onClosePreview={() => setIsPreviewOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Type Picker Modal */}
      <QuestionTypePickerModal
        isOpen={isTypePickerOpen}
        onClose={() => setIsTypePickerOpen(false)}
        onSelectType={handleAddQuestionType}
      />

      {/* Delete Question Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmQuestion}
        onClose={() => setDeleteConfirmQuestion(null)}
        title="Delete Question?"
        description="Are you sure you want to remove this question from your form?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmQuestion(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete Question
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          Question: <span className="font-semibold text-slate-900">"{deleteConfirmQuestion?.question_text}"</span>
        </p>
      </Modal>

      {/* Publish Success Modal */}
      <PublishSuccessModal
        isOpen={isPublishModalOpen}
        form={form}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
}
