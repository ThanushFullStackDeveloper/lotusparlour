import requests
import sys
import json
from datetime import datetime, timedelta

class BeautyParlourAPITester:
    def __init__(self, base_url="https://parlour-pro-portal.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else ""
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "expected": expected_status,
                "actual": "Connection Error"
            })
            print(f"❌ Failed - Connection Error: {str(e)}")
            return False, {}

    def test_admin_seed(self):
        """Test admin seeding"""
        success, response = self.run_test(
            "Seed Admin",
            "POST",
            "api/seed/admin",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/admin/login",
            200,
            data={"email": "admin@lotus.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data={
                "name": f"Test User {timestamp}",
                "email": f"test{timestamp}@lotus.com",
                "phone": f"98765{timestamp[:5]}",
                "password": "testpass123"
            }
        )
        if success and 'token' in response:
            self.user_token = response['token']
            return True
        return False

    def test_services_crud(self):
        """Test services CRUD operations"""
        if not self.admin_token:
            return False

        # Create service
        service_data = {
            "name": "Test Facial Service",
            "price": 1500,
            "duration": 60,
            "description": "Deep cleansing facial for glowing skin",
            "image": "data:image/jpeg;base64,test"
        }
        
        success, response = self.run_test(
            "Create Service",
            "POST",
            "api/services",
            200,
            data=service_data,
            auth_token=self.admin_token
        )
        
        if not success:
            return False
            
        service_id = response.get('id')
        
        # Get all services
        success, _ = self.run_test(
            "Get All Services",
            "GET",
            "api/services",
            200
        )
        
        # Delete service
        if service_id:
            success, _ = self.run_test(
                "Delete Service",
                "DELETE",
                f"api/services/{service_id}",
                200,
                auth_token=self.admin_token
            )
        
        return True

    def test_staff_crud(self):
        """Test staff CRUD operations"""
        if not self.admin_token:
            return False

        # Create staff
        staff_data = {
            "name": "Test Staff Member",
            "role": "Senior Beautician",
            "experience": "5 years",
            "specialization": "Bridal Makeup",
            "photo": "data:image/jpeg;base64,test"
        }
        
        success, response = self.run_test(
            "Create Staff",
            "POST",
            "api/staff",
            200,
            data=staff_data,
            auth_token=self.admin_token
        )
        
        if not success:
            return False
            
        staff_id = response.get('id')
        
        # Get all staff
        success, _ = self.run_test(
            "Get All Staff",
            "GET",
            "api/staff",
            200
        )
        
        # Delete staff
        if staff_id:
            success, _ = self.run_test(
                "Delete Staff",
                "DELETE",
                f"api/staff/{staff_id}",
                200,
                auth_token=self.admin_token
            )
        
        return True

    def test_booking_flow(self):
        """Test appointment booking flow"""
        if not self.user_token:
            return False

        # Get services first
        success, services_response = self.run_test(
            "Get Services for Booking",
            "GET",
            "api/services",
            200
        )
        
        if not success or not services_response:
            return False

        # Get available slots
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        service_id = services_response[0]['id'] if services_response else 'test-service-id'
        
        success, slots_response = self.run_test(
            "Get Available Slots",
            "GET",
            f"api/appointments/available-slots?date={tomorrow}&service_id={service_id}",
            200
        )
        
        # Create appointment
        appointment_data = {
            "customer_name": "Test Customer",
            "customer_phone": "9876543210",
            "customer_email": "test@example.com",
            "service_id": service_id,
            "staff_id": None,
            "appointment_date": tomorrow,
            "appointment_time": "10:00"
        }
        
        success, appointment_response = self.run_test(
            "Create Appointment",
            "POST",
            "api/appointments",
            200,
            data=appointment_data,
            auth_token=self.user_token
        )
        
        # Get user appointments
        success, _ = self.run_test(
            "Get User Appointments",
            "GET",
            "api/appointments",
            200,
            auth_token=self.user_token
        )
        
        return True

    def test_admin_dashboard(self):
        """Test admin dashboard endpoints"""
        if not self.admin_token:
            return False

        # Test dashboard stats
        success, _ = self.run_test(
            "Dashboard Stats",
            "GET",
            "api/dashboard/stats",
            200,
            auth_token=self.admin_token
        )
        
        # Test revenue data
        success, _ = self.run_test(
            "Revenue Analytics",
            "GET",
            "api/dashboard/revenue",
            200,
            auth_token=self.admin_token
        )
        
        return True

    def test_gallery_management(self):
        """Test gallery CRUD operations"""
        if not self.admin_token:
            return False

        # Create gallery image
        gallery_data = {
            "category": "Bridal",
            "image": "data:image/jpeg;base64,testimage"
        }
        
        success, response = self.run_test(
            "Create Gallery Image",
            "POST",
            "api/gallery",
            200,
            data=gallery_data,
            auth_token=self.admin_token
        )
        
        # Get gallery
        success, _ = self.run_test(
            "Get Gallery",
            "GET",
            "api/gallery",
            200
        )
        
        return True

    def test_reviews_management(self):
        """Test reviews CRUD operations"""
        if not self.admin_token:
            return False

        # Create review
        review_data = {
            "customer_name": "Happy Customer",
            "rating": 5,
            "review_text": "Excellent service, very satisfied!"
        }
        
        success, response = self.run_test(
            "Create Review",
            "POST",
            "api/reviews",
            200,
            data=review_data,
            auth_token=self.admin_token
        )
        
        # Get reviews
        success, _ = self.run_test(
            "Get Public Reviews",
            "GET",
            "api/reviews",
            200
        )
        
        return True

    def test_holidays_management(self):
        """Test holidays CRUD operations"""
        if not self.admin_token:
            return False

        # Create holiday
        future_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        holiday_data = {
            "date": future_date,
            "reason": "Test Holiday"
        }
        
        success, response = self.run_test(
            "Create Holiday",
            "POST",
            "api/holidays",
            200,
            data=holiday_data,
            auth_token=self.admin_token
        )
        
        # Get holidays
        success, _ = self.run_test(
            "Get Holidays",
            "GET",
            "api/holidays",
            200
        )
        
        return True

    def test_coupons_management(self):
        """Test coupons CRUD operations"""
        if not self.admin_token:
            return False

        # Create coupon
        future_date = (datetime.now() + timedelta(days=30)).isoformat()
        coupon_data = {
            "code": "TESTCOUPON10",
            "discount_percent": 10,
            "valid_until": future_date
        }
        
        success, response = self.run_test(
            "Create Coupon",
            "POST",
            "api/coupons",
            200,
            data=coupon_data,
            auth_token=self.admin_token
        )
        
        # Get coupons
        success, _ = self.run_test(
            "Get Coupons",
            "GET",
            "api/coupons",
            200,
            auth_token=self.admin_token
        )
        
        return True

