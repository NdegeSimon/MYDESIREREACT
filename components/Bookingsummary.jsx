import React from "react";

function BookingSummary({ staff, service, date, time, customer }) {
  return (
    <div className="p-6 rounded-lg bg-gray-800 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">Booking Summary</h2>
      <ul className="space-y-2 text-gray-300">
        <li><strong>Staff:</strong> {staff ? staff.name : "Not selected"}</li>
        <li><strong>Service:</strong> {service ? service.name : "Not selected"}</li>
        <li><strong>Date:</strong> {date || "Not selected"}</li>
        <li><strong>Time:</strong> {time || "Not selected"}</li>
        <li><strong>Name:</strong> {customer.name || "Not provided"}</li>
        <li><strong>Email:</strong> {customer.email || "Not provided"}</li>
        <li><strong>Phone:</strong> {customer.phone || "Not provided"}</li>
      </ul>
    </div>
  );
}

export default BookingSummary;
