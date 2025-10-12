import React, { useState, useEffect } from 'react';
import '../index.css';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, service: null });

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'hair', label: 'Hair Services' },
    { value: 'nails', label: 'Nail Services' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'massage', label: 'Massage' },
    { value: 'makeup', label: 'Makeup' },
    { value: 'general', label: 'General' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 60,
    category: 'hair',
    image: '',
    staffRequired: true
  });

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchServices();
    }
  }, [userRole]);

  useEffect(() => {
    filterServices();
  }, [services, categoryFilter]);

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

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'http://localhost:5000/api/services';
      let headers = {};

      if (userRole === 'admin') {
        endpoint = 'http://localhost:5000/api/admin/services';
        headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }

      const response = await fetch(endpoint, { headers });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || data);
      } else {
        setError('Failed to load services');
      }
    } catch (error) {
      setError('Error loading services: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (categoryFilter === 'all') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service => 
        service.category === categoryFilter && service.isActive !== false
      );
      setFilteredServices(filtered);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: 60,
      category: 'hair',
      image: '',
      staffRequired: true
    });
    setDialogOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration || 60,
      category: service.category || 'hair',
      image: service.image || '',
      staffRequired: service.staffRequired !== false
    });
    setDialogOpen(true);
  };

  const handleDeleteService = (service) => {
    setDeleteConfirm({ open: true, service });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.service) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/services/${deleteConfirm.service.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setDeleteConfirm({ open: false, service: null });
        fetchServices();
      } else {
        setError('Failed to delete service');
      }
    } catch (error) {
      setError('Error deleting service: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingService 
        ? `http://localhost:5000/api/admin/services/${editingService.id}`
        : 'http://localhost:5000/api/admin/services';
      
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          category: formData.category,
          image: formData.image,
          staffRequired: formData.staffRequired
        })
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchServices();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save service');
      }
    } catch (error) {
      setError('Error saving service: ' + error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      'hair': '#4CAF50',
      'nails': '#FF9800',
      'skincare': '#2196F3',
      'massage': '#9C27B0',
      'makeup': '#E91E63',
      'general': '#607D8B'
    };
    return colors[category] || '#607D8B';
  };

  if (loading) {
    return (
      <div className="services-container">
        <div className="loading">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Our Services</h1>
        <p>Discover our range of professional beauty services</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="services-controls">
        <div className="filter-section">
          <label>Filter by Category:</label>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {userRole === 'admin' && (
          <button className="btn-primary" onClick={handleAddService}>
            Add New Service
          </button>
        )}
      </div>

      <div className="services-grid">
        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <h3>No services found</h3>
            <p>No services available in this category.</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              {service.image && (
                <div className="service-image">
                  <img src={service.image} alt={service.name} />
                </div>
              )}
              
              <div className="service-content">
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(service.category) }}
                  >
                    {service.category}
                  </span>
                </div>

                <p className="service-description">
                  {service.description || 'Professional beauty service'}
                </p>

                <div className="service-details">
                  <div className="detail">
                    <span className="label">Price:</span>
                    <span className="value">KES {service.price}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Duration:</span>
                    <span className="value">{service.duration} mins</span>
                  </div>
                  <div className="detail">
                    <span className="label">Staff Required:</span>
                    <span className="value">{service.staffRequired ? 'Yes' : 'No'}</span>
                  </div>
                  {service.staffCount > 0 && (
                    <div className="detail">
                      <span className="label">Available Staff:</span>
                      <span className="value">{service.staffCount}</span>
                    </div>
                  )}
                </div>

                {userRole === 'admin' && (
                  <div className="service-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditService(service)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteService(service)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Service Dialog */}
      {dialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (KES) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categories.filter(cat => cat.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.staffRequired}
                    onChange={(e) => handleInputChange('staffRequired', e.target.checked)}
                  />
                  Staff Required
                </label>
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
                  {editingService ? 'Update Service' : 'Add Service'}
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
            <h3>Delete Service</h3>
            <p>Are you sure you want to delete this service? This action cannot be undone.</p>
            
            {deleteConfirm.service && (
              <div className="service-summary">
                <p><strong>Service:</strong> {deleteConfirm.service.name}</p>
                <p><strong>Price:</strong> KES {deleteConfirm.service.price}</p>
                <p><strong>Category:</strong> {deleteConfirm.service.category}</p>
              </div>
            )}

            <div className="dialog-actions">
              <button 
                className="btn-secondary"
                onClick={() => setDeleteConfirm({ open: false, service: null })}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={confirmDelete}
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;