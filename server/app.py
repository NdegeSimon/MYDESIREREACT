import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token, get_jwt_identity,
    jwt_required, set_access_cookies, unset_jwt_cookies
)
from werkzeug.security import generate_password_hash, check_password_hash

# Import extensions from the centralized location
from extensions import db, bcrypt, migrate, jwt

# REMOVE these lines:
# bcrypt = Bcrypt()
# db = SQLAlchemy()
# migrate = Migrate()
# jwt = JWTManager()

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # ==============================
    # Config
    # ==============================
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'salon.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # JWT Config
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-change-in-production'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
    app.config['JWT_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = os.environ.get('FLASK_ENV') == 'production'
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/api/auth/refresh'
    app.config['JWT_COOKIE_SAMESITE'] = 'Lax'

    # CORS Config
    CORS(app,
         resources={r"/api/*": {
             "origins": os.environ.get('FRONTEND_URL', 'http://localhost:5173'),
             "supports_credentials": True,
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }})

    # Initialize extensions
    bcrypt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models here to avoid circular imports
    from models import User, Service, Staff, Appointment, Booking, Payment, StaffAvailability

    return app


# ==============================
# Initialize App
# ==============================
app = create_app()

# Import models after app creation
from models import User, Service, Staff, Appointment, Booking, Payment, StaffAvailability


# ==============================
# DATABASE INITIALIZATION
# ==============================
def initialize_database():
    """Create tables and insert sample data"""
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully!")

            # Admin user
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

            # Sample customer
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

            # Sample services
            if Service.query.count() == 0:
                services = [
                    Service(name="Women's Haircut & Style", description="Professional haircut tailored to your style", price=1500, duration=60, category="hair"),
                    Service(name="Men's Haircut", description="Classic or modern men's haircut", price=800, duration=30, category="hair"),
                    Service(name="Spa Manicure", description="Luxurious manicure with hand massage", price=1200, duration=45, category="nails"),
                    Service(name="Classic Facial", description="Deep cleansing and hydrating facial treatment", price=2000, duration=60, category="skincare")
                ]
                db.session.add_all(services)
                print("✅ Sample services created")

            # Sample staff
            if Staff.query.count() == 0:
                staff_members = [
                    Staff(first_name='Sarah', last_name='Johnson', email='sarah@salon.com', phone='+254722222222', specialty='hair-stylist', experience='5 years in hair styling', bio='Expert hair stylist with 5 years experience', rating=4.8),
                    Staff(first_name='Mike', last_name='Brown', email='mike@salon.com', phone='+254733333333', specialty='barber', experience='3 years in barbering', bio='Professional barber specializing in modern cuts', rating=4.7),
                    Staff(first_name='Emma', last_name='Wilson', email='emma@salon.com', phone='+254744444444', specialty='skincare-specialist', experience='4 years in skincare', bio='Certified skincare specialist with 4 years experience', rating=4.9)
                ]
                db.session.add_all(staff_members)
                print("✅ Sample staff created")

            db.session.commit()
            print("✅ Database initialization completed successfully!")

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error initializing database: {e}")


# ==============================
# ROUTES
# ==============================

@app.route("/")
def home():
    return jsonify({'message': 'Welcome to Salon Booking API', 'version': '1.0.0'})


# ===== HEALTH CHECK =====
@app.route('/api/health', methods=['GET'])
def api_health_check():
    return jsonify({'status': 'healthy', 'message': 'Salon Booking API is running!'})


# ===== AUTHENTICATION =====
@app.route('/api/auth/signup', methods=['POST'])
def auth_signup():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required_fields = ['firstName', 'lastName', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'message': 'User already exists with this email'}), 400

        user = User(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            email=data.get('email'),
            phone=data.get('phone', ''),
            role='user'
        )
        user.set_password(data.get('password'))
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        return jsonify({'message': 'User created', 'user': user.to_dict(), 'access_token': access_token}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required',
                'status': 400
            }), 400

        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password',
                'status': 401
            }), 401

        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict(),
            'status': 200
        }), 200

    except Exception as e:
        return jsonify({'message': 'Error during login', 'error': str(e)}), 500


# ===== AUTH ROUTES =====
@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'status': 404
            }), 404
            
        return jsonify({
            'success': True,
            'data': user.to_dict(),
            'status': 200
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching user profile',
            'error': str(e),
            'status': 500
        }), 500

# ===== USER PROFILE =====
@app.route('/api/users/profile', methods=['GET'])
@jwt_required()
def user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})


@app.route('/api/users/profile', methods=['PUT'])
@jwt_required()
def user_update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()

    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'phone' in data:
        user.phone = data['phone']
    if 'email' in data:
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user.id:
            return jsonify({'message': 'Email already taken'}), 400
        user.email = data['email']

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()})


# ==============================
# ADDITIONAL ROUTES (Services, Staff, Appointments, Bookings, Payments, Admin)
# ==============================
# You can copy all your previous routes here, unchanged,
# they will work fine after this app structure fix

# Initialize database on first request
@app.before_request
def initialize_db_once():
    if not hasattr(app, 'db_initialized'):
        with app.app_context():
            initialize_database()
        app.db_initialized = True

# ==============================
# MAIN ENTRY
# ==============================
if __name__ == "__main__":
    print("🚀 Salon Booking API starting...")
    print("🔗 Available at: http://localhost:5000")
    print("📋 API Documentation:")
    print("   - GET  /api/health")
    print("   - POST /api/auth/login")
    print("   - POST /api/auth/signup")
    print("   - GET  /api/services")
    print("   - GET  /api/staff")
    print("   - POST /api/appointments")
    
    # Initialize database ONCE with proper app context
    with app.app_context():
        initialize_database()
    
    app.run(port=5000, debug=True)