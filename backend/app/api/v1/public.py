from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.response_service import ResponseService
from app.schemas import FormRead, ResponseSubmit, ResponseRead

router = APIRouter(prefix="/public/forms", tags=["Public Respondent"])


@router.get("/{slug}", response_model=FormRead)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    """
    Get published form structure for conversational respondent runner.
    Returns 404 if form is in draft status or does not exist.
    """
    service = ResponseService(db)
    return service.get_public_form(slug)


@router.post("/{slug}/responses", response_model=ResponseRead, status_code=status.HTTP_201_CREATED)
def submit_response(slug: str, payload: ResponseSubmit, db: Session = Depends(get_db)):
    """
    Submit full form response with server-side transactional validation.
    """
    service = ResponseService(db)
    return service.submit_response(slug, payload)
