import re
import uuid
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.form_repository import FormRepository
from app.repositories.response_repository import ResponseRepository
from app.models.response import Response
from app.models.answer import Answer
from app.models.enums import FormStatus, QuestionType
from app.schemas import ResponseSubmit, ResponseRead, AnswerRead

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class ResponseService:
    def __init__(self, db: Session):
        self.db = db
        self.form_repo = FormRepository(db)
        self.resp_repo = ResponseRepository(db)

    def get_public_form(self, slug: str):
        """
        Fetch public form for respondent runner.
        Must be in PUBLISHED status; raises 404 if draft or missing.
        """
        form = self.form_repo.get_by_slug(slug)
        if not form or form.status != FormStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Public form with link '{slug}' not found or not published."
            )
        return form

    def submit_response(self, slug: str, payload: ResponseSubmit) -> Response:
        """
        Validate and submit a response transactionally.
        """
        form = self.get_public_form(slug)
        
        # Build map of valid questions for this form
        questions_by_id = {q.id: q for q in form.questions}
        answers_by_q_id: Dict[str, Any] = {}

        for ans in payload.answers:
            # Rule: question_id in answer must belong to this form
            if ans.question_id not in questions_by_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question ID '{ans.question_id}' does not belong to form '{form.title}'."
                )
            answers_by_q_id[ans.question_id] = ans

        db_answers: List[Answer] = []

        # Server-side Validation across all questions
        for q_id, q in questions_by_id.items():
            ans_payload = answers_by_q_id.get(q_id)
            val_text = ans_payload.value_text.strip() if (ans_payload and ans_payload.value_text) else None
            val_num = ans_payload.value_number if ans_payload else None
            val_json = ans_payload.value_json if ans_payload else None

            # 1. Required field check
            is_empty = (
                val_text is None or val_text == ""
            ) and (
                val_num is None
            ) and (
                val_json is None
            )

            if q.required and is_empty:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Question '{q.question_text}' is required."
                )

            if is_empty:
                continue

            # 2. Type-specific validations
            if q.type == QuestionType.EMAIL:
                if val_text and not EMAIL_REGEX.match(val_text):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Invalid email address provided for '{q.question_text}'."
                    )

            elif q.type == QuestionType.NUMBER:
                if val_num is None and val_text is not None:
                    try:
                        val_num = float(val_text)
                    except ValueError:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"Answer for '{q.question_text}' must be numeric."
                        )
                if val_num is not None and q.config:
                    min_val = q.config.get("min")
                    max_val = q.config.get("max")
                    if min_val is not None and val_num < min_val:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"Answer for '{q.question_text}' must be >= {min_val}."
                        )
                    if max_val is not None and val_num > max_val:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"Answer for '{q.question_text}' must be <= {max_val}."
                        )

            elif q.type == QuestionType.RATING:
                if val_num is None and val_text is not None:
                    try:
                        val_num = float(val_text)
                    except ValueError:
                        pass
                if val_num is None:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Rating for '{q.question_text}' must be numeric."
                    )
                min_rating = (q.config or {}).get("min", 1)
                max_rating = (q.config or {}).get("max", 5)
                if not (min_rating <= val_num <= max_rating):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Rating score for '{q.question_text}' must be between {min_rating} and {max_rating}."
                    )

            elif q.type == QuestionType.YES_NO:
                valid_yes_no = {"yes", "no", "true", "false"}
                if val_text and val_text.lower() not in valid_yes_no:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Answer for '{q.question_text}' must be 'Yes' or 'No'."
                    )

            elif q.type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
                valid_options = {opt.value for opt in q.choice_options} | {opt.label for opt in q.choice_options}
                selected_val = val_text or (str(val_json) if val_json else None)
                if selected_val and selected_val not in valid_options:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Selected option '{selected_val}' is invalid for question '{q.question_text}'."
                    )

            db_answer = Answer(
                id=str(uuid.uuid4()),
                question_id=q.id,
                value_text=val_text,
                value_number=val_num,
                value_json=val_json
            )
            db_answers.append(db_answer)

        response = Response(
            id=str(uuid.uuid4()),
            form_id=form.id,
            completion_time_seconds=payload.completion_time_seconds
        )

        return self.resp_repo.create_response(response, db_answers)

    def list_responses(self, form_id: str) -> List[Response]:
        form = self.form_repo.get_by_id(form_id)
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID '{form_id}' not found."
            )
        return self.resp_repo.get_form_responses(form_id)

    def get_response_detail(self, form_id: str, response_id: str) -> dict:
        form = self.form_repo.get_by_id(form_id)
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID '{form_id}' not found."
            )

        resp = self.resp_repo.get_response_by_id(form_id, response_id)
        if not resp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Response with ID '{response_id}' not found for form '{form_id}'."
            )

        # Build response joined with question details
        answers_detailed = []
        for ans in resp.answers:
            q = ans.question
            answers_detailed.append({
                "id": ans.id,
                "question_id": ans.question_id,
                "question_text": q.question_text if q else "Deleted Question",
                "question_type": q.type if q else None,
                "value_text": ans.value_text,
                "value_number": ans.value_number,
                "value_json": ans.value_json,
            })

        return {
            "id": resp.id,
            "form_id": resp.form_id,
            "submitted_at": resp.submitted_at,
            "completion_time_seconds": resp.completion_time_seconds,
            "answers": answers_detailed
        }
