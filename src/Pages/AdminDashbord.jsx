// components/AdminDashboard.jsx
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import "../index.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample data
  const dashboardStats = {
    todayAppointments: 15,
    pendingAppointments: 3,
    totalRevenue: 45200,
    newCustomers: 8
  };

  const recentAppointments = [
    { id: 1, customer: 'Jane Smith', service: 'Haircut', time: '10:00 AM', staff: 'Mary', status: 'confirmed' },
    { id: 2, customer: 'John Doe', service: 'Manicure', time: '11:30 AM', staff: 'Sarah', status: 'pending' },
    { id: 3, customer: 'Alice Johnson', service: 'Braids', time: '2:00 PM', staff: 'Linda', status: 'confirmed' }
  ];

  const revenueData = [
    { day: 'Mon', revenue: 12000 },
    { day: 'Tue', revenue: 19000 },
    { day: 'Wed', revenue: 15000 },
    { day: 'Thu', revenue: 21000 },
    { day: 'Fri', revenue: 25000 },
    { day: 'Sat', revenue: 32000 },
    { day: 'Sun', revenue: 18000 }
  ];

  const serviceData = [
    { name: 'Haircut', value: 35 },
    { name: 'Manicure', value: 25 },
    { name: 'Braids', value: 20 },
    { name: 'Coloring', value: 15 },
    { name: 'Other', value: 5 }
  ];

  const COLORS = ['#dc0000', '#a80000', '#800000', '#500000', '#300000'];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>My Desire Salon</h2>
          <p>Admin Dashboard</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers
          </button>
          <button 
            className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            👨‍💼 Staff
          </button>
          <button 
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            💅 Services
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💰 Payments
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📈 Reports
          </button>
          <button 
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventory
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button className="notification-btn">🔔 <span className="notification-count">3</span></button>
            <div className="admin-profile">
              <span>Admin User</span>
              <div className="profile-dropdown">▼</div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <h3>Today's Appointments</h3>
                <div className="stat-number">{dashboardStats.todayAppointments}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <h3>Pending Approval</h3>
                <div className="stat-number">{dashboardStats.pendingAppointments}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <h3>Total Revenue</h3>
                <div className="stat-number">Ksh {dashboardStats.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <h3>New Customers</h3>
                <div className="stat-number">{dashboardStats.newCustomers}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Weekly Revenue</h3>
                <div className="chart-container">
                  <LineChart width={500} height={300} data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '1px solid #dc0000',
                        color: '#fff'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#dc0000" 
                      strokeWidth={3}
                      dot={{ fill: '#dc0000', strokeWidth: 2 }}
                    />
                  </LineChart>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Service Distribution</h3>
                <div className="chart-container">
                  <PieChart width={400} height={300}>
                    <Pie
                      data={serviceData}
                      cx={200}
                      cy={150}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '1px solid #dc0000',
                        color: '#fff'
                      }} 
                    />
                  </PieChart>
                </div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="recent-appointments">
              <div className="section-header">
                <h3>Today's Appointments</h3>
                <button className="view-all-btn">View All →</button>
              </div>
              <div className="appointments-list">
                {recentAppointments.map(appointment => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-info">
                      <div className="customer-name">{appointment.customer}</div>
                      <div className="service-type">{appointment.service}</div>
                      <div className="appointment-time">{appointment.time}</div>
                      <div className="staff-assigned">{appointment.staff}</div>
                    </div>
                    <div className={`status-badge ${appointment.status}`}>
                      {appointment.status}
                    </div>
                    <div className="appointment-actions">
                      <button className="action-btn approve">✓</button>
                      <button className="action-btn reject">✗</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && <AppointmentsManagement />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'services' && <ServicesManagement />}
        {activeTab === 'payments' && <PaymentsManagement />}
        {activeTab === 'reports' && <ReportsAnalytics />}
        {activeTab === 'inventory' && <InventoryManagement />}
      </div>
    </div>
  );
};

// Sample Component Implementations
const AppointmentsManagement = () => (
  <div className="tab-content">
    <div className="section-header">
      <h2>Appointments Management</h2>
      <button className="primary-btn">+ New Appointment</button>
    </div>
    <div className="content-grid">
      <div className="calendar-view">
        <h3>Calendar View</h3>
        <div className="calendar-placeholder">
          Calendar will be implemented here
        </div>
      </div>
      <div className="appointments-list-full">
        <h3>Upcoming Appointments</h3>
        {/* Full appointments list */}
      </div>
    </div>
  </div>
);

const CustomerManagement = () => (
  <div className="tab-content">
    <h2>Customer Management</h2>
    <div className="search-bar">
      <input type="text" placeholder="Search customers..." className="search-input" />
      <button className="search-btn">Search</button>
    </div>
    {/* Customer list and details */}
  </div>
);

const StaffManagement = () => (
  <div className="tab-content">
    <h2>Staff Management</h2>
    {/* Staff schedules and management */}
  </div>
);

const ServicesManagement = () => (
  <div className="tab-content">
    <h2>Services & Pricing</h2>
    {/* Services CRUD operations */}
  </div>
);

const PaymentsManagement = () => (
  <div className="tab-content">
    <h2>Payments & Invoices</h2>
    {/* Payment tracking and management */}
  </div>
);

const ReportsAnalytics = () => (
  <div className="tab-content">
    <h2>Reports & Analytics</h2>
    {/* Detailed reports and analytics */}
  </div>
);

const InventoryManagement = () => (
  <div className="tab-content">
    <h2>Inventory Management</h2>
    {/* Inventory tracking and alerts */}
  </div>
);

export default AdminDashboard;