# SQLAlchemy models (User, Appointment, etc.)
from datetime import datetime
import bcrypt
import jwt
from flask import current_app
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Association table for Staff-Services many-to-many relationship
staff_services = db.Table('staff_services',
    db.Column('staff_id', db.Integer, db.ForeignKey('staff.id'), primary_key=True),
    db.Column('service_id', db.Integer, db.ForeignKey('services.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # user, admin, staff
    loyalty_points = db.Column(db.Integer, default=0)
    membership_tier = db.Column(db.String(20), default='standard')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='user', lazy=True)
    bookings = db.relationship('Booking', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'loyaltyPoints': self.loyalty_points,
            'membershipTier': self.membership_tier,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in minutes
    category = db.Column(db.String(50), nullable=False)
    image = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    staff_required = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='service', lazy=True)
    staff_members = db.relationship('Staff', secondary=staff_services, backref='services')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'duration': self.duration,
            'category': self.category,
            'image': self.image,
            'isActive': self.is_active,
            'staffRequired': self.staff_required,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Staff(db.Model):
    __tablename__ = 'staff'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)  # Changed from 'name'
    last_name = db.Column(db.String(50), nullable=False)   # Added last_name
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    specialty = db.Column(db.String(50), nullable=False)
    bio = db.Column(db.Text)
    experience = db.Column(db.Integer, default=0)  # in years
    image = db.Column(db.String(255))
    working_hours_start = db.Column(db.String(5), default='09:00')
    working_hours_end = db.Column(db.String(5), default='18:00')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='staff', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'name': f"{self.first_name} {self.last_name}",  # For compatibility
            'email': self.email,
            'phone': self.phone,
            'specialty': self.specialty,
            'bio': self.bio,
            'experience': self.experience,
            'image': self.image,
            'workingHours': {
                'start': self.working_hours_start,
                'end': self.working_hours_end
            },
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(5), nullable=False)  # HH:MM format
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    price = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with Booking
    bookings = db.relationship('Booking', backref='appointment', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'serviceId': self.service_id,
            'staffId': self.staff_id,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time,
            'status': self.status,
            'price': self.price,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            # Include related data
            'user': self.user.to_dict() if self.user else None,
            'service': self.service.to_dict() if self.service else None,
            'staff': self.staff.to_dict() if self.staff else None
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "appointmentId": self.appointment_id,
            "user": self.user.to_dict() if self.user else None,
            "appointment": self.appointment.to_dict() if self.appointment else None,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }