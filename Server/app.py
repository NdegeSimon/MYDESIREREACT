from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, Service, Staff, Appointment  # import your models
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, JWTManager
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ==============================
# Database Config
# ==============================
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///salon.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "your-super-secret-jwt-key-change-this-in-production"

# Initialize extensions
db.init_app(app)
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
        email = data.get('email')
        password = data.get('password')
        
        # Find user
        user = User.query.filter_by(email=email, is_active=True).first()
        
        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
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

# ===== HEALTH CHECK =====
@app.route('/api/health', methods=['GET'])
def api_health_check():
    return jsonify({'status': 'healthy', 'message': 'Salon Booking API is running!'})

if __name__ == "__main__":
    app.run(port=5000, debug=True)