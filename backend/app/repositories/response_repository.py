from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.response import Response
from app.models.answer import Answer
from app.models.question import Question


class ResponseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_response(self, response: Response, answers: List[Answer]) -> Response:
        """
        Save response and answers transactionally in a single commit.
        """
        self.db.add(response)
        self.db.flush()
        for ans in answers:
            ans.response_id = response.id
            self.db.add(ans)
        self.db.commit()
        self.db.refresh(response)
        return response

    def get_form_responses(self, form_id: str) -> List[Response]:
        """
        List all responses for a form ordered by submitted_at desc.
        """
        return (
            self.db.query(Response)
            .options(joinedload(Response.answers))
            .filter(Response.form_id == form_id)
            .order_by(Response.submitted_at.desc())
            .all()
        )

    def get_response_by_id(self, form_id: str, response_id: str) -> Optional[Response]:
        """
        Get a single response joined with its answers.
        """
        return (
            self.db.query(Response)
            .options(joinedload(Response.answers).joinedload(Answer.question))
            .filter(Response.form_id == form_id, Response.id == response_id)
            .first()
        )

    def get_answers_for_form(self, form_id: str) -> List[Answer]:
        """
        Get all answers submitted across all responses for a form.
        """
        return (
            self.db.query(Answer)
            .join(Response, Answer.response_id == Response.id)
            .filter(Response.form_id == form_id)
            .all()
        )
