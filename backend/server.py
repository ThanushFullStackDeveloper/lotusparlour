from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from fastapi.responses import RedirectResponse
import json

# IST Timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))
import jwt
import bcrypt
from twilio.rest import Client
import base64
import cloudinary
import cloudinary.uploader

# Setup logging early
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.getenv("MONGO_URL")
db_name = os.getenv("DB_NAME", "lotusdb")
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'lotus-beauty-parlour-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Twilio Configuration (optional - will not fail if not set)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ WEBSOCKET CONNECTION MANAGER ============

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                disconnected.append(connection)
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    password_hash: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    created_at: str

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Staff(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    experience: str
    specialization: str
    photo: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StaffCreate(BaseModel):
    name: str
    role: str
    experience: str
    specialization: str
    photo: Optional[str] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    discount_price: Optional[float] = None
    duration: int
    description: str
    image: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ServiceCreate(BaseModel):
    name: str
    price: float
    discount_price: Optional[float] = None
    duration: int
    description: str
    image: Optional[str] = None
    
    @validator('discount_price')
    def validate_discount_price(cls, v, values):
        if v is not None:
            if v < 0:
                raise ValueError('Discount price cannot be negative')
            if 'price' in values and v >= values['price']:
                raise ValueError('Discount price must be less than original price')
        return v

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    service_id: str
    staff_id: Optional[str] = None
    appointment_date: str
    appointment_time: str
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AppointmentCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    service_id: str
    staff_id: Optional[str] = None
    appointment_date: str
    appointment_time: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    rating: int
    review_text: str
    approved: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReviewCreate(BaseModel):
    customer_name: str
    rating: int
    review_text: str

class Gallery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    image: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GalleryCreate(BaseModel):
    category: str
    image: str

class Holiday(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    reason: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class HolidayCreate(BaseModel):
    date: str
    reason: str

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_percent: float
    start_time: str
    end_time: str
    active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CouponCreate(BaseModel):
    code: str
    discount_percent: float
    start_time: str
    end_time: str

class ServiceVideo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    youtube_url: str
    category: str
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ServiceVideoCreate(BaseModel):
    title: str
    description: str
    youtube_url: str
    category: str
    is_active: bool = True


class WeeklyHours(BaseModel):
    day: str
    start_time: str = "09:00"
    end_time: str = "22:00"
    is_open: bool = True

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    parlour_name: str = "Lotus Beauty Parlour"
    welcome_text: str = "Welcome to Lotus Beauty Parlour"
    tagline: str = "Transform your beauty journey with our premium makeup artistry and salon services in the heart of Tirunelveli."
    google_rating: str = "5.0"
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None
    hero_image: Optional[str] = None
    logo_image: Optional[str] = None
    years_experience: str = "5+"
    opening_time: str = "09:00"
    closing_time: str = "22:00"
    weekly_hours: Optional[List[dict]] = None
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SettingsUpdate(BaseModel):
    parlour_name: Optional[str] = None
    welcome_text: Optional[str] = None
    tagline: Optional[str] = None
    google_rating: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None
    hero_image: Optional[str] = None
    logo_image: Optional[str] = None
    years_experience: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    weekly_hours: Optional[List[dict]] = None

class SupportRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    email: Optional[str] = None
    phone: str
    problem: str
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SupportRequestCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: str
    problem: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str

class Enquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    message: str
    status: str = "unread"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EnquiryCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: str



# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def verify_admin(payload: dict = Depends(verify_token)):
    if payload.get('role') != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return payload

async def send_sms_reminder(phone: str, message: str):
    if twilio_client and TWILIO_PHONE_NUMBER:
        try:
            twilio_client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
        except Exception as e:
            logging.error(f"SMS sending failed: {str(e)}")

# =========== Server routes ==========

@app.get("/")
async def root():
    return {"message": "Backend running 🚀"}

@app.get("/")
async def root():
    return RedirectResponse(url="/api")


# ============ AUTHENTICATION ROUTES ============

@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for duplicate phone number
    existing_phone = await db.users.find_one({"phone": user_data.phone}, {"_id": 0})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password)
    )
    
    doc = user.model_dump()
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.email, 'user')
    return {"token": token, "user": UserResponse(**{k: v for k, v in doc.items() if k != 'password_hash'})}

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], 'user')
    return {"token": token, "user": UserResponse(**{k: v for k, v in user.items() if k != 'password_hash'})}

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    if not admin or not verify_password(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    token = create_token(admin['id'], admin['email'], 'admin')
    return {"token": token, "admin": {"id": admin['id'], "email": admin['email']}}

@api_router.get("/auth/me")
async def get_current_user(payload: dict = Depends(verify_token)):
    if payload['role'] == 'admin':
        admin = await db.admins.find_one({"id": payload['user_id']}, {"_id": 0})
        return {"role": "admin", "user": {"id": admin['id'], "email": admin['email']}}
    else:
        user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0, "password_hash": 0})
        return {"role": "user", "user": user}

