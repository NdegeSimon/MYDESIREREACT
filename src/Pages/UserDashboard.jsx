import "../index.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import your separate components
import MyAppointments from './MyAppointments';
import BookingPage from './BookApointments'; // Make sure this file exists
import Profile from './Profile';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
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
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // API client with auth header
  const apiClient = axios.create({
    baseURL: apiUrl,
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
          </div>
          {/* Welcome message */}
          <div className="welcome-message">
            <span>Hey, {userData?.firstName}</span>
          </div>
        </div>
        <br />
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            My Appointments
          </button>
          <button 
            className={`nav-item ${activeTab === 'book' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('book')} /* FIXED: was 'bookapointments' */
          >
            Book Appointment
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
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
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'appointments' && 'My Appointments'}
            {activeTab === 'book' && 'Book New Appointment'} {/* This matches the tab name */}
            {activeTab === 'payments' && 'Payment History'}
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="dashboard-content">
            <Profile />
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="dashboard-content">
            <MyAppointments />
          </div>
        )}

        {/* Book Appointment Tab */}
        {activeTab === 'book' && (
          <div className="dashboard-content">
            <BookingPage />
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="dashboard-content">
            <PaymentsTab paymentHistory={paymentHistory} />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="dashboard-content">
            <NotificationsTab 
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// PaymentsTab Component
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

// NotificationsTab Component
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