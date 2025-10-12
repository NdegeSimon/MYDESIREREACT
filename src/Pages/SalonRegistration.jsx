import React, { useState } from 'react';
import '../index.css';

const SalonRegistration = () => {
  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Using the existing signup endpoint but with admin role
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.ownerName.split(' ')[0],
          lastName: formData.ownerName.split(' ').slice(1).join(' ') || 'Owner',
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          salonName: formData.salonName,
          address: formData.address,
          city: formData.city,
          role: 'admin' // This will need to be handled in your backend
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Salon registered successfully! You can now login as admin.');
        setFormData({
          salonName: '',
          ownerName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          password: '',
          confirmPassword: ''
        });
        
        // Auto login after successful registration
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salon-registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h1>Register Your Salon</h1>
          <p>Create your salon account and get admin access to manage your business</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <h3>Salon Information</h3>
            <div className="form-group">
              <label>Salon Name *</label>
              <input
                type="text"
                value={formData.salonName}
                onChange={(e) => handleInputChange('salonName', e.target.value)}
                required
                placeholder="Enter your salon name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Owner Full Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  placeholder="+254 XXX XXX XXX"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  placeholder="Street address"
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  placeholder="City"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Account Security</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Admin Privileges</h3>
            <div className="privileges-list">
              <div className="privilege-item">
                <span className="privilege-icon">👑</span>
                <div>
                  <strong>Full Admin Access</strong>
                  <p>Manage staff, services, appointments, and users</p>
                </div>
              </div>
              <div className="privilege-item">
                <span className="privilege-icon">💰</span>
                <div>
                  <strong>Business Analytics</strong>
                  <p>View revenue reports and business insights</p>
                </div>
              </div>
              <div className="privilege-item">
                <span className="privilege-icon">👥</span>
                <div>
                  <strong>Staff Management</strong>
                  <p>Add, edit, and manage your salon staff</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Salon & Get Admin Access'}
            </button>
          </div>

          <div className="login-link">
            <p>Already have an account? <a href="/login">Login here</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalonRegistration;