import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import QuestionType


class Question(Base):
    """
    Question model belonging to a Form.
    Restricted to fixed QuestionType enum.
    """
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    form_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("forms.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    type: Mapped[QuestionType] = mapped_column(
        SQLEnum(QuestionType, native_enum=False),
        nullable=False,
        index=True
    )
    question_text: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order: Mapped[int] = mapped_column("order", Integer, nullable=False, default=0, index=True)
    config: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    form: Mapped["Form"] = relationship("Form", back_populates="questions")
    choice_options: Mapped[List["ChoiceOption"]] = relationship(
        "ChoiceOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="ChoiceOption.order"
    )
    answers: Mapped[List["Answer"]] = relationship(
        "Answer",
        back_populates="question",
        cascade="all, delete-orphan"
    )
