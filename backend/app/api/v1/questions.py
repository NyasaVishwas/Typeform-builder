from typing import List
from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.question_service import QuestionService
from app.schemas import QuestionCreate, QuestionUpdate, QuestionRead, BaseModel

router = APIRouter(tags=["Questions"])


class ReorderPayload(BaseModel):
    question_ids: List[str]


@router.post("/forms/{form_id}/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
def add_question(form_id: str, payload: QuestionCreate, db: Session = Depends(get_db)):
    """
    Add a new question to a form.
    """
    service = QuestionService(db)
    return service.add_question(form_id, payload)


@router.patch("/questions/{question_id}", response_model=QuestionRead)
def update_question(question_id: str, payload: QuestionUpdate, db: Session = Depends(get_db)):
    """
    Edit an existing question's properties, type, config, or choice options.
    """
    service = QuestionService(db)
    return service.update_question(question_id, payload)


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    """
    Delete a question from a form.
    """
    service = QuestionService(db)
    service.delete_question(question_id)
    return None


@router.patch("/forms/{form_id}/questions/reorder", response_model=List[QuestionRead])
def reorder_questions(form_id: str, payload: ReorderPayload, db: Session = Depends(get_db)):
    """
    Reorder questions in a form by providing an ordered array of question IDs.
    """
    service = QuestionService(db)
    return service.reorder_questions(form_id, payload.question_ids)
