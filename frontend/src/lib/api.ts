import { Form, FormStatus, Question, ResponseData } from "@/types";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, "");

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// FORMS API
export async function getForms(): Promise<Form[]> {
  return fetcher<Form[]>("/forms");
}

export async function getForm(id: string): Promise<Form> {
  return fetcher<Form>(`/forms/${id}`);
}

export async function createForm(payload: { title: string; description?: string; slug?: string }): Promise<Form> {
  return fetcher<Form>("/forms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateForm(
  id: string,
  payload: { title?: string; description?: string; slug?: string; status?: FormStatus; theme_settings?: any }
): Promise<Form> {
  return fetcher<Form>(`/forms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteForm(id: string): Promise<void> {
  return fetcher<void>(`/forms/${id}`, {
    method: "DELETE",
  });
}

export async function duplicateForm(id: string): Promise<Form> {
  return fetcher<Form>(`/forms/${id}/duplicate`, {
    method: "POST",
  });
}

export async function publishForm(id: string): Promise<Form> {
  return fetcher<Form>(`/forms/${id}/publish`, {
    method: "POST",
  });
}

export async function unpublishForm(id: string): Promise<Form> {
  return fetcher<Form>(`/forms/${id}/unpublish`, {
    method: "POST",
  });
}

// QUESTIONS API
export async function addQuestion(formId: string, payload: any): Promise<Question> {
  return fetcher<Question>(`/forms/${formId}/questions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateQuestion(questionId: string, payload: any): Promise<Question> {
  return fetcher<Question>(`/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteQuestion(questionId: string): Promise<void> {
  return fetcher<void>(`/questions/${questionId}`, {
    method: "DELETE",
  });
}

export async function reorderQuestions(formId: string, questionIds: string[]): Promise<Question[]> {
  return fetcher<Question[]>(`/forms/${formId}/questions/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ question_ids: questionIds }),
  });
}

// PUBLIC RESPONDENT API
export async function getPublicForm(slug: string): Promise<Form> {
  return fetcher<Form>(`/public/forms/${slug}`);
}

export async function submitResponse(slug: string, payload: { completion_time_seconds?: number; answers: any[] }): Promise<ResponseData> {
  return fetcher<ResponseData>(`/public/forms/${slug}/responses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// RESPONSES & STATISTICS API
export async function getFormResponses(formId: string): Promise<ResponseData[]> {
  return fetcher<ResponseData[]>(`/forms/${formId}/responses`);
}

export async function getResponseDetail(formId: string, responseId: string): Promise<any> {
  return fetcher<any>(`/forms/${formId}/responses/${responseId}`);
}

export async function getFormStatistics(formId: string): Promise<any> {
  return fetcher<any>(`/forms/${formId}/statistics`);
}