# ============ STAFF ROUTES ============

@api_router.get("/staff")
async def get_all_staff():
    staff_list = await db.staff.find({}, {"_id": 0}).to_list(1000)
    return staff_list

@api_router.post("/staff", dependencies=[Depends(verify_admin)])
async def create_staff(staff_data: StaffCreate):
    staff = Staff(**staff_data.model_dump())
    doc = staff.model_dump()
    await db.staff.insert_one(doc)
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "staff", "action": "create"})
    return staff

@api_router.put("/staff/{staff_id}", dependencies=[Depends(verify_admin)])
async def update_staff(staff_id: str, staff_data: StaffCreate):
    result = await db.staff.update_one(
        {"id": staff_id},
        {"$set": staff_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Staff not found")
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "staff", "action": "update"})
    return {"message": "Staff updated successfully"}

@api_router.delete("/staff/{staff_id}", dependencies=[Depends(verify_admin)])
async def delete_staff(staff_id: str):
    result = await db.staff.delete_one({"id": staff_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Staff not found")
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "staff", "action": "delete"})
    return {"message": "Staff deleted successfully"}

# ============ SERVICE ROUTES ============

@api_router.get("/services")
async def get_all_services():
    # Return services without large image data for faster loading
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    # Truncate base64 images - only return URL-based images or short strings
    for service in services:
        if service.get('image') and len(service.get('image', '')) > 500:
            # It's a base64 image, truncate it for listing
            service['image_preview'] = service['image'][:100] + '...'
            service['has_large_image'] = True
        else:
            service['has_large_image'] = False
    return services

@api_router.get("/services/light")
async def get_services_light():
    # Return only essential service info without images
    services = await db.services.find({}, {
        "_id": 0, 
        "id": 1, 
        "name": 1, 
        "price": 1,
        "discount_price": 1,
        "duration": 1, 
        "category": 1,
        "description": 1
    }).to_list(1000)
    return services

@api_router.post("/services", dependencies=[Depends(verify_admin)])
async def create_service(service_data: ServiceCreate):
    service = Service(**service_data.model_dump())
    doc = service.model_dump()
    await db.services.insert_one(doc)
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "services", "action": "create"})
    return service

@api_router.put("/services/{service_id}", dependencies=[Depends(verify_admin)])
async def update_service(service_id: str, service_data: ServiceCreate):
    result = await db.services.update_one(
        {"id": service_id},
        {"$set": service_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "services", "action": "update"})
    return {"message": "Service updated successfully"}

@api_router.delete("/services/{service_id}", dependencies=[Depends(verify_admin)])
async def delete_service(service_id: str):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "services", "action": "delete"})
    return {"message": "Service deleted successfully"}

@api_router.get("/services/{service_id}/image")
async def get_service_image(service_id: str):
    """Get full image data for a specific service"""
    service = await db.services.find_one({"id": service_id}, {"_id": 0, "image": 1})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"image": service.get("image", "")}


# ============ APPOINTMENT ROUTES ============

