from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, Service, Staff, Appointment  # import your models

app = Flask(__name__)
CORS(app)

# ==============================
# Database Config
# ==============================
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///salon.db"   # you can swap SQLite for Postgres/MySQL later
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize db + migrations
db.init_app(app)
migrate = Migrate(app, db)


# ==============================
# Routes (basic examples)
# ==============================
@app.route("/")
def home():
    return "<h1>Salon Booking Backend is Running ✅</h1>"


# Get all services
@app.route("/services", methods=["GET"])
def get_services():
    services = Service.query.all()
    return jsonify([s.to_dict() for s in services]), 200


# Create a user (basic demo route)
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


# Get all appointments
@app.route("/appointments", methods=["GET"])
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([a.to_dict() for a in appointments]), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)
