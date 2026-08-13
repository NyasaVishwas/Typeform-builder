import pytest


def test_add_question(client):
    payload = {
        "type": "short_text",
        "question_text": "What is your job title?",
        "required": True,
        "config": {"placeholder": "e.g. Senior Software Engineer"}
    }
    response = client.post("/api/v1/forms/form_customer_satisfaction/questions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["question_text"] == "What is your job title?"
    assert data["type"] == "short_text"
    assert data["required"] is True


def test_add_multiple_choice_question_requires_options(client):
    payload = {
        "type": "multiple_choice",
        "question_text": "Choose an option",
        "choice_options": []
    }
    response = client.post("/api/v1/forms/form_customer_satisfaction/questions", json=payload)
    assert response.status_code == 400
    assert "requires at least one choice option" in response.json()["detail"]


def test_update_question(client):
    payload = {
        "question_text": "Updated Rating Question Text",
        "required": False
    }
    response = client.patch("/api/v1/questions/q1_rating", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["question_text"] == "Updated Rating Question Text"
    assert data["required"] is False


def test_delete_question(client):
    response = client.delete("/api/v1/questions/q1_email")
    assert response.status_code == 204

    # Verify form question count decreased
    form_resp = client.get("/api/v1/forms/form_customer_satisfaction")
    q_ids = [q["id"] for q in form_resp.json()["questions"]]
    assert "q1_email" not in q_ids


def test_reorder_questions(client):
    # Form 1 initial order: q1_rating, q1_feature, q1_frequency, q1_recommend, q1_feedback, q1_email
    new_order = ["q1_email", "q1_rating", "q1_feature", "q1_frequency", "q1_recommend", "q1_feedback"]
    payload = {"question_ids": new_order}

    response = client.patch("/api/v1/forms/form_customer_satisfaction/questions/reorder", json=payload)
    assert response.status_code == 200
    ordered_questions = response.json()
    assert [q["id"] for q in ordered_questions] == new_order
