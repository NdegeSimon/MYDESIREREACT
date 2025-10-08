import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import "../index.css"; // We'll create this CSS file

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    address: user?.address || ""
  });
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const fileInputRef = useRef(null);

  if (loading) return (
    <div className="profile-loading">
      <div className="spinner"></div>
      <p>Loading profile...</p>
    </div>
  );
  
  if (!user) return (
    <div className="profile-error">
      <h2>No user data found</h2>
      <p>Please log in to view your profile</p>
    </div>
  );

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the file to your server
      // For now, we'll create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
      
      // Here you would typically upload to your backend
      // updateProfile({ avatar: imageUrl });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({ ...profileData, avatar });
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || "",
      address: user.address || ""
    });
    setAvatar(user.avatar || "");
    setIsEditing(false);
  };

  return (
    <div className="profile-container red-black-theme">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button 
            className="edit-btn red-border"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div 
            className={`avatar-container ${isEditing ? 'editable' : ''}`}
            onClick={handleAvatarClick}
          >
            {avatar ? (
              <img src={avatar} alt="Profile Avatar" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder red-gradient">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
            {isEditing && (
              <div className="avatar-overlay">
                <span>Change Photo</span>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div className="avatar-info">
            <h2>{user.firstName} {user.lastName}</h2>
            <p className="member-since">
              Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </p>
            {user.membershipTier && (
              <span className="membership-badge red-bg">
                {user.membershipTier}
              </span>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="profile-form-section">
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input red-border"
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input red-border"
              />
            </div>

            <div className="form-group full-width">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input red-border"
              />
            </div>

            <div className="form-group full-width">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input red-border"
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-textarea red-border"
                rows="3"
                placeholder="Enter your address..."
              />
            </div>

            <div className="form-group full-width">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-textarea red-border"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="form-actions">
              <button 
                className="btn-cancel red-border"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                className="btn-save red-bg"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="profile-stats">
          <div className="stat-card red-border">
            <h3>Appointments</h3>
            <p className="stat-number red-text">{user.totalAppointments || 0}</p>
            <p className="stat-label">Total Bookings</p>
          </div>

          <div className="stat-card red-border">
            <h3>Loyalty Points</h3>
            <p className="stat-number red-text">{user.loyaltyPoints || 0}</p>
            <p className="stat-label">Points Earned</p>
          </div>

          <div className="stat-card red-border">
            <h3>Member Tier</h3>
            <p className="stat-number">{user.membershipTier || 'Standard'}</p>
            <p className="stat-label">Current Level</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;