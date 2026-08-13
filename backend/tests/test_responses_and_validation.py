import pytest


def test_submit_valid_response(client):
    payload = {
        "completion_time_seconds": 45,
        "answers": [
            {"question_id": "q1_rating", "value_number": 5.0},
            {"question_id": "q1_feature", "value_text": "Webhooks Engine"},
            {"question_id": "q1_frequency", "value_text": "Daily"},
            {"question_id": "q1_recommend", "value_text": "Yes"},
            {"question_id": "q1_feedback", "value_text": "Everything is great!"},
            {"question_id": "q1_email", "value_text": "newuser@example.com"}
        ]
    }
    response = client.post("/api/v1/public/forms/customer-satisfaction/responses", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["form_id"] == "form_customer_satisfaction"
    assert len(data["answers"]) == 6


def test_submit_response_missing_required_question(client):
    # q1_rating and q1_feature are required in customer-satisfaction
    payload = {
        "completion_time_seconds": 30,
        "answers": [
            {"question_id": "q1_feature", "value_text": "Only Feature Answered"}
        ]
    }
    response = client.post("/api/v1/public/forms/customer-satisfaction/responses", json=payload)
    assert response.status_code == 422
    assert "required" in response.json()["detail"].lower()


def test_submit_response_invalid_email_format(client):
    payload = {
        "completion_time_seconds": 30,
        "answers": [
            {"question_id": "q1_rating", "value_number": 4.0},
            {"question_id": "q1_feature", "value_text": "Feature"},
            {"question_id": "q1_recommend", "value_text": "Yes"},
            {"question_id": "q1_email", "value_text": "not-an-email-address"}
        ]
    }
    response = client.post("/api/v1/public/forms/customer-satisfaction/responses", json=payload)
    assert response.status_code == 422
    assert "invalid email" in response.json()["detail"].lower()


def test_submit_response_out_of_bounds_rating(client):
    # Rating config min=1, max=5
    payload = {
        "completion_time_seconds": 30,
        "answers": [
            {"question_id": "q1_rating", "value_number": 10.0}, # Out of bounds
            {"question_id": "q1_feature", "value_text": "Feature"},
            {"question_id": "q1_recommend", "value_text": "Yes"}
        ]
    }
    response = client.post("/api/v1/public/forms/customer-satisfaction/responses", json=payload)
    assert response.status_code == 422
    assert "must be between" in response.json()["detail"].lower()


def test_submit_response_invalid_choice_option(client):
    payload = {
        "completion_time_seconds": 30,
        "answers": [
            {"question_id": "q1_rating", "value_number": 4.0},
            {"question_id": "q1_feature", "value_text": "Feature"},
            {"question_id": "q1_frequency", "value_text": "Every Second"}, # Invalid choice
            {"question_id": "q1_recommend", "value_text": "Yes"}
        ]
    }
    response = client.post("/api/v1/public/forms/customer-satisfaction/responses", json=payload)
    assert response.status_code == 422
    assert "invalid for question" in response.json()["detail"].lower()


def test_submit_response_question_from_other_form(client):
    payload = {
        "answers": [
            {"question_id": "q2_name", "value_text": "Wrong Question ID"} # q2_name belongs to form 2
        ]
    }
    response = client.post("/api/v1/public/forms/customer-satisfaction/responses", json=payload)
    assert response.status_code == 400
    assert "does not belong to form" in response.json()["detail"].lower()
