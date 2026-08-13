import re
import uuid
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.form_repository import FormRepository
from app.models.form import Form
from app.models.question import Question
from app.models.choice_option import ChoiceOption
from app.models.enums import FormStatus
from app.schemas import FormCreate, FormUpdate


class FormService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FormRepository(db)

    def _generate_slug(self, title: str) -> str:
        """
        Generate a URL-friendly slug from title.
        """
        base_slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        if not base_slug:
            base_slug = "untitled-form"
        
        slug = base_slug
        counter = 1
        while self.repo.is_slug_taken(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def list_forms(self, creator_id: str = "creator_default_1") -> List[dict]:
        return self.repo.get_all_forms(creator_id)

    def get_form(self, form_id: str) -> Form:
        form = self.repo.get_by_id(form_id)
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID '{form_id}' not found."
            )
        return form

    def create_form(self, payload: FormCreate, creator_id: str = "creator_default_1") -> Form:
        slug = payload.slug.strip() if payload.slug else self._generate_slug(payload.title)
        if self.repo.is_slug_taken(slug):
            slug = self._generate_slug(payload.title)

        form = Form(
            id=str(uuid.uuid4()),
            creator_id=creator_id,
            title=payload.title.strip(),
            description=payload.description,
            slug=slug,
            status=payload.status,
            theme_settings=payload.theme_settings or {"accent_color": "#0F172A", "font_family": "Inter"}
        )

        if payload.questions:
            for idx, q_data in enumerate(payload.questions):
                q = Question(
                    id=str(uuid.uuid4()),
                    form_id=form.id,
                    type=q_data.type,
                    question_text=q_data.question_text,
                    description=q_data.description,
                    required=q_data.required,
                    order=idx + 1,
                    config=q_data.config
                )
                if q_data.choice_options:
                    for opt_idx, opt_data in enumerate(q_data.choice_options):
                        opt = ChoiceOption(
                            id=str(uuid.uuid4()),
                            question_id=q.id,
                            label=opt_data.label,
                            value=opt_data.value,
                            order=opt_idx + 1
                        )
                        q.choice_options.append(opt)
                form.questions.append(q)

        return self.repo.create(form)

    def update_form(self, form_id: str, payload: FormUpdate) -> Form:
        form = self.get_form(form_id)

        if payload.title is not None:
            form.title = payload.title.strip()
        if payload.description is not None:
            form.description = payload.description
        if payload.slug is not None and payload.slug != form.slug:
            clean_slug = payload.slug.strip()
            if self.repo.is_slug_taken(clean_slug, exclude_form_id=form.id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Slug '{clean_slug}' is already taken."
                )
            form.slug = clean_slug
        if payload.status is not None:
            form.status = payload.status
        if payload.theme_settings is not None:
            form.theme_settings = payload.theme_settings

        return self.repo.update(form)

    def delete_form(self, form_id: str) -> None:
        form = self.get_form(form_id)
        self.repo.delete(form)

    def duplicate_form(self, form_id: str) -> Form:
        """
        Deep-copy form, its questions, and choice options.
        Resets response counts and sets status to DRAFT.
        """
        source_form = self.get_form(form_id)

        new_title = f"Copy of {source_form.title}"
        new_slug = self._generate_slug(f"{source_form.slug}-copy")

        new_form = Form(
            id=str(uuid.uuid4()),
            creator_id=source_form.creator_id,
            title=new_title,
            description=source_form.description,
            slug=new_slug,
            status=FormStatus.DRAFT,
            theme_settings=source_form.theme_settings
        )

        for q in source_form.questions:
            new_q = Question(
                id=str(uuid.uuid4()),
                form_id=new_form.id,
                type=q.type,
                question_text=q.question_text,
                description=q.description,
                required=q.required,
                order=q.order,
                config=q.config
            )
            for opt in q.choice_options:
                new_opt = ChoiceOption(
                    id=str(uuid.uuid4()),
                    question_id=new_q.id,
                    label=opt.label,
                    value=opt.value,
                    order=opt.order
                )
                new_q.choice_options.append(new_opt)
            new_form.questions.append(new_q)

        return self.repo.create(new_form)

    def publish_form(self, form_id: str) -> Form:
        form = self.get_form(form_id)
        form.status = FormStatus.PUBLISHED
        return self.repo.update(form)

    def unpublish_form(self, form_id: str) -> Form:
        form = self.get_form(form_id)
        form.status = FormStatus.DRAFT
        return self.repo.update(form)
