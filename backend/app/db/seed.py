from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.enums import QuestionType, FormStatus
from app.models.creator import Creator
from app.models.form import Form
from app.models.question import Question
from app.models.choice_option import ChoiceOption
from app.models.response import Response
from app.models.answer import Answer


DEFAULT_CREATOR_ID = "creator_default_1"


def seed_db(db: Session) -> None:
    """
    Idempotent database seeder.
    Populates default creator, 3 realistic forms, questions across all 8 types,
    and historical responses so dashboards and analytics look immediately alive.
    """
    # 1. Ensure Default Creator
    existing_creator = db.query(Creator).filter(Creator.id == DEFAULT_CREATOR_ID).first()
    if not existing_creator:
        creator = Creator(
            id=DEFAULT_CREATOR_ID,
            email="creator@typeformbuilder.com",
            name="Default Creator"
        )
        db.add(creator)
        db.commit()
    
    # 2. Check if forms are already seeded
    existing_forms_count = db.query(Form).count()
    if existing_forms_count > 0:
        print("[Seed] Database already seeded. Skipping...")
        return

    print("[Seed] Seeding database with realistic forms, questions, and responses...")
    now = datetime.now(timezone.utc)

    # ---------------------------------------------------------
    # FORM 1: Customer Satisfaction Survey (Published)
    # ---------------------------------------------------------
    form1 = Form(
        id="form_customer_satisfaction",
        creator_id=DEFAULT_CREATOR_ID,
        title="Customer Satisfaction Survey",
        description="Help us improve our SaaS platform by providing your candid feedback.",
        slug="customer-satisfaction",
        status=FormStatus.PUBLISHED,
        theme_settings={"accent_color": "#0F172A", "font_family": "Inter"},
        created_at=now - timedelta(days=5),
        updated_at=now - timedelta(days=5)
    )
    db.add(form1)
    db.flush()

    # Questions for Form 1
    q1_1 = Question(
        id="q1_rating",
        form_id=form1.id,
        type=QuestionType.RATING,
        question_text="Overall, how satisfied are you with our product?",
        description="Select a score from 1 (Very Dissatisfied) to 5 (Extremely Satisfied).",
        required=True,
        order=1,
        config={"min": 1, "max": 5, "low_label": "Very Dissatisfied", "high_label": "Extremely Satisfied"}
    )
    q1_2 = Question(
        id="q1_feature",
        form_id=form1.id,
        type=QuestionType.SHORT_TEXT,
        question_text="Which primary feature or workflow do you use the most?",
        description="e.g. Form Builder, Live Analytics, Webhooks",
        required=True,
        order=2,
        config={"placeholder": "e.g. Form Builder"}
    )
    q1_3 = Question(
        id="q1_frequency",
        form_id=form1.id,
        type=QuestionType.MULTIPLE_CHOICE,
        question_text="How often do you interact with our platform?",
        required=False,
        order=3
    )
    q1_4 = Question(
        id="q1_recommend",
        form_id=form1.id,
        type=QuestionType.YES_NO,
        question_text="Would you recommend Typeform Builder to a colleague?",
        required=True,
        order=4
    )
    q1_5 = Question(
        id="q1_feedback",
        form_id=form1.id,
        type=QuestionType.LONG_TEXT,
        question_text="What is one thing we could improve to make your experience better?",
        required=False,
        order=5,
        config={"placeholder": "Share your thoughts..."}
    )
    q1_6 = Question(
        id="q1_email",
        form_id=form1.id,
        type=QuestionType.EMAIL,
        question_text="What email address can we reach you at for follow-up questions?",
        required=False,
        order=6,
        config={"placeholder": "name@company.com"}
    )

    db.add_all([q1_1, q1_2, q1_3, q1_4, q1_5, q1_6])
    db.flush()

    # Options for Q1_3 (Multiple Choice)
    opt1_3 = [
        ChoiceOption(id="opt_q1_3_1", question_id=q1_3.id, label="Daily", value="daily", order=1),
        ChoiceOption(id="opt_q1_3_2", question_id=q1_3.id, label="Weekly", value="weekly", order=2),
        ChoiceOption(id="opt_q1_3_3", question_id=q1_3.id, label="Monthly", value="monthly", order=3),
        ChoiceOption(id="opt_q1_3_4", question_id=q1_3.id, label="Rarely", value="rarely", order=4),
    ]
    db.add_all(opt1_3)

    # ---------------------------------------------------------
    # FORM 2: Tech Event Registration 2026 (Published)
    # ---------------------------------------------------------
    form2 = Form(
        id="form_event_registration",
        creator_id=DEFAULT_CREATOR_ID,
        title="Tech Event Registration 2026",
        description="Register your spot for the upcoming Developer Summit.",
        slug="event-registration",
        status=FormStatus.PUBLISHED,
        theme_settings={"accent_color": "#2563EB", "font_family": "Inter"},
        created_at=now - timedelta(days=3),
        updated_at=now - timedelta(days=3)
    )
    db.add(form2)
    db.flush()

    q2_1 = Question(
        id="q2_name",
        form_id=form2.id,
        type=QuestionType.SHORT_TEXT,
        question_text="What is your full name?",
        required=True,
        order=1,
        config={"placeholder": "Jane Doe"}
    )
    q2_2 = Question(
        id="q2_email",
        form_id=form2.id,
        type=QuestionType.EMAIL,
        question_text="What is your work email address?",
        required=True,
        order=2,
        config={"placeholder": "jane@acme.com"}
    )
    q2_3 = Question(
        id="q2_track",
        form_id=form2.id,
        type=QuestionType.DROPDOWN,
        question_text="Which main conference track are you planning to attend?",
        required=True,
        order=3
    )
    q2_4 = Question(
        id="q2_diet",
        form_id=form2.id,
        type=QuestionType.MULTIPLE_CHOICE,
        question_text="Do you have any dietary preferences for lunch?",
        required=False,
        order=4
    )
    q2_5 = Question(
        id="q2_team_size",
        form_id=form2.id,
        type=QuestionType.NUMBER,
        question_text="How many team members will be attending with you?",
        required=False,
        order=5,
        config={"min": 0, "max": 25}
    )

    db.add_all([q2_1, q2_2, q2_3, q2_4, q2_5])
    db.flush()

    # Options for Q2_3 (Dropdown)
    opt2_3 = [
        ChoiceOption(id="opt_q2_3_1", question_id=q2_3.id, label="Frontend & UX (Next.js & React)", value="frontend", order=1),
        ChoiceOption(id="opt_q2_3_2", question_id=q2_3.id, label="Backend & APIs (FastAPI & Python)", value="backend", order=2),
        ChoiceOption(id="opt_q2_3_3", question_id=q2_3.id, label="AI Agents & Developer Tools", value="ai_tools", order=3),
    ]
    # Options for Q2_4 (Multiple Choice)
    opt2_4 = [
        ChoiceOption(id="opt_q2_4_1", question_id=q2_4.id, label="Standard / No restriction", value="none", order=1),
        ChoiceOption(id="opt_q2_4_2", question_id=q2_4.id, label="Vegetarian", value="vegetarian", order=2),
        ChoiceOption(id="opt_q2_4_3", question_id=q2_4.id, label="Vegan", value="vegan", order=3),
        ChoiceOption(id="opt_q2_4_4", question_id=q2_4.id, label="Gluten-Free", value="gluten_free", order=4),
    ]
    db.add_all(opt2_3 + opt2_4)

    # ---------------------------------------------------------
    # FORM 3: Product Feature Request (Draft)
    # ---------------------------------------------------------
    form3 = Form(
        id="form_feature_request",
        creator_id=DEFAULT_CREATOR_ID,
        title="Product Feature Request & Ideas",
        description="Internal draft for collecting customer feature requests.",
        slug="product-feedback-draft",
        status=FormStatus.DRAFT,
        theme_settings={"accent_color": "#475569", "font_family": "Inter"},
        created_at=now - timedelta(days=1),
        updated_at=now - timedelta(days=1)
    )
    db.add(form3)
    db.flush()

    q3_1 = Question(
        id="q3_title",
        form_id=form3.id,
        type=QuestionType.SHORT_TEXT,
        question_text="Feature Title",
        required=True,
        order=1
    )
    q3_2 = Question(
        id="q3_desc",
        form_id=form3.id,
        type=QuestionType.LONG_TEXT,
        question_text="Describe the problem this feature will solve",
        required=True,
        order=2
    )
    q3_3 = Question(
        id="q3_priority",
        form_id=form3.id,
        type=QuestionType.DROPDOWN,
        question_text="What priority should this feature have?",
        required=False,
        order=3
    )
    db.add_all([q3_1, q3_2, q3_3])
    db.flush()

    opt3_3 = [
        ChoiceOption(id="opt_q3_3_1", question_id=q3_3.id, label="Nice to have", value="low", order=1),
        ChoiceOption(id="opt_q3_3_2", question_id=q3_3.id, label="Important", value="medium", order=2),
        ChoiceOption(id="opt_q3_3_3", question_id=q3_3.id, label="Critical / Blocker", value="critical", order=3),
    ]
    db.add_all(opt3_3)

    # ---------------------------------------------------------
    # RESPONSES & ANSWERS FOR FORM 1 (Customer Satisfaction)
    # ---------------------------------------------------------
    resp1_1 = Response(
        id="resp_1_1",
        form_id=form1.id,
        submitted_at=now - timedelta(days=4, hours=3),
        completion_time_seconds=85
    )
    resp1_2 = Response(
        id="resp_1_2",
        form_id=form1.id,
        submitted_at=now - timedelta(days=3, hours=10),
        completion_time_seconds=120
    )
    resp1_3 = Response(
        id="resp_1_3",
        form_id=form1.id,
        submitted_at=now - timedelta(days=1, hours=5),
        completion_time_seconds=64
    )
    resp1_4 = Response(
        id="resp_1_4",
        form_id=form1.id,
        submitted_at=now - timedelta(hours=2),
        completion_time_seconds=95
    )
    db.add_all([resp1_1, resp1_2, resp1_3, resp1_4])
    db.flush()

    # Answers for Resp 1_1
    a1_1 = [
        Answer(response_id=resp1_1.id, question_id=q1_1.id, value_number=5.0),
        Answer(response_id=resp1_1.id, question_id=q1_2.id, value_text="Conversational Form Runner"),
        Answer(response_id=resp1_1.id, question_id=q1_3.id, value_text="Daily"),
        Answer(response_id=resp1_1.id, question_id=q1_4.id, value_text="Yes"),
        Answer(response_id=resp1_1.id, question_id=q1_5.id, value_text="Add CSV export for response analytics!"),
        Answer(response_id=resp1_1.id, question_id=q1_6.id, value_text="sarah.tech@example.com")
    ]
    # Answers for Resp 1_2
    a1_2 = [
        Answer(response_id=resp1_2.id, question_id=q1_1.id, value_number=4.0),
        Answer(response_id=resp1_2.id, question_id=q1_2.id, value_text="Drag-and-Drop Question Builder"),
        Answer(response_id=resp1_2.id, question_id=q1_3.id, value_text="Weekly"),
        Answer(response_id=resp1_2.id, question_id=q1_4.id, value_text="Yes"),
        Answer(response_id=resp1_2.id, question_id=q1_5.id, value_text="Keyboard navigation shortcut hints in the builder."),
        Answer(response_id=resp1_2.id, question_id=q1_6.id, value_text="alex.dev@example.com")
    ]
    # Answers for Resp 1_3
    a1_3 = [
        Answer(response_id=resp1_3.id, question_id=q1_3.id, value_text="Daily"),
        Answer(response_id=resp1_3.id, question_id=q1_4.id, value_text="Yes"),
        Answer(response_id=resp1_3.id, question_id=q1_1.id, value_number=5.0),
        Answer(response_id=resp1_3.id, question_id=q1_2.id, value_text="Live Form Preview"),
    ]
    # Answers for Resp 1_4
    a1_4 = [
        Answer(response_id=resp1_4.id, question_id=q1_1.id, value_number=3.0),
        Answer(response_id=resp1_4.id, question_id=q1_2.id, value_text="Results Dashboard"),
        Answer(response_id=resp1_4.id, question_id=q1_3.id, value_text="Monthly"),
        Answer(response_id=resp1_4.id, question_id=q1_4.id, value_text="No"),
        Answer(response_id=resp1_4.id, question_id=q1_5.id, value_text="Mobile responsiveness could be even slicker."),
        Answer(response_id=resp1_4.id, question_id=q1_6.id, value_text="david.pm@example.com")
    ]
    db.add_all(a1_1 + a1_2 + a1_3 + a1_4)

    # ---------------------------------------------------------
    # RESPONSES & ANSWERS FOR FORM 2 (Event Registration)
    # ---------------------------------------------------------
    resp2_1 = Response(
        id="resp_2_1",
        form_id=form2.id,
        submitted_at=now - timedelta(days=2, hours=4),
        completion_time_seconds=42
    )
    resp2_2 = Response(
        id="resp_2_2",
        form_id=form2.id,
        submitted_at=now - timedelta(days=1, hours=1),
        completion_time_seconds=55
    )
    resp2_3 = Response(
        id="resp_2_3",
        form_id=form2.id,
        submitted_at=now - timedelta(hours=6),
        completion_time_seconds=38
    )
    db.add_all([resp2_1, resp2_2, resp2_3])
    db.flush()

    a2_1 = [
        Answer(response_id=resp2_1.id, question_id=q2_1.id, value_text="Elena Rostova"),
        Answer(response_id=resp2_1.id, question_id=q2_2.id, value_text="elena@startup.io"),
        Answer(response_id=resp2_1.id, question_id=q2_3.id, value_text="Frontend & UX (Next.js & React)"),
        Answer(response_id=resp2_1.id, question_id=q2_4.id, value_text="Vegetarian"),
        Answer(response_id=resp2_1.id, question_id=q2_5.id, value_number=3.0)
    ]
    a2_2 = [
        Answer(response_id=resp2_2.id, question_id=q2_2.id, value_text="marcus@cloudtech.com"),
        Answer(response_id=resp2_2.id, question_id=q2_1.id, value_text="Marcus Vance"),
        Answer(response_id=resp2_2.id, question_id=q2_3.id, value_text="Backend & APIs (FastAPI & Python)"),
        Answer(response_id=resp2_2.id, question_id=q2_4.id, value_text="Standard / No restriction"),
        Answer(response_id=resp2_2.id, question_id=q2_5.id, value_number=1.0)
    ]
    a2_3 = [
        Answer(response_id=resp2_3.id, question_id=q2_1.id, value_text="Priya Nair"),
        Answer(response_id=resp2_3.id, question_id=q2_2.id, value_text="priya@ai-labs.org"),
        Answer(response_id=resp2_3.id, question_id=q2_3.id, value_text="AI Agents & Developer Tools"),
        Answer(response_id=resp2_3.id, question_id=q2_4.id, value_text="Vegan"),
        Answer(response_id=resp2_3.id, question_id=q2_5.id, value_number=5.0)
    ]
    db.add_all(a2_1 + a2_2 + a2_3)

    db.commit()
    print("[Seed] Successfully seeded forms, questions, choice options, responses, and answers.")
