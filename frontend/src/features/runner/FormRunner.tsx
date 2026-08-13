"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, Question, QuestionType } from "@/types";
import { submitResponse } from "@/lib/api";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { RunnerProgressBar } from "./RunnerProgressBar";
import { ThankYouScreen } from "./ThankYouScreen";

export interface FormRunnerProps {
  form: Form;
}

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export const FormRunner: React.FC<FormRunnerProps> = ({ form }) => {
  const questions = form.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Track start time for completion metadata
  const startTimeRef = useRef<number>(Date.now());

  const activeQuestion = questions[currentIndex];

  // Client-side Validation Logic (matching Phase 2 server rules)
  const validateCurrentQuestion = useCallback((): boolean => {
    if (!activeQuestion) return true;

    const val = answersMap[activeQuestion.id];
    const isValEmpty =
      val === undefined ||
      val === null ||
      val === "" ||
      (typeof val === "string" && val.trim() === "");

    // 1. Required field check
    if (activeQuestion.required && isValEmpty) {
      setValidationError("Please complete this required question before continuing.");
      return false;
    }

    if (isValEmpty) {
      setValidationError(null);
      return true;
    }

    const strVal = String(val).trim();

    // 2. Email format validation
    if (activeQuestion.type === QuestionType.EMAIL) {
      if (!EMAIL_REGEX.test(strVal)) {
        setValidationError("Please enter a valid email address (e.g. name@example.com).");
        return false;
      }
    }

    // 3. Number bounds validation
    if (activeQuestion.type === QuestionType.NUMBER) {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        setValidationError("Please enter a valid numeric value.");
        return false;
      }
      const min = activeQuestion.config?.min;
      const max = activeQuestion.config?.max;
      if (min !== undefined && numVal < min) {
        setValidationError(`Value must be greater than or equal to ${min}.`);
        return false;
      }
      if (max !== undefined && numVal > max) {
        setValidationError(`Value must be less than or equal to ${max}.`);
        return false;
      }
    }

    // 4. Rating bounds validation
    if (activeQuestion.type === QuestionType.RATING) {
      const numVal = Number(val);
      const minScale = activeQuestion.config?.min || 1;
      const maxScale = activeQuestion.config?.max || 5;
      if (isNaN(numVal) || numVal < minScale || numVal > maxScale) {
        setValidationError(`Please select a rating score between ${minScale} and ${maxScale}.`);
        return false;
      }
    }

    // 5. Choice options validation
    if (
      activeQuestion.type === QuestionType.MULTIPLE_CHOICE ||
      activeQuestion.type === QuestionType.DROPDOWN
    ) {
      const validOptions = new Set([
        ...(activeQuestion.choice_options?.map((o) => o.label) || []),
        ...(activeQuestion.choice_options?.map((o) => o.value) || []),
      ]);
      if (!validOptions.has(strVal)) {
        setValidationError("Please select one of the valid options provided.");
        return false;
      }
    }

    setValidationError(null);
    return true;
  }, [activeQuestion, answersMap]);

  // Answer change handler
  const handleAnswerChange = (newValue: any) => {
    setValidationError(null);
    setAnswersMap((prev) => ({
      ...prev,
      [activeQuestion.id]: newValue,
    }));

    // Auto-advance for Multiple Choice or Yes/No after 300ms
    if (
      activeQuestion.type === QuestionType.MULTIPLE_CHOICE ||
      activeQuestion.type === QuestionType.YES_NO
    ) {
      setTimeout(() => {
        handleNextStep();
      }, 300);
    }
  };

  // Final Response Submission Handler
  const executeSubmission = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    const completionTimeSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const formattedAnswers = Object.entries(answersMap)
      .map(([qId, val]) => {
        const q = questions.find((item) => item.id === qId);
        const isNum = q?.type === QuestionType.NUMBER || q?.type === QuestionType.RATING;

        const isBlank =
          val === undefined ||
          val === null ||
          val === "" ||
          (typeof val === "string" && val.trim() === "");

        if (isBlank) return null;

        return {
          question_id: qId,
          value_text: String(val),
          value_number: isNum ? Number(val) : null,
        };
      })
      .filter(Boolean);

    try {
      await submitResponse(form.slug, {
        completion_time_seconds: completionTimeSeconds,
        answers: formattedAnswers,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step Forward / Next Handler
  const handleNextStep = () => {
    if (!validateCurrentQuestion()) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      executeSubmission();
    }
  };

  // Step Backward / Previous Handler
  const handlePrevStep = () => {
    setValidationError(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Global Keyboard Shortcuts (Enter, Arrow Up, Arrow Down, Letter Keys A-D)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside textarea or text input
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "textarea" || targetTag === "input" || targetTag === "select") {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleNextStep();
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevStep();
      } else if (
        activeQuestion &&
        activeQuestion.type === QuestionType.MULTIPLE_CHOICE &&
        activeQuestion.choice_options
      ) {
        // Support keys A, B, C, D to pick multiple choice options
        const char = e.key.toUpperCase();
        const letterIndex = char.charCodeAt(0) - 65; // A -> 0, B -> 1
        if (letterIndex >= 0 && letterIndex < activeQuestion.choice_options.length) {
          e.preventDefault();
          const targetOpt = activeQuestion.choice_options[letterIndex];
          handleAnswerChange(targetOpt.label);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentIndex, activeQuestion, validateCurrentQuestion, handleNextStep, handlePrevStep]);

  if (isSubmitted) {
    return (
      <ThankYouScreen
        formTitle={form.title}
        onRestart={() => {
          setAnswersMap({});
          setCurrentIndex(0);
          setIsSubmitted(false);
          startTimeRef.current = Date.now();
        }}
      />
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top Header & Progress Bar */}
      <div>
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-xs">
          <span className="font-bold text-sm text-slate-900 tracking-tight">
            {form.title}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[10px] font-mono text-slate-600">Enter ↵</kbd> to advance
          </span>
        </header>

        <RunnerProgressBar currentIndex={currentIndex} totalQuestions={questions.length} />
      </div>

      {/* Main Single Question Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-98 duration-200">
        {activeQuestion ? (
          <QuestionRenderer
            question={activeQuestion}
            questionNumber={currentIndex + 1}
            value={answersMap[activeQuestion.id]}
            onChange={handleAnswerChange}
            onSubmit={handleNextStep}
            error={validationError}
          />
        ) : (
          <div className="text-slate-400 text-sm">No questions available.</div>
        )}
      </main>

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="mx-auto max-w-md my-2 p-3 bg-red-950 text-red-200 border border-red-800 rounded-xl text-xs flex items-center justify-between gap-3">
          <span>{submissionError}</span>
          <button
            onClick={executeSubmission}
            className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white font-semibold rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bottom Step Navigation Bar */}
      <footer className="px-6 py-4 border-t border-slate-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentIndex === 0 || isSubmitting}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous question (Up Arrow)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next question (Down Arrow)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Submit / Next Button */}
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isSubmitting}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-sm flex items-center gap-2 ${
            isLastQuestion
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          } ${isSubmitting ? "opacity-60 cursor-wait" : ""}`}
        >
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : isLastQuestion ? (
            <>
              <span>Submit Response</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              <span>OK</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};
