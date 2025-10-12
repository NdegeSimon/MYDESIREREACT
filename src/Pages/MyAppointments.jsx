import React, { useState, useEffect } from 'react';
import '../index.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointment: null });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTab]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      } else {
        setError('Failed to load appointments');
      }
    } catch (error) {
      setError('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    const now = new Date();
    let filtered = [];

    switch (activeTab) {
      case 'upcoming':
        filtered = appointments.filter(apt => 
          new Date(`${apt.date}T${apt.time}`) > now && 
          apt.status !== 'cancelled' && 
          apt.status !== 'completed'
        );
        break;
      case 'past':
        filtered = appointments.filter(apt => 
          new Date(`${apt.date}T${apt.time}`) <= now || 
          apt.status === 'completed'
        );
        break;
      case 'cancelled':
        filtered = appointments.filter(apt => apt.status === 'cancelled');
        break;
      default:
        filtered = appointments;
    }

    filtered.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async () => {
    if (!cancelDialog.appointment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${cancelDialog.appointment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCancelDialog({ open: false, appointment: null });
        fetchAppointments();
      } else {
        setError('Failed to cancel appointment');
      }
    } catch (error) {
      setError('Error cancelling appointment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status, date, time) => {
    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();
    const statusClass = {
      'confirmed': 'status-confirmed',
      'pending': 'status-pending',
      'cancelled': 'status-cancelled',
      'completed': 'status-completed'
    }[status] || 'status-pending';

    let statusText = status;
    if (status === 'confirmed' && appointmentDate < now) {
      statusText = 'expired';
    }

    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
  };

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <p>Manage and view your beauty appointments</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
          <button 
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </div>
      </div>

      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <h3>No appointments found</h3>
            <p>
              {activeTab === 'upcoming' ? "You don't have any upcoming appointments." : 
               activeTab === 'past' ? "No past appointments found." :
               activeTab === 'cancelled' ? "No cancelled appointments found." : 
               "No appointments found."}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.service_name || 'Beauty Service'}</h3>
                {getStatusBadge(appointment.status, appointment.date, appointment.time)}
              </div>
              
              <div className="appointment-details">
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(appointment.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{formatTime(appointment.time)}</span>
                </div>
                {appointment.staff_name && (
                  <div className="detail-item">
                    <span className="label">Staff:</span>
                    <span className="value">{appointment.staff_name}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Price:</span>
                  <span className="value">KES {appointment.price}</span>
                </div>
                {appointment.notes && (
                  <div className="detail-item">
                    <span className="label">Notes:</span>
                    <span className="value notes">{appointment.notes}</span>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                {appointment.status !== 'cancelled' && 
                 appointment.status !== 'completed' &&
                 new Date(`${appointment.date}T${appointment.time}`) > new Date() && (
                  <button 
                    className="btn-cancel"
                    onClick={() => setCancelDialog({ open: true, appointment })}
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialog.open && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Cancel Appointment</h3>
            <p>Are you sure you want to cancel this appointment?</p>
            
            {cancelDialog.appointment && (
              <div className="appointment-summary">
                <p><strong>Service:</strong> {cancelDialog.appointment.service_name}</p>
                <p><strong>Date:</strong> {formatDate(cancelDialog.appointment.date)}</p>
                <p><strong>Time:</strong> {formatTime(cancelDialog.appointment.time)}</p>
                <p><strong>Price:</strong> KES {cancelDialog.appointment.price}</p>
              </div>
            )}

            <div className="dialog-actions">
              <button 
                className="btn-secondary"
                onClick={() => setCancelDialog({ open: false, appointment: null })}
              >
                Keep Appointment
              </button>
              <button 
                className="btn-danger"
                onClick={handleCancelAppointment}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;