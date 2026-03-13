"""
Backend API Tests for New Features:
- Weekly working hours in settings
- Booking validation for past closing time  
- Multiple bookings per slot allowed
- Available slots filtering based on day/time
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSettingsWeeklyHours:
    """Test weekly hours configuration in settings"""
    
    def test_settings_has_weekly_hours(self):
        """Settings API returns weekly_hours array"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert 'weekly_hours' in data, "weekly_hours key missing from settings"
        assert len(data['weekly_hours']) == 7, "Should have 7 days in weekly_hours"
        
        # Check structure of each day
        for day_config in data['weekly_hours']:
            assert 'day' in day_config
            assert 'start_time' in day_config
            assert 'end_time' in day_config
            assert 'is_open' in day_config
        print("PASS: Settings has weekly_hours with correct structure")
    
    def test_admin_update_weekly_hours(self):
        """Admin can update weekly hours"""
        # Login as admin
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
        token = login_resp.json()['token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Update weekly hours - toggle Sunday to closed
        new_weekly_hours = [
            {"day": "Monday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Tuesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Wednesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Thursday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Friday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Saturday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Sunday", "start_time": "09:00", "end_time": "22:00", "is_open": False},
        ]
        
        update_resp = requests.put(f"{BASE_URL}/api/settings", json={
            "weekly_hours": new_weekly_hours
        }, headers=headers)
        assert update_resp.status_code == 200, f"Settings update failed: {update_resp.text}"
        
        # Verify the update
        get_resp = requests.get(f"{BASE_URL}/api/settings")
        data = get_resp.json()
        sunday = next((d for d in data['weekly_hours'] if d['day'] == 'Sunday'), None)
        assert sunday is not None
        assert sunday['is_open'] == False, "Sunday should be marked as closed"
        
        # Revert Sunday back to open for other tests
        new_weekly_hours[6]['is_open'] = True
        requests.put(f"{BASE_URL}/api/settings", json={
            "weekly_hours": new_weekly_hours
        }, headers=headers)
        
        print("PASS: Admin can update weekly hours successfully")


class TestAvailableSlotsAPI:
    """Test available slots endpoint with weekly hours logic"""
    
    def test_get_available_slots_today(self):
        """Get available slots for today"""
        # Get a service first
        services_resp = requests.get(f"{BASE_URL}/api/services")
        assert services_resp.status_code == 200
        services = services_resp.json()
        assert len(services) > 0, "Need at least one service for test"
        service_id = services[0]['id']
        
        # Get today's date
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = requests.get(f"{BASE_URL}/api/appointments/available-slots", params={
            "date": today,
            "service_id": service_id
        })
        assert response.status_code == 200
        data = response.json()
        
        # Should have either available slots or a closed message
        assert 'available' in data
        assert 'slots' in data
        
        if data['available']:
            # Today is open - check slots don't include past times
            now = datetime.now()
            current_minutes = now.hour * 60 + now.minute
            
            for slot in data['slots']:
                slot_hour, slot_min = map(int, slot.split(':'))
                slot_minutes = slot_hour * 60 + slot_min
                # Slots should be at least 30 mins in the future
                assert slot_minutes > current_minutes, f"Past slot {slot} should be filtered"
            print(f"PASS: Today's slots filtered correctly, {len(data['slots'])} available")
        else:
            print(f"PASS: Shop closed for today - message: {data.get('message')}")
    
    def test_get_slots_for_future_date(self):
        """Get available slots for a future date"""
        # Get a service
        services_resp = requests.get(f"{BASE_URL}/api/services")
        services = services_resp.json()
        service_id = services[0]['id']
        
        # Get tomorrow's date
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{BASE_URL}/api/appointments/available-slots", params={
            "date": tomorrow,
            "service_id": service_id
        })
        assert response.status_code == 200
        data = response.json()
        
        if data['available']:
            # All slots should be shown for future dates
            assert len(data['slots']) > 0, "Future date should have slots"
            print(f"PASS: Future date has {len(data['slots'])} slots available")
        else:
            print(f"PASS: Tomorrow is closed - message: {data.get('message')}")
    
    def test_closed_day_returns_no_slots(self):
        """Verify closed day returns no slots"""
        # First, set a day to closed
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@lotus.com",
            "password": "admin123"
        })
        token = login_resp.json()['token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Set Sunday to closed
        weekly_hours = [
            {"day": "Monday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Tuesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Wednesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Thursday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Friday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Saturday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Sunday", "start_time": "09:00", "end_time": "22:00", "is_open": False},
        ]
        requests.put(f"{BASE_URL}/api/settings", json={"weekly_hours": weekly_hours}, headers=headers)
        
        # Find next Sunday
        today = datetime.now()
        days_until_sunday = (6 - today.weekday()) % 7  # Sunday is 6
        if days_until_sunday == 0:
            days_until_sunday = 7  # If today is Sunday, get next Sunday
        next_sunday = (today + timedelta(days=days_until_sunday)).strftime("%Y-%m-%d")
        
        # Get services
        services_resp = requests.get(f"{BASE_URL}/api/services")
        service_id = services_resp.json()[0]['id']
        
        # Check slots for Sunday
        response = requests.get(f"{BASE_URL}/api/appointments/available-slots", params={
            "date": next_sunday,
            "service_id": service_id
        })
        data = response.json()
        
        assert data['available'] == False, "Closed day should not be available"
        assert 'Sunday' in data.get('message', ''), f"Message should mention Sunday: {data.get('message')}"
        
        # Revert Sunday to open
        weekly_hours[6]['is_open'] = True
        requests.put(f"{BASE_URL}/api/settings", json={"weekly_hours": weekly_hours}, headers=headers)
        
        print("PASS: Closed day correctly returns no slots")


class TestMultipleBookingsPerSlot:
    """Test that multiple customers can book the same time slot"""
    
    def test_multiple_bookings_same_slot(self):
        """Multiple users can book the same time slot"""
        # Create test user 1
        import random
        user1_email = f"test_multi1_{random.randint(1000,9999)}@test.com"
        reg1_resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User 1",
            "email": user1_email,
            "phone": f"+9199{random.randint(10000000,99999999)}",
            "password": "test123"
        })
        
        # If user exists, login instead
        if reg1_resp.status_code == 400:
            login1_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": user1_email,
                "password": "test123"
            })
            token1 = login1_resp.json()['token']
        else:
            assert reg1_resp.status_code == 200, f"User 1 registration failed: {reg1_resp.text}"
            token1 = reg1_resp.json()['token']
        
        # Create test user 2
        user2_email = f"test_multi2_{random.randint(1000,9999)}@test.com"
        reg2_resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User 2",
            "email": user2_email,
            "phone": f"+9199{random.randint(10000000,99999999)}",
            "password": "test123"
        })
        if reg2_resp.status_code == 400:
            login2_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": user2_email,
                "password": "test123"
            })
            token2 = login2_resp.json()['token']
        else:
            assert reg2_resp.status_code == 200, f"User 2 registration failed: {reg2_resp.text}"
            token2 = reg2_resp.json()['token']
        
        # Get a service
        services_resp = requests.get(f"{BASE_URL}/api/services")
        service_id = services_resp.json()[0]['id']
        
        # Pick a future date
        future_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        booking_time = "14:00"  # 2 PM
        
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # User 1 books the slot
        booking1_resp = requests.post(f"{BASE_URL}/api/appointments", json={
            "customer_name": "Test User 1",
            "customer_phone": "+919900000001",
            "customer_email": user1_email,
            "service_id": service_id,
            "appointment_date": future_date,
            "appointment_time": booking_time
        }, headers=headers1)
        assert booking1_resp.status_code == 200, f"User 1 booking failed: {booking1_resp.text}"
        print(f"User 1 booked slot {booking_time} on {future_date}")
        
        # User 2 books the SAME slot - should succeed with multiple bookings allowed
        booking2_resp = requests.post(f"{BASE_URL}/api/appointments", json={
            "customer_name": "Test User 2",
            "customer_phone": "+919900000002",
            "customer_email": user2_email,
            "service_id": service_id,
            "appointment_date": future_date,
            "appointment_time": booking_time
        }, headers=headers2)
        
        assert booking2_resp.status_code == 200, f"User 2 should be able to book same slot: {booking2_resp.text}"
        print(f"PASS: Multiple bookings allowed for same slot - both users booked {booking_time}")


class TestBookingPastClosingTime:
    """Test booking validation for past closing time"""
    
    def test_booking_closed_for_today_message(self):
        """Check that booking shows proper message when shop is closed"""
        # Get services
        services_resp = requests.get(f"{BASE_URL}/api/services")
        service_id = services_resp.json()[0]['id']
        
        # Get settings to check closing time
        settings_resp = requests.get(f"{BASE_URL}/api/settings")
        settings = settings_resp.json()
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = requests.get(f"{BASE_URL}/api/appointments/available-slots", params={
            "date": today,
            "service_id": service_id
        })
        data = response.json()
        
        # The message should be appropriate based on current time
        if not data['available']:
            assert 'closed' in data.get('message', '').lower() or 'another date' in data.get('message', '').lower()
            print(f"PASS: Proper closure message: {data.get('message')}")
        else:
            print(f"PASS: Shop is still open, {len(data['slots'])} slots available")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
