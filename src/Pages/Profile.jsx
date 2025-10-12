import React, { useState, useEffect } from 'react';
import '../index.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Your personal information and account details</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <h2>{user.first_name} {user.last_name}</h2>
            <div className="user-role">
              {user.role === 'admin' ? 'Administrator' : 'Customer'}
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">First Name</span>
                  <span className="detail-value">{user.first_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name</span>
                  <span className="detail-value">{user.last_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">{user.id}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{user.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Status</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Account Type</span>
                  <span className="detail-value">
                    <span className={`status-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
                {user.loyalty_points && (
                  <div className="detail-item">
                    <span className="detail-label">Loyalty Points</span>
                    <span className="detail-value">{user.loyalty_points}</span>
                  </div>
                )}
                {user.membership_tier && (
                  <div className="detail-item">
                    <span className="detail-label">Membership Tier</span>
                    <span className="detail-value">{user.membership_tier}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-notice">
            <p>This is a read-only view of your profile. Contact administration for updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;