from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from models import db, User, Service, Staff, Appointment,StaffAvailability  # import your models
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, JWTManager
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
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
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)


# Routes 

@app.route("/")
def home():
    return jsonify({'message': 'Welcome to Salon Booking API', 'version': '1.0.0'})

# Get all services (public route)
@app.route("/services", methods=["GET"])
def get_services_public():
    services = Service.query.all()
    return jsonify([s.to_dict() for s in services]), 200

# Create a user 
@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    # Create and hash password
    user = User(
        first_name=data.get("firstName"),
        last_name=data.get("lastName"),
        email=data.get("email"),
        phone=data.get("phone"),
        role=data.get("role", "user")
    )
    user.set_password(data.get("password"))

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created", "user": user.to_dict()}), 201

# Get all users
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

# Get all appointments (public route)
@app.route("/appointments", methods=["GET"])
def get_appointments_public():
    appointments = Appointment.query.all()
    return jsonify([a.to_dict() for a in appointments]), 200

# ===== AUTHENTICATION ROUTES =====
@app.route('/api/auth/signup', methods=['POST'])
def auth_signup():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'message': 'User already exists with this email'}), 400
        
        # Create new user
        user = User(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            email=data.get('email'),
            phone=data.get('phone')
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
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

        # Find user
        user = User.query.filter_by(email=email, is_active=True).first()
        
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Check password
        if not user.check_password(password):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
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
        
        # Get revenue (sum of all completed appointments)
        revenue_result = db.session.query(db.func.sum(Appointment.price)).filter(
            Appointment.status == 'completed'
        ).first()
        total_revenue = revenue_result[0] or 0
        
        # Get today's appointments
        today = datetime.now().date()
        today_appointments = Appointment.query.filter_by(date=today).count()
        
        return jsonify({
            'stats': {
                'totalUsers': total_users,
                'totalAppointments': total_appointments,
                'totalServices': total_services,
                'totalStaff': total_staff,
                'totalRevenue': float(total_revenue),
                'todayAppointments': today_appointments
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
            duration=data.get('duration', 60),  # Default 60 minutes
            category=data.get('category', 'general'),
            is_active=True
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
        
        # Validate required fields
        if not data.get('name') or not data.get('email'):
            return jsonify({'message': 'Name and email are required'}), 400

        # Check if staff email already exists
        existing_staff = Staff.query.filter_by(email=data['email']).first()
        if existing_staff:
            return jsonify({'message': 'Staff with this email already exists'}), 400

        new_staff = Staff(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', ''),
            specialty=data.get('specialty', 'hair-stylist'),
            experience=data.get('experience', ''),
            bio=data.get('bio', ''),
            rating=float(data.get('rating', 0.0)),
            image=data.get('image', '/api/placeholder/300/300'),
            is_active=True
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
        if 'name' in data:
            staff.name = data['name']
        
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
            appointment_data['staffName'] = staff.name if staff else 'Unknown Staff'
            
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
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
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
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating user', 'error': str(e)}), 500    
    
    
app.route('/api/payments/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    data = request.get_json()
    phone = data['phone']
    amount = data['amount']
    # Call Safaricom Daraja STK Push here
    return jsonify({'message': 'Payment initiated'})

# ===== HEALTH CHECK =====
@app.route('/api/health', methods=['GET'])
def api_health_check():
    return jsonify({'status': 'healthy', 'message': 'Salon Booking API is running!'})


if __name__ == "__main__":
    app.run(port=5000, debug=True)