def main():
    print("🧪 Starting Beauty Parlour API Testing...")
    tester = BeautyParlourAPITester()
    
    # Test sequence
    test_results = []
    
    # Admin setup and authentication
    print("\n=== ADMIN AUTHENTICATION ===")
    test_results.append(("Admin Seed", tester.test_admin_seed()))
    test_results.append(("Admin Login", tester.test_admin_login()))
    
    # User authentication
    print("\n=== USER AUTHENTICATION ===")
    test_results.append(("User Registration", tester.test_user_registration()))
    
    # CRUD Operations
    print("\n=== SERVICES MANAGEMENT ===")
    test_results.append(("Services CRUD", tester.test_services_crud()))
    
    print("\n=== STAFF MANAGEMENT ===")
    test_results.append(("Staff CRUD", tester.test_staff_crud()))
    
    # Booking flow
    print("\n=== BOOKING SYSTEM ===")
    test_results.append(("Booking Flow", tester.test_booking_flow()))
    
    # Admin dashboard
    print("\n=== ADMIN DASHBOARD ===")
    test_results.append(("Dashboard Analytics", tester.test_admin_dashboard()))
    
    # Additional features
    print("\n=== ADDITIONAL FEATURES ===")
    test_results.append(("Gallery Management", tester.test_gallery_management()))
    test_results.append(("Reviews Management", tester.test_reviews_management()))
    test_results.append(("Holidays Management", tester.test_holidays_management()))
    test_results.append(("Coupons Management", tester.test_coupons_management()))
    
    # Print final results
    print("\n" + "="*60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("="*60)
    
    for test_name, success in test_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
    
    if tester.failed_tests:
        print("\n❌ FAILED TEST DETAILS:")
        for i, fail in enumerate(tester.failed_tests, 1):
            print(f"{i}. {fail['test']}")
            if 'error' in fail:
                print(f"   Error: {fail['error']}")
            else:
                print(f"   Expected: {fail['expected']}, Got: {fail['actual']}")
                if fail.get('response'):
                    print(f"   Response: {fail['response']}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate > 80 else 1

if __name__ == "__main__":
    sys.exit(main())