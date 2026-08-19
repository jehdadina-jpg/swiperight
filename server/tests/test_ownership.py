"""
Ensure a user cannot access another user's statements/recommendations by ID.
"""
from database.models import Statement, StatementStatus, Recommendation, Card
from tests.conftest import register_and_login


def _login_headers(client, email):
    token = register_and_login(client, email=email, password="password123")
    return {"Authorization": f"Bearer {token}"}


def test_user_cannot_fetch_other_users_statement_via_analyze(client, db_session):
    headers_a = _login_headers(client, "owner@example.com")
    headers_b = _login_headers(client, "intruder@example.com")

    # Find owner's user id via /api/auth/login response is opaque; look up by email in DB
    from database.models import User
    owner = db_session.query(User).filter(User.email == "owner@example.com").first()

    stmt = Statement(
        user_id=owner.id,
        file_name="secret.csv",
        file_type="CSV",
        status=StatementStatus.COMPLETED,
    )
    db_session.add(stmt)
    db_session.commit()
    db_session.refresh(stmt)

    # Intruder tries to analyze owner's statement -> should be 404, not their data
    resp = client.post(f"/api/upload/analyze/{stmt.id}", headers=headers_b)
    assert resp.status_code == 404

    # Owner should also get a sane response (won't be COMPLETED/PROCESSING conflict since
    # no file backing it, but should NOT be a 404 "not found" — it exists for them, may 404 on file)
    resp_owner = client.post(f"/api/upload/analyze/{stmt.id}", headers=headers_a)
    assert resp_owner.status_code != 401


def test_user_cannot_fetch_other_users_recommendation(client, db_session):
    headers_a = _login_headers(client, "recowner@example.com")
    headers_b = _login_headers(client, "recintruder@example.com")

    from database.models import User
    owner = db_session.query(User).filter(User.email == "recowner@example.com").first()

    card = Card(name="Test Card", issuer="Test Bank", network="Visa", annual_fee=0, reward_rate=1.0)
    db_session.add(card)
    db_session.commit()
    db_session.refresh(card)

    rec = Recommendation(
        user_id=owner.id,
        card_id=card.id,
        category_totals={"Dining": 1000.0},
        yearly_spend=12000.0,
        total_rewards=120.0,
        effective_reward_rate=1.0,
        net_annual_benefit=120.0,
        model_version="v1.0",
        confidence_score=0.9,
        reasoning="test",
    )
    db_session.add(rec)
    db_session.commit()
    db_session.refresh(rec)

    resp = client.get(f"/api/recommendation/{rec.id}", headers=headers_b)
    assert resp.status_code == 404

    resp_owner = client.get(f"/api/recommendation/{rec.id}", headers=headers_a)
    assert resp_owner.status_code == 200
