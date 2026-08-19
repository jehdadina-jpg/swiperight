import io


def test_upload_requires_auth(client):
    resp = client.post(
        "/api/upload/",
        files={"file": ("statement.csv", io.BytesIO(b"date,merchant,amount\n"), "text/csv")},
    )
    assert resp.status_code == 401


def test_recommendation_requires_auth(client):
    resp = client.post("/api/recommendation/", json={"statement_id": 1})
    assert resp.status_code == 401


def test_chat_requires_auth(client):
    resp = client.post("/api/chat/", json={"message": "hi", "recommendation_id": 1})
    assert resp.status_code == 401


def test_upload_history_requires_auth(client):
    resp = client.get("/api/upload/history")
    assert resp.status_code == 401
