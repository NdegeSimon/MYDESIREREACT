import React, { useState, useEffect } from 'react';
import "../index.css";

const StaffPage = ({ isAdmin = false }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    title: '',
    specialty: 'hair-stylist',
    experience: '',
    bio: '',
    skills: [],
    services: [],
    rating: 0,
    reviews: 0,
    available: true,
    featured: false
  });

  // Staff specialties
  const specialties = [
    'all',
    'hair-stylist',
    'color-specialist',
    'barber',
    'esthetician',
    'nail-technician',
    'makeup-artist',
    'massage-therapist'
  ];

  // Load staff data from localStorage on component mount
  useEffect(() => {
    const savedStaff = localStorage.getItem('staffData');
    if (savedStaff) {
      setStaffMembers(JSON.parse(savedStaff));
    } else {
      // Initialize with sample data if none exists
      const initialStaff = [
        {
          id: 1,
          name: "Sarah Johnson",
          title: "Senior Hair Stylist",
          specialty: "hair-stylist",
          experience: "8 years",
          image: "/api/placeholder/300/300",
          bio: "Sarah specializes in precision cutting and modern hair trends.",
          skills: ["Precision Cutting", "Balayage", "Hair Extensions"],
          services: ["Women's Haircut", "Blowouts", "Updos"],
          rating: 4.9,
          reviews: 127,
          available: true,
          featured: true
        },
        {
          id: 2,
          name: "Marcus Rodriguez",
          title: "Master Color Specialist",
          specialty: "color-specialist",
          experience: "12 years",
          image: "/api/placeholder/300/300",
          bio: "Marcus is our color genius with extensive training.",
          skills: ["Balayage", "Color Correction", "Vivid Colors"],
          services: ["Full Color", "Highlights", "Color Correction"],
          rating: 5.0,
          reviews: 89,
          available: true,
          featured: true
        }
      ];
      setStaffMembers(initialStaff);
      localStorage.setItem('staffData', JSON.stringify(initialStaff));
    }
  }, []);

  // Save staff data whenever it changes
  useEffect(() => {
    if (staffMembers.length > 0) {
      localStorage.setItem('staffData', JSON.stringify(staffMembers));
    }
  }, [staffMembers]);

  const filteredStaff = selectedSpecialty === 'all' 
    ? staffMembers 
    : staffMembers.filter(staff => staff.specialty === selectedSpecialty);

  const openStaffModal = (staff) => {
    setSelectedStaff(staff);
  };

  const closeStaffModal = () => {
    setSelectedStaff(null);
  };

  const deleteStaff = (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      const updatedStaff = staffMembers.filter(staff => staff.id !== staffId);
      setStaffMembers(updatedStaff);
    }
  };

  const handleAddStaff = () => {
    const staffWithId = {
      ...newStaff,
      id: Date.now(), // Simple ID generation
      image: "/api/placeholder/300/300",
      skills: newStaff.skills.length > 0 ? newStaff.skills.split(',').map(s => s.trim()) : [],
      services: newStaff.services.length > 0 ? newStaff.services.split(',').map(s => s.trim()) : []
    };

    setStaffMembers([...staffMembers, staffWithId]);
    setShowAddStaffModal(false);
    setNewStaff({
      name: '',
      title: '',
      specialty: 'hair-stylist',
      experience: '',
      bio: '',
      skills: [],
      services: [],
      rating: 0,
      reviews: 0,
      available: true,
      featured: false
    });
  };

  const getSpecialtyLabel = (specialty) => {
    const labels = {
      'hair-stylist': 'Hair Stylist',
      'color-specialist': 'Color Specialist',
      'barber': 'Barber',
      'esthetician': 'Esthetician',
      'nail-technician': 'Nail Technician',
      'makeup-artist': 'Makeup Artist',
      'massage-therapist': 'Massage Therapist'
    };
    return labels[specialty] || specialty;
  };

  return (
    <div className="staff-page red-black-theme">
      {/* Hero Section */}
      <section className="staff-hero">
        <div className="hero-content">
          <h1 className="hero-title">Meet Our Expert Team</h1>
          <p className="hero-subtitle">
            Our talented professionals are dedicated to providing you with exceptional service 
            and helping you look and feel your absolute best.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number red-text">{staffMembers.length}+</span>
              <span className="stat-label">Expert Stylists</span>
            </div>
            <div className="stat">
              <span className="stat-number red-text">50+</span>
              <span className="stat-label">Years Combined Experience</span>
            </div>
            <div className="stat">
              <span className="stat-number red-text">1000+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
          </div>

          {/* Admin Only - Add Staff Button */}
          {isAdmin && (
            <div className="admin-controls">
              <button 
                className="add-staff-btn red-bg"
                onClick={() => setShowAddStaffModal(true)}
              >
                + Add New Staff Member
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Specialty Filter */}
      <section className="specialty-filter">
        <div className="filter-container">
          <h2 className="filter-title">Find Your Specialist</h2>
          <div className="filter-buttons">
            {specialties.map(specialty => (
              <button
                key={specialty}
                className={`specialty-btn ${selectedSpecialty === specialty ? 'active red-active' : ''}`}
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty === 'all' ? 'All Team' : getSpecialtyLabel(specialty)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="staff-grid-section">
        <div className="container">
          <h2 className="section-title">
            {selectedSpecialty === 'all' ? 'Our Entire Team' : getSpecialtyLabel(selectedSpecialty) + 's'}
          </h2>
          
          {filteredStaff.length === 0 ? (
            <div className="no-staff-message">
              <h3>No staff members found</h3>
              <p>Please check back later or contact us for more information.</p>
            </div>
          ) : (
            <div className="staff-grid">
              {filteredStaff.map(staff => (
                <div key={staff.id} className="staff-card red-border">
                  <div className="card-header">
                    <div className="staff-image">
                      <img 
                        src={staff.image} 
                        alt={staff.name}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/300x300/DC2626/FFFFFF?text=${encodeURIComponent(staff.name.split(' ')[0])}`;
                        }}
                      />
                      {!staff.available && (
                        <div className="unavailable-overlay">
                          <span>On Leave</span>
                        </div>
                      )}
                    </div>
                    {staff.featured && selectedSpecialty === 'all' && (
                      <div className="featured-tag red-bg">Featured</div>
                    )}
                    
                    {/* Admin Only - Delete Button */}
                    {isAdmin && (
                      <button 
                        className="delete-staff-btn"
                        onClick={() => deleteStaff(staff.id)}
                        title="Delete Staff Member"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="staff-name red-text">{staff.name}</h3>
                    <p className="staff-title">{staff.title}</p>
                    <p className="staff-experience">Experience: {staff.experience}</p>
                    
                    <div className="staff-rating">
                      <span className="stars">★★★★★</span>
                      <span className="rating">{staff.rating} ({staff.reviews} reviews)</span>
                    </div>

                    <div className="availability">
                      <span className={`status ${staff.available ? 'available' : 'unavailable'}`}>
                        {staff.available ? '✅ Available' : '⏸️ On Leave'}
                      </span>
                    </div>

                    <div className="staff-skills">
                      {staff.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag red-border">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="card-actions">
                      <button 
                        className="profile-btn red-border"
                        onClick={() => openStaffModal(staff)}
                      >
                        View Profile
                      </button>
                      <button 
                        className={`book-btn ${staff.available ? 'red-bg' : 'disabled'}`}
                        disabled={!staff.available}
                      >
                        {staff.available ? 'Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Staff Details Modal */}
      {selectedStaff && (
        <div className="staff-modal-overlay" onClick={closeStaffModal}>
          <div className="staff-modal red-border" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeStaffModal}>×</button>
            
            <div className="modal-content">
              <div className="modal-image-section">
                <div className="staff-image-large">
                  <img 
                    src={selectedStaff.image} 
                    alt={selectedStaff.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x400/DC2626/FFFFFF?text=${encodeURIComponent(selectedStaff.name.split(' ')[0])}`;
                    }}
                  />
                </div>
                {selectedStaff.featured && (
                  <div className="featured-badge-large red-bg">Featured Artist</div>
                )}
              </div>
              
              <div className="modal-details">
                <div className="modal-header">
                  <h2 className="modal-name red-text">{selectedStaff.name}</h2>
                  <p className="modal-title">{selectedStaff.title}</p>
                  <div className="modal-meta">
                    <span className="experience">{selectedStaff.experience} Experience</span>
                    <span className="rating">
                      ★ {selectedStaff.rating} ({selectedStaff.reviews} reviews)
                    </span>
                    <span className={`availability ${selectedStaff.available ? 'available' : 'unavailable'}`}>
                      {selectedStaff.available ? 'Available' : 'On Leave'}
                    </span>
                  </div>
                </div>

                <div className="modal-bio">
                  <h3>About Me</h3>
                  <p>{selectedStaff.bio}</p>
                </div>

                <div className="modal-skills">
                  <h3>Specialties</h3>
                  <div className="skills-grid">
                    {selectedStaff.skills.map((skill, index) => (
                      <div key={index} className="skill-item red-border">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-services">
                  <h3>Services Offered</h3>
                  <ul>
                    {selectedStaff.services.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-actions">
                  <button 
                    className={`btn-primary ${selectedStaff.available ? 'red-bg' : 'disabled'}`}
                    disabled={!selectedStaff.available}
                  >
                    {selectedStaff.available ? 'Book Appointment' : 'Currently Unavailable'}
                  </button>
                  <button className="btn-secondary red-border" onClick={closeStaffModal}>
                    Back to Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal - Admin Only */}
      {showAddStaffModal && isAdmin && (
        <div className="staff-modal-overlay" onClick={() => setShowAddStaffModal(false)}>
          <div className="staff-modal red-border" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddStaffModal(false)}>×</button>
            
            <div className="modal-content">
              <div className="modal-details">
                <h2 className="modal-name red-text">Add New Staff Member</h2>
                
                <div className="add-staff-form">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Title *</label>
                    <input 
                      type="text" 
                      value={newStaff.title}
                      onChange={(e) => setNewStaff({...newStaff, title: e.target.value})}
                      placeholder="e.g., Senior Hair Stylist"
                    />
                  </div>

                  <div className="form-group">
                    <label>Specialty *</label>
                    <select 
                      value={newStaff.specialty}
                      onChange={(e) => setNewStaff({...newStaff, specialty: e.target.value})}
                    >
                      {specialties.filter(s => s !== 'all').map(specialty => (
                        <option key={specialty} value={specialty}>
                          {getSpecialtyLabel(specialty)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Experience *</label>
                    <input 
                      type="text" 
                      value={newStaff.experience}
                      onChange={(e) => setNewStaff({...newStaff, experience: e.target.value})}
                      placeholder="e.g., 5 years"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio *</label>
                    <textarea 
                      value={newStaff.bio}
                      onChange={(e) => setNewStaff({...newStaff, bio: e.target.value})}
                      placeholder="Enter staff biography"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Skills (comma separated)</label>
                    <input 
                      type="text" 
                      value={newStaff.skills}
                      onChange={(e) => setNewStaff({...newStaff, skills: e.target.value})}
                      placeholder="e.g., Cutting, Coloring, Styling"
                    />
                  </div>

                  <div className="form-group">
                    <label>Services (comma separated)</label>
                    <input 
                      type="text" 
                      value={newStaff.services}
                      onChange={(e) => setNewStaff({...newStaff, services: e.target.value})}
                      placeholder="e.g., Haircut, Color, Treatment"
                    />
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={newStaff.available}
                        onChange={(e) => setNewStaff({...newStaff, available: e.target.checked})}
                      />
                      Available for bookings
                    </label>
                    
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={newStaff.featured}
                        onChange={(e) => setNewStaff({...newStaff, featured: e.target.checked})}
                      />
                      Featured staff member
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button 
                      className="btn-primary red-bg"
                      onClick={handleAddStaff}
                      disabled={!newStaff.name || !newStaff.title || !newStaff.experience || !newStaff.bio}
                    >
                      Add Staff Member
                    </button>
                    <button 
                      className="btn-secondary red-border"
                      onClick={() => setShowAddStaffModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="staff-cta red-bg">
        <div className="cta-content">
          <h2>Ready to Work With Our Experts?</h2>
          <p>Book your appointment with our talented team and experience the difference of professional care.</p>
          <div className="cta-buttons">
            <button className="cta-btn-primary">Book Consultation</button>
            <button className="cta-btn-secondary">Call: +254 700 123 456</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffPage;