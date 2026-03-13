"""
Test Suite for Iteration 3 Features:
1. Feature cards without icons (UI test)
2. Dynamic navbar logo from settings
3. Admin password reset in Settings
4. Customer Management with search/edit/delete
5. Account Recovery form (phone only)
6. Contact form sends to Enquiries tab
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminLogin:
    """Authenticate admin to get token for protected routes"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["token"]
    
    def test_admin_login(self, admin_token):
        """Verify admin can login"""
        assert admin_token is not None
        print("PASS: Admin login successful")


class TestSettingsApi:
    """Test Settings API including logo_image field and admin password change"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_settings_returns_logo_image(self):
        """Verify settings includes logo_image field for dynamic navbar logo"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert 'logo_image' in data, "logo_image field missing from settings"
        assert 'parlour_name' in data, "parlour_name field missing"
        print(f"PASS: Settings returns logo_image: {data.get('logo_image')}")
        print(f"PASS: Settings returns parlour_name: {data.get('parlour_name')}")
    
    def test_update_settings_logo_image(self, admin_token):
        """Verify admin can update logo_image in settings"""
        test_logo = "https://example.com/test-logo.png"
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={"logo_image": test_logo},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed to update settings: {response.text}"
        
        # Verify the update
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data.get('logo_image') == test_logo, "logo_image not updated"
        print("PASS: Admin can update logo_image in settings")


class TestAdminPasswordChange:
    """Test admin password change functionality"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_admin_change_password_endpoint_exists(self, admin_token):
        """Verify admin password change endpoint exists"""
        # Test with wrong current password to check endpoint exists
        response = requests.put(
            f"{BASE_URL}/api/admin/change-password",
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword123"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # 400 means endpoint exists but current password is wrong
        assert response.status_code == 400, f"Unexpected status: {response.status_code}"
        assert "incorrect" in response.json().get('detail', '').lower(), "Should indicate incorrect password"
        print("PASS: Admin change password endpoint exists and validates current password")
    
    def test_admin_change_password_requires_auth(self):
        """Verify admin password change requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/admin/change-password",
            json={
                "current_password": "admin123",
                "new_password": "newpassword123"
            }
        )
        assert response.status_code in [401, 403], "Should require auth"
        print("PASS: Admin password change requires authentication")


