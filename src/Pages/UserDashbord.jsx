import "../index.css";
// components/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [userData, setUserData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // API client with auth header
  const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile');
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get('/appointments/my-appointments');
      const appointments = response.data;
      
      const now = new Date();
      const upcoming = appointments.filter(apt => new Date(apt.date + ' ' + apt.time) > now);
      const past = appointments.filter(apt => new Date(apt.date + ' ' + apt.time) <= now);
      
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await apiClient.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/staff');
      setStaffMembers(response.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // Fetch payment history
  const fetchPayments = async () => {
    try {
      const response = await apiClient.get('/payments/my-payments');
      setPaymentHistory(response.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/cancel`);
      // Refresh appointments
      fetchAppointments();
      // Show success message
      setError('Appointment cancelled successfully');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  // Book new appointment
  const bookAppointment = async (appointmentData) => {
    try {
      await apiClient.post('/appointments/book', appointmentData);
      // Refresh appointments
      fetchAppointments();
      // Switch to appointments tab
      setActiveTab('appointments');
      setError('Appointment booked successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      await apiClient.put('/users/profile', profileData);
      // Refresh user data
      fetchUserProfile();
      setError('Profile updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchAppointments(),
          fetchServices(),
          fetchStaff(),
          fetchPayments(),
          fetchNotifications()
        ]);
      } catch (err) {
        console.error('Error loading UserDashboard data:', err);
        setError('Failed to load UserDashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="user-dashboard red-black-theme">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your UserDashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard red-black-theme">
      {/* Sidebar */}
      <div className="user-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar red-gradient">
              {userData?.firstName?.[0]}{userData?.lastName?.[0]}
            </div>
            <div className="user-info">
              <h3>{userData?.firstName} {userData?.lastName}</h3>
              <p className="red-text">{userData?.membershipTier || 'Standard Member'}</p>
            </div>
          </div>
          <div className="loyalty-points red-border">
            <span className="points red-text">{userData?.loyaltyPoints || 0}</span>
            <span className="points-label">Loyalty Points</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📅 My Appointments
          </button>
          <button 
            className={`nav-item ${activeTab === 'book' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            ➕ Book Appointment
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💰 Payments
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 My Profile
          </button>
          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="nav-badge red-bg">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="user-main">
        <header className="user-header red-border-bottom">
          <h1 className="red-text">
            {activeTab === 'appointments' && 'My Appointments'}
            {activeTab === 'book' && 'Book New Appointment'}
            {activeTab === 'payments' && 'Payment History'}
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'notifications' && 'Notifications'}
          </h1>
          <div className="header-actions">
            <button className="notification-bell red-hover">
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-dot red-bg"></span>
              )}
            </button>
            <button className="logout-btn red-border" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="error-message red-border">
            {error}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <AppointmentsTab 
            upcomingAppointments={upcomingAppointments}
            pastAppointments={pastAppointments}
            onCancelAppointment={cancelAppointment}
          />
        )}

        {/* Book Appointment Tab */}
        {activeTab === 'book' && (
          <BookAppointmentTab 
            services={services}
            staffMembers={staffMembers}
            onBookAppointment={bookAppointment}
          />
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <PaymentsTab paymentHistory={paymentHistory} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileTab 
            userData={userData}
            onUpdateProfile={updateProfile}
          />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationsTab 
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
          />
        )}
      </div>
    </div>
  );
};

