from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow React frontend (5173) to call Flask backend (5000)

# Dummy in-memory storage
bookings = []

@app.route("/bookings/", methods=["POST"])
def create_booking():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    # Save booking
    booking = {
        "id": len(bookings) + 1,
        "staffId": data.get("staffId"),
        "staffName": data.get("staffName"),
        "service": data.get("service"),
        "date": data.get("date"),
        "time": data.get("time"),
        "customer": data.get("customer"),
    }
    bookings.append(booking)

    # Simulate notification (admin + staff)
    print(f"📢 Notification: New booking for {booking['staffName']} on {booking['date']} at {booking['time']}")

    return jsonify({"message": "Booking confirmed", "booking": booking}), 201


if __name__ == "__main__":
    app.run(port=5000, debug=True)