@api_router.post("/appointments")
async def create_appointment(appointment_data: AppointmentCreate, payload: dict = Depends(verify_token)):
    # Check if date is a holiday
    holiday = await db.holidays.find_one({"date": appointment_data.appointment_date}, {"_id": 0})
    if holiday:
        raise HTTPException(status_code=400, detail="Today the parlour is closed. Please select another date.")
    
    # Allow multiple bookings for same time slot (removed conflict check)
    
    appointment = Appointment(
        user_id=payload.get('user_id'),
        **appointment_data.model_dump()
    )
    
    doc = appointment.model_dump()
    await db.appointments.insert_one(doc)
    
    return appointment

@api_router.get("/appointments")
async def get_appointments(payload: dict = Depends(verify_token)):
    if payload['role'] == 'admin':
        appointments = await db.appointments.find({}, {"_id": 0}).to_list(1000)
    else:
        appointments = await db.appointments.find({"user_id": payload['user_id']}, {"_id": 0}).to_list(1000)
    
    if not appointments:
        return appointments
    
    # Batch fetch all services and staff at once (much faster than individual queries)
    service_ids = list(set(apt.get('service_id') for apt in appointments if apt.get('service_id')))
    staff_ids = list(set(apt.get('staff_id') for apt in appointments if apt.get('staff_id')))
    
    # Fetch services and staff WITHOUT image data for faster loading
    # Exclude 'image' field which contains large base64 data
    services_list = await db.services.find(
        {"id": {"$in": service_ids}}, 
        {"_id": 0, "image": 0}
    ).to_list(100)
    staff_list = await db.staff.find(
        {"id": {"$in": staff_ids}}, 
        {"_id": 0, "image": 0}
    ).to_list(100)
    
    # Create lookup dictionaries
    services_map = {s['id']: s for s in services_list}
    staff_map = {s['id']: s for s in staff_list}
    
    # Populate service and staff details from cache
    for apt in appointments:
        apt['service'] = services_map.get(apt.get('service_id'))
        apt['staff'] = staff_map.get(apt.get('staff_id'))
    
    return appointments

@api_router.get("/appointments/available-slots")
async def get_available_slots(date: str, service_id: str):
    # Get settings for weekly hours
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    
    # Parse the requested date
    try:
        requested_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return {"available": False, "message": "Invalid date format", "slots": []}
    
    # Get day of week (0 = Monday, 6 = Sunday)
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = day_names[requested_date.weekday()]
    
    # Check weekly hours
    weekly_hours = settings.get('weekly_hours', []) if settings else []
    day_config = next((d for d in weekly_hours if d.get('day') == day_name), None)
    
    if day_config and not day_config.get('is_open', True):
        return {"available": False, "message": f"Parlour is closed on {day_name}", "slots": []}
    
    # Get opening and closing times for this day
    if day_config:
        start_time_str = day_config.get('start_time', '09:00')
        end_time_str = day_config.get('end_time', '22:00')
    else:
        start_time_str = settings.get('opening_time', '09:00') if settings else '09:00'
        end_time_str = settings.get('closing_time', '22:00') if settings else '22:00'
    
    start_hour = int(start_time_str.split(':')[0])
    end_hour = int(end_time_str.split(':')[0])
    
    # Generate time slots based on configured hours
    all_slots = []
    for hour in range(start_hour, end_hour):
        all_slots.append(f"{hour:02d}:00")
        all_slots.append(f"{hour:02d}:30")
    
    # Check if today and filter out past slots (using IST timezone)
    now = datetime.now(IST)
    today_str = now.strftime("%Y-%m-%d")
    
    if date == today_str:
        current_minutes = now.hour * 60 + now.minute
        # Check if shop is already closed for today
        closing_minutes = end_hour * 60
        if current_minutes >= closing_minutes:
            return {"available": False, "message": "Booking closed for today. Please select another date.", "slots": []}
        
        # Filter out past time slots
        valid_slots = []
        for slot in all_slots:
            slot_hour, slot_min = map(int, slot.split(':'))
            slot_minutes = slot_hour * 60 + slot_min
            # Only show slots at least 30 mins in the future
            if slot_minutes > current_minutes + 30:
                valid_slots.append(slot)
        all_slots = valid_slots
    
    # Allow multiple bookings - don't filter out booked slots
    return {"available": True, "slots": all_slots}

