import React, { useState, useEffect } from 'react';
import './index.css';

const BookAppointments = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    serviceId: '',
    staffId: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    fetchServices();
    fetchStaff();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId: parseInt(formData.serviceId),
          staffId: parseInt(formData.staffId),
          date: formData.date,
          time: formData.time,
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Appointment booked successfully!');
        setFormData({
          serviceId: '',
          staffId: '',
          date: '',
          time: '',
          notes: ''
        });
        setCurrentStep(1);
      } else {
        setError(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      setError('Error booking appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
  const selectedStaff = staff.find(s => s.id === parseInt(formData.staffId));

  const steps = [
    { number: 1, title: 'Select Service' },
    { number: 2, title: 'Choose Staff & Time' },
    { number: 3, title: 'Confirm Booking' }
  ];

  const getAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <div className="book-appointments-container">
      <div className="booking-header">
        <h1>Book an Appointment</h1>
        <p>Schedule your beauty treatment with our professional staff</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="booking-card">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={step.number} className="step-container">
              <div className={`step ${currentStep >= step.number ? 'active' : ''}`}>
                <div className="step-number">{step.number}</div>
                <div className="step-title">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`step-line ${currentStep > step.number ? 'active' : ''}`}></div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="form-step">
              <h3>Choose a Service</h3>
              <div className="services-grid">
                {services.map(service => (
                  <div 
                    key={service.id}
                    className={`service-option ${formData.serviceId === service.id.toString() ? 'selected' : ''}`}
                    onClick={() => handleInputChange('serviceId', service.id.toString())}
                  >
                    <div className="service-info">
                      <h4>{service.name}</h4>
                      <p className="service-description">{service.description}</p>
                      <div className="service-details">
                        <span className="price">KES {service.price}</span>
                        <span className="duration">{service.duration} mins</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="step-actions">
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={nextStep}
                  disabled={!formData.serviceId}
                >
                  Next: Choose Staff
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Staff & Time Selection */}
          {currentStep === 2 && (
            <div className="form-step">
              <h3>Select Staff & Time</h3>
              
              <div className="form-group">
                <label>Choose Staff Member</label>
                <div className="staff-grid">
                  {staff.map(staffMember => (
                    <div 
                      key={staffMember.id}
                      className={`staff-option ${formData.staffId === staffMember.id.toString() ? 'selected' : ''}`}
                      onClick={() => handleInputChange('staffId', staffMember.id.toString())}
                    >
                      <div className="staff-avatar">
                        {staffMember.first_name[0]}{staffMember.last_name[0]}
                      </div>
                      <div className="staff-info">
                        <h4>{staffMember.first_name} {staffMember.last_name}</h4>
                        <p className="specialty">{staffMember.specialty}</p>
                        <p className="rating">⭐ {staffMember.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Appointment Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Time</label>
                  <select
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                  >
                    <option value="">Select time</option>
                    {getAvailableTimeSlots().map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special requests or notes for our staff..."
                  rows="3"
                />
              </div>

              <div className="step-actions">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={nextStep}
                  disabled={!formData.staffId || !formData.date || !formData.time}
                >
                  Next: Confirm Booking
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="form-step">
              <h3>Confirm Your Appointment</h3>
              
              <div className="appointment-summary">
                <div className="summary-section">
                  <h4>Service Details</h4>
                  {selectedService && (
                    <div className="summary-item">
                      <span className="label">Service:</span>
                      <span className="value">{selectedService.name}</span>
                    </div>
                  )}
                  {selectedService && (
                    <div className="summary-item">
                      <span className="label">Price:</span>
                      <span className="value">KES {selectedService.price}</span>
                    </div>
                  )}
                  {selectedService && (
                    <div className="summary-item">
                      <span className="label">Duration:</span>
                      <span className="value">{selectedService.duration} minutes</span>
                    </div>
                  )}
                </div>

                <div className="summary-section">
                  <h4>Staff & Timing</h4>
                  {selectedStaff && (
                    <div className="summary-item">
                      <span className="label">Staff:</span>
                      <span className="value">{selectedStaff.first_name} {selectedStaff.last_name}</span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(formData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Time:</span>
                    <span className="value">{formData.time}</span>
                  </div>
                </div>

                {formData.notes && (
                  <div className="summary-section">
                    <h4>Additional Notes</h4>
                    <p className="notes">{formData.notes}</p>
                  </div>
                )}
              </div>

              <div className="step-actions">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookAppointments;