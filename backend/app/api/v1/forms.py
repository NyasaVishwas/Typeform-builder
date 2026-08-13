from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.form_service import FormService
from app.schemas import FormCreate, FormUpdate, FormRead

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.get("", response_model=List[FormRead])
def list_forms(db: Session = Depends(get_db)):
    """
    List all forms created by creator with question and response counts.
    """
    service = FormService(db)
    return service.list_forms()


@router.post("", response_model=FormRead, status_code=status.HTTP_201_CREATED)
def create_form(payload: FormCreate, db: Session = Depends(get_db)):
    """
    Create a new form. Auto-generates unique slug if not explicitly supplied.
    """
    service = FormService(db)
    return service.create_form(payload)


@router.get("/{form_id}", response_model=FormRead)
def get_form(form_id: str, db: Session = Depends(get_db)):
    """
    Get full form details with ordered questions & choice options.
    """
    service = FormService(db)
    return service.get_form(form_id)


@router.patch("/{form_id}", response_model=FormRead)
def update_form(form_id: str, payload: FormUpdate, db: Session = Depends(get_db)):
    """
    Update form title, description, slug, status, or theme settings.
    """
    service = FormService(db)
    return service.update_form(form_id, payload)


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    """
    Delete form and cascade all questions, options, responses, and answers.
    """
    service = FormService(db)
    service.delete_form(form_id)
    return None


@router.post("/{form_id}/duplicate", response_model=FormRead, status_code=status.HTTP_201_CREATED)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    """
    Deep-copy form, its questions, and choice options (resets responses & sets status to draft).
    """
    service = FormService(db)
    return service.duplicate_form(form_id)


@router.post("/{form_id}/publish", response_model=FormRead)
def publish_form(form_id: str, db: Session = Depends(get_db)):
    """
    Publish form so it becomes accessible via public link.
    """
    service = FormService(db)
    return service.publish_form(form_id)


@router.post("/{form_id}/unpublish", response_model=FormRead)
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    """
    Unpublish form (reverts status to draft, public link becomes inaccessible).
    """
    service = FormService(db)
    return service.unpublish_form(form_id)
