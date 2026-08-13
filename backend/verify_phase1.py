import sys
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.db.seed import seed_db
from app.models.form import Form
from app.models.question import Question
from app.models.choice_option import ChoiceOption
from app.models.response import Response
from app.models.answer import Answer
from app.models.creator import Creator


def verify_db():
    print("=== Step 1: Create Tables ===")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    print("\n=== Step 2: Run Seed Script (First Run) ===")
    with Session(engine) as session:
        seed_db(session)

    print("\n=== Step 3: Verify Data Counts ===")
    with Session(engine) as session:
        creator_count = session.query(Creator).count()
        form_count = session.query(Form).count()
        question_count = session.query(Question).count()
        option_count = session.query(ChoiceOption).count()
        response_count = session.query(Response).count()
        answer_count = session.query(Answer).count()

        print(f"Creators: {creator_count}")
        print(f"Forms: {form_count}")
        print(f"Questions: {question_count}")
        print(f"Choice Options: {option_count}")
        print(f"Responses: {response_count}")
        print(f"Answers: {answer_count}")

        assert creator_count == 1, "Expected 1 creator"
        assert form_count == 3, "Expected 3 forms"
        assert question_count == 14, "Expected 14 questions total"
        assert option_count == 14, f"Expected 14 choice options total, got {option_count}"
        assert response_count == 7, "Expected 7 responses total"
        assert answer_count == 37, f"Expected 37 answers total, got {answer_count}"

        # Verify forms detail
        pub_forms = session.query(Form).filter(Form.status == "published").all()
        draft_forms = session.query(Form).filter(Form.status == "draft").all()
        print(f"\nPublished forms: {[f.title + ' (' + f.slug + ')' for f in pub_forms]}")
        print(f"Draft forms: {[f.title + ' (' + f.slug + ')' for f in draft_forms]}")

        # Verify Question types present
        q_types = set(q.type.value for q in session.query(Question).all())
        print(f"Question types present in DB: {sorted(list(q_types))}")

    print("\n=== Step 4: Re-run Seed Script (Idempotency Check) ===")
    with Session(engine) as session:
        seed_db(session)
        form_count_after = session.query(Form).count()
        assert form_count_after == form_count, "Idempotency failed: form count changed on re-run"
        print("Idempotency verified: re-running seed did not duplicate data.")

    print("\n=== PHASE 1 BACKEND VERIFICATION SUCCESSFUL! ===")


if __name__ == "__main__":
    verify_db()
