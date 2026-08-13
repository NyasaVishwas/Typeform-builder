from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.response_service import ResponseService
from app.services.statistics_service import StatisticsService
from app.schemas import ResponseRead

router = APIRouter(prefix="/forms", tags=["Responses & Analytics"])


@router.get("/{form_id}/responses", response_model=List[ResponseRead])
def list_responses(form_id: str, db: Session = Depends(get_db)):
    """
    List all responses submitted for a form.
    """
    service = ResponseService(db)
    return service.list_responses(form_id)


@router.get("/{form_id}/responses/{response_id}")
def get_response_detail(form_id: str, response_id: str, db: Session = Depends(get_db)):
    """
    Get a single response joined with all answers and question text/type definitions.
    """
    service = ResponseService(db)
    return service.get_response_detail(form_id, response_id)


@router.get("/{form_id}/statistics")
def get_form_statistics(form_id: str, db: Session = Depends(get_db)):
    """
    Get aggregated per-question statistics, option distributions, and completion stats.
    """
    stats_service = StatisticsService(db)
    return stats_service.calculate_form_statistics(form_id)
