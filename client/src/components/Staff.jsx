import { useEffect, useState } from "react";

function StaffList() {
  const [staffData, setStaffData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/attendants/") // Flask backend on port 5000
      .then((res) => res.json())
      .then((data) => setStaffData(data))
      .catch(() =>
        setStaffData([
          {
            id: 1,
            name: "Harrison",
            specialty: "Styling",
            rating: 4.9,
            image: "/images/harrison.jpg",
          },
          {
            id: 2,
            name: "Maria",
            specialty: "Coloring",
            rating: 4.8,
            image: "/images/maria.jpg",
          },
        ])
      );
  }, []);

  return (
    <div>
      <h2>Our Attendants</h2>
      <ul>
        {staffData.map((staff) => (
          <li key={staff.id}>
            <img src={staff.image} alt={staff.name} width={80} />
            <h3>{staff.name}</h3>
            <p>{staff.specialty}</p>
            <p>⭐ {staff.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StaffList;
