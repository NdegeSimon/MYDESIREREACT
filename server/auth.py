# routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from models import User

auth_bp = Blueprint('auth', __name__)

# ===========================
# SIGNUP
# ===========================
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing request data'}), 400

    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'User already exists with this email'}), 400

    try:
        user = User(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            email=data.get('email'),
            phone=data.get('phone'),
            is_active=True
        )
        user.set_password(data.get('password'))
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500


# ===========================
# LOGIN
# ===========================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing credentials'}), 400

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()  # ✅ removed is_active=True

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not user.check_password(password):
        return jsonify({'message': 'Invalid password'}), 401

    try:
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200

    except Exception as e:
        return jsonify({'message': 'Error creating token', 'error': str(e)}), 500


# ===========================
# GET CURRENT USER
# ===========================
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
