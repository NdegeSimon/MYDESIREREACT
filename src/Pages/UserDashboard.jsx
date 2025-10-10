import "../index.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import your separate components
import MyAppointments from './MyAppointments';
import BookingPage from './BookApointments';
import Profile from './Profile';
import StaffPage from "./Staff";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // API client with auth header - UPDATED with CORS handling
  const apiClient = axios.create({
    baseURL: apiUrl,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    withCredentials: true // Add this for CORS
  });

  // Add request interceptor for better error handling
  apiClient.interceptors.request.use(
    (config) => {
      console.log(`🔄 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for better error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('❌ Response error:', error);
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        setError('Network error: Cannot connect to server. Please check if the backend is running.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        handleLogout();
      } else if (error.response?.status === 403) {
        setError('Access forbidden. Please check your permissions.');
      } else if (error.response?.status === 404) {
        setError('Requested resource not found.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      }
      return Promise.reject(error);
    }
  );

  // Fetch user profile - UPDATED with better error handling
  const fetchUserProfile = async () => {
    try {
      console.log('🔄 Fetching user profile...');
      const response = await apiClient.get('/users/profile');
      console.log('✅ User profile data:', response.data);
      setUserData(response.data);
    } catch (err) {
      console.error('❌ Error fetching user profile:', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to load user profile');
      }
    }
  };

  // Fetch appointments - UPDATED with better error handling
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
      console.error('❌ Error fetching appointments:', err);
      // Don't set error here to avoid spam - we'll show general error in interceptor
    }
  };

  // Fetch services - UPDATED with better error handling
  const fetchServices = async () => {
    try {
      const response = await apiClient.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('❌ Error fetching services:', err);
    }
  };

  // Fetch staff - UPDATED with better error handling
  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/staff');
      setStaffMembers(response.data);
    } catch (err) {
      console.error('❌ Error fetching staff:', err);
    }
  };

  // Fetch payment history - UPDATED with better error handling
  const fetchPayments = async () => {
    try {
      const response = await apiClient.get('/payments/my-payments');
      setPaymentHistory(response.data);
    } catch (err) {
      console.error('❌ Error fetching payments:', err);
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Load all data on component mount - UPDATED to handle CORS errors gracefully
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Only fetch essential data - remove problematic endpoints temporarily
        await Promise.all([
          fetchUserProfile(),
          fetchAppointments(),
          fetchServices(),
          fetchStaff()
          // Remove payments and notifications for now to avoid CORS errors
          // fetchPayments(),
          // fetchNotifications()
        ]);
      } catch (err) {
        console.error('Error loading UserDashboard data:', err);
        // Error is already handled in interceptors
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
          {/* Welcome message with better fallback */}
          <div className="welcome-message">
            <span>Hey, {userData?.firstName || userData?.name || 'User'}</span>
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
            onClick={() => setActiveTab('book')}
          >
           Book Appointment
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
           Payments
          </button>
          {/* REPLACED Notifications with Staff */}
          <button 
            className={`nav-item ${activeTab === 'staff' ? 'active red-active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            👥 Our Staff
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="user-main">
        <header className="user-header red-border-bottom">
          <h1 className="red-text">
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'appointments' && 'My Appointments'}
            {activeTab === 'book' && 'Book New Appointment'}
            {activeTab === 'payments' && 'Payment History'}
            {activeTab === 'staff' && 'Our Team'} {/* Updated title */}
          </h1>
          <div className="header-actions">
            <button className="logout-btn red-border" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="error-message red-border">
            {error}
            <button 
              className="close-error" 
              onClick={() => setError('')}
              style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              ×
            </button>
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

        {/* Staff Tab - NEW */}
        {activeTab === 'staff' && (
          <div className="dashboard-content">
            <StaffTab staffMembers={staffMembers} />
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

// StaffTab Component - NEW (Simple version for now)
const StaffTab = ({ staffMembers }) => {
  return (
    <div className="dashboard-content">
      <div className="content-section red-border">
        <h2>Our Professional Team</h2>
        <p>Meet our talented team of beauty and wellness experts dedicated to making you look and feel your best.</p>
        
        {staffMembers.length === 0 ? (
          <div className="no-data">
            <p>No staff information available at the moment.</p>
            <p>Please check back later or contact us directly.</p>
          </div>
        ) : (
          <div className="staff-grid-mini">
            {staffMembers.map(staff => (
              <div key={staff._id} className="staff-card-mini red-border">
                <div className="staff-avatar-mini red-gradient">
                  {staff.name?.split(' ').map(n => n[0]).join('') || 'ST'}
                </div>
                <div className="staff-info-mini">
                  <h3 className="red-text">{staff.name || 'Staff Member'}</h3>
                  <p className="staff-role">{staff.specialty || 'Beauty Expert'}</p>
                  <p className="staff-experience">{staff.experience || 'Professional'}</p>
                  <div className="staff-status available">
                    {staff.available !== false ? '✅ Available' : '⏸️ Unavailable'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;