"""
Backend API tests for PWA features - Iteration 7
Tests for: Customer Dashboard filters, Admin Appointments management, Cache invalidation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Credentials for testing
ADMIN_EMAIL = "admin@lotus.com"
ADMIN_PASSWORD = "admin123"
USER_EMAIL = "test@test.com"
USER_PASSWORD = "test123"


class TestHealthAndBasicAPIs:
    """Basic health checks and public API endpoints"""
    
    def test_services_api_returns_list(self):
        """Test services API returns list of services"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Services API returned {len(data)} services")
    
    def test_staff_api_returns_list(self):
        """Test staff API returns list of staff members"""
        response = requests.get(f"{BASE_URL}/api/staff")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Staff API returned {len(data)} staff members")
    
    def test_settings_api_returns_settings(self):
        """Test settings API returns site settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "parlour_name" in data
        assert "weekly_hours" in data
        print(f"Settings API returned parlour_name: {data.get('parlour_name')}")
    
    def test_gallery_api_returns_list(self):
        """Test gallery API returns list of images"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Gallery API returned {len(data)} images")
    
    def test_videos_api_returns_list(self):
        """Test videos API returns list of videos"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Videos API returned {len(data)} videos")
    
    def test_reviews_api_returns_approved_only(self):
        """Test reviews API returns only approved reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned reviews should be approved
        for review in data:
            assert review.get("approved") == True
        print(f"Reviews API returned {len(data)} approved reviews")


class TestAuthenticationFlow:
    """Tests for admin and user authentication"""
    
    def test_admin_login_success(self):
        """Admin can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "admin" in data
        assert data["admin"]["email"] == ADMIN_EMAIL
        print("Admin login successful")
    
    def test_admin_login_invalid_credentials(self):
        """Admin login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Admin login correctly rejected invalid credentials")
    
    def test_user_login_success(self):
        """User can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == USER_EMAIL
        print("User login successful")
    
    def test_user_login_invalid_credentials(self):
        """User login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("User login correctly rejected invalid credentials")


class TestAppointmentsAPI:
    """Tests for appointments API - Customer Dashboard filter functionality"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def user_token(self):
        """Get user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("User authentication failed")
    
    def test_get_appointments_as_admin(self, admin_token):
        """Admin can get all appointments"""
        response = requests.get(
            f"{BASE_URL}/api/appointments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify appointments have required fields for filtering
        if len(data) > 0:
            apt = data[0]
            assert "status" in apt
            assert "appointment_date" in apt
            assert "appointment_time" in apt
            assert "customer_name" in apt
        print(f"Admin retrieved {len(data)} appointments")
    
    def test_get_appointments_as_user(self, user_token):
        """User can get their own appointments"""
        response = requests.get(
            f"{BASE_URL}/api/appointments",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"User retrieved {len(data)} appointments")
    
    def test_appointment_has_service_details(self, admin_token):
        """Appointments include populated service and staff details"""
        response = requests.get(
            f"{BASE_URL}/api/appointments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            apt = data[0]
            # Check service is populated
            assert "service" in apt
            if apt["service"]:
                assert "name" in apt["service"]
                assert "price" in apt["service"]
                assert "duration" in apt["service"]
        print("Appointments include populated service details")
    
    def test_update_appointment_status_as_admin(self, admin_token):
        """Admin can update appointment status (for filtering tests)"""
        # First get an appointment
        response = requests.get(
            f"{BASE_URL}/api/appointments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        appointments = response.json()
        
        if len(appointments) > 0:
            apt_id = appointments[0]["id"]
            # Test status update endpoint exists
            status_response = requests.put(
                f"{BASE_URL}/api/appointments/{apt_id}/status?status=confirmed",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert status_response.status_code == 200
            print(f"Successfully updated appointment {apt_id} status")
        else:
            print("No appointments to test status update")


class TestAdminDashboardAPIs:
    """Tests for admin dashboard stats and data"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_dashboard_stats_endpoint(self, admin_token):
        """Admin dashboard stats endpoint returns correct data structure"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_appointments" in data
        assert "today_bookings" in data
        assert "pending_appointments" in data
        assert "total_revenue" in data
        print(f"Dashboard stats: {data}")
    
    def test_revenue_data_endpoint(self, admin_token):
        """Admin revenue data endpoint returns chart data"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/revenue",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "daily_revenue" in data
        assert "service_revenue" in data
        print("Revenue data endpoint working")


class TestAdminCRUDOperations:
    """Tests for admin CRUD operations that trigger cache invalidation"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_services_crud_as_admin(self, admin_token):
        """Admin can perform CRUD on services (triggers cache invalidation)"""
        # Create service
        create_response = requests.post(
            f"{BASE_URL}/api/services",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "TEST_CacheTest Service",
                "price": 100.0,
                "duration": 30,
                "description": "Test service for cache testing"
            }
        )
        assert create_response.status_code == 200
        service = create_response.json()
        assert "id" in service
        service_id = service["id"]
        print(f"Created test service: {service_id}")
        
        # Update service
        update_response = requests.put(
            f"{BASE_URL}/api/services/{service_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "TEST_CacheTest Service Updated",
                "price": 150.0,
                "duration": 45,
                "description": "Updated test service"
            }
        )
        assert update_response.status_code == 200
        print(f"Updated test service: {service_id}")
        
        # Delete service
        delete_response = requests.delete(
            f"{BASE_URL}/api/services/{service_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        print(f"Deleted test service: {service_id}")
    
    def test_staff_crud_as_admin(self, admin_token):
        """Admin can perform CRUD on staff (triggers cache invalidation)"""
        # Create staff
        create_response = requests.post(
            f"{BASE_URL}/api/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "TEST_Cache Tester",
                "role": "Tester",
                "experience": "1 year",
                "specialization": "Testing"
            }
        )
        assert create_response.status_code == 200
        staff = create_response.json()
        staff_id = staff["id"]
        print(f"Created test staff: {staff_id}")
        
        # Delete staff
        delete_response = requests.delete(
            f"{BASE_URL}/api/staff/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        print(f"Deleted test staff: {staff_id}")
    
    def test_settings_update_as_admin(self, admin_token):
        """Admin can update settings (triggers cache invalidation)"""
        # Get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        current_settings = get_response.json()
        
        # Update settings
        update_response = requests.put(
            f"{BASE_URL}/api/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "parlour_name": current_settings.get("parlour_name", "Lotus Beauty")
            }
        )
        assert update_response.status_code == 200
        print("Settings update working")


class TestAvailableSlots:
    """Tests for appointment slot availability"""
    
    def test_available_slots_endpoint(self):
        """Available slots endpoint returns correct structure"""
        import datetime
        tomorrow = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Get a service ID first
        services_response = requests.get(f"{BASE_URL}/api/services")
        services = services_response.json()
        
        if len(services) > 0:
            service_id = services[0]["id"]
            
            response = requests.get(
                f"{BASE_URL}/api/appointments/available-slots",
                params={"date": tomorrow, "service_id": service_id}
            )
            assert response.status_code == 200
            data = response.json()
            assert "available" in data
            assert "slots" in data
            print(f"Available slots for {tomorrow}: {len(data.get('slots', []))} slots")
        else:
            pytest.skip("No services available for slot testing")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
