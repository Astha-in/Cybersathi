from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, raise_server_exceptions=False)

state = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjc3JmIjoiY2YzNThhMTE5ODM4ZDlmNDg4YzJhYTZkNzRlMTU5ODQiLCJ0eXBlIjoib2F1dGhfc3RhdGUifQ.S7VQYZIlk7ooUXV82o18pIZFA4acQjieDL2c8kk4HsI"

r = client.get(
    "/auth/google/callback",
    params={
        "state": state,
        "iss": "https://accounts.google.com",
        "code": "4/0AXlqoi40YcxpY5Fw88DD6Wj9Opvnlo9bINSJdl4bG50q4Z0QnPzPDfS6Z6aP4zJLfPom3A",
        "scope": "email profile",
        "authuser": "0",
        "prompt": "consent",
    },
    follow_redirects=False
)
print("STATUS:", r.status_code)
print("HEADERS:", dict(r.headers))
print("BODY:", r.text[:3000])
