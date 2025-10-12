import React, { useState, useEffect } from 'react';
import '../index.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    staffCount: 0,
    servicesCount: 0,
    isLoading: true,
    error: null
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      const token = localStorage.getItem('token');
      
      // Fetch user appointments
      const appointmentsResponse = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let upcomingAppointments = [];
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        upcomingAppointments = appointmentsData.appointments
          .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
          .slice(0, 3);
      }

      // Fetch staff count
      const staffResponse = await fetch('http://localhost:5000/api/staff');
      let staffCount = 0;
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        staffCount = staffData.staff.length;
      }

      // Fetch services count
      const servicesResponse = await fetch('http://localhost:5000/api/services');
      let servicesCount = 0;
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        servicesCount = servicesData.services.length;
      }

      setDashboardData({
        upcomingAppointments,
        staffCount,
        servicesCount,
        isLoading: false,
        error: null
      });

    } catch (error) {
      setDashboardData(prev => ({ 
        ...prev, 
        error: 'Failed to load dashboard data',
        isLoading: false
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (dashboardData.isLoading) {
    return (
      <div className="user-dashboard-container">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand">
            <h1>Elite Salon</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">
              {getGreeting()}, {user?.first_name}
            </span>
            <div className="user-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            Book Appointment
          </button>
          <button 
            className={`nav-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            My Appointments
          </button>
          <button 
            className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
          <button 
            className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Our Staff
          </button>
          {user?.role === 'admin' && (
            <button 
              className={`nav-btn admin-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Admin Dashboard
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {dashboardData.error && (
          <div className="error-message">{dashboardData.error}</div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2>Welcome to Your Beauty Dashboard</h2>
              <p>Manage your appointments and discover our services</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{dashboardData.upcomingAppointments.length}</h3>
                  <p>Upcoming Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{dashboardData.staffCount}</h3>
                  <p>Expert Staff</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💅</div>
                <div className="stat-info">
                  <h3>{dashboardData.servicesCount}</h3>
                  <p>Services Available</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-grid">
                <div 
                  className="action-card"
                  onClick={() => setActiveTab('book')}
                >
                  <div className="action-icon">➕</div>
                  <h4>Book Appointment</h4>
                  <p>Schedule a new beauty treatment</p>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveTab('appointments')}
                >
                  <div className="action-icon">📋</div>
                  <h4>View Appointments</h4>
                  <p>See your upcoming bookings</p>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveTab('services')}
                >
                  <div className="action-icon">🔍</div>
                  <h4>Browse Services</h4>
                  <p>Explore our treatments</p>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveTab('staff')}
                >
                  <div className="action-icon">⭐</div>
                  <h4>Meet Our Team</h4>
                  <p>View our professional staff</p>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            {dashboardData.upcomingAppointments.length > 0 && (
              <div className="upcoming-appointments">
                <h3>Upcoming Appointments</h3>
                <div className="appointments-list">
                  {dashboardData.upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-info">
                        <h4>{appointment.service_name || 'Beauty Service'}</h4>
                        <p>{formatDate(appointment.date)} at {appointment.time}</p>
                        <span className={`status ${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <button 
                        className="view-btn"
                        onClick={() => setActiveTab('appointments')}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs would render their respective components */}
        {activeTab === 'book' && (
          <div className="tab-content">
            <h2>Book an Appointment</h2>
            <p>This would load the BookAppointments component</p>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="tab-content">
            <h2>My Appointments</h2>
            <p>This would load the MyAppointments component</p>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="tab-content">
            <h2>Our Services</h2>
            <p>This would load the ServicesPage component</p>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="tab-content">
            <h2>Our Staff</h2>
            <p>This would load the StaffPage component</p>
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="tab-content">
            <h2>Admin Dashboard</h2>
            <p>This would load the AdminDashboard component</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;