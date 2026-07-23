def test_register_and_login(client):
    # Register user
    register_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@carevoice.com",
            "full_name": "Test Caretaker",
            "password": "password123",
            "role": "caretaker"
        }
    )
    assert register_res.status_code == 200, register_res.text
    data = register_res.json()
    assert data["email"] == "test@carevoice.com"
    assert "id" in data

    # Login user
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "test@carevoice.com", "password": "password123"}
    )
    assert login_res.status_code == 200, login_res.text
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Read me endpoint with Bearer token
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test@carevoice.com"
