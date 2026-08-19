def test_register_and_login_happy_path(client):
    resp = client.post("/api/auth/register", json={
        "email": "alice@example.com",
        "password": "supersecret1",
        "full_name": "Alice",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "alice@example.com"
    assert "id" in body

    resp = client.post("/api/auth/login", json={
        "email": "alice@example.com",
        "password": "supersecret1",
    })
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_register_duplicate_email(client):
    payload = {
        "email": "bob@example.com",
        "password": "supersecret1",
        "full_name": "Bob",
    }
    resp1 = client.post("/api/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/auth/register", json=payload)
    assert resp2.status_code == 400


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "email": "carol@example.com",
        "password": "supersecret1",
        "full_name": "Carol",
    })
    resp = client.post("/api/auth/login", json={
        "email": "carol@example.com",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401
