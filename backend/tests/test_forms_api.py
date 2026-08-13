import pytest


def test_list_forms(client):
    response = client.get("/api/v1/forms")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    slugs = [f["slug"] for f in data]
    assert "customer-satisfaction" in slugs
    assert "event-registration" in slugs
    assert "product-feedback-draft" in slugs


def test_create_form(client):
    payload = {
        "title": "New User Onboarding",
        "description": "Welcome survey for new users.",
        "slug": "user-onboarding",
        "status": "draft",
        "theme_settings": {"accent_color": "#10B981", "font_family": "Inter"}
    }
    response = client.post("/api/v1/forms", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New User Onboarding"
    assert data["slug"] == "user-onboarding"
    assert data["status"] == "draft"


def test_get_form_detail(client):
    response = client.get("/api/v1/forms/form_customer_satisfaction")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Customer Satisfaction Survey"
    assert len(data["questions"]) == 6


def test_update_form(client):
    payload = {
        "title": "Updated Survey Title",
        "description": "Updated description text."
    }
    response = client.patch("/api/v1/forms/form_customer_satisfaction", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Survey Title"
    assert data["description"] == "Updated description text."


def test_delete_form(client):
    # Create form to delete
    create_resp = client.post("/api/v1/forms", json={"title": "Form To Delete", "slug": "form-to-delete"})
    form_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/forms/{form_id}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/forms/{form_id}")
    assert get_resp.status_code == 404


def test_duplicate_form(client):
    response = client.post("/api/v1/forms/form_customer_satisfaction/duplicate")
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Copy of Customer Satisfaction Survey"
    assert data["status"] == "draft"
    assert len(data["questions"]) == 6
    assert data["id"] != "form_customer_satisfaction"


def test_publish_and_unpublish_form(client):
    # Unpublish form_customer_satisfaction
    unpub_resp = client.post("/api/v1/forms/form_customer_satisfaction/unpublish")
    assert unpub_resp.status_code == 200
    assert unpub_resp.json()["status"] == "draft"

    # Public runner should now 404
    pub_get = client.get("/api/v1/public/forms/customer-satisfaction")
    assert pub_get.status_code == 404

    # Re-publish form
    pub_resp = client.post("/api/v1/forms/form_customer_satisfaction/publish")
    assert pub_resp.status_code == 200
    assert pub_resp.json()["status"] == "published"

    # Public runner should now 200
    pub_get2 = client.get("/api/v1/public/forms/customer-satisfaction")
    assert pub_get2.status_code == 200
