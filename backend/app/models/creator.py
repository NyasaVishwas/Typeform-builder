from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Creator(Base):
    """
    Simplified single-creator entity for authentication-less single creator mode.
    Documented assumption: System assumes a single default creator ('creator_default_1')
    to simplify user management for this evaluation project.
    """
    __tablename__ = "creators"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    forms: Mapped[list["Form"]] = relationship(
        "Form",
        back_populates="creator",
        cascade="all, delete-orphan"
    )
