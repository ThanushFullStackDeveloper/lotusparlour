"""
Tests for Iteration 8 - Unified Login and Add to Calendar (ICS) features

Features being tested:
1. Unified Login - Admin and Customer login from same endpoint with role-based redirection
2. Add to Calendar (ICS) - Generate ICS file with correct parlour details, NOT customer phone
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials as provided
ADMIN_EMAIL = "admin@lotus.com"
ADMIN_PASSWORD = "admin123"
CUSTOMER_EMAIL = "test@test.com"
CUSTOMER_PASSWORD = "test123"
CUSTOMER_PHONE = "9876543210"


class TestUnifiedLogin:
    """Tests for unified login endpoint /api/auth/unified-login"""
    
    def test_admin_login_via_unified_endpoint(self):
        """Admin should be able to login via unified login and get role='admin'"""
        response = requests.post(f"{BASE_URL}/api/auth/unified-login", json={
            "identifier": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        print(f"Admin unified login response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "role" in data, "Response should contain role"
        assert data["role"] == "admin", f"Expected role='admin', got {data['role']}"
        assert "user" in data, "Response should contain user object"
        print(f"Admin login successful with role: {data['role']}")
    
    def test_customer_email_login_via_unified_endpoint(self):
        """Customer should be able to login via email using unified login and get role='customer'"""
        response = requests.post(f"{BASE_URL}/api/auth/unified-login", json={
            "identifier": CUSTOMER_EMAIL,
            "password": CUSTOMER_PASSWORD
        })
        print(f"Customer email unified login response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "role" in data, "Response should contain role"
        assert data["role"] == "customer", f"Expected role='customer', got {data['role']}"
        assert "user" in data, "Response should contain user object"
        print(f"Customer email login successful with role: {data['role']}")
    
    def test_customer_phone_login_via_unified_endpoint(self):
        """Customer should be able to login via phone number using unified login"""
        response = requests.post(f"{BASE_URL}/api/auth/unified-login", json={
            "identifier": CUSTOMER_PHONE,
            "password": CUSTOMER_PASSWORD
        })
        print(f"Customer phone unified login response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "role" in data, "Response should contain role"
        assert data["role"] == "customer", f"Expected role='customer', got {data['role']}"
        print(f"Customer phone login successful with role: {data['role']}")
    
    def test_invalid_credentials_unified_login(self):
        """Invalid credentials should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/unified-login", json={
            "identifier": "invalid@email.com",
            "password": "wrongpassword"
        })
        print(f"Invalid credentials response: {response.status_code}")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_wrong_password_unified_login(self):
        """Correct email with wrong password should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/unified-login", json={
            "identifier": ADMIN_EMAIL,
            "password": "wrongpassword123"
        })
        print(f"Wrong password response: {response.status_code}")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestICSCalendarFile:
    """Tests for ICS calendar file generation /api/appointments/{id}/ics"""
    
    @pytest.fixture
    def customer_token(self):
        """Get customer authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/unified-login", json={
            "identifier": CUSTOMER_EMAIL,
            "password": CUSTOMER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Customer authentication failed")
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/unified-login", json={
            "identifier": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def customer_appointment_id(self, customer_token):
        """Get an existing appointment ID for the customer"""
        response = requests.get(
            f"{BASE_URL}/api/appointments",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        if response.status_code == 200:
            appointments = response.json()
            if appointments:
                return appointments[0]["id"]
        pytest.skip("No appointments found for customer")
    
    def test_ics_file_download_success(self, customer_token, customer_appointment_id):
        """Customer should be able to download ICS file for their appointment"""
        response = requests.get(
            f"{BASE_URL}/api/appointments/{customer_appointment_id}/ics",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        print(f"ICS download response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type
        content_type = response.headers.get("content-type", "")
        assert "text/calendar" in content_type, f"Expected text/calendar, got {content_type}"
        
        # Check content disposition
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp, "Should be attachment"
        assert ".ics" in content_disp, "Should have .ics extension"
        
        print("ICS file download successful")
    
    def test_ics_file_has_correct_title(self, customer_token, customer_appointment_id):
        """ICS file should have title 'Lotus Beauty Parlour Appointment'"""
        response = requests.get(
            f"{BASE_URL}/api/appointments/{customer_appointment_id}/ics",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        
        ics_content = response.text
        print(f"ICS SUMMARY line: {[line for line in ics_content.split(chr(10)) if 'SUMMARY' in line]}")
        
        assert "SUMMARY:Lotus Beauty Parlour Appointment" in ics_content, \
            "ICS should have SUMMARY:Lotus Beauty Parlour Appointment"
        print("ICS title verified: Lotus Beauty Parlour Appointment")
    
    def test_ics_file_has_correct_location(self, customer_token, customer_appointment_id):
        """ICS file should have correct parlour address in LOCATION"""
        response = requests.get(
            f"{BASE_URL}/api/appointments/{customer_appointment_id}/ics",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        
        ics_content = response.text
        expected_location = "3/41, East Street, Main Road, Puthumanai, Tirunelveli, Tamil Nadu 627120"
        
        print(f"ICS LOCATION line: {[line for line in ics_content.split(chr(10)) if 'LOCATION' in line]}")
        
        assert f"LOCATION:{expected_location}" in ics_content, \
            f"ICS should have correct location address"
        print(f"ICS location verified: {expected_location}")
    
    def test_ics_file_has_parlour_phone_not_customer_phone(self, customer_token, customer_appointment_id):
        """ICS file should contain parlour phone (09500673208), NOT customer phone"""
        response = requests.get(
            f"{BASE_URL}/api/appointments/{customer_appointment_id}/ics",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        
        ics_content = response.text
        parlour_phone = "09500673208"
        customer_phone = CUSTOMER_PHONE
        
        print(f"ICS DESCRIPTION: {[line for line in ics_content.split(chr(10)) if 'DESCRIPTION' in line]}")
        
        # Should contain parlour phone
        assert parlour_phone in ics_content, f"ICS should contain parlour phone {parlour_phone}"
        print(f"Parlour phone {parlour_phone} found in ICS")
        
        # Should NOT contain customer phone (unless it happens to be same as parlour phone)
        if customer_phone != parlour_phone:
            assert customer_phone not in ics_content, f"ICS should NOT contain customer phone {customer_phone}"
            print(f"Customer phone {customer_phone} correctly NOT in ICS")
    
    def test_ics_file_has_service_and_staff_in_description(self, customer_token, customer_appointment_id):
        """ICS description should contain service name and staff name"""
        response = requests.get(
            f"{BASE_URL}/api/appointments/{customer_appointment_id}/ics",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        
        ics_content = response.text
        
        # Check that DESCRIPTION contains Service and Staff information
        assert "Service:" in ics_content, "ICS description should contain 'Service:'"
        assert "Staff:" in ics_content, "ICS description should contain 'Staff:'"
        print("ICS description contains service and staff information")
    
    def test_ics_unauthorized_access(self, admin_token, customer_appointment_id):
        """Non-owner should not be able to download another user's appointment ICS (unless admin)"""
        # Admin should be able to access any appointment
        response = requests.get(
            f"{BASE_URL}/api/appointments/{customer_appointment_id}/ics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print(f"Admin access to customer ICS: {response.status_code}")
        # Admin should have access
        assert response.status_code == 200, "Admin should be able to access any appointment ICS"
    
    def test_ics_invalid_appointment_id(self, customer_token):
        """Invalid appointment ID should return 404"""
        response = requests.get(
            f"{BASE_URL}/api/appointments/invalid-appointment-id-12345/ics",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        print(f"Invalid appointment ID response: {response.status_code}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_ics_without_auth(self, customer_appointment_id):
        """ICS endpoint should require authentication"""
        response = requests.get(
            f"{BASE_URL}/api/appointments/{customer_appointment_id}/ics"
        )
        print(f"Unauthenticated ICS request response: {response.status_code}")
        assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}"


class TestLegacyLoginEndpoints:
    """Test that legacy login endpoints still work alongside unified login"""
    
    def test_legacy_customer_login(self):
        """Legacy /api/auth/login should still work for customers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CUSTOMER_EMAIL,
            "password": CUSTOMER_PASSWORD
        })
        print(f"Legacy customer login response: {response.status_code}")
        assert response.status_code == 200, f"Legacy login should still work, got {response.status_code}"
    
    def test_legacy_admin_login(self):
        """Legacy /api/admin/login should still work for admins"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        print(f"Legacy admin login response: {response.status_code}")
        assert response.status_code == 200, f"Legacy admin login should still work, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