// Appointments Tab Component
const AppointmentsTab = ({ upcomingAppointments, pastAppointments, onCancelAppointment }) => {
  return (
    <div className="dashboard-content">
      <div className="content-section red-border">
        <h2>Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <p className="no-data">No upcoming appointments</p>
        ) : (
          <div className="appointments-grid">
            {upcomingAppointments.map(appointment => (
              <div key={appointment._id} className="appointment-card red-border-left red-hover">
                <div className="appointment-header">
                  <h3>{appointment.serviceId?.name || appointment.serviceName}</h3>
                  <span className={`status-badge ${appointment.status} red-border`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="appointment-details">
                  <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {appointment.time}</p>
                  <p><strong>Stylist:</strong> {appointment.staffId?.name || appointment.staffName}</p>
                  <p><strong>Price:</strong> <span className="red-text">Ksh {appointment.price}</span></p>
                </div>
                <div className="appointment-actions">
                  <button className="btn-secondary red-border">Reschedule</button>
                  <button 
                    className="btn-danger red-border"
                    onClick={() => onCancelAppointment(appointment._id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content-section red-border">
        <h2>Past Appointments</h2>
        {pastAppointments.length === 0 ? (
          <p className="no-data">No past appointments</p>
        ) : (
          <div className="appointments-list">
            {pastAppointments.map(appointment => (
              <div key={appointment._id} className="appointment-item red-border-left red-hover">
                <div className="appointment-info">
                  <strong>{appointment.serviceId?.name || appointment.serviceName}</strong>
                  <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                  <span>with {appointment.staffId?.name || appointment.staffName}</span>
                </div>
                <div className="appointment-status">
                  <span className="status-completed">Completed</span>
                  <span className="appointment-price red-text">Ksh {appointment.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Book Appointment Tab Component
const BookAppointmentTab = ({ services, staffMembers, onBookAppointment }) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  const handleBookAppointment = () => {
    const appointmentData = {
      serviceId: selectedService,
      staffId: selectedStaff,
      date: selectedDate,
      time: selectedTime
    };
    onBookAppointment(appointmentData);
  };

  // Fetch available slots when service, staff, or date changes
  useEffect(() => {
    // This would call an API to get available time slots
    // For now, we'll mock some slots
    if (selectedService && selectedStaff && selectedDate) {
      setAvailableSlots(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
    }
  }, [selectedService, selectedStaff, selectedDate]);

  return (
    <div className="dashboard-content">
      <div className="booking-wizard red-border">
        <div className="wizard-steps">
          <div className="wizard-step active red-border">1. Select Service</div>
          <div className="wizard-step red-border">2. Choose Staff</div>
          <div className="wizard-step red-border">3. Pick Date & Time</div>
          <div className="wizard-step red-border">4. Confirm Booking</div>
        </div>

        <div className="booking-form">
          <div className="form-section">
            <h3>Select Service</h3>
            <div className="services-grid">
              {services.map(service => (
                <div 
                  key={service._id}
                  className={`service-card red-border ${selectedService === service._id ? 'selected red-active' : ''}`}
                  onClick={() => setSelectedService(service._id)}
                >
                  <h4>{service.name}</h4>
                  <p className="service-duration">{service.duration} minutes</p>
                  <p className="service-price red-text">Ksh {service.price}</p>
                  <span className="service-category red-border">{service.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Choose Your Stylist</h3>
            <div className="staff-grid">
              {staffMembers.map(staff => (
                <div 
                  key={staff._id}
                  className={`staff-card red-border ${selectedStaff === staff._id ? 'selected red-active' : ''}`}
                  onClick={() => setSelectedStaff(staff._id)}
                >
                  <div className="staff-avatar red-gradient">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="staff-info">
                    <h4>{staff.name}</h4>
                    <p>{staff.specialty}</p>
                    <span className={`availability ${staff.available ? 'available' : 'unavailable'}`}>
                      {staff.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Select Date & Time</h3>
            <div className="datetime-selection">
              <div className="date-picker">
                <label>Select Date:</label>
                <input 
                  type="date" 
                  className="form-input red-border"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="time-slots">
                <h4>Available Time Slots</h4>
                <div className="slots-grid">
                  {availableSlots.map(slot => (
                    <button 
                      key={slot}
                      className={`time-slot red-border ${selectedTime === slot ? 'selected red-active' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="booking-summary red-border">
            <h3>Booking Summary</h3>
            <div className="summary-details">
              <p><strong>Service:</strong> {services.find(s => s._id === selectedService)?.name || 'Not selected'}</p>
              <p><strong>Stylist:</strong> {staffMembers.find(s => s._id === selectedStaff)?.name || 'Not selected'}</p>
              <p><strong>Date:</strong> {selectedDate || 'Not selected'}</p>
              <p><strong>Time:</strong> {selectedTime || 'Not selected'}</p>
              <p><strong>Duration:</strong> {services.find(s => s._id === selectedService)?.duration || '0'} minutes</p>
              <p><strong>Total:</strong> <span className="red-text">Ksh {services.find(s => s._id === selectedService)?.price || 0}</span></p>
            </div>
            <button 
              className="btn-primary book-now-btn"
              onClick={handleBookAppointment}
              disabled={!selectedService || !selectedStaff || !selectedDate || !selectedTime}
            >
              Confirm & Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payments Tab Component
const PaymentsTab = ({ paymentHistory }) => {
  return (
    <div className="dashboard-content">
      <div className="content-section red-border">
        <h2>Payment History</h2>
        {paymentHistory.length === 0 ? (
          <p className="no-data">No payment history found</p>
        ) : (
          <div className="payments-table">
            <div className="table-header">
              <span>Date</span>
              <span>Service</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Payment Method</span>
            </div>
            {paymentHistory.map(payment => (
              <div key={payment._id} className="table-row">
                <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                <span>{payment.serviceId?.name || payment.serviceName}</span>
                <span>Ksh {payment.amount}</span>
                <span className={`payment-status ${payment.status} red-text`}>
                  {payment.status}
                </span>
                <span>{payment.paymentMethod || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ userData, onUpdateProfile }) => {
  const [profile, setProfile] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    preferences: userData?.preferences || {
      newsletter: true,
      preferredStylist: '',
      favoriteServices: []
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(profile);
  };

  return (
    <div className="dashboard-content">
      <div className="content-section red-border">
        <h2>Personal Information</h2>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                className="form-input red-border"
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                className="form-input red-border"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="form-input red-border"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="form-input red-border"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab = ({ notifications, onMarkAsRead }) => {
  return (
    <div className="dashboard-content">
      <div className="content-section red-border">
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <p className="no-data">No notifications</p>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item red-border-left ${notification.read ? 'read' : 'unread red-active'}`}
                onClick={() => !notification.read && onMarkAsRead(notification._id)}
              >
                <div className="notification-icon red-text">
                  {notification.type === 'reminder' && '⏰'}
                  {notification.type === 'promo' && '🎁'}
                  {notification.type === 'loyalty' && '⭐'}
                </div>
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!notification.read && <div className="unread-dot red-bg"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;