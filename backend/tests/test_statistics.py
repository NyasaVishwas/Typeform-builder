import pytest


def test_form_statistics_calculation(client):
    response = client.get("/api/v1/forms/form_customer_satisfaction/statistics")
    assert response.status_code == 200
    data = response.json()

    assert data["form_id"] == "form_customer_satisfaction"
    assert data["total_responses"] == 4
    assert data["avg_completion_seconds"] > 0

    stats_by_q = {q["question_id"]: q for q in data["question_stats"]}

    # Verify Rating Stats
    rating_stat = stats_by_q["q1_rating"]
    assert rating_stat["type"] == "rating"
    assert rating_stat["summary"]["average"] == 4.25 # (5 + 4 + 5 + 3) / 4 = 17 / 4 = 4.25
    assert rating_stat["total_answers"] == 4

    # Verify Multiple Choice Stats
    freq_stat = stats_by_q["q1_frequency"]
    assert freq_stat["type"] == "multiple_choice"
    daily_opt = next(opt for opt in freq_stat["options"] if opt["label"] == "Daily")
    assert daily_opt["count"] == 2
    assert daily_opt["percentage"] == 50.0

    # Verify Yes/No Stats
    recommend_stat = stats_by_q["q1_recommend"]
    assert recommend_stat["type"] == "yes_no"
    yes_opt = next(opt for opt in recommend_stat["options"] if opt["label"] == "Yes")
    assert yes_opt["count"] == 3
    assert yes_opt["percentage"] == 75.0


def test_number_statistics_summary(client):
    response = client.get("/api/v1/forms/form_event_registration/statistics")
    assert response.status_code == 200
    data = response.json()

    stats_by_q = {q["question_id"]: q for q in data["question_stats"]}
    team_stat = stats_by_q["q2_team_size"]

    assert team_stat["type"] == "number"
    # Seed values: 3.0, 1.0, 5.0 -> avg = 3.0, min = 1.0, max = 5.0
    assert team_stat["summary"]["avg"] == 3.0
    assert team_stat["summary"]["min"] == 1.0
    assert team_stat["summary"]["max"] == 5.0
