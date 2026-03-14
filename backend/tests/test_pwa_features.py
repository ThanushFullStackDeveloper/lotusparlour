"""
Test PWA features and ICS calendar endpoint for Beauty Parlour app
- PWA manifest.json accessibility
- Service worker accessibility  
- PWA icons accessibility
- Offline fallback page accessibility
- ICS calendar file generation for appointments
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER = {"email": "testuser@test.com", "password": "test123"}
ADMIN_USER = {"email": "admin@lotus.com", "password": "admin123"}


class TestPWAStaticAssets:
    """Test PWA static assets are accessible"""
    
    def test_manifest_json_accessible(self):
        """PWA manifest.json should be accessible at /manifest.json"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify it's valid JSON
        data = response.json()
        assert "name" in data, "Manifest should have 'name' field"
        assert "short_name" in data, "Manifest should have 'short_name' field"
        assert "icons" in data, "Manifest should have 'icons' field"
        print(f"manifest.json content: {data['name']}, {data['short_name']}")
        
    def test_manifest_has_required_fields(self):
        """Manifest should have all required PWA fields"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        data = response.json()
        
        required_fields = ["name", "short_name", "start_url", "display", "theme_color", "background_color", "icons"]
        for field in required_fields:
            assert field in data, f"Manifest missing required field: {field}"
        
        # Verify icons configuration
        assert len(data["icons"]) >= 2, "Manifest should have at least 2 icons"
        
        icon_sizes = [icon["sizes"] for icon in data["icons"]]
        assert "192x192" in icon_sizes, "Manifest should have 192x192 icon"
        assert "512x512" in icon_sizes, "Manifest should have 512x512 icon"
        print(f"Manifest has all required fields with {len(data['icons'])} icons")
        
    def test_service_worker_accessible(self):
        """Service worker should be accessible at /service-worker.js"""
        response = requests.get(f"{BASE_URL}/service-worker.js")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify it's JavaScript content
        content_type = response.headers.get('content-type', '')
        assert 'javascript' in content_type or 'text' in content_type, f"Unexpected content type: {content_type}"
        
        # Verify it contains service worker code
        content = response.text
        assert 'addEventListener' in content, "Service worker should have event listeners"
        print("Service worker is accessible and contains event listeners")
        
    def test_offline_html_accessible(self):
        """Offline fallback page should be accessible at /offline.html"""
        response = requests.get(f"{BASE_URL}/offline.html")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify it's HTML content
        content = response.text
        assert '<!DOCTYPE html>' in content or '<html' in content, "Should be valid HTML"
        assert 'Offline' in content or 'offline' in content, "Should mention offline status"
        print("Offline page is accessible")
        
    def test_icon_192x192_accessible(self):
        """PWA icon 192x192 should be accessible"""
        response = requests.get(f"{BASE_URL}/icons/icon-192x192.png")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify it's an image
        content_type = response.headers.get('content-type', '')
        assert 'image' in content_type, f"Should be an image, got: {content_type}"
        print("192x192 icon is accessible")
        
    def test_icon_512x512_accessible(self):
        """PWA icon 512x512 should be accessible"""
        response = requests.get(f"{BASE_URL}/icons/icon-512x512.png")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify it's an image
        content_type = response.headers.get('content-type', '')
        assert 'image' in content_type, f"Should be an image, got: {content_type}"
        print("512x512 icon is accessible")


class TestICSCalendarEndpoint:
    """Test ICS calendar file generation for appointments"""
    
    @pytest.fixture
    def user_token(self):
        """Get user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        if response.status_code == 200:
            return response.json().get("token")
        # If user doesn't exist, register first
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": TEST_USER["email"],
            "phone": "1234567890",
            "password": TEST_USER["password"]
        })
        if register_response.status_code == 200:
            return register_response.json().get("token")
        pytest.skip("Could not authenticate test user")
        
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json=ADMIN_USER)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Could not authenticate admin")
        
    @pytest.fixture
    def test_service_id(self):
        """Get an existing service ID"""
        # Get existing services (public endpoint)
        response = requests.get(f"{BASE_URL}/api/services")
        if response.status_code == 200 and len(response.json()) > 0:
            return response.json()[0]["id"]
        pytest.skip("No services available for testing")
        
    @pytest.fixture
    def test_appointment_id(self, user_token, test_service_id):
        """Create a test appointment and return its ID"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        appointment_data = {
            "customer_name": "TEST_PWA_User",
            "customer_phone": "9876543210",
            "customer_email": "test_pwa@test.com",
            "service_id": test_service_id,
            "appointment_date": "2026-02-15",
            "appointment_time": "10:00"
        }
        
        response = requests.post(f"{BASE_URL}/api/appointments", json=appointment_data, headers=headers)
        if response.status_code == 200:
            return response.json()["id"]
        pytest.skip(f"Could not create test appointment: {response.text}")
        
    def test_ics_endpoint_requires_auth(self):
        """ICS endpoint should require authentication"""
        fake_appointment_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/appointments/{fake_appointment_id}/ics")
        assert response.status_code in [401, 403], f"Expected 401 or 403 without auth, got {response.status_code}"
        print("ICS endpoint properly requires authentication")
        
    def test_ics_endpoint_returns_ics_file(self, user_token, test_appointment_id):
        """ICS endpoint should return valid ICS calendar file"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/appointments/{test_appointment_id}/ics", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify content type
        content_type = response.headers.get('content-type', '')
        assert 'calendar' in content_type or 'text' in content_type, f"Expected calendar content type, got: {content_type}"
        
        # Verify content disposition (download)
        content_disposition = response.headers.get('content-disposition', '')
        assert 'attachment' in content_disposition, f"Should be an attachment download"
        assert '.ics' in content_disposition, f"Filename should end with .ics"
        
        print(f"ICS file returned with content-disposition: {content_disposition}")
        
    def test_ics_content_is_valid(self, user_token, test_appointment_id):
        """ICS file content should have valid iCalendar format"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/appointments/{test_appointment_id}/ics", headers=headers)
        assert response.status_code == 200
        
        content = response.text
        
        # Check required iCalendar components
        assert 'BEGIN:VCALENDAR' in content, "Should start with VCALENDAR"
        assert 'END:VCALENDAR' in content, "Should end with VCALENDAR"
        assert 'BEGIN:VEVENT' in content, "Should contain VEVENT"
        assert 'END:VEVENT' in content, "Should close VEVENT"
        assert 'DTSTART:' in content, "Should have start time"
        assert 'DTEND:' in content, "Should have end time"
        assert 'SUMMARY:' in content, "Should have summary/title"
        
        print("ICS content has valid iCalendar format")
        
    def test_ics_has_alarm_reminders(self, user_token, test_appointment_id):
        """ICS file should include VALARM reminders"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/appointments/{test_appointment_id}/ics", headers=headers)
        content = response.text
        
        assert 'BEGIN:VALARM' in content, "Should have VALARM for reminders"
        assert 'TRIGGER:' in content, "VALARM should have trigger time"
        
        print("ICS content includes alarm reminders")
        
    def test_ics_non_existent_appointment(self, user_token):
        """ICS endpoint should return 404 for non-existent appointment"""
        headers = {"Authorization": f"Bearer {user_token}"}
        fake_id = str(uuid.uuid4())
        
        response = requests.get(f"{BASE_URL}/api/appointments/{fake_id}/ics", headers=headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("ICS endpoint properly returns 404 for non-existent appointment")
        
    def test_ics_unauthorized_access(self, test_service_id):
        """User should not be able to access another user's appointment ICS"""
        # First register a different user
        other_user = {
            "name": "Other User",
            "email": f"other_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "5555555555",
            "password": "otherpass123"
        }
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=other_user)
        if reg_response.status_code != 200:
            pytest.skip("Could not create other test user")
            
        other_token = reg_response.json()["token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        # Create appointment as the other user
        appointment_data = {
            "customer_name": "Other User",
            "customer_phone": "5555555555",
            "customer_email": other_user["email"],
            "service_id": test_service_id,
            "appointment_date": "2026-02-20",
            "appointment_time": "14:00"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/appointments", json=appointment_data, headers=other_headers)
        if create_response.status_code != 200:
            pytest.skip("Could not create appointment for other user")
            
        other_appointment_id = create_response.json()["id"]
        
        # Try to access as original test user
        test_user_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        if test_user_response.status_code != 200:
            pytest.skip("Could not login as test user")
        test_user_token = test_user_response.json()["token"]
        test_headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Should be forbidden
        response = requests.get(f"{BASE_URL}/api/appointments/{other_appointment_id}/ics", headers=test_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("ICS endpoint properly denies unauthorized access")


class TestAPIEndpoints:
    """Test additional API endpoints for completeness"""
    
    def test_settings_endpoint(self):
        """Settings endpoint should return parlour settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "parlour_name" in data
        assert "logo_image" in data or data.get("logo_image") is None
        print(f"Settings returned: {data.get('parlour_name')}")
        
    def test_services_endpoint(self):
        """Services endpoint should return list of services"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Services endpoint returned {len(data)} services")
        
    def test_staff_endpoint(self):
        """Staff endpoint should return list of staff"""
        response = requests.get(f"{BASE_URL}/api/staff")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Staff endpoint returned {len(data)} staff members")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
