from fastapi import APIRouter
from app.api.v1.forms import router as forms_router
from app.api.v1.questions import router as questions_router
from app.api.v1.public import router as public_router
from app.api.v1.responses import router as responses_router

api_router = APIRouter()
api_router.include_router(forms_router)
api_router.include_router(questions_router)
api_router.include_router(public_router)
api_router.include_router(responses_router)
