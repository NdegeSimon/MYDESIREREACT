import React, { useState, useEffect } from 'react';
import '../index.css';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, staff: null });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: 'hair-stylist',
    experience: '',
    bio: '',
    rating: 0,
    image: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    experienceYears: 0
  });

  const specialties = [
    { value: 'hair-stylist', label: 'Hair Stylist' },
    { value: 'barber', label: 'Barber' },
    { value: 'skincare-specialist', label: 'Skincare Specialist' },
    { value: 'nails', label: 'Nail Technician' },
    { value: 'massage', label: 'Massage Therapist' },
    { value: 'makeup', label: 'Makeup Artist' }
  ];

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchStaff();
    }
  }, [userRole]);

  const fetchUserRole = async () => {
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
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'http://localhost:5000/api/staff';
      let headers = {};

      // If user is admin, use admin endpoint to get all staff (including inactive)
      if (userRole === 'admin') {
        endpoint = 'http://localhost:5000/api/admin/staff';
        headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }

      const response = await fetch(endpoint, { headers });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || data);
      } else {
        setError('Failed to load staff');
      }
    } catch (error) {
      setError('Error loading staff: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: 'hair-stylist',
      experience: '',
      bio: '',
      rating: 0,
      image: '',
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      experienceYears: 0
    });
    setDialogOpen(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      firstName: staffMember.first_name,
      lastName: staffMember.last_name,
      email: staffMember.email,
      phone: staffMember.phone || '',
      specialty: staffMember.specialty,
      experience: staffMember.experience || '',
      bio: staffMember.bio || '',
      rating: staffMember.rating || 0,
      image: staffMember.image || '',
      workingHoursStart: staffMember.working_hours_start || '09:00',
      workingHoursEnd: staffMember.working_hours_end || '18:00',
      experienceYears: staffMember.experience_years || 0
    });
    setDialogOpen(true);
  };

  const handleDeleteStaff = (staffMember) => {
    setDeleteConfirm({ open: true, staff: staffMember });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.staff) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/staff/${deleteConfirm.staff.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setDeleteConfirm({ open: false, staff: null });
        fetchStaff();
      } else {
        setError('Failed to delete staff member');
      }
    } catch (error) {
      setError('Error deleting staff member: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingStaff 
        ? `http://localhost:5000/api/admin/staff/${editingStaff.id}`
        : 'http://localhost:5000/api/admin/staff';
      
      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          experience: formData.experience,
          bio: formData.bio,
          rating: parseFloat(formData.rating),
          image: formData.image,
          workingHoursStart: formData.workingHoursStart,
          workingHoursEnd: formData.workingHoursEnd,
          experienceYears: parseInt(formData.experienceYears)
        })
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchStaff();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save staff member');
      }
    } catch (error) {
      setError('Error saving staff member: ' + error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSpecialtyLabel = (specialty) => {
    const found = specialties.find(s => s.value === specialty);
    return found ? found.label : specialty;
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'hair-stylist': '#4CAF50',
      'barber': '#2196F3',
      'skincare-specialist': '#FF9800',
      'nails': '#E91E63',
      'massage': '#9C27B0',
      'makeup': '#607D8B'
    };
    return colors[specialty] || '#607D8B';
  };

  // Regular users can only view staff
  if (userRole !== 'admin') {
    return (
      <div className="staff-page-container">
        <div className="staff-header">
          <h1>Our Professional Staff</h1>
          <p>Meet our team of beauty experts</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading staff...</div>
        ) : (
          <div className="staff-grid">
            {staff.map(staffMember => (
              <div key={staffMember.id} className="staff-card">
                <div className="staff-avatar">
                  {staffMember.image ? (
                    <img src={staffMember.image} alt={`${staffMember.first_name} ${staffMember.last_name}`} />
                  ) : (
                    <div className="avatar-fallback">
                      {staffMember.first_name[0]}{staffMember.last_name[0]}
                    </div>
                  )}
                </div>
                
                <div className="staff-info">
                  <h3>{staffMember.first_name} {staffMember.last_name}</h3>
                  <span 
                    className="specialty-badge"
                    style={{ backgroundColor: getSpecialtyColor(staffMember.specialty) }}
                  >
                    {getSpecialtyLabel(staffMember.specialty)}
                  </span>
                  
                  {staffMember.rating > 0 && (
                    <div className="rating">
                      {'⭐'.repeat(Math.floor(staffMember.rating))}
                      <span className="rating-text">{staffMember.rating}</span>
                    </div>
                  )}

                  {staffMember.experience && (
                    <p className="experience">{staffMember.experience}</p>
                  )}

                  {staffMember.bio && (
                    <p className="bio">"{staffMember.bio}"</p>
                  )}

                  <div className="staff-contact">
                    {staffMember.email && (
                      <div className="contact-item">
                        <span className="label">Email:</span>
                        <span className="value">{staffMember.email}</span>
                      </div>
                    )}
                    {staffMember.phone && (
                      <div className="contact-item">
                        <span className="label">Phone:</span>
                        <span className="value">{staffMember.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin users get full CRUD access
  return (
    <div className="staff-page-container">
      <div className="staff-header">
        <h1>Staff Management</h1>
        <p>Manage your salon staff members</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="staff-actions">
        <button className="btn-primary" onClick={handleAddStaff}>
          Add New Staff Member
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading staff...</div>
      ) : (
        <div className="staff-grid">
          {staff.map(staffMember => (
            <div key={staffMember.id} className="staff-card admin-card">
              <div className="staff-avatar">
                {staffMember.image ? (
                  <img src={staffMember.image} alt={`${staffMember.first_name} ${staffMember.last_name}`} />
                ) : (
                  <div className="avatar-fallback">
                    {staffMember.first_name[0]}{staffMember.last_name[0]}
                  </div>
                )}
                {!staffMember.is_active && (
                  <div className="inactive-badge">Inactive</div>
                )}
              </div>
              
              <div className="staff-info">
                <h3>{staffMember.first_name} {staffMember.last_name}</h3>
                <span 
                  className="specialty-badge"
                  style={{ backgroundColor: getSpecialtyColor(staffMember.specialty) }}
                >
                  {getSpecialtyLabel(staffMember.specialty)}
                </span>
                
                {staffMember.rating > 0 && (
                  <div className="rating">
                    {'⭐'.repeat(Math.floor(staffMember.rating))}
                    <span className="rating-text">{staffMember.rating}</span>
                  </div>
                )}

                {staffMember.experience && (
                  <p className="experience">{staffMember.experience}</p>
                )}

                {staffMember.bio && (
                  <p className="bio">"{staffMember.bio}"</p>
                )}

                <div className="staff-contact">
                  {staffMember.email && (
                    <div className="contact-item">
                      <span className="label">Email:</span>
                      <span className="value">{staffMember.email}</span>
                    </div>
                  )}
                  {staffMember.phone && (
                    <div className="contact-item">
                      <span className="label">Phone:</span>
                      <span className="value">{staffMember.phone}</span>
                    </div>
                  )}
                  {staffMember.working_hours_start && staffMember.working_hours_end && (
                    <div className="contact-item">
                      <span className="label">Hours:</span>
                      <span className="value">{staffMember.working_hours_start} - {staffMember.working_hours_end}</span>
                    </div>
                  )}
                </div>

                <div className="staff-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditStaff(staffMember)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteStaff(staffMember)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Dialog */}
      {dialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Specialty</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                >
                  {specialties.map(specialty => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Working Hours Start</label>
                  <input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) => handleInputChange('workingHoursStart', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Working Hours End</label>
                  <input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) => handleInputChange('workingHoursEnd', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Experience Description</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="e.g., 5 years in hair styling"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows="3"
                  placeholder="Short bio about the staff member..."
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="dialog-actions">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Delete Staff Member</h3>
            <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
            
            {deleteConfirm.staff && (
              <div className="staff-summary">
                <p><strong>Name:</strong> {deleteConfirm.staff.first_name} {deleteConfirm.staff.last_name}</p>
                <p><strong>Specialty:</strong> {getSpecialtyLabel(deleteConfirm.staff.specialty)}</p>
                <p><strong>Email:</strong> {deleteConfirm.staff.email}</p>
              </div>
            )}

            <div className="dialog-actions">
              <button 
                className="btn-secondary"
                onClick={() => setDeleteConfirm({ open: false, staff: null })}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={confirmDelete}
              >
                Delete Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;