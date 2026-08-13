from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.question import Question
from app.models.choice_option import ChoiceOption


class QuestionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, question_id: str) -> Optional[Question]:
        return (
            self.db.query(Question)
            .options(joinedload(Question.choice_options))
            .filter(Question.id == question_id)
            .first()
        )

    def create_question(self, question: Question) -> Question:
        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def update_question(self, question: Question) -> Question:
        self.db.commit()
        self.db.refresh(question)
        return question

    def delete_question(self, question: Question) -> None:
        self.db.delete(question)
        self.db.commit()

    def replace_choice_options(self, question_id: str, new_options: List[ChoiceOption]) -> None:
        """
        Delete existing choice options for a question and insert new list.
        """
        self.db.query(ChoiceOption).filter(ChoiceOption.question_id == question_id).delete()
        for opt in new_options:
            opt.question_id = question_id
            self.db.add(opt)
        self.db.commit()

    def reorder_questions(self, form_id: str, ordered_question_ids: List[str]) -> List[Question]:
        """
        Update order positions for questions belonging to a form.
        """
        questions = self.db.query(Question).filter(Question.form_id == form_id).all()
        q_map = {q.id: q for q in questions}

        for idx, q_id in enumerate(ordered_question_ids):
            if q_id in q_map:
                q_map[q_id].order = idx + 1

        self.db.commit()
        return (
            self.db.query(Question)
            .filter(Question.form_id == form_id)
            .order_by(Question.order.asc())
            .all()
        )
