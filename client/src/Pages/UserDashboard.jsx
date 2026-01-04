import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // adjust path if needed

export default function Dashboard() {
  const navigate = useNavigate();

  // =============================
  // STATE
  // =============================
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

  // =============================
  // FORMAT HELPERS (kept)
  // =============================
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-KE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

  // =============================
  // BOOTSTRAP DASHBOARD (ONE ENTRY)
  // =============================
  useEffect(() => {
    const bootDashboard = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);

        const [appointmentsData, servicesData, staffData] =
          await Promise.all([
            api.getAppointments(),
            api.getServices(),
            api.getStaff(),
          ]);

        setAppointments(appointmentsData || []);
        setServices(servicesData || []);
        setStaff(staffData || []);
      } catch (err) {
        api.logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    bootDashboard();
  }, [navigate]);

  // =============================
  // DERIVED DATA
  // =============================
  const upcomingAppointments = appointments.filter(
    (appt) => new Date(appt.date) > new Date()
  );

  // =============================
  // ACTIONS
  // =============================
  const handleLogout = () => {
    api.logout();
    navigate("/login");
  };

  // =============================
  // GUARDS
  // =============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Welcome, {user?.name}
          </h1>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* TABS */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto flex space-x-6 px-4">
          {["overview", "appointments", "services", "staff"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 capitalize border-b-2 ${
                activeTab === tab
                  ? "border-black font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}

          {user?.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-4 border-b-2 ${
                activeTab === "admin"
                  ? "border-black font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              Admin
            </button>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Upcoming Appointments"
              value={upcomingAppointments.length}
            />
            <StatCard title="Services" value={services.length} />
            <StatCard title="Staff Members" value={staff.length} />
          </div>
        )}

        {activeTab === "appointments" && (
          <Section title="Appointments">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 border rounded flex justify-between"
              >
                <span>{formatDate(appt.date)}</span>
                <span>{appt.service}</span>
                <span>{formatCurrency(appt.price)}</span>
              </div>
            ))}
          </Section>
        )}

        {activeTab === "services" && (
          <Section title="Services">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 border rounded flex justify-between"
              >
                <span>{service.name}</span>
                <span>{formatCurrency(service.price)}</span>
              </div>
            ))}
          </Section>
        )}

        {activeTab === "staff" && (
          <Section title="Staff">
            {staff.map((member) => (
              <div key={member.id} className="p-4 border rounded">
                {member.name}
              </div>
            ))}
          </Section>
        )}

        {activeTab === "admin" && user?.role === "admin" && (
          <Section title="Admin Panel">
            <p>Admin-only controls go here.</p>
          </Section>
        )}
      </main>
    </div>
  );
}

// =============================
// SMALL REUSABLE COMPONENTS
// =============================
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
