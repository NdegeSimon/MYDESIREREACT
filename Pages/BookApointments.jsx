import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import StaffSelection from "../components/StaffSelection";
import Services from "../components/Services";
import Calendar from "../components/Calendar";
import TimeSlots from "../components/TimeSlots";
import CustomerForm from "../components/CustomerForm";
import BookingSummary from "../components/BookingSummary";

function BookingPage() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
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
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      customer: customerInfo,
    };

    try {
      const response = await fetch("http://localhost:8000/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setMessage("✅ Booking confirmed! Notifications sent to Admin & Staff.");
        // reset form
        setSelectedStaff(null);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setCustomerInfo({ name: "", email: "", phone: "" });
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-pink-400 text-center mb-10">
          Book Your Appointment
        </h1>

        <section className="mb-12">
          <StaffSelection selectedStaff={selectedStaff} onSelect={setSelectedStaff} />
        </section>

        <section className="mb-12">
          <Services selectedService={selectedService} onSelect={setSelectedService} />
        </section>

        <section className="mb-12">
          <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Choose a Time</h2>
          <TimeSlots timeSlots={timeSlots} selectedTime={selectedTime} onSelect={setSelectedTime} />
        </section>

        <section className="mb-12">
          <CustomerForm customerInfo={customerInfo} onChange={setCustomerInfo} />
        </section>

        <section className="mb-12">
          <BookingSummary
            staff={selectedStaff}
            service={selectedService}
            date={selectedDate}
            time={selectedTime}
            customer={customerInfo}
          />
        </section>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-bold text-lg transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Confirm Booking"}
          </button>
          {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
      </main>

      <Sidebar />

      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-700">
        © 2025 My Desire Salon. All rights reserved.
      </footer>
    </div>
  );
}

export default BookingPage;
