import os
import re
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Ensure parent directory exists for SQLite database files
if settings.DATABASE_URL.startswith("sqlite"):
    # Remove sqlite:/// prefix (handles 3 or 4 slashes)
    clean_path = re.sub(r"^sqlite:///", "", settings.DATABASE_URL)
    db_dir = os.path.dirname(clean_path)
    if db_dir and db_dir != ".":
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception:
            pass

# Create engine with connect_args for SQLite
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# Enable foreign keys for SQLite
if settings.DATABASE_URL.startswith("sqlite"):
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
