"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Question } from "@/types";
import { SortableQuestionCard } from "./SortableQuestionCard";
import { Button } from "@/components/ui/Button";

export interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (question: Question) => void;
  onReorder: (newQuestions: Question[]) => void;
  onAddQuestionClick: () => void;
  onDuplicateQuestion: (question: Question) => void;
  onDeleteQuestion: (question: Question) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onReorder,
  onAddQuestionClick,
  onDuplicateQuestion,
  onDeleteQuestion,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({
        ...q,
        order: idx + 1,
      }));

      onReorder(reordered);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/70 border-r border-slate-200/80 p-4 overflow-y-auto">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Questions ({questions.length})
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2.5">
            {questions.map((q, idx) => (
              <SortableQuestionCard
                key={q.id}
                question={q}
                index={idx}
                isSelected={selectedQuestionId === q.id}
                onSelect={onSelectQuestion}
                onDuplicate={onDuplicateQuestion}
                onDelete={onDeleteQuestion}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Question Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onAddQuestionClick}
        className="w-full mt-4 border-dashed border-slate-300 hover:border-slate-900 bg-white text-xs py-2.5"
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      >
        Add question
      </Button>
    </div>
  );
};
