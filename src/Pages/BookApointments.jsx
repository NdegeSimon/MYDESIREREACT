import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function BookingPage() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  // Mock staff data - replace with actual data from your backend
  const staffMembers = [
    { id: 1, name: "John Doe", specialty: "Hair Stylist" },
    { id: 2, name: "Jane Smith", specialty: "Color Specialist" },
    { id: 3, name: "Mike Johnson", specialty: "Barber" }
  ];

  // Mock services data - replace with actual data from your backend
  const services = [
    { id: 1, name: "Haircut", price: 30, duration: "30 min" },
    { id: 2, name: "Hair Coloring", price: 80, duration: "2 hours" },
    { id: 3, name: "Hair Styling", price: 25, duration: "45 min" }
  ];

  // Submit booking to backend
  const handleSubmit = async () => {
    if (!selectedStaff || !selectedService || !selectedDate || !selectedTime) {
      setMessage("⚠️ Please complete all booking details.");
      return;
    }

    setLoading(true);
    setMessage("");

    const bookingData = {
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      service: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      customer: {
        name: user?.firstName + ' ' + user?.lastName,
        email: user?.email,
        phone: user?.phone,
        userId: user?.id
      }
    };

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch("http://localhost:8000/bookings/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setMessage("✅ Booking confirmed! Notifications sent to Admin & Staff.");
        // reset form
        setSelectedStaff(null);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
      } else {
        setMessage("❌ Failed to confirm booking. Try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="booking-page">
      <h1 className="booking-title">Book Your Appointment</h1>

      <div className="booking-sections">
        {/* Staff Selection Section */}
        <section className="booking-section">
          <h2 className="section-title">Select Staff</h2>
          <div className="staff-grid">
            {staffMembers.map(staff => (
              <div 
                key={staff.id}
                className={`staff-card ${selectedStaff?.id === staff.id ? 'selected' : ''}`}
                onClick={() => setSelectedStaff(staff)}
              >
                <div className="staff-avatar">
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="staff-info">
                  <h3>{staff.name}</h3>
                  <p>{staff.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services Selection Section */}
        <section className="booking-section">
          <h2 className="section-title">Select Service</h2>
          <div className="services-grid">
            {services.map(service => (
              <div 
                key={service.id}
                className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service)}
              >
                <h3>{service.name}</h3>
                <p className="service-duration">{service.duration}</p>
                <p className="service-price">${service.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Date Selection Section */}
        <section className="booking-section">
          <h2 className="section-title">Select Date</h2>
          <div className="calendar">
            <input 
              type="date" 
              className="date-input"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </section>

        {/* Time Selection Section */}
        <section className="booking-section">
          <h2 className="section-title">Choose a Time</h2>
          <div className="time-slots-grid">
            {timeSlots.map(slot => (
              <button
                key={slot}
                className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                onClick={() => setSelectedTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </section>

        {/* Booking Summary Section */}
        <section className="booking-section">
          <h2 className="section-title">Booking Summary</h2>
          <div className="booking-summary">
            {selectedStaff && (
              <div className="summary-item">
                <strong>Staff:</strong> {selectedStaff.name}
              </div>
            )}
            {selectedService && (
              <div className="summary-item">
                <strong>Service:</strong> {selectedService.name} - ${selectedService.price}
              </div>
            )}
            {selectedDate && (
              <div className="summary-item">
                <strong>Date:</strong> {selectedDate}
              </div>
            )}
            {selectedTime && (
              <div className="summary-item">
                <strong>Time:</strong> {selectedTime}
              </div>
            )}
            {selectedService && (
              <div className="summary-total">
                <strong>Total: ${selectedService.price}</strong>
              </div>
            )}
          </div>
        </section>

        {/* Submit Button */}
        <div className="booking-actions">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="book-button"
          >
            {loading ? "Submitting..." : "Confirm Booking"}
          </button>
          {message && <p className="booking-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;