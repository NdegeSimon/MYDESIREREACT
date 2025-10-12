from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, JWTManager
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# ==============================
# Database Config
# ==============================
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///salon.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "your-super-secret-jwt-key-change-this-in-production"

# Initialize extensions
bcrypt = Bcrypt(app)

# Import and initialize db
from models import db
db.init_app(app)

migrate = Migrate(app, db)
jwt = JWTManager(app)

# Import all models after db initialization
from models import User, Service, Staff, Appointment, Booking, Payment, StaffAvailability

# ==============================
# DATABASE INITIALIZATION
# ==============================

def initialize_database():
    """Create database tables and admin user with sample data"""
    try:
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Create admin user if it doesn't exist
        if not User.query.filter_by(email='admin@salon.com').first():
            admin = User(
                first_name='Admin',
                last_name='User',
                email='admin@salon.com',
                phone='+254700000000',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("✅ Admin user created: admin@salon.com / admin123")
        
        # Create sample customer for testing
        if not User.query.filter_by(email='customer@example.com').first():
            customer = User(
                first_name='John',
                last_name='Doe',
                email='customer@example.com',
                phone='+254711111111',
                role='user'
            )
            customer.set_password('password123')
            db.session.add(customer)
            print("✅ Sample customer created: customer@example.com / password123")
            
        # Create sample services if none exist
        if Service.query.count() == 0:
            services = [
                Service(
                    name="Women's Haircut & Style",
                    description="Professional haircut tailored to your style",
                    price=1500,
                    duration=60,
                    category="hair"
                ),
                Service(
                    name="Men's Haircut",
                    description="Classic or modern men's haircut",
                    price=800,
                    duration=30,
                    category="hair"
                ),
                Service(
                    name="Spa Manicure",
                    description="Luxurious manicure with hand massage",
                    price=1200,
                    duration=45,
                    category="nails"
                ),
                Service(
                    name="Classic Facial",
                    description="Deep cleansing and hydrating facial treatment",
                    price=2000,
                    duration=60,
                    category="skincare"
                )
            ]
            db.session.add_all(services)
            print("✅ Sample services created")
            
        # Create sample staff if none exist
        if Staff.query.count() == 0:
            staff_members = [
                Staff(
                    first_name='Sarah',
                    last_name='Johnson',
                    email='sarah@salon.com',
                    phone='+254722222222',
                    specialty='hair-stylist',
                    experience='5 years in hair styling',
                    bio='Expert hair stylist with 5 years experience',
                    rating=4.8
                ),
                Staff(
                    first_name='Mike',
                    last_name='Brown', 
                    email='mike@salon.com',
                    phone='+254733333333',
                    specialty='barber',
                    experience='3 years in barbering',
                    bio='Professional barber specializing in modern cuts',
                    rating=4.7
                ),
                Staff(
                    first_name='Emma',
                    last_name='Wilson',
                    email='emma@salon.com',
                    phone='+254744444444',
                    specialty='skincare-specialist',
                    experience='4 years in skincare',
                    bio='Certified skincare specialist with 4 years experience',
                    rating=4.9
                )
            ]
            db.session.add_all(staff_members)
            print("✅ Sample staff created")
            
        db.session.commit()
        print("✅ Database initialization completed successfully!")
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error initializing database: {e}")

# Initialize database when app starts
with app.app_context():
    initialize_database()

# ==============================
# ROUTES
# ==============================

@app.route("/")
def home():
    return jsonify({'message': 'Welcome to Salon Booking API', 'version': '1.0.0'})

# ===== DEBUG & HEALTH ROUTES =====
@app.route('/api/health', methods=['GET'])
def api_health_check():
    return jsonify({'status': 'healthy', 'message': 'Salon Booking API is running!'})

@app.route('/api/debug/users', methods=['GET'])
def debug_users():
    """List all users for debugging"""
    try:
        users = User.query.all()
        return jsonify({
            'total_users': len(users),
            'users': [{'id': u.id, 'email': u.email, 'role': u.role, 'firstName': u.first_name} for u in users]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug/database', methods=['GET'])
def debug_database():
    """Debug endpoint to check all database tables"""
    try:
        users_count = User.query.count()
        services_count = Service.query.count()
        staff_count = Staff.query.count()
        appointments_count = Appointment.query.count()
        bookings_count = Booking.query.count()
        payments_count = Payment.query.count()
        availability_count = StaffAvailability.query.count()
        
        return jsonify({
            'database_stats': {
                'users': users_count,
                'services': services_count,
                'staff': staff_count,
                'appointments': appointments_count,
                'bookings': bookings_count,
                'payments': payments_count,
                'staff_availability': availability_count
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== AUTHENTICATION ROUTES =====
@app.route('/api/auth/signup', methods=['POST'])
def auth_signup():
    try:
        data = request.get_json()
        print(f"📝 Signup attempt for: {data.get('email')}")
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Check required fields
        required_fields = ['firstName', 'lastName', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'message': 'User already exists with this email'}), 400
        
        # Create new user
        user = User(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            email=data.get('email'),
            phone=data.get('phone', ''),
            role='user'  # Default role
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        print(f"✅ User created successfully: {user.email}")
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Signup error: {str(e)}")
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        print(f"🔐 Login attempt for: {email}")

        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print("❌ User not found")
            return jsonify({'message': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 403
        
        print(f"✅ User found: {user.email}, checking password...")
        
        # Check password
        if not user.check_password(password):
            print("❌ Invalid password")
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        print(f"✅ Login successful for: {user.email}")
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({'message': 'Error during login', 'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def auth_me():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching user', 'error': str(e)}), 500

# ===== USER ROUTES =====
@app.route('/api/users/profile', methods=['GET'])
@jwt_required()
def user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching profile', 'error': str(e)}), 500

@app.route('/api/users/profile', methods=['PUT'])
@jwt_required()
def user_update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        data = request.get_json()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Update user fields
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'phone' in data:
            user.phone = data['phone']
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'message': 'Email already taken'}), 400
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating profile', 'error': str(e)}), 500

# ===== SERVICE ROUTES =====
@app.route('/api/services', methods=['GET'])
def api_get_services():
    try:
        services = Service.query.filter_by(is_active=True).all()
        return jsonify({
            'services': [service.to_dict() for service in services]
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching services', 'error': str(e)}), 500

@app.route('/api/services/<int:service_id>', methods=['GET'])
def api_get_service(service_id):
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({'message': 'Service not found'}), 404
        return jsonify({'service': service.to_dict()}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching service', 'error': str(e)}), 500

# ===== STAFF ROUTES =====
@app.route('/api/staff', methods=['GET'])
def api_get_staff():
    try:
        staff = Staff.query.filter_by(is_active=True).all()
        return jsonify({
            'staff': [s.to_dict() for s in staff]
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching staff', 'error': str(e)}), 500

@app.route('/api/staff/<int:staff_id>', methods=['GET'])
def api_get_staff_member(staff_id):
    try:
        staff = Staff.query.get(staff_id)
        if not staff:
            return jsonify({'message': 'Staff not found'}), 404
        return jsonify({'staff': staff.to_dict()}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching staff member', 'error': str(e)}), 500

# ===== APPOINTMENT ROUTES =====
@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def api_get_appointments():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # If user is admin, return all appointments. Otherwise, return only user's appointments.
        if user.role == 'admin':
            appointments = Appointment.query.all()
        else:
            appointments = Appointment.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'appointments': [appointment.to_dict() for appointment in appointments]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching appointments', 'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def api_create_appointment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Check if the service exists
        service = Service.query.get(data.get('serviceId'))
        if not service:
            return jsonify({'message': 'Service not found'}), 404
        
        # Check if the staff exists
        staff = Staff.query.get(data.get('staffId'))
        if not staff:
            return jsonify({'message': 'Staff not found'}), 404
        
        # Parse date and time
        appointment_date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
        appointment_time = data.get('time')
        
        # Check if the staff is available at the given date and time
        existing_appointment = Appointment.query.filter_by(
            staff_id=staff.id,
            date=appointment_date,
            time=appointment_time
        ).first()
        
        if existing_appointment:
            return jsonify({'message': 'Staff is not available at this time'}), 400
        
        # Create new appointment
        appointment = Appointment(
            user_id=user_id,
            service_id=service.id,
            staff_id=staff.id,
            date=appointment_date,
            time=appointment_time,
            price=service.price,
            notes=data.get('notes', '')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating appointment', 'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['GET'])
@jwt_required()
def api_get_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404
        
        # Check if the user is allowed to view this appointment
        user = User.query.get(user_id)
        if user.role != 'admin' and appointment.user_id != user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        return jsonify({'appointment': appointment.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching appointment', 'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def api_update_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        data = request.get_json()
        
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404
        
        # Check if the user is allowed to update this appointment
        user = User.query.get(user_id)
        if user.role != 'admin' and appointment.user_id != user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Update appointment fields
        if 'serviceId' in data:
            service = Service.query.get(data['serviceId'])
            if not service:
                return jsonify({'message': 'Service not found'}), 404
            appointment.service_id = service.id
            appointment.price = service.price
        
        if 'staffId' in data:
            staff = Staff.query.get(data['staffId'])
            if not staff:
                return jsonify({'message': 'Staff not found'}), 404
            appointment.staff_id = staff.id
        
        if 'date' in data:
            appointment.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        if 'time' in data:
            appointment.time = data['time']
        
        if 'status' in data and user.role == 'admin':
            appointment.status = data['status']
        
        if 'notes' in data:
            appointment.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating appointment', 'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def api_cancel_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404
        
        # Check if the user is allowed to cancel this appointment
        user = User.query.get(user_id)
        if user.role != 'admin' and appointment.user_id != user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Instead of deleting, mark as cancelled
        appointment.status = 'cancelled'
        db.session.commit()
        
        return jsonify({'message': 'Appointment cancelled successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error cancelling appointment', 'error': str(e)}), 500

# ===== BOOKING ROUTES =====
@app.route('/api/bookings', methods=['GET'])
@jwt_required()
def api_get_bookings():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role == 'admin':
            bookings = Booking.query.all()
        else:
            bookings = Booking.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching bookings', 'error': str(e)}), 500

@app.route('/api/bookings', methods=['POST'])
@jwt_required()
def api_create_booking():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Check if appointment exists
        appointment = Appointment.query.get(data.get('appointmentId'))
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404
        
        # Create booking reference
        booking_reference = f"BK{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        booking = Booking(
            user_id=user_id,
            appointment_id=appointment.id,
            booking_reference=booking_reference,
            special_requests=data.get('specialRequests', ''),
            status='confirmed'
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating booking', 'error': str(e)}), 500

# ===== PAYMENT ROUTES =====
@app.route('/api/payments', methods=['GET'])
@jwt_required()
def api_get_payments():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role == 'admin':
            payments = Payment.query.all()
        else:
            payments = Payment.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'payments': [payment.to_dict() for payment in payments]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching payments', 'error': str(e)}), 500

@app.route('/api/payments/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        phone = data.get('phone')
        amount = data.get('amount')
        appointment_id = data.get('appointmentId')
        booking_id = data.get('bookingId')
        
        if not phone or not amount:
            return jsonify({'message': 'Phone and amount are required'}), 400
        
        # Create payment record
        payment = Payment(
            user_id=user_id,
            appointment_id=appointment_id,
            booking_id=booking_id,
            amount=amount,
            phone_number=phone,
            status='pending',
            transaction_id=f"TX{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        
        db.session.add(payment)
        db.session.commit()
        
        # Here you would integrate with M-Pesa Daraja API
        # For now, simulate successful payment
        payment.status = 'completed'
        payment.completed_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Payment initiated successfully',
            'payment': payment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error initiating payment', 'error': str(e)}), 500

# ===== STAFF AVAILABILITY ROUTES =====
@app.route('/api/staff-availability', methods=['GET'])
def api_get_staff_availability():
    try:
        staff_id = request.args.get('staffId')
        
        if staff_id:
            availability = StaffAvailability.query.filter_by(staff_id=staff_id, is_available=True).all()
        else:
            availability = StaffAvailability.query.filter_by(is_available=True).all()
        
        return jsonify({
            'availability': [avail.to_dict() for avail in availability]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching staff availability', 'error': str(e)}), 500

# ===== ADMIN ROUTES =====
@app.route('/api/admin/dashboard/stats', methods=['GET'])
@jwt_required()
def admin_dashboard_stats():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Check if user is admin
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        # Get basic stats
        total_users = User.query.count()
        total_appointments = Appointment.query.count()
        total_services = Service.query.count()
        total_staff = Staff.query.count()
        total_bookings = Booking.query.count()
        total_payments = Payment.query.count()
        
        # Get revenue (sum of all completed payments)
        revenue_result = db.session.query(db.func.sum(Payment.amount)).filter(
            Payment.status == 'completed'
        ).first()
        total_revenue = revenue_result[0] or 0
        
        # Get today's appointments
        today = datetime.now().date()
        today_appointments = Appointment.query.filter_by(date=today).count()
        
        # Get pending payments
        pending_payments = Payment.query.filter_by(status='pending').count()
        
        return jsonify({
            'stats': {
                'totalUsers': total_users,
                'totalAppointments': total_appointments,
                'totalServices': total_services,
                'totalStaff': total_staff,
                'totalBookings': total_bookings,
                'totalPayments': total_payments,
                'totalRevenue': float(total_revenue),
                'todayAppointments': today_appointments,
                'pendingPayments': pending_payments
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching dashboard stats', 'error': str(e)}), 500

# ===== ADMIN SERVICE MANAGEMENT =====
@app.route('/api/admin/services', methods=['POST'])
@jwt_required()
def admin_add_service():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('price'):
            return jsonify({'message': 'Name and price are required'}), 400

        # Check if service already exists
        existing_service = Service.query.filter_by(name=data['name']).first()
        if existing_service:
            return jsonify({'message': 'Service with this name already exists'}), 400

        new_service = Service(
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            duration=data.get('duration', 60),
            category=data.get('category', 'general'),
            is_active=True,
            image=data.get('image', ''),
            staff_required=data.get('staffRequired', True)
        )
        
        db.session.add(new_service)
        db.session.commit()
        
        return jsonify({
            'message': 'Service created successfully',
            'service': new_service.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating service', 'error': str(e)}), 500

@app.route('/api/admin/services/<int:service_id>', methods=['PUT'])
@jwt_required()
def admin_update_service(service_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        service = Service.query.get(service_id)
        if not service:
            return jsonify({'message': 'Service not found'}), 404

        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            # Check if name is taken by another service
            existing = Service.query.filter(
                Service.name == data['name'],
                Service.id != service_id
            ).first()
            if existing:
                return jsonify({'message': 'Service name already taken'}), 400
            service.name = data['name']
        
        if 'description' in data:
            service.description = data['description']
        
        if 'price' in data:
            service.price = float(data['price'])
        
        if 'duration' in data:
            service.duration = data['duration']
        
        if 'category' in data:
            service.category = data['category']
        
        if 'is_active' in data:
            service.is_active = bool(data['is_active'])
        
        if 'image' in data:
            service.image = data['image']
        
        if 'staff_required' in data:
            service.staff_required = bool(data['staff_required'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Service updated successfully',
            'service': service.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating service', 'error': str(e)}), 500

@app.route('/api/admin/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_service(service_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        service = Service.query.get(service_id)
        if not service:
            return jsonify({'message': 'Service not found'}), 404

        # Soft delete by marking as inactive
        service.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'Service deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting service', 'error': str(e)}), 500

@app.route('/api/admin/services', methods=['GET'])
@jwt_required()
def admin_get_all_services():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        # Get all services (including inactive ones for admin)
        services = Service.query.all()
        
        return jsonify({
            'services': [service.to_dict() for service in services]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching services', 'error': str(e)}), 500

# ===== ADMIN STAFF MANAGEMENT =====
@app.route('/api/admin/staff', methods=['POST'])
@jwt_required()
def admin_add_staff():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        data = request.get_json()
        
        # Validate required fields - FIXED: Use correct field names
        if not data.get('firstName') or not data.get('lastName') or not data.get('email'):
            return jsonify({'message': 'First name, last name and email are required'}), 400

        # Check if staff email already exists
        existing_staff = Staff.query.filter_by(email=data['email']).first()
        if existing_staff:
            return jsonify({'message': 'Staff with this email already exists'}), 400

        # FIXED: Use correct field names from Staff model
        new_staff = Staff(
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            phone=data.get('phone', ''),
            specialty=data.get('specialty', 'hair-stylist'),
            experience=data.get('experience', ''),
            bio=data.get('bio', ''),
            rating=float(data.get('rating', 0.0)),
            image=data.get('image', '/api/placeholder/300/300'),
            is_active=True,
            working_hours_start=data.get('workingHoursStart', '09:00'),
            working_hours_end=data.get('workingHoursEnd', '18:00'),
            experience_years=data.get('experienceYears', 0)
        )
        
        db.session.add(new_staff)
        db.session.commit()
        
        return jsonify({
            'message': 'Staff member created successfully',
            'staff': new_staff.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating staff member', 'error': str(e)}), 500

@app.route('/api/admin/staff/<int:staff_id>', methods=['PUT'])
@jwt_required()
def admin_update_staff(staff_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        staff = Staff.query.get(staff_id)
        if not staff:
            return jsonify({'message': 'Staff member not found'}), 404

        data = request.get_json()
        
        # Update fields if provided
        if 'firstName' in data:
            staff.first_name = data['firstName']
        
        if 'lastName' in data:
            staff.last_name = data['lastName']
        
        if 'email' in data:
            # Check if email is taken by another staff member
            existing = Staff.query.filter(
                Staff.email == data['email'],
                Staff.id != staff_id
            ).first()
            if existing:
                return jsonify({'message': 'Email already taken by another staff member'}), 400
            staff.email = data['email']
        
        if 'phone' in data:
            staff.phone = data['phone']
        
        if 'specialty' in data:
            staff.specialty = data['specialty']
        
        if 'experience' in data:
            staff.experience = data['experience']
        
        if 'bio' in data:
            staff.bio = data['bio']
        
        if 'rating' in data:
            staff.rating = float(data['rating'])
        
        if 'image' in data:
            staff.image = data['image']
        
        if 'is_active' in data:
            staff.is_active = bool(data['is_active'])
        
        if 'workingHoursStart' in data:
            staff.working_hours_start = data['workingHoursStart']
        
        if 'workingHoursEnd' in data:
            staff.working_hours_end = data['workingHoursEnd']
        
        if 'experienceYears' in data:
            staff.experience_years = data['experienceYears']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Staff member updated successfully',
            'staff': staff.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating staff member', 'error': str(e)}), 500

@app.route('/api/admin/staff/<int:staff_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_staff(staff_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        staff = Staff.query.get(staff_id)
        if not staff:
            return jsonify({'message': 'Staff member not found'}), 404

        # Check if staff has upcoming appointments
        upcoming_appointments = Appointment.query.filter(
            Appointment.staff_id == staff_id,
            Appointment.status.in_(['pending', 'confirmed']),
            Appointment.date >= datetime.now().date()
        ).count()
        
        if upcoming_appointments > 0:
            return jsonify({
                'message': f'Cannot delete staff with {upcoming_appointments} upcoming appointment(s). Please reassign or cancel appointments first.'
            }), 400

        # Soft delete by marking as inactive
        staff.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'Staff member deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting staff member', 'error': str(e)}), 500

@app.route('/api/admin/staff', methods=['GET'])
@jwt_required()
def admin_get_all_staff():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        # Get all staff (including inactive ones for admin)
        staff_members = Staff.query.all()
        
        return jsonify({
            'staff': [staff.to_dict() for staff in staff_members]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching staff', 'error': str(e)}), 500

# ===== ADMIN APPOINTMENT MANAGEMENT =====
@app.route('/api/admin/appointments', methods=['GET'])
@jwt_required()
def admin_get_appointments():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        appointments = Appointment.query.order_by(Appointment.date.desc()).all()
        
        appointments_data = []
        for appointment in appointments:
            appointment_data = appointment.to_dict()
            # Add customer name
            customer = User.query.get(appointment.user_id)
            appointment_data['customerName'] = f"{customer.first_name} {customer.last_name}"
            
            # Add service name
            service = Service.query.get(appointment.service_id)
            appointment_data['serviceName'] = service.name if service else 'Unknown Service'
            
            # Add staff name
            staff = Staff.query.get(appointment.staff_id)
            appointment_data['staffName'] = f"{staff.first_name} {staff.last_name}" if staff else 'Unknown Staff'
            
            appointments_data.append(appointment_data)
        
        return jsonify({'appointments': appointments_data}), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching appointments', 'error': str(e)}), 500

@app.route('/api/admin/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def admin_update_appointment_status(appointment_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404
        
        data = request.get_json()
        
        # Update status if provided
        if 'status' in data:
            appointment.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating appointment', 'error': str(e)}), 500

@app.route('/api/admin/appointments/<int:appointment_id>/cancel', methods=['POST'])
@jwt_required()
def admin_cancel_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404
        
        appointment.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment cancelled successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error cancelling appointment', 'error': str(e)}), 500

# ===== ADMIN USER MANAGEMENT =====
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        users = User.query.all()
        
        users_data = []
        for user in users:
            user_data = user.to_dict()
            # Add appointment count
            appointment_count = Appointment.query.filter_by(user_id=user.id).count()
            user_data['appointmentCount'] = appointment_count
            
            # Add booking count
            booking_count = Booking.query.filter_by(user_id=user.id).count()
            user_data['bookingCount'] = booking_count
            
            users_data.append(user_data)
        
        return jsonify({'users': users_data}), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching users', 'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def admin_update_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin_user = User.query.get(admin_id)
        
        if admin_user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'email' in data:
            # Check if email is taken by another user
            existing = User.query.filter(
                User.email == data['email'],
                User.id != user_id
            ).first()
            if existing:
                return jsonify({'message': 'Email already taken'}), 400
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = bool(data['is_active'])
        if 'loyalty_points' in data:
            user.loyalty_points = data['loyalty_points']
        if 'membership_tier' in data:
            user.membership_tier = data['membership_tier']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating user', 'error': str(e)}), 500

if __name__ == "__main__":
    # Ensure database is initialized before running
    with app.app_context():
        initialize_database()
        print("🚀 Salon Booking API starting...")
        print("📊 Database initialized!")
        print("🔗 Available at: http://localhost:5000")
        print("📋 API Documentation:")
        print("   - GET  /api/health")
        print("   - POST /api/auth/login")
        print("   - POST /api/auth/signup")
        print("   - GET  /api/services")
        print("   - GET  /api/staff")
        print("   - POST /api/appointments")
        
    app.run(port=5000, debug=True)