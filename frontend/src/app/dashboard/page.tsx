"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Form, FormStatus } from "@/types";
import {
  getForms,
  createForm,
  updateForm,
  deleteForm,
  duplicateForm,
  publishForm,
  unpublishForm,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/features/dashboard/FormCard";
import { FormSearchFilter } from "@/features/dashboard/FormSearchFilter";
import { RenameFormModal } from "@/features/dashboard/RenameFormModal";
import { DeleteFormModal } from "@/features/dashboard/DeleteFormModal";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [renameTarget, setRenameTarget] = useState<Form | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Form | null>(null);

  const fetchFormsData = async () => {
    setIsLoading(true);
    try {
      const data = await getForms();
      setForms(data);
    } catch (err: any) {
      toast(err.message || "Failed to fetch forms from server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormsData();
  }, []);

  // Filtered forms list
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch =
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && form.status === FormStatus.PUBLISHED) ||
        (statusFilter === "draft" && form.status === FormStatus.DRAFT);

      return matchesSearch && matchesStatus;
    });
  }, [forms, searchQuery, statusFilter]);

  // Create Form Handler
  const handleCreateForm = async () => {
    setIsCreating(true);
    try {
      const newForm = await createForm({
        title: "Untitled Form",
        description: "Add questions in the builder to complete your form.",
      });
      toast("Form created successfully!");
      router.push(`/builder/${newForm.id}`);
    } catch (err: any) {
      toast(err.message || "Failed to create form.", "error");
      setIsCreating(false);
    }
  };

  // Rename Form Handler
  const handleRenameConfirm = async (formId: string, newTitle: string, newDescription?: string) => {
    try {
      const updated = await updateForm(formId, { title: newTitle, description: newDescription });
      setForms((prev) => prev.map((f) => (f.id === formId ? { ...f, ...updated } : f)));
      toast(`Form renamed to "${newTitle}"`);
    } catch (err: any) {
      toast(err.message || "Failed to rename form.", "error");
      throw err;
    }
  };

  // Duplicate Form Handler
  const handleDuplicate = async (form: Form) => {
    try {
      const duplicated = await duplicateForm(form.id);
      setForms((prev) => [duplicated, ...prev]);
      toast(`Duplicated "${form.title}"`);
    } catch (err: any) {
      toast(err.message || "Failed to duplicate form.", "error");
    }
  };

  // Toggle Publish Status Handler
  const handleTogglePublish = async (form: Form) => {
    try {
      if (form.status === FormStatus.PUBLISHED) {
        const updated = await unpublishForm(form.id);
        setForms((prev) => prev.map((f) => (f.id === form.id ? updated : f)));
        toast(`Form unpublished (set to Draft)`);
      } else {
        const updated = await publishForm(form.id);
        setForms((prev) => prev.map((f) => (f.id === form.id ? updated : f)));
        toast(`Form published! Public URL is live.`);
      }
    } catch (err: any) {
      toast(err.message || "Failed to update publish status.", "error");
    }
  };

  // Delete Form Handler
  const handleDeleteConfirm = async (formId: string) => {
    try {
      await deleteForm(formId);
      setForms((prev) => prev.filter((f) => f.id !== formId));
      toast("Form deleted successfully.");
    } catch (err: any) {
      toast(err.message || "Failed to delete form.", "error");
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onCreateForm={handleCreateForm} isCreating={isCreating} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Page Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Forms</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, publish, and view live response analytics for your forms.
            </p>
          </div>

          <Button
            onClick={handleCreateForm}
            isLoading={isCreating}
            className="sm:hidden self-start"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create form
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <FormSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          totalForms={forms.length}
        />

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-44 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-20 mb-4" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-8" />
                <div className="h-4 bg-slate-200 rounded w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredForms.length > 0 ? (
          /* Forms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {filteredForms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onRename={setRenameTarget}
                onDuplicate={handleDuplicate}
                onTogglePublish={handleTogglePublish}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1">
              {searchQuery || statusFilter !== "all" ? "No matching forms found" : "No forms created yet"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Get started by creating your first conversational form."}
            </p>
            <Button
              onClick={handleCreateForm}
              isLoading={isCreating}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create your first form
            </Button>
          </div>
        )}
      </main>

      {/* Rename Modal */}
      <RenameFormModal
        isOpen={!!renameTarget}
        form={renameTarget}
        onClose={() => setRenameTarget(null)}
        onConfirm={handleRenameConfirm}
      />

      {/* Delete Modal */}
      <DeleteFormModal
        isOpen={!!deleteTarget}
        form={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
