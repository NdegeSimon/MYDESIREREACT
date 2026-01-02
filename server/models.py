from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()

# ==============================
# ASSOCIATION TABLES
# ==============================

# Many-to-Many: Staff can provide multiple Services, Services can be provided by multiple Staff
staff_services = db.Table('staff_services',
    db.Column('staff_id', db.Integer, db.ForeignKey('staff.id'), primary_key=True),
    db.Column('service_id', db.Integer, db.ForeignKey('services.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

# ==============================
# USER MODEL
# ==============================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')  # user, admin, staff
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    loyalty_points = db.Column(db.Integer, default=0)
    membership_tier = db.Column(db.String(20), default='standard')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', back_populates='user', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', back_populates='user', cascade='all, delete-orphan')
    payments = db.relationship('Payment', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'isActive': self.is_active,
            'loyaltyPoints': self.loyalty_points,
            'membershipTier': self.membership_tier,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            # Include counts for frontend
            'appointmentCount': len(self.appointments),
            'bookingCount': len(self.bookings)
        }

# ==============================
# SERVICE MODEL
# ==============================

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    duration = db.Column(db.Integer, default=60)  # minutes
    category = db.Column(db.String(50), default='general')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    image = db.Column(db.String(255))
    staff_required = db.Column(db.Boolean, default=True)
    
    # Relationships
    appointments = db.relationship('Appointment', back_populates='service', cascade='all, delete-orphan')
    staff_members = db.relationship('Staff', secondary=staff_services, back_populates='services')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'duration': self.duration,
            'category': self.category,
            'isActive': self.is_active,
            'image': self.image,
            'staffRequired': self.staff_required,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            # Include related data
            'staffCount': len(self.staff_members),
            'appointmentCount': len(self.appointments)
        }

# ==============================
# STAFF MODEL
# ==============================

class Staff(db.Model):
    __tablename__ = 'staff'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    specialty = db.Column(db.String(50), default='hair-stylist')
    experience = db.Column(db.String(100))  # Text description
    bio = db.Column(db.Text)
    rating = db.Column(db.Float, default=0.0)
    image = db.Column(db.String(200), default='/api/placeholder/300/300')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    working_hours_start = db.Column(db.String(5), default='09:00')
    working_hours_end = db.Column(db.String(5), default='18:00')
    experience_years = db.Column(db.Integer, default=0)

    # Relationships
    appointments = db.relationship('Appointment', back_populates='staff', cascade='all, delete-orphan')
    services = db.relationship('Service', secondary=staff_services, back_populates='staff_members')
    availability = db.relationship('StaffAvailability', back_populates='staff', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'specialty': self.specialty,
            'experience': self.experience,
            'bio': self.bio,
            'rating': float(self.rating),
            'image': self.image,
            'isActive': self.is_active,
            'workingHours': {
                'start': self.working_hours_start,
                'end': self.working_hours_end
            },
            'experienceYears': self.experience_years,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            # Include related data
            'serviceCount': len(self.services),
            'appointmentCount': len(self.appointments),
            'availability': [avail.to_dict() for avail in self.availability]
        }

# ==============================
# APPOINTMENT MODEL
# ==============================

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(20), nullable=False)  # HH:MM format
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled, no-show
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='appointments')
    service = db.relationship('Service', back_populates='appointments')
    staff = db.relationship('Staff', back_populates='appointments')
    bookings = db.relationship('Booking', back_populates='appointment', cascade='all, delete-orphan')
    payments = db.relationship('Payment', back_populates='appointment', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'serviceId': self.service_id,
            'staffId': self.staff_id,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time,
            'price': float(self.price),
            'status': self.status,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            # Include related objects
            'user': self.user.to_dict() if self.user else None,
            'service': self.service.to_dict() if self.service else None,
            'staff': self.staff.to_dict() if self.staff else None,
            'hasBooking': len(self.bookings) > 0,
            'hasPayment': len(self.payments) > 0
        }

# ==============================
# BOOKING MODEL
# ==============================

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled, completed
    booking_reference = db.Column(db.String(50), unique=True)
    special_requests = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='bookings')
    appointment = db.relationship('Appointment', back_populates='bookings')
    payments = db.relationship('Payment', back_populates='booking', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'appointmentId': self.appointment_id,
            'status': self.status,
            'bookingReference': self.booking_reference,
            'specialRequests': self.special_requests,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            # Include related objects
            'user': self.user.to_dict() if self.user else None,
            'appointment': self.appointment.to_dict() if self.appointment else None,
            'hasPayment': len(self.payments) > 0
        }

# ==============================
# PAYMENT MODEL
# ==============================

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='KES')
    payment_method = db.Column(db.String(50), default='mpesa')  # mpesa, card, cash
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed, refunded
    transaction_id = db.Column(db.String(100), unique=True)
    phone_number = db.Column(db.String(20))  # For M-Pesa payments
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    # Relationships
    user = db.relationship('User', back_populates='payments')
    appointment = db.relationship('Appointment', back_populates='payments')
    booking = db.relationship('Booking', back_populates='payments')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'appointmentId': self.appointment_id,
            'bookingId': self.booking_id,
            'amount': float(self.amount),
            'currency': self.currency,
            'paymentMethod': self.payment_method,
            'status': self.status,
            'transactionId': self.transaction_id,
            'phoneNumber': self.phone_number,
            'description': self.description,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
            # Include related objects
            'user': self.user.to_dict() if self.user else None,
            'appointment': self.appointment.to_dict() if self.appointment else None,
            'booking': self.booking.to_dict() if self.booking else None
        }

# ==============================
# STAFF AVAILABILITY MODEL
# ==============================

class StaffAvailability(db.Model):
    __tablename__ = 'staff_availability'
    
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)
    day_of_week = db.Column(db.String(10), nullable=False)  # monday, tuesday, etc.
    start_time = db.Column(db.String(5), nullable=False)   # HH:MM format
    end_time = db.Column(db.String(5), nullable=False)     # HH:MM format
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    staff = db.relationship('Staff', back_populates='availability')

    def to_dict(self):
        return {
            'id': self.id,
            'staffId': self.staff_id,
            'dayOfWeek': self.day_of_week,
            'startTime': self.start_time,
            'endTime': self.end_time,
            'isAvailable': self.is_available,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

# ==============================
# DATABASE RELATIONSHIP SUMMARY:
# ==============================
"""
USER RELATIONSHIPS:
- One-to-Many: User → Appointments
- One-to-Many: User → Bookings  
- One-to-Many: User → Payments

SERVICE RELATIONSHIPS:
- One-to-Many: Service → Appointments
- Many-to-Many: Service ↔ Staff (through staff_services)

STAFF RELATIONSHIPS:
- One-to-Many: Staff → Appointments
- Many-to-Many: Staff ↔ Services (through staff_services)
- One-to-Many: Staff → StaffAvailability

APPOINTMENT RELATIONSHIPS:
- Many-to-One: Appointment → User
- Many-to-One: Appointment → Service
- Many-to-One: Appointment → Staff
- One-to-Many: Appointment → Bookings
- One-to-Many: Appointment → Payments

BOOKING RELATIONSHIPS:
- Many-to-One: Booking → User
- Many-to-One: Booking → Appointment
- One-to-Many: Booking → Payments

PAYMENT RELATIONSHIPS:
- Many-to-One: Payment → User
- Many-to-One: Payment → Appointment (optional)
- Many-to-One: Payment → Booking (optional)

STAFF_AVAILABILITY RELATIONSHIPS:
- Many-to-One: StaffAvailability → Staff
"""