@api_router.put("/appointments/{appointment_id}/status", dependencies=[Depends(verify_admin)])
async def update_appointment_status(appointment_id: str, status: str):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Send SMS if confirmed
    if status == "confirmed":
        appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
        message = f"Your appointment at Lotus Beauty Parlour on {appointment['appointment_date']} at {appointment['appointment_time']} has been confirmed. See you soon!"
        await send_sms_reminder(appointment['customer_phone'], message)
    
    return {"message": "Appointment status updated"}

@api_router.get("/appointments/{appointment_id}/ics")
async def get_appointment_ics(appointment_id: str, payload: dict = Depends(verify_token)):
    """Generate ICS calendar file for an appointment"""
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Verify ownership (user can only download their own appointments)
    if payload['role'] != 'admin' and appointment.get('user_id') != payload['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to access this appointment")
    
    # Get service details
    service = await db.services.find_one({"id": appointment['service_id']}, {"_id": 0})
    service_name = service['name'] if service else 'Beauty Service'
    service_duration = service['duration'] if service else 60
    
    # Get staff details if assigned
    staff_name = "Any Available"
    if appointment.get('staff_id'):
        staff = await db.staff.find_one({"id": appointment['staff_id']}, {"_id": 0})
        if staff:
            staff_name = staff.get('name', 'Any Available')
    
    # Parlour details - fixed values as per requirement
    parlour_name = "Lotus Beauty Parlour"
    parlour_address = "3/41, East Street, Main Road, Puthumanai, Tirunelveli, Tamil Nadu 627120"
    parlour_phone = "09500673208"
    
    # Parse appointment date and time
    date_str = appointment['appointment_date']
    time_str = appointment['appointment_time']
    
    try:
        start_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        end_dt = start_dt + timedelta(minutes=service_duration)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid appointment date/time format")
    
    # Format datetime for ICS (YYYYMMDDTHHMMSS)
    start_ics = start_dt.strftime("%Y%m%dT%H%M%S")
    end_ics = end_dt.strftime("%Y%m%dT%H%M%S")
    created_ics = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    
    # Build ICS content with proper escaping for description
    # Note: DO NOT include customer phone, only parlour phone
    description = f"Service: {service_name}\\nStaff: {staff_name}\\n\\nContact Parlour: {parlour_phone}"
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lotus Beauty Parlour//Appointment Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{appointment_id}@lotusbeauty.com
DTSTAMP:{created_ics}
DTSTART:{start_ics}
DTEND:{end_ics}
SUMMARY:Lotus Beauty Parlour Appointment
DESCRIPTION:{description}
LOCATION:{parlour_address}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Appointment reminder: {service_name} in 1 hour
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Appointment reminder: {service_name} tomorrow
END:VALARM
END:VEVENT
END:VCALENDAR"""

    # Return as downloadable ICS file
    filename = f"appointment_{appointment_id[:8]}.ics"
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

# ============ REVIEW ROUTES ============

@api_router.get("/reviews")
async def get_reviews():
    reviews = await db.reviews.find({"approved": True}, {"_id": 0}).to_list(1000)
    return reviews

@api_router.get("/reviews/all", dependencies=[Depends(verify_admin)])
async def get_all_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).to_list(1000)
    return reviews

@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate):
    """Customer can submit a review (will need admin approval)"""
    review = Review(**review_data.model_dump(), approved=False)
    doc = review.model_dump()
    await db.reviews.insert_one(doc)
    return {"message": "Review submitted successfully. It will be visible after admin approval."}

@api_router.post("/reviews/admin", dependencies=[Depends(verify_admin)])
async def create_review_admin(review_data: ReviewCreate):
    """Admin can directly create an approved review"""
    review = Review(**review_data.model_dump(), approved=True)
    doc = review.model_dump()
    await db.reviews.insert_one(doc)
    return review

@api_router.put("/reviews/{review_id}/approve", dependencies=[Depends(verify_admin)])
async def approve_review(review_id: str):
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"approved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review approved"}

@api_router.put("/reviews/{review_id}/unapprove", dependencies=[Depends(verify_admin)])
async def unapprove_review(review_id: str):
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"approved": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review unapproved"}

@api_router.delete("/reviews/{review_id}", dependencies=[Depends(verify_admin)])
async def delete_review(review_id: str):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

# ============ GALLERY ROUTES ============

@api_router.get("/gallery")
async def get_gallery():
    # Return only metadata without base64 images for faster loading
    images = await db.gallery.find({}, {"_id": 0, "id": 1, "category": 1, "created_at": 1}).to_list(1000)
    return images

@api_router.get("/gallery/full")
async def get_gallery_full():
    # Return full gallery with images (for admin or when needed)
    images = await db.gallery.find({}, {"_id": 0}).to_list(1000)
    return images

@api_router.get("/gallery/{image_id}/image")
async def get_gallery_image(image_id: str):
    # Get single image by ID
    image = await db.gallery.find_one({"id": image_id}, {"_id": 0, "image": 1})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"image": image.get("image", "")}

@api_router.post("/gallery", dependencies=[Depends(verify_admin)])
async def create_gallery_image(gallery_data: GalleryCreate):
    gallery = Gallery(**gallery_data.model_dump())
    doc = gallery.model_dump()
    await db.gallery.insert_one(doc)
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "gallery", "action": "create"})
    return gallery

@api_router.delete("/gallery/{image_id}", dependencies=[Depends(verify_admin)])
async def delete_gallery_image(image_id: str):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "gallery", "action": "delete"})
    return {"message": "Image deleted"}

# ============ HOLIDAY ROUTES ============

@api_router.get("/holidays")
async def get_holidays():
    holidays = await db.holidays.find({}, {"_id": 0}).to_list(1000)
    return holidays

@api_router.post("/holidays", dependencies=[Depends(verify_admin)])
async def create_holiday(holiday_data: HolidayCreate):
    holiday = Holiday(**holiday_data.model_dump())
    doc = holiday.model_dump()
    await db.holidays.insert_one(doc)
    return holiday

@api_router.delete("/holidays/{holiday_id}", dependencies=[Depends(verify_admin)])
async def delete_holiday(holiday_id: str):
    result = await db.holidays.delete_one({"id": holiday_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Holiday not found")
    return {"message": "Holiday deleted"}

# ============ COUPON ROUTES ============

@api_router.get("/coupons", dependencies=[Depends(verify_admin)])
async def get_coupons():
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(1000)
    return coupons

@api_router.post("/coupons", dependencies=[Depends(verify_admin)])
async def create_coupon(coupon_data: CouponCreate):
    coupon = Coupon(**coupon_data.model_dump())
    doc = coupon.model_dump()
    await db.coupons.insert_one(doc)
    return coupon

@api_router.get("/coupons/validate/{code}")
async def validate_coupon(code: str):
    coupon = await db.coupons.find_one({"code": code, "active": True}, {"_id": 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon")
    
    now = datetime.now(timezone.utc)
    
    # Helper to parse various datetime formats
    def parse_datetime(dt_str: str) -> datetime:
        if not dt_str:
            return None
        try:
            # Try full ISO format with timezone
            dt = datetime.fromisoformat(dt_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            pass
        # Try date-only format (YYYY-MM-DD)
        try:
            dt = datetime.strptime(dt_str, "%Y-%m-%d")
            return dt.replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
        except ValueError:
            return None
    
    # Check start_time if present
    if 'start_time' in coupon and coupon['start_time']:
        start_time = parse_datetime(coupon['start_time'])
        if start_time and now < start_time:
            raise HTTPException(status_code=400, detail="Coupon not yet active")
    
    # Check end_time or valid_until if present
    end_time_str = coupon.get('end_time') or coupon.get('valid_until')
    if end_time_str:
        end_time = parse_datetime(end_time_str)
        if end_time and now > end_time:
            raise HTTPException(status_code=400, detail="Coupon expired")
    
    return coupon

@api_router.delete("/coupons/{coupon_id}", dependencies=[Depends(verify_admin)])
async def delete_coupon(coupon_id: str):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}

# ============ DASHBOARD ANALYTICS ============

@api_router.get("/dashboard/stats", dependencies=[Depends(verify_admin)])
async def get_dashboard_stats():
    total_appointments = await db.appointments.count_documents({})
    
    today = datetime.now(timezone.utc).date().isoformat()
    today_bookings = await db.appointments.count_documents({"appointment_date": today})
    
    pending_appointments = await db.appointments.count_documents({"status": "pending"})
    
    # Calculate revenue (assuming cash payment at parlour)
    appointments = await db.appointments.find({"status": {"$in": ["confirmed", "completed"]}}, {"_id": 0}).to_list(10000)
    total_revenue = 0
    for apt in appointments:
        service = await db.services.find_one({"id": apt['service_id']}, {"_id": 0})
        if service:
            total_revenue += service['price']
    
    return {
        "total_appointments": total_appointments,
        "today_bookings": today_bookings,
        "pending_appointments": pending_appointments,
        "total_revenue": total_revenue
    }

@api_router.get("/dashboard/revenue", dependencies=[Depends(verify_admin)])
async def get_revenue_data():
    appointments = await db.appointments.find({"status": {"$in": ["confirmed", "completed"]}}, {"_id": 0}).to_list(10000)
    
    # Group by date and service
    daily_revenue = {}
    service_revenue = {}
    
    for apt in appointments:
        service = await db.services.find_one({"id": apt['service_id']}, {"_id": 0})
        if service:
            date = apt['appointment_date']
            daily_revenue[date] = daily_revenue.get(date, 0) + service['price']
            
            service_name = service['name']
            service_revenue[service_name] = service_revenue.get(service_name, 0) + service['price']
    
    # Convert to list format for charts
    daily_data = [{"date": k, "revenue": v} for k, v in sorted(daily_revenue.items())]
    service_data = [{"name": k, "revenue": v} for k, v in service_revenue.items()]
    
    return {
        "daily_revenue": daily_data,
        "service_revenue": service_data
    }

# ============ FILE UPLOAD ============

# @api_router.post("/upload")
# async def upload_image(file: UploadFile = File(...)):
#     # Read file and encode to base64
#     contents = await file.read()
#     base64_encoded = base64.b64encode(contents).decode('utf-8')
#     image_data = f"data:{file.content_type};base64,{base64_encoded}"
#     return {"url": image_data}

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        result = cloudinary.uploader.upload(
            contents,
            folder="lotus_parlour",
            resource_type="image"
        )

        return {"url": result["secure_url"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ SERVICE VIDEOS ROUTES ============

@api_router.get("/videos")
async def get_videos():
    videos = await db.service_videos.find({"is_active": True}, {"_id": 0}).to_list(1000)
    return videos

@api_router.get("/videos/all", dependencies=[Depends(verify_admin)])
async def get_all_videos():
    videos = await db.service_videos.find({}, {"_id": 0}).to_list(1000)
    return videos


# ============ SETTINGS ROUTES ============

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        # Create default settings with weekly hours
        default_weekly_hours = [
            {"day": "Monday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Tuesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Wednesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Thursday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Friday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Saturday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Sunday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
        ]
        default_settings = Settings(weekly_hours=default_weekly_hours)
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings.model_dump()
    
    # Ensure weekly_hours exists for existing settings
    if not settings.get('weekly_hours'):
        default_weekly_hours = [
            {"day": "Monday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Tuesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Wednesday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Thursday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Friday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Saturday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
            {"day": "Sunday", "start_time": "09:00", "end_time": "22:00", "is_open": True},
        ]
        settings['weekly_hours'] = default_weekly_hours
        await db.settings.update_one({"id": "site_settings"}, {"$set": {"weekly_hours": default_weekly_hours}})
    
    return settings

@api_router.put("/settings", dependencies=[Depends(verify_admin)])
async def update_settings(settings_data: SettingsUpdate):
    update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": update_data},
        upsert=True
    )
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "settings", "action": "update"})
    return {"message": "Settings updated successfully"}

# ============ SUPPORT ROUTES ============

@api_router.post("/support")
async def create_support_request(request_data: SupportRequestCreate):
    support_request = SupportRequest(**request_data.model_dump())
    doc = support_request.model_dump()
    await db.support_requests.insert_one(doc)
    return {"message": "Support request submitted successfully"}

@api_router.get("/support", dependencies=[Depends(verify_admin)])
async def get_support_requests():
    requests = await db.support_requests.find({}, {"_id": 0}).to_list(1000)
    return requests

@api_router.put("/support/{request_id}/status", dependencies=[Depends(verify_admin)])
async def update_support_status(request_id: str, status: str):
    result = await db.support_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": "Status updated"}

@api_router.delete("/support/{request_id}", dependencies=[Depends(verify_admin)])
async def delete_support_request(request_id: str):
    result = await db.support_requests.delete_one({"id": request_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": "Request deleted"}

# ============ CUSTOMER MANAGEMENT ============

@api_router.get("/customers", dependencies=[Depends(verify_admin)])
async def get_customers():
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    # Add booking count for each user
    for user in users:
        booking_count = await db.appointments.count_documents({"user_id": user['id']})
        user['total_bookings'] = booking_count
    
    return users

@api_router.put("/customers/{user_id}/reset-password", dependencies=[Depends(verify_admin)])
async def admin_reset_customer_password(user_id: str):
    # Generate temporary password
    temp_password = str(uuid.uuid4())[:8]
    password_hash = hash_password(temp_password)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": password_hash, "force_password_reset": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Password reset", "temporary_password": temp_password}

@api_router.put("/customers/{user_id}", dependencies=[Depends(verify_admin)])
async def update_customer(user_id: str, customer_data: dict):
    update_data = {}
    if 'name' in customer_data:
        update_data['name'] = customer_data['name']
    if 'email' in customer_data:
        # Check if email is already taken by another user
        existing = await db.users.find_one({"email": customer_data['email'], "id": {"$ne": user_id}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data['email'] = customer_data['email']
    if 'phone' in customer_data:
        update_data['phone'] = customer_data['phone']
    if 'password' in customer_data and customer_data['password']:
        update_data['password_hash'] = hash_password(customer_data['password'])
        update_data['force_password_reset'] = True
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Customer updated successfully"}

@api_router.delete("/customers/{user_id}", dependencies=[Depends(verify_admin)])
async def delete_customer(user_id: str):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    # Also delete their appointments
    await db.appointments.delete_many({"user_id": user_id})
    return {"message": "Customer deleted successfully"}

# ============ ADMIN PASSWORD CHANGE ============

@api_router.put("/admin/change-password", dependencies=[Depends(verify_admin)])
async def change_admin_password(password_data: AdminPasswordChange, payload: dict = Depends(verify_admin)):
    admin = await db.admins.find_one({"id": payload['user_id']}, {"_id": 0})
    
    if not verify_password(password_data.current_password, admin['password_hash']):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = hash_password(password_data.new_password)
    await db.admins.update_one(
        {"id": payload['user_id']},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Password changed successfully"}

# ============ PHONE LOGIN ============

@api_router.post("/auth/login-phone")
async def login_with_phone(phone: str, password: str):
    user = await db.users.find_one({"phone": phone}, {"_id": 0})
    if not user or not verify_password(password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if forced password reset
    if user.get('force_password_reset'):
        token = create_token(user['id'], user['email'], 'user')
        return {
            "token": token,
            "force_password_reset": True,
            "user": UserResponse(**{k: v for k, v in user.items() if k != 'password_hash'})
        }
    
    token = create_token(user['id'], user['email'], 'user')
    return {"token": token, "user": UserResponse(**{k: v for k, v in user.items() if k != 'password_hash'})}

# ============ UNIFIED LOGIN (Customer + Admin from same page) ============

class UnifiedLogin(BaseModel):
    identifier: str  # Can be email or phone
    password: str

@api_router.post("/auth/unified-login")
async def unified_login(login_data: UnifiedLogin):
    """
    Unified login endpoint that checks both customer and admin accounts.
    First checks customer, then admin if customer not found.
    """
    identifier = login_data.identifier.strip()
    password = login_data.password
    
    # Step 1: Try to find customer by email or phone
    user = await db.users.find_one(
        {"$or": [{"email": identifier}, {"phone": identifier}]}, 
        {"_id": 0}
    )
    
    if user and verify_password(password, user['password_hash']):
        # Customer login successful
        # Check if forced password reset
        if user.get('force_password_reset'):
            token = create_token(user['id'], user['email'], 'user')
            return {
                "token": token,
                "role": "customer",
                "force_password_reset": True,
                "user": UserResponse(**{k: v for k, v in user.items() if k != 'password_hash'})
            }
        
        token = create_token(user['id'], user['email'], 'user')
        return {
            "token": token,
            "role": "customer",
            "user": UserResponse(**{k: v for k, v in user.items() if k != 'password_hash'})
        }
    
    # Step 2: Try to find admin by email
    admin = await db.admins.find_one({"email": identifier}, {"_id": 0})
    
    if admin and verify_password(password, admin['password_hash']):
        # Admin login successful
        token = create_token(admin['id'], admin['email'], 'admin')
        return {
            "token": token,
            "role": "admin",
            "user": {"id": admin['id'], "email": admin['email'], "name": "Admin"}
        }
    
    # Neither customer nor admin credentials matched
    raise HTTPException(status_code=401, detail="Invalid credentials")

# ============ USER PASSWORD RESET ============

@api_router.post("/auth/reset-password")
async def reset_password(new_password: str, payload: dict = Depends(verify_token)):
    password_hash = hash_password(new_password)
    
    result = await db.users.update_one(
        {"id": payload['user_id']},
        {"$set": {"password_hash": password_hash, "force_password_reset": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Password updated successfully"}

@api_router.post("/videos", dependencies=[Depends(verify_admin)])
async def create_video(video_data: ServiceVideoCreate):
    video = ServiceVideo(**video_data.model_dump())
    doc = video.model_dump()
    await db.service_videos.insert_one(doc)
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "videos", "action": "create"})
    return video

@api_router.put("/videos/{video_id}", dependencies=[Depends(verify_admin)])
async def update_video(video_id: str, video_data: ServiceVideoCreate):
    result = await db.service_videos.update_one(
        {"id": video_id},
        {"$set": video_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "videos", "action": "update"})
    return {"message": "Video updated successfully"}

@api_router.delete("/videos/{video_id}", dependencies=[Depends(verify_admin)])
async def delete_video(video_id: str):
    result = await db.service_videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    # Broadcast update to all connected clients
    await manager.broadcast({"type": "update", "entity": "videos", "action": "delete"})
    return {"message": "Video deleted successfully"}

# ============ SEED DATA ============

@api_router.post("/seed/admin")
async def seed_admin():
    existing = await db.admins.find_one({"email": "admin@lotus.com"}, {"_id": 0})
    if existing:
        return {"message": "Admin already exists"}
    
    admin = Admin(
        email="admin@lotus.com",
        password_hash=hash_password("admin123")
    )
    await db.admins.insert_one(admin.model_dump())
    return {"message": "Admin created", "email": "admin@lotus.com", "password": "admin123"}

# ============ ENQUIRIES ROUTES ============

@api_router.post("/enquiries")
async def create_enquiry(enquiry_data: EnquiryCreate):
    enquiry = Enquiry(**enquiry_data.model_dump())
    doc = enquiry.model_dump()
    await db.enquiries.insert_one(doc)
    return {"message": "Enquiry submitted successfully"}

@api_router.get("/enquiries", dependencies=[Depends(verify_admin)])
async def get_enquiries():
    enquiries = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return enquiries

@api_router.put("/enquiries/{enquiry_id}/status", dependencies=[Depends(verify_admin)])
async def update_enquiry_status(enquiry_id: str, status: str):
    result = await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"message": "Status updated"}

@api_router.delete("/enquiries/{enquiry_id}", dependencies=[Depends(verify_admin)])
async def delete_enquiry(enquiry_id: str):
    result = await db.enquiries.delete_one({"id": enquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"message": "Enquiry deleted"}

# ============ WEBSOCKET ENDPOINT ============

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for any client messages
            data = await websocket.receive_text()
            # Echo back or handle ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
