import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import './UserDashboard.css';
import apiService from '../api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    staffCount: 0,
    servicesCount: 0,
    isLoading: true,
    error: null
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchInitialData = useCallback(async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData.user || userData);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error fetching initial data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchInitialData();
  }, [navigate, fetchInitialData]);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch all data in parallel
      const [appointmentsRes, staffRes, servicesRes] = await Promise.all([
        apiService.client.get('/appointments').catch(() => ({ data: { appointments: [] } })),
        apiService.client.get('/staff').catch(() => ({ data: { staff: [] } })),
        apiService.client.get('/services').catch(() => ({ data: { services: [] } }))
      ]);

      const upcomingAppointments = Array.isArray(appointmentsRes.data.appointments) 
        ? appointmentsRes.data.appointments.filter(appt => new Date(appt.date) > new Date())
        : [];

      setDashboardData({
        upcomingAppointments,
        staffCount: staffRes.data.staff?.length || 0,
        servicesCount: servicesRes.data.services?.length || 0,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to load dashboard data',
        isLoading: false
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      navigate('/login');
    }
  };

  if (dashboardData.isLoading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard">
        <div className="error-message">{dashboardData.error}</div>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      year: 'numeric',
      month: 'long',
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="user-info">
            <h3>{user?.first_name} {user?.last_name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
        <nav>
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            <span className="icon">➕</span>
            <span>Book Appointment</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <span className="icon">📅</span>
            <span>My Appointments</span>
            {dashboardData.upcomingAppointments.length > 0 && (
              <span className="badge">{dashboardData.upcomingAppointments.length}</span>
            )}
          </button>
          <button 
            className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <span className="icon">💅</span>
            <span>Our Services</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <span className="icon">👥</span>
            <span>Our Staff</span>
          </button>
          {user?.role === 'admin' && (
            <button 
              className={`nav-btn admin-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <span className="icon">⚙️</span>
              <span>Admin Dashboard</span>
            </button>
          )}
          <div className="logout-container">
            <button className="logout-btn" onClick={handleLogout}>
              <span className="icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <div className="dashboard-header">
              <h2>Welcome back, {user?.first_name || 'User'}! 👋</h2>
              <p>Here's what's happening with your appointments today.</p>
            </div>
            
            {/* Stats Overview */}
            <div className="stats-container">
              <div 
                className="stat-card" 
                onClick={() => setActiveTab('appointments')}
              >
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{dashboardData.upcomingAppointments.length}</h3>
                  <p>Upcoming Appointments</p>
                </div>
              </div>
              <div 
                className="stat-card" 
                onClick={() => setActiveTab('staff')}
              >
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{dashboardData.staffCount}</h3>
                  <p>Expert Staff</p>
                </div>
              </div>
              <div 
                className="stat-card" 
                onClick={() => setActiveTab('services')}
              >
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
                  <div className="action-arrow">→</div>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveTab('appointments')}
                >
                  <div className="action-icon">📋</div>
                  <h4>View Appointments</h4>
                  <p>See your upcoming bookings</p>
                  <div className="action-arrow">→</div>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveTab('services')}
                >
                  <div className="action-icon">🔍</div>
                  <h4>Browse Services</h4>
                  <p>Explore our treatments</p>
                  <div className="action-arrow">→</div>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveTab('staff')}
                >
                  <div className="action-icon">⭐</div>
                  <h4>Meet Our Team</h4>
                  <p>View our professional staff</p>
                  <div className="action-arrow">→</div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="upcoming-appointments">
              <div className="section-header">
                <h3>Upcoming Appointments</h3>
                {dashboardData.upcomingAppointments.length > 0 && (
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('appointments')}
                  >
                    View All
                  </button>
                )}
              </div>
              {dashboardData.upcomingAppointments.length > 0 ? (
                <div className="appointments-list">
                  {dashboardData.upcomingAppointments.slice(0, 3).map(appointment => (
                    <div 
                      key={appointment.id} 
                      className="appointment-item" 
                      onClick={() => setActiveTab('appointments')}
                    >
                      <div className="appointment-info">
                        <div className="appointment-time">
                          <span className="time">{formatTime(appointment.time)}</span>
                          <span className="date">{formatDate(appointment.date)}</span>
                        </div>
                        <div className="appointment-details">
                          <h4>{appointment.service_name || 'Beauty Service'}</h4>
                          <div className="appointment-meta">
                            <span className={`status ${appointment.status || 'pending'}`}>
                              {appointment.status || 'Pending'}
                            </span>
                            <span className="staff">
                              with {appointment.staff_name || 'Our Specialist'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-arrow">→</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-appointments">
                  <p>You don't have any upcoming appointments.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('book')}
                  >
                    Book an Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Book Appointment Tab */}
        {activeTab === 'book' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Book an Appointment</h2>
              <p>Schedule your next beauty treatment with us</p>
            </div>
            <div className="booking-container">
              <div className="booking-steps">
                <div className="step active">
                  <div className="step-number">1</div>
                  <div className="step-info">
                    <h4>Select Service</h4>
                    <p>Choose from our range of services</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-info">
                    <h4>Choose Staff</h4>
                    <p>Select your preferred specialist</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-info">
                    <h4>Pick Date & Time</h4>
                    <p>Find a time that works for you</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-info">
                    <h4>Confirm Booking</h4>
                    <p>Review and book your appointment</p>
                  </div>
                </div>
              </div>
              <div className="booking-content">
                <h3>Select a Service</h3>
                <div className="services-grid">
                  <div className="service-card">
                    <div className="service-icon">💇‍♀️</div>
                    <h4>Haircut & Styling</h4>
                    <p>60 min • $50+</p>
                    <button className="btn-select">Select</button>
                  </div>
                  <div className="service-card">
                    <div className="service-icon">💅</div>
                    <h4>Manicure</h4>
                    <p>45 min • $35+</p>
                    <button className="btn-select">Select</button>
                  </div>
                  <div className="service-card">
                    <div className="service-icon">💆‍♀️</div>
                    <h4>Facial Treatment</h4>
                    <p>75 min • $80+</p>
                    <button className="btn-select">Select</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>My Appointments</h2>
              <button 
                className="btn-primary"
                onClick={() => setActiveTab('book')}
              >
                + New Appointment
              </button>
            </div>
            
            {dashboardData.upcomingAppointments.length > 0 ? (
              <div className="appointments-list">
                {dashboardData.upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-card-header">
                      <h3>{appointment.service_name || 'Beauty Service'}</h3>
                      <span className={`status-badge ${appointment.status || 'pending'}`}>
                        {appointment.status || 'Pending'}
                      </span>
                    </div>
                    <div className="appointment-card-body">
                      <div className="appointment-detail">
                        <span className="label">Date</span>
                        <span className="value">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="label">Time</span>
                        <span className="value">{formatTime(appointment.time)}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="label">With</span>
                        <span className="value">{appointment.staff_name || 'Our Specialist'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-appointments">
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>No Appointments Yet</h3>
                  <p>You don't have any upcoming appointments. Book your first appointment now!</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('book')}
                  >
                    Book an Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="tab-content">
            <div className="tab-header">
              <div>
                <h2>Our Services</h2>
                <p>Explore our range of beauty and wellness services</p>
              </div>
              {user?.role === 'admin' && (
                <button className="btn-primary">
                  + Add New Service
                </button>
              )}
            </div>
            
            <div className="services-container">
              <div className="service-categories">
                <button className="category-btn active">All Services</button>
                <button className="category-btn">Hair</button>
                <button className="category-btn">Nails</button>
                <button className="category-btn">Skincare</button>
                <button className="category-btn">Massage</button>
              </div>
              
              <div className="services-grid">
                <div className="service-card">
                  <div className="service-image" style={{ backgroundImage: 'url(https://via.placeholder.com/300x200)' }}></div>
                  <div className="service-info">
                    <h3>Haircut & Styling</h3>
                    <p className="service-description">Professional haircut with blow dry and style</p>
                    <div className="service-meta">
                      <span className="duration">60 min</span>
                      <span className="price">$50+</span>
                    </div>
                    <button 
                      className="btn-book"
                      onClick={() => setActiveTab('book')}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-image" style={{ backgroundImage: 'url(https://via.placeholder.com/300x200)' }}></div>
                  <div className="service-info">
                    <h3>Manicure</h3>
                    <p className="service-description">Classic or gel manicure with nail art options</p>
                    <div className="service-meta">
                      <span className="duration">45 min</span>
                      <span className="price">$35+</span>
                    </div>
                    <button className="btn-book">Book Now</button>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-image" style={{ backgroundImage: 'url(https://via.placeholder.com/300x200)' }}></div>
                  <div className="service-info">
                    <h3>Facial Treatment</h3>
                    <p className="service-description">Rejuvenating facial with deep cleansing</p>
                    <div className="service-meta">
                      <span className="duration">75 min</span>
                      <span className="price">$80+</span>
                    </div>
                    <button className="btn-book">Book Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="tab-content">
            <div className="tab-header">
              <div>
                <h2>Our Expert Team</h2>
                <p>Meet our professional beauty specialists</p>
              </div>
              {user?.role === 'admin' && (
                <button className="btn-primary">
                  + Add Staff Member
                </button>
              )}
            </div>
            
            <div className="staff-grid">
              <div className="staff-card">
                <div className="staff-image" style={{ backgroundImage: 'url(https://randomuser.me/api/portraits/women/32.jpg)' }}></div>
                <div className="staff-info">
                  <h3>Sarah Johnson</h3>
                  <p className="staff-role">Senior Stylist</p>
                  <p className="staff-bio">Specializes in color correction and balayage with over 10 years of experience.</p>
                  <div className="staff-expertise">
                    <span className="expertise-tag">Hair Coloring</span>
                    <span className="expertise-tag">Balayage</span>
                    <span className="expertise-tag">Extensions</span>
                  </div>
                  <button 
                    className="btn-book"
                    onClick={() => setActiveTab('book')}
                  >
                    Book with Sarah
                  </button>
                </div>
              </div>
              
              <div className="staff-card">
                <div className="staff-image" style={{ backgroundImage: 'url(https://randomuser.me/api/portraits/men/45.jpg)' }}></div>
                <div className="staff-info">
                  <h3>Michael Chen</h3>
                  <p className="staff-role">Master Barber</p>
                  <p className="staff-bio">Specializes in classic and modern men's haircuts and beard grooming.</p>
                  <div className="staff-expertise">
                    <span className="expertise-tag">Men's Cuts</span>
                    <span className="expertise-tag">Beard Grooming</span>
                    <span className="expertise-tag">Hot Towel Shave</span>
                  </div>
                  <button className="btn-book">Book with Michael</button>
                </div>
              </div>
              
              <div className="staff-card">
                <div className="staff-image" style={{ backgroundImage: 'url(https://randomuser.me/api/portraits/women/67.jpg)' }}></div>
                <div className="staff-info">
                  <h3>Emily Rodriguez</h3>
                  <p className="staff-role">Esthetician</p>
                  <p className="staff-bio">Specializes in advanced skincare treatments and anti-aging solutions.</p>
                  <div className="staff-expertise">
                    <span className="expertise-tag">Facials</span>
                    <span className="expertise-tag">Chemical Peels</span>
                    <span className="expertise-tag">Microdermabrasion</span>
                  </div>
                  <button className="btn-book">Book with Emily</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Admin Dashboard</h2>
              <p>Manage your salon's operations and services</p>
            </div>
            
            <div className="admin-stats">
              <div className="stat-card">
                <h3>Today's Appointments</h3>
                <div className="stat-number">12</div>
                <p>5 upcoming, 7 completed</p>
              </div>
              <div className="stat-card">
                <h3>New Customers</h3>
                <div className="stat-number">8</div>
                <p>This week</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <div className="stat-number">$2,450</div>
                <p>This week</p>
              </div>
            </div>
            
            <div className="admin-sections">
              <div className="admin-section">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button className="btn-primary">Add New Service</button>
                  <button className="btn-primary">Add Staff Member</button>
                  <button className="btn-primary">View Reports</button>
                  <button className="btn-primary">Manage Bookings</button>
                </div>
              </div>
              
              <div className="admin-section">
                <h3>Recent Activity</h3>
                <div className="activity-feed">
                  <div className="activity-item">
                    <div className="activity-icon">📅</div>
                    <div className="activity-details">
                      <p>New appointment booked by John Doe</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">💳</div>
                    <div className="activity-details">
                      <p>Payment received from Sarah Smith</p>
                      <span className="activity-time">5 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">✂️</div>
                    <div className="activity-details">
                      <p>Service "Hair Coloring" was updated</p>
                      <span className="activity-time">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-btns">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
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
              <h2>Welcome to Your Beauty Dashboard, {user?.first_name}</h2>
              <p>Manage your appointments and discover our services</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab('appointments')} style={{cursor: 'pointer'}}>
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{dashboardData.upcomingAppointments.length}</h3>
                  <p>Upcoming Appointments</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('staff')} style={{cursor: 'pointer'}}>
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{dashboardData.staffCount}</h3>
                  <p>Expert Staff</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('services')} style={{cursor: 'pointer'}}>
                <div className="stat-icon">💅</div>
                <div className="stat-info">
                  <h3>{dashboardData.servicesCount}</h3>
                  <p>Services Available</p>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            {dashboardData.upcomingAppointments.length > 0 && (
              <div className="upcoming-appointments">
                <div className="section-header">
                  <h3>Upcoming Appointments</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('appointments')}
                  >
                    View All
                  </button>
                </div>
                <div className="appointments-list">
                  {dashboardData.upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="appointment-item" onClick={() => setActiveTab('appointments')}>
                      <div className="appointment-info">
                        <div className="appointment-time">
                          <span className="time">{appointment.time}</span>
                          <span className="date">{formatDate(appointment.date)}</span>
                        </div>
                        <div className="appointment-details">
                          <h4>{appointment.service_name || 'Beauty Service'}</h4>
                          <div className="appointment-meta">
                            <span className={`status ${appointment.status}`}>
                              {appointment.status}
                            </span>
                            <span className="staff">
                              with {appointment.staff_name || 'Our Specialist'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-arrow">→</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
            <p>Admin panel content would go here</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;