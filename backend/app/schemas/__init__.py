from app.models.enums import QuestionType, FormStatus
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# Choice Option Schemas
class ChoiceOptionBase(BaseModel):
    label: str = Field(..., min_length=1, max_length=255)
    value: str = Field(..., min_length=1, max_length=255)
    order: int = Field(0, ge=0)


class ChoiceOptionCreate(ChoiceOptionBase):
    pass


class ChoiceOptionRead(ChoiceOptionBase):
    id: str
    question_id: str
    model_config = ConfigDict(from_attributes=True)


# Question Schemas
class QuestionBase(BaseModel):
    type: QuestionType
    question_text: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    required: bool = False
    order: int = Field(0, ge=0)
    config: Optional[Dict[str, Any]] = None


class QuestionCreate(QuestionBase):
    choice_options: Optional[List[ChoiceOptionCreate]] = None


class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    question_text: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    required: Optional[bool] = None
    order: Optional[int] = Field(None, ge=0)
    config: Optional[Dict[str, Any]] = None
    choice_options: Optional[List[ChoiceOptionCreate]] = None


class QuestionRead(QuestionBase):
    id: str
    form_id: str
    created_at: datetime
    updated_at: datetime
    choice_options: List[ChoiceOptionRead] = []
    model_config = ConfigDict(from_attributes=True)


# Form Schemas
class ThemeSettings(BaseModel):
    accent_color: str = "#0F172A"
    font_family: str = "Inter"


class FormBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    slug: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    status: FormStatus = FormStatus.DRAFT
    theme_settings: Optional[Dict[str, Any]] = None


class FormCreate(FormBase):
    questions: Optional[List[QuestionCreate]] = None


class FormUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    slug: Optional[str] = Field(None, min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    status: Optional[FormStatus] = None
    theme_settings: Optional[Dict[str, Any]] = None


class FormRead(FormBase):
    id: str
    creator_id: str
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionRead] = []
    response_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)


# Answer Schemas
class AnswerSubmit(BaseModel):
    question_id: str
    value_text: Optional[str] = None
    value_number: Optional[float] = None
    value_json: Optional[Any] = None


class AnswerRead(BaseModel):
    id: str
    response_id: str
    question_id: str
    value_text: Optional[str] = None
    value_number: Optional[float] = None
    value_json: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True)


# Response Schemas
class ResponseSubmit(BaseModel):
    completion_time_seconds: Optional[int] = None
    answers: List[AnswerSubmit]


class ResponseRead(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    completion_time_seconds: Optional[int] = None
    answers: List[AnswerRead] = []
    model_config = ConfigDict(from_attributes=True)
