"""
Test End-to-End Analysis Persistence and User Isolation
"""
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.core.database import engine
from app.core.security import create_access_token

client = TestClient(app)


def run_e2e_persistence_test():
    token_u1 = create_access_token({"sub": "1"})
    token_u2 = create_access_token({"sub": "2"})

    # 1. Check initial stats
    res1_init = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {token_u1}"}).json()
    res2_init = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {token_u2}"}).json()

    print("Initial User 1 Stats:", res1_init)
    print("Initial User 2 Stats:", res2_init)

    initial_total_u1 = res1_init["total_analyses"]
    initial_total_u2 = res2_init["total_analyses"]

    # 2. User 1 performs an analysis
    analysis_payload = {
        "text": "Your account access has been limited. Please visit http://update-secure-login.com to confirm your credentials immediately."
    }
    
    print("\nExecuting POST /analysis/text as User 1...")
    analysis_res = client.post(
        "/analysis/text",
        headers={"Authorization": f"Bearer {token_u1}"},
        json=analysis_payload,
    )
    assert analysis_res.status_code == 200, f"Analysis failed: {analysis_res.text}"
    analysis_data = analysis_res.json()
    print("Analysis result received:", analysis_data["risk_level"], "| Risk score:", analysis_data["risk_score"])

    # 3. Verify DB record in Supabase
    with engine.connect() as conn:
        latest = conn.execute(
            text("SELECT id, user_id, risk_level, risk_score FROM analyses ORDER BY id DESC LIMIT 1")
        ).fetchone()
        print(f"Latest DB record in Supabase: ID={latest[0]}, user_id={latest[1]}, risk_level={latest[2]}, risk_score={latest[3]}")
        assert latest[1] == 1, "Latest analysis must belong to User 1"
        new_analysis_id = latest[0]

    # 4. Check User 1 stats after analysis
    res1_after = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {token_u1}"}).json()
    print("\nUser 1 Stats After Analysis:", res1_after)
    assert res1_after["total_analyses"] == initial_total_u1 + 1, "User 1 total analyses must increment by 1"

    # 5. Check User 2 stats - MUST NOT CHANGE
    res2_after = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {token_u2}"}).json()
    print("User 2 Stats After Analysis:", res2_after)
    assert res2_after["total_analyses"] == initial_total_u2, "User 2 total analyses must remain unchanged!"

    # 6. Check User 1 history
    h1 = client.get("/analysis/history", headers={"Authorization": f"Bearer {token_u1}"}).json()
    h1_ids = [item["id"] for item in h1]
    assert new_analysis_id in h1_ids, "New analysis must appear in User 1 history"

    # 7. Check User 2 history - MUST NOT CONTAIN new_analysis_id
    h2 = client.get("/analysis/history", headers={"Authorization": f"Bearer {token_u2}"}).json()
    h2_ids = [item["id"] for item in h2]
    assert new_analysis_id not in h2_ids, "New analysis must NEVER appear in User 2 history!"

    print("\n[PASS] End-to-End Analysis Persistence and Multi-User Isolation Fully Verified!")


if __name__ == "__main__":
    run_e2e_persistence_test()
