"""
Backend API Tests for Lotus Beauty Parlour
Tests: Auth, Settings, Support, Customers, Coupon Validation, Reviews
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://parlour-pro-portal.preview.emergentagent.com')

# ============ FIXTURES ============

@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="session")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/admin/login", json={
        "email": "admin@lotus.com",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin authentication failed - skipping authenticated tests")

@pytest.fixture(scope="session")
def auth_headers(admin_token):
    """Auth headers for admin requests"""
    return {"Authorization": f"Bearer {admin_token}"}


# ============ HEALTH CHECK ============

class TestHealthCheck:
    """Basic health check tests"""
    
    def test_settings_endpoint_accessible(self, api_client):
        """Test /api/settings endpoint is accessible"""
        response = api_client.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "parlour_name" in data
        print(f"✓ Settings endpoint working: {data.get('parlour_name')}")

    def test_services_endpoint_accessible(self, api_client):
        """Test /api/services endpoint is accessible"""
        response = api_client.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        print(f"✓ Services endpoint working, count: {len(response.json())}")

    def test_staff_endpoint_accessible(self, api_client):
        """Test /api/staff endpoint is accessible"""
        response = api_client.get(f"{BASE_URL}/api/staff")
        assert response.status_code == 200
        print(f"✓ Staff endpoint working, count: {len(response.json())}")


# ============ AUTHENTICATION TESTS ============

class TestAuthentication:
    """Authentication flow tests"""
    
    def test_admin_login_success(self, api_client):
        """Test admin login with valid credentials"""
        response = api_client.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "admin" in data
        assert data["admin"]["email"] == "admin@lotus.com"
        print("✓ Admin login successful")

    def test_admin_login_invalid_password(self, api_client):
        """Test admin login with invalid password"""
        response = api_client.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Admin login correctly rejects invalid password")

    def test_user_registration(self, api_client):
        """Test user registration"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "TEST_User",
            "email": unique_email,
            "phone": "1234567890",
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        print(f"✓ User registration successful: {unique_email}")

    def test_user_login_with_email(self, api_client):
        """Test user login with email"""
        # First register
        unique_email = f"logintest_{uuid.uuid4().hex[:8]}@test.com"
        api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "TEST_LoginUser",
            "email": unique_email,
            "phone": "1234567891",
            "password": "testpass123"
        })
        
        # Then login
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print("✓ User email login successful")

    def test_user_login_with_phone(self, api_client):
        """Test user login with phone number"""
        # First register
        unique_email = f"phonetest_{uuid.uuid4().hex[:8]}@test.com"
        unique_phone = f"9{uuid.uuid4().hex[:9]}"
        api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "TEST_PhoneUser",
            "email": unique_email,
            "phone": unique_phone,
            "password": "testpass123"
        })
        
        # Then login with phone
        response = api_client.post(f"{BASE_URL}/api/auth/login-phone", params={
            "phone": unique_phone,
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print("✓ User phone login successful")


# ============ SUPPORT REQUEST TESTS ============

class TestSupportRequests:
    """Support request tests"""
    
    def test_create_support_request(self, api_client):
        """Test creating a support request (public endpoint)"""
        response = api_client.post(f"{BASE_URL}/api/support", json={
            "name": "TEST_SupportUser",
            "email": "support@test.com",
            "phone": "9876543210",
            "problem": "TEST: Forgot my password, need help resetting"
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ Support request created successfully")

    def test_get_support_requests_admin(self, api_client, auth_headers):
        """Test admin can view support requests"""
        response = api_client.get(f"{BASE_URL}/api/support", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view support requests: {len(data)} requests")


# ============ CUSTOMER MANAGEMENT TESTS ============

class TestCustomerManagement:
    """Customer management tests (admin only)"""
    
    def test_get_customers_admin(self, api_client, auth_headers):
        """Test admin can view customers"""
        response = api_client.get(f"{BASE_URL}/api/customers", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify customer fields
        if len(data) > 0:
            customer = data[0]
            assert "id" in customer
            assert "email" in customer
            assert "total_bookings" in customer
        print(f"✓ Admin can view customers: {len(data)} customers")


# ============ SETTINGS TESTS ============

class TestSettingsManagement:
    """Settings management tests"""
    
    def test_get_settings_public(self, api_client):
        """Test public can view settings"""
        response = api_client.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "parlour_name" in data
        assert "opening_time" in data
        assert "closing_time" in data
        print(f"✓ Settings retrieved: {data.get('parlour_name')}")

    def test_update_settings_admin(self, api_client, auth_headers):
        """Test admin can update settings"""
        # Get current settings
        current = api_client.get(f"{BASE_URL}/api/settings").json()
        
        # Update settings
        response = api_client.put(f"{BASE_URL}/api/settings", headers=auth_headers, json={
            "welcome_text": "Welcome to Lotus Beauty Parlour - TEST"
        })
        assert response.status_code == 200
        
        # Verify update
        updated = api_client.get(f"{BASE_URL}/api/settings").json()
        assert "TEST" in updated.get("welcome_text", "")
        
        # Restore original
        api_client.put(f"{BASE_URL}/api/settings", headers=auth_headers, json={
            "welcome_text": current.get("welcome_text", "Welcome to Lotus Beauty Parlour")
        })
        print("✓ Admin can update settings")


# ============ COUPON VALIDATION TESTS ============

class TestCouponValidation:
    """Coupon validation tests"""
    
    def test_validate_invalid_coupon(self, api_client):
        """Test validation of non-existent coupon"""
        response = api_client.get(f"{BASE_URL}/api/coupons/validate/INVALIDCODE123")
        assert response.status_code == 404
        print("✓ Invalid coupon correctly rejected")

    def test_create_and_validate_coupon(self, api_client, auth_headers):
        """Test creating and validating a coupon"""
        # Create a valid coupon
        coupon_code = f"TEST_{uuid.uuid4().hex[:6].upper()}"
        create_response = api_client.post(f"{BASE_URL}/api/coupons", headers=auth_headers, json={
            "code": coupon_code,
            "discount_percent": 10.0,
            "start_time": "2024-01-01",
            "end_time": "2027-12-31"
        })
        assert create_response.status_code == 200
        print(f"✓ Coupon created: {coupon_code}")
        
        # Validate the coupon
        validate_response = api_client.get(f"{BASE_URL}/api/coupons/validate/{coupon_code}")
        assert validate_response.status_code == 200
        data = validate_response.json()
        assert data["code"] == coupon_code
        assert data["discount_percent"] == 10.0
        print("✓ Coupon validated successfully")


# ============ REVIEW TESTS ============

class TestReviews:
    """Review submission tests"""
    
    def test_create_review_public(self, api_client):
        """Test public can submit a review (needs approval)"""
        response = api_client.post(f"{BASE_URL}/api/reviews", json={
            "customer_name": "TEST_Reviewer",
            "rating": 5,
            "review_text": "TEST: Great service, loved the experience!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ Review submitted for approval")

    def test_get_approved_reviews(self, api_client):
        """Test public can view approved reviews"""
        response = api_client.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned reviews should be approved
        for review in data:
            assert review.get("approved") == True
        print(f"✓ Approved reviews retrieved: {len(data)} reviews")

    def test_get_all_reviews_admin(self, api_client, auth_headers):
        """Test admin can view all reviews including unapproved"""
        response = api_client.get(f"{BASE_URL}/api/reviews/all", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view all reviews: {len(data)} reviews")


# ============ APPOINTMENTS TESTS ============

class TestAppointments:
    """Appointment related tests"""
    
    def test_get_available_slots(self, api_client):
        """Test getting available appointment slots"""
        # Use a future date
        response = api_client.get(f"{BASE_URL}/api/appointments/available-slots?date=2026-03-20&service_id=test")
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        assert "slots" in data
        print(f"✓ Available slots retrieved: {len(data.get('slots', []))} slots")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
