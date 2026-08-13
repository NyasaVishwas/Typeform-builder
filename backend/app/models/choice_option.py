import uuid
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class ChoiceOption(Base):
    """
    Choice options for Multiple Choice and Dropdown questions.
    """
    __tablename__ = "choice_options"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    question_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column("order", Integer, nullable=False, default=0, index=True)

    # Relationships
    question: Mapped["Question"] = relationship("Question", back_populates="choice_options")
