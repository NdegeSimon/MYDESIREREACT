import React from "react";

function CustomerForm({ customerInfo, onChange }) {
  const handleChange = e => {
    onChange({ ...customerInfo, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-primary">Your Details</h2>
      <div className="grid gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={customerInfo.name}
          onChange={handleChange}
          className="p-3 rounded-md bg-gray-800 text-white border border-gray-600"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={customerInfo.email}
          onChange={handleChange}
          className="p-3 rounded-md bg-gray-800 text-white border border-gray-600"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={customerInfo.phone}
          onChange={handleChange}
          className="p-3 rounded-md bg-gray-800 text-white border border-gray-600"
        />
      </div>
    </div>
  );
}

export default CustomerForm;
