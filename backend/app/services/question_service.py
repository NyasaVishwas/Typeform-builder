import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.question_repository import QuestionRepository
from app.repositories.form_repository import FormRepository
from app.models.question import Question
from app.models.choice_option import ChoiceOption
from app.models.enums import QuestionType
from app.schemas import QuestionCreate, QuestionUpdate


class QuestionService:
    def __init__(self, db: Session):
        self.db = db
        self.q_repo = QuestionRepository(db)
        self.form_repo = FormRepository(db)

    def add_question(self, form_id: str, payload: QuestionCreate) -> Question:
        form = self.form_repo.get_by_id(form_id)
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID '{form_id}' not found."
            )

        # Enforce choice options requirement for multiple choice and dropdown
        if payload.type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
            if not payload.choice_options or len(payload.choice_options) < 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question type '{payload.type.value}' requires at least one choice option."
                )

        next_order = len(form.questions) + 1 if not payload.order else payload.order

        question = Question(
            id=str(uuid.uuid4()),
            form_id=form_id,
            type=payload.type,
            question_text=payload.question_text.strip(),
            description=payload.description,
            required=payload.required,
            order=next_order,
            config=payload.config
        )

        if payload.choice_options:
            for idx, opt_data in enumerate(payload.choice_options):
                opt = ChoiceOption(
                    id=str(uuid.uuid4()),
                    question_id=question.id,
                    label=opt_data.label.strip(),
                    value=opt_data.value.strip(),
                    order=opt_data.order if opt_data.order else idx + 1
                )
                question.choice_options.append(opt)

        return self.q_repo.create_question(question)

    def update_question(self, question_id: str, payload: QuestionUpdate) -> Question:
        question = self.q_repo.get_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found."
            )

        if payload.type is not None:
            question.type = payload.type
        if payload.question_text is not None:
            question.question_text = payload.question_text.strip()
        if payload.description is not None:
            question.description = payload.description
        if payload.required is not None:
            question.required = payload.required
        if payload.order is not None:
            question.order = payload.order
        if payload.config is not None:
            question.config = payload.config

        if payload.choice_options is not None:
            new_opts = [
                ChoiceOption(
                    id=str(uuid.uuid4()),
                    question_id=question_id,
                    label=opt.label.strip(),
                    value=opt.value.strip(),
                    order=idx + 1
                )
                for idx, opt in enumerate(payload.choice_options)
            ]
            self.q_repo.replace_choice_options(question_id, new_opts)

        return self.q_repo.update_question(question)

    def delete_question(self, question_id: str) -> None:
        question = self.q_repo.get_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found."
            )
        self.q_repo.delete_question(question)

    def reorder_questions(self, form_id: str, ordered_question_ids: List[str]) -> List[Question]:
        form = self.form_repo.get_by_id(form_id)
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID '{form_id}' not found."
            )
        return self.q_repo.reorder_questions(form_id, ordered_question_ids)
