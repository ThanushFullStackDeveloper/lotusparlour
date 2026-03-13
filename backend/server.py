from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from twilio.rest import Client
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    duration: int
    description: str
    image: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ServiceCreate(BaseModel):
    name: str
    price: float
    duration: int
    description: str
    image: Optional[str] = None

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

# ============ AUTHENTICATION ROUTES ============

@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
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
    return staff

@api_router.put("/staff/{staff_id}", dependencies=[Depends(verify_admin)])
async def update_staff(staff_id: str, staff_data: StaffCreate):
    result = await db.staff.update_one(
        {"id": staff_id},
        {"$set": staff_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Staff not found")
    return {"message": "Staff updated successfully"}

@api_router.delete("/staff/{staff_id}", dependencies=[Depends(verify_admin)])
async def delete_staff(staff_id: str):
    result = await db.staff.delete_one({"id": staff_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Staff not found")
    return {"message": "Staff deleted successfully"}

# ============ SERVICE ROUTES ============

@api_router.get("/services")
async def get_all_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

@api_router.post("/services", dependencies=[Depends(verify_admin)])
async def create_service(service_data: ServiceCreate):
    service = Service(**service_data.model_dump())
    doc = service.model_dump()
    await db.services.insert_one(doc)
    return service

@api_router.put("/services/{service_id}", dependencies=[Depends(verify_admin)])
async def update_service(service_id: str, service_data: ServiceCreate):
    result = await db.services.update_one(
        {"id": service_id},
        {"$set": service_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service updated successfully"}

@api_router.delete("/services/{service_id}", dependencies=[Depends(verify_admin)])
async def delete_service(service_id: str):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}

# ============ APPOINTMENT ROUTES ============

@api_router.post("/appointments")
async def create_appointment(appointment_data: AppointmentCreate, payload: dict = Depends(verify_token)):
    # Check if date is a holiday
    holiday = await db.holidays.find_one({"date": appointment_data.appointment_date}, {"_id": 0})
    if holiday:
        raise HTTPException(status_code=400, detail="Today the parlour is closed. Please select another date.")
    
    # Check for double booking
    existing = await db.appointments.find_one({
        "appointment_date": appointment_data.appointment_date,
        "appointment_time": appointment_data.appointment_time,
        "staff_id": appointment_data.staff_id,
        "status": {"$ne": "cancelled"}
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
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
    
    # Populate service and staff details
    for apt in appointments:
        service = await db.services.find_one({"id": apt['service_id']}, {"_id": 0})
        apt['service'] = service
        if apt.get('staff_id'):
            staff = await db.staff.find_one({"id": apt['staff_id']}, {"_id": 0})
            apt['staff'] = staff
    
    return appointments

@api_router.get("/appointments/available-slots")
async def get_available_slots(date: str, service_id: str):
    # Check if date is a holiday
    holiday = await db.holidays.find_one({"date": date}, {"_id": 0})
    if holiday:
        return {"available": False, "message": "Parlour is closed on this date", "slots": []}
    
    # Generate time slots from 9 AM to 10 PM (closing time)
    all_slots = []
    for hour in range(9, 22):  # 9 AM to 10 PM
        all_slots.append(f"{hour:02d}:00")
        all_slots.append(f"{hour:02d}:30")
    
    # Get booked slots
    booked_appointments = await db.appointments.find({
        "appointment_date": date,
        "status": {"$ne": "cancelled"}
    }, {"_id": 0}).to_list(1000)
    
    booked_slots = [apt['appointment_time'] for apt in booked_appointments]
    available_slots = [slot for slot in all_slots if slot not in booked_slots]
    
    return {"available": True, "slots": available_slots}

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
async def approve_review(review_id: str):
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"approved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review approved"}

@api_router.delete("/reviews/{review_id}", dependencies=[Depends(verify_admin)])
async def delete_review(review_id: str):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

# ============ GALLERY ROUTES ============

@api_router.get("/gallery")
async def get_gallery():
    images = await db.gallery.find({}, {"_id": 0}).to_list(1000)
    return images

@api_router.post("/gallery", dependencies=[Depends(verify_admin)])
async def create_gallery_image(gallery_data: GalleryCreate):
    gallery = Gallery(**gallery_data.model_dump())
    doc = gallery.model_dump()
    await db.gallery.insert_one(doc)
    return gallery

@api_router.delete("/gallery/{image_id}", dependencies=[Depends(verify_admin)])
async def delete_gallery_image(image_id: str):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
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
    
    # Check if coupon is within valid time range
    now = datetime.now(timezone.utc)
    start_time = datetime.fromisoformat(coupon['start_time'])
    end_time = datetime.fromisoformat(coupon['end_time'])
    
    if now < start_time:
        raise HTTPException(status_code=400, detail="Coupon not yet active")
    
    if now > end_time:
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

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # Read file and encode to base64
    contents = await file.read()
    base64_encoded = base64.b64encode(contents).decode('utf-8')
    image_data = f"data:{file.content_type};base64,{base64_encoded}"
    return {"url": image_data}


# ============ SERVICE VIDEOS ROUTES ============

@api_router.get("/videos")
async def get_videos():
    videos = await db.service_videos.find({"is_active": True}, {"_id": 0}).to_list(1000)
    return videos

@api_router.get("/videos/all", dependencies=[Depends(verify_admin)])
async def get_all_videos():
    videos = await db.service_videos.find({}, {"_id": 0}).to_list(1000)
    return videos

@api_router.post("/videos", dependencies=[Depends(verify_admin)])
async def create_video(video_data: ServiceVideoCreate):
    video = ServiceVideo(**video_data.model_dump())
    doc = video.model_dump()
    await db.service_videos.insert_one(doc)
    return video

@api_router.put("/videos/{video_id}", dependencies=[Depends(verify_admin)])
async def update_video(video_id: str, video_data: ServiceVideoCreate):
    result = await db.service_videos.update_one(
        {"id": video_id},
        {"$set": video_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"message": "Video updated successfully"}

@api_router.delete("/videos/{video_id}", dependencies=[Depends(verify_admin)])
async def delete_video(video_id: str):
    result = await db.service_videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
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

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
