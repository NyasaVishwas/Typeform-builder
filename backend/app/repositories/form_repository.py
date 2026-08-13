from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.form import Form
from app.models.question import Question
from app.models.choice_option import ChoiceOption
from app.models.response import Response
from app.models.answer import Answer
from app.models.enums import FormStatus


class FormRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_forms(self, creator_id: str = "creator_default_1") -> List[dict]:
        """
        List all forms for creator along with question count and response count.
        """
        forms = (
            self.db.query(Form)
            .filter(Form.creator_id == creator_id)
            .order_by(Form.updated_at.desc())
            .all()
        )
        
        result = []
        for form in forms:
            response_count = self.db.query(Response).filter(Response.form_id == form.id).count()
            question_count = len(form.questions)
            form_dict = {
                "id": form.id,
                "creator_id": form.creator_id,
                "title": form.title,
                "description": form.description,
                "slug": form.slug,
                "status": form.status,
                "theme_settings": form.theme_settings,
                "created_at": form.created_at,
                "updated_at": form.updated_at,
                "question_count": question_count,
                "response_count": response_count
            }
            result.append(form_dict)
        return result

    def get_by_id(self, form_id: str) -> Optional[Form]:
        """
        Get form by ID with eager loaded questions & choice options.
        """
        return (
            self.db.query(Form)
            .options(
                joinedload(Form.questions).joinedload(Question.choice_options)
            )
            .filter(Form.id == form_id)
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[Form]:
        """
        Get form by unique slug.
        """
        return (
            self.db.query(Form)
            .options(
                joinedload(Form.questions).joinedload(Question.choice_options)
            )
            .filter(Form.slug == slug)
            .first()
        )

    def create(self, form: Form) -> Form:
        self.db.add(form)
        self.db.commit()
        self.db.refresh(form)
        return form

    def update(self, form: Form) -> Form:
        self.db.commit()
        self.db.refresh(form)
        return form

    def delete(self, form: Form) -> None:
        self.db.delete(form)
        self.db.commit()

    def is_slug_taken(self, slug: str, exclude_form_id: Optional[str] = None) -> bool:
        query = self.db.query(Form).filter(Form.slug == slug)
        if exclude_form_id:
            query = query.filter(Form.id != exclude_form_id)
        return query.first() is not None
