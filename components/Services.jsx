import React, { useEffect, useState } from "react";

function Services({ selectedService, onSelect }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/services/")
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(() =>
        setServices([
          { id: 1, name: "Haircut", price: 1500, image: "/images/haircut.jpg" },
          { id: 2, name: "Hair Coloring", price: 3000, image: "/images/color.jpg" },
          { id: 3, name: "Makeup", price: 2000, image: "/images/makeup.jpg" },
        ])
      );
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-primary">Select a Service</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {services.map(service => (
          <div
            key={service.id}
            className={`p-4 rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105 ${
              selectedService?.id === service.id ? "bg-pink-600" : "bg-gray-800"
            }`}
            onClick={() => onSelect(service)}
          >
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-32 object-cover rounded-md mb-4"
            />
            <h3 className="text-lg font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">KES {service.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