class TestCustomerManagement:
    """Test Customer Management CRUD operations"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def test_customer(self, admin_token):
        """Create a test customer for CRUD operations"""
        unique_email = f"test_customer_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "TEST_Customer",
            "email": unique_email,
            "phone": "9999999999",
            "password": "testpass123"
        })
        assert response.status_code == 200, f"Failed to create test customer: {response.text}"
        return response.json()["user"]
    
    def test_get_customers_list(self, admin_token):
        """Verify admin can get list of customers"""
        response = requests.get(
            f"{BASE_URL}/api/customers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed to get customers: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Customers should be a list"
        print(f"PASS: Get customers list - {len(data)} customers found")
    
    def test_customer_has_booking_count(self, admin_token, test_customer):
        """Verify customer records include total_bookings count"""
        response = requests.get(
            f"{BASE_URL}/api/customers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Find our test customer
        customer = next((c for c in data if c['id'] == test_customer['id']), None)
        assert customer is not None, "Test customer not found"
        assert 'total_bookings' in customer, "total_bookings field missing"
        print(f"PASS: Customer has total_bookings field: {customer['total_bookings']}")
    
    def test_update_customer(self, admin_token, test_customer):
        """Verify admin can update customer details"""
        response = requests.put(
            f"{BASE_URL}/api/customers/{test_customer['id']}",
            json={
                "name": "TEST_Updated_Customer",
                "phone": "8888888888"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed to update customer: {response.text}"
        
        # Verify update
        get_response = requests.get(
            f"{BASE_URL}/api/customers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        customers = get_response.json()
        customer = next((c for c in customers if c['id'] == test_customer['id']), None)
        assert customer['name'] == "TEST_Updated_Customer", "Name not updated"
        assert customer['phone'] == "8888888888", "Phone not updated"
        print("PASS: Admin can update customer name and phone")
    
    def test_reset_customer_password(self, admin_token, test_customer):
        """Verify admin can reset customer password"""
        response = requests.put(
            f"{BASE_URL}/api/customers/{test_customer['id']}/reset-password",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed to reset password: {response.text}"
        data = response.json()
        assert 'temporary_password' in data, "Should return temporary password"
        print(f"PASS: Admin can reset customer password - temp: {data['temporary_password']}")
    
    def test_delete_customer(self, admin_token, test_customer):
        """Verify admin can delete customer"""
        response = requests.delete(
            f"{BASE_URL}/api/customers/{test_customer['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed to delete customer: {response.text}"
        
        # Verify customer is deleted
        get_response = requests.get(
            f"{BASE_URL}/api/customers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        customers = get_response.json()
        customer = next((c for c in customers if c['id'] == test_customer['id']), None)
        assert customer is None, "Customer should be deleted"
        print("PASS: Admin can delete customer")


class TestSupportRequestApi:
    """Test Account Recovery / Support Request API (phone only)"""
    
    def test_create_support_request_phone_only(self):
        """Verify support request can be created with phone and problem only"""
        response = requests.post(f"{BASE_URL}/api/support", json={
            "phone": "9876543210",
            "problem": "Cannot login to my account, forgot password"
        })
        assert response.status_code == 200, f"Failed to create support request: {response.text}"
        print("PASS: Support request created with phone and problem only")
    
    def test_support_request_fields_optional(self):
        """Verify name and email are optional in support request"""
        response = requests.post(f"{BASE_URL}/api/support", json={
            "phone": "9876543211",
            "problem": "Need help with booking"
        })
        assert response.status_code == 200
        print("PASS: Support request works without name and email fields")


class TestEnquiriesApi:
    """Test Contact Form Enquiries API"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def test_enquiry(self):
        """Create a test enquiry"""
        unique_email = f"test_enquiry_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/enquiries", json={
            "name": "TEST_Enquiry_User",
            "email": unique_email,
            "phone": "9123456789",
            "message": "This is a test enquiry message"
        })
        assert response.status_code == 200, f"Failed to create enquiry: {response.text}"
        return {"email": unique_email}
    
    def test_create_enquiry(self):
        """Verify contact form can create enquiry"""
        response = requests.post(f"{BASE_URL}/api/enquiries", json={
            "name": "Test Contact",
            "email": f"contact_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "9876543210",
            "message": "I would like to know about bridal makeup services"
        })
        assert response.status_code == 200, f"Failed to create enquiry: {response.text}"
        print("PASS: Contact form enquiry created successfully")
    
    def test_admin_get_enquiries(self, admin_token, test_enquiry):
        """Verify admin can get all enquiries"""
        response = requests.get(
            f"{BASE_URL}/api/enquiries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed to get enquiries: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Enquiries should be a list"
        assert len(data) > 0, "Should have at least one enquiry"
        
        # Check enquiry structure
        enquiry = data[0]
        assert 'id' in enquiry
        assert 'name' in enquiry
        assert 'email' in enquiry
        assert 'phone' in enquiry
        assert 'message' in enquiry
        assert 'status' in enquiry
        assert 'created_at' in enquiry
        print(f"PASS: Admin can get enquiries - {len(data)} found")
    
    def test_enquiry_default_status_unread(self, admin_token):
        """Verify new enquiries have 'unread' status by default"""
        # Create new enquiry
        unique_email = f"status_test_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/enquiries", json={
            "name": "Status Test",
            "email": unique_email,
            "phone": "9999888877",
            "message": "Testing status"
        })
        
        # Get enquiries
        response = requests.get(
            f"{BASE_URL}/api/enquiries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        data = response.json()
        enquiry = next((e for e in data if e['email'] == unique_email), None)
        assert enquiry is not None, "Test enquiry not found"
        assert enquiry['status'] == 'unread', f"Default status should be 'unread', got: {enquiry['status']}"
        print("PASS: New enquiries have 'unread' status by default")
    
    def test_update_enquiry_status(self, admin_token):
        """Verify admin can mark enquiry as read"""
        # Create test enquiry
        unique_email = f"mark_read_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/enquiries", json={
            "name": "Mark Read Test",
            "email": unique_email,
            "phone": "9999777766",
            "message": "Test marking as read"
        })
        
        # Get enquiry ID
        response = requests.get(
            f"{BASE_URL}/api/enquiries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        data = response.json()
        enquiry = next((e for e in data if e['email'] == unique_email), None)
        assert enquiry is not None, "Test enquiry not found"
        
        # Mark as read
        update_response = requests.put(
            f"{BASE_URL}/api/enquiries/{enquiry['id']}/status?status=read",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert update_response.status_code == 200, f"Failed to update status: {update_response.text}"
        
        # Verify status updated
        get_response = requests.get(
            f"{BASE_URL}/api/enquiries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        updated_enquiry = next((e for e in get_response.json() if e['id'] == enquiry['id']), None)
        assert updated_enquiry['status'] == 'read', "Status should be 'read'"
        print("PASS: Admin can mark enquiry as read")
    
    def test_delete_enquiry(self, admin_token):
        """Verify admin can delete enquiry"""
        # Create test enquiry
        unique_email = f"delete_test_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/enquiries", json={
            "name": "Delete Test",
            "email": unique_email,
            "phone": "9999666655",
            "message": "Test deletion"
        })
        
        # Get enquiry ID
        response = requests.get(
            f"{BASE_URL}/api/enquiries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        data = response.json()
        enquiry = next((e for e in data if e['email'] == unique_email), None)
        assert enquiry is not None, "Test enquiry not found"
        
        # Delete
        delete_response = requests.delete(
            f"{BASE_URL}/api/enquiries/{enquiry['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200, f"Failed to delete: {delete_response.text}"
        
        # Verify deleted
        get_response = requests.get(
            f"{BASE_URL}/api/enquiries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        deleted_enquiry = next((e for e in get_response.json() if e['id'] == enquiry['id']), None)
        assert deleted_enquiry is None, "Enquiry should be deleted"
        print("PASS: Admin can delete enquiry")


class TestEnquiriesRequiresAuth:
    """Test enquiries endpoints require admin auth"""
    
    def test_get_enquiries_requires_auth(self):
        """Verify GET /enquiries requires admin auth"""
        response = requests.get(f"{BASE_URL}/api/enquiries")
        assert response.status_code in [401, 403], f"Should require auth, got: {response.status_code}"
        print("PASS: GET enquiries requires authentication")
    
    def test_update_enquiry_requires_auth(self):
        """Verify PUT /enquiries/:id/status requires admin auth"""
        response = requests.put(f"{BASE_URL}/api/enquiries/fake-id/status?status=read")
        assert response.status_code in [401, 403], f"Should require auth, got: {response.status_code}"
        print("PASS: Update enquiry status requires authentication")
    
    def test_delete_enquiry_requires_auth(self):
        """Verify DELETE /enquiries/:id requires admin auth"""
        response = requests.delete(f"{BASE_URL}/api/enquiries/fake-id")
        assert response.status_code in [401, 403], f"Should require auth, got: {response.status_code}"
        print("PASS: Delete enquiry requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
