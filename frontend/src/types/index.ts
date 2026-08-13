export enum QuestionType {
  SHORT_TEXT = "short_text",
  LONG_TEXT = "long_text",
  MULTIPLE_CHOICE = "multiple_choice",
  DROPDOWN = "dropdown",
  EMAIL = "email",
  NUMBER = "number",
  YES_NO = "yes_no",
  RATING = "rating",
}

export enum FormStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export interface ChoiceOption {
  id?: string;
  question_id?: string;
  label: string;
  value: string;
  order: number;
}

export interface QuestionConfig {
  min?: number;
  max?: number;
  low_label?: string;
  high_label?: string;
  placeholder?: string;
  [key: string]: any;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  question_text: string;
  description?: string | null;
  required: boolean;
  order: number;
  config?: QuestionConfig | null;
  choice_options: ChoiceOption[];
  created_at?: string;
  updated_at?: string;
}

export interface ThemeSettings {
  accent_color: string;
  font_family: string;
  [key: string]: any;
}

export interface Form {
  id: string;
  creator_id: string;
  title: string;
  description?: string | null;
  slug: string;
  status: FormStatus;
  theme_settings?: ThemeSettings | null;
  questions: Question[];
  response_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AnswerSubmit {
  question_id: string;
  value_text?: string | null;
  value_number?: number | null;
  value_json?: any | null;
}

export interface ResponseSubmit {
  completion_time_seconds?: number | null;
  answers: AnswerSubmit[];
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  value_text?: string | null;
  value_number?: number | null;
  value_json?: any | null;
}

export interface ResponseData {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time_seconds?: number | null;
  answers: Answer[];
}
