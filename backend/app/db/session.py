import os
import re
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


def create_sqlite_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite"):
        # Remove sqlite:/// or sqlite://// prefix to extract filesystem path
        clean_path = re.sub(r"^sqlite:///?", "", db_url)
        db_dir = os.path.dirname(clean_path)
        if db_dir and db_dir != ".":
            try:
                os.makedirs(db_dir, exist_ok=True)
            except Exception:
                # Fallback to current working directory if path /var/data is not writeable
                db_url = "sqlite:///./typeform_builder.db"

    try:
        connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
        eng = create_engine(db_url, connect_args=connect_args, echo=False)
        # Test connection immediately
        with eng.connect() as conn:
            pass
        return eng, db_url
    except Exception:
        # Fallback to local project directory SQLite file
        fallback_url = "sqlite:///./typeform_builder.db"
        eng = create_engine(fallback_url, connect_args={"check_same_thread": False}, echo=False)
        return eng, fallback_url


engine, active_db_url = create_sqlite_engine()

# Enable foreign keys for SQLite
if active_db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency generator for FastAPI endpoints to get a DB session.
    Automatically closes session after request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
