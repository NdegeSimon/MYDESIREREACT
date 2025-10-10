import React, { useState, useEffect } from 'react';
import ApiService from '../api'; 

const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    staffId: '',
    date: '',
    time: '',
    notes: ''
  });

  // Service categories
  const categories = [
    'all',
    'hair',
    'skincare',
    'nails',
    'waxing',
    'makeup',
    'massage',
    'specialty'
  ];

  // Fetch services and staff from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, staffData] = await Promise.all([
          salonApi.getServices(),
          salonApi.getStaff()
        ]);
        setServices(servicesData);
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to sample data if API fails
        setServices(sampleServices);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sample data fallback
  const sampleServices = [
    // Hair Services
    {
      id: 1,
      name: "Women's Haircut & Style",
      category: "hair",
      price: 2000,
      duration: 60,
      image: "/api/placeholder/300/200",
      description: "Professional haircut tailored to your face shape and style preferences",
      fullDesc: "Our expert stylists will consult with you to create the perfect haircut that complements your face shape, hair texture, and lifestyle. Includes shampoo, conditioning treatment, and professional blow-dry styling.",
      features: ["Personalized consultation", "Precision cutting", "Shampoo & conditioner", "Blow-dry styling", "Style advice"]
    },
    {
      id: 2,
      name: "Men's Haircut",
      category: "hair",
      price: 1000,
      duration: 30,
      image: "/api/placeholder/300/200",
      description: "Classic or modern men's haircut with styling",
      fullDesc: "Traditional or contemporary men's haircut performed by our skilled barbers. Includes shampoo, precise cutting, and finishing with product application.",
      features: ["Style consultation", "Precision cutting", "Neck shave", "Product application", "Hot towel service"]
    },
    // Add more sample services as needed...
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const openServiceModal = (service) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  const handleBookService = (service) => {
    setSelectedService(null);
    setBookingData({
      ...bookingData,
      serviceId: service.id,
      price: service.price
    });
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await salonApi.createAppointment(bookingData);
      setShowBookingForm(false);
      setBookingData({
        serviceId: '',
        staffId: '',
        date: '',
        time: '',
        notes: ''
      });
      alert('Appointment booked successfully!');
    } catch (error) {
      alert('Error booking appointment: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="services-page red-black-theme">
        <div className="loading">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="services-page red-black-theme">
      {/* Header Section */}
      <section className="services-hero">
        <div className="hero-content">
          <h1 className="hero-title">Our Premium Services</h1>
          <p className="hero-subtitle">
            Experience luxury and excellence with our comprehensive range of beauty and wellness services. 
            Book your appointment today and let our experts pamper you.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-filter">
        <div className="filter-container">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active red-active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="container">
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card red-border">
                <div className="service-image">
                  <img 
                    src={service.image || `/api/placeholder/300/200`} 
                    alt={service.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200/DC2626/FFFFFF?text=${encodeURIComponent(service.name)}`;
                    }}
                  />
                  <div className="service-price-tag red-bg">
                    Ksh {service.price}
                  </div>
                </div>
                
                <div className="service-content">
                  <h3 className="service-name red-text">{service.name}</h3>
                  <p className="service-duration">{service.duration} minutes</p>
                  <p className="service-short-desc">{service.description}</p>
                  
                  <div className="service-features">
                    {service.features && service.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="feature-tag red-border">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button 
                    className="more-info-btn red-border"
                    onClick={() => openServiceModal(service)}
                  >
                    Learn More & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Modal */}
      {selectedService && (
        <div className="service-modal-overlay" onClick={closeServiceModal}>
          <div className="service-modal red-border" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeServiceModal}>×</button>
            
            <div className="modal-content">
              <div className="modal-image">
                <img 
                  src={selectedService.image || `/api/placeholder/500/300`} 
                  alt={selectedService.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/500x300/DC2626/FFFFFF?text=${encodeURIComponent(selectedService.name)}`;
                  }}
                />
              </div>
              
              <div className="modal-details">
                <h2 className="modal-title red-text">{selectedService.name}</h2>
                <div className="modal-meta">
                  <span className="modal-price red-text">Ksh {selectedService.price}</span>
                  <span className="modal-duration">{selectedService.duration} minutes</span>
                </div>
                
                <div className="modal-description">
                  <h4>Service Description</h4>
                  <p>{selectedService.fullDesc || selectedService.description}</p>
                </div>

                {selectedService.features && (
                  <div className="modal-features">
                    <h4>What's Included</h4>
                    <ul>
                      {selectedService.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    className="btn-primary red-bg"
                    onClick={() => handleBookService(selectedService)}
                  >
                    Book This Service
                  </button>
                  <button className="btn-secondary red-border" onClick={closeServiceModal}>
                    View Other Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="modal red-border">
            <h2>Book Appointment</h2>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Service:</label>
                <select 
                  value={bookingData.serviceId}
                  onChange={(e) => setBookingData({...bookingData, serviceId: e.target.value})}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - KES {service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Staff:</label>
                <select 
                  value={bookingData.staffId}
                  onChange={(e) => setBookingData({...bookingData, staffId: e.target.value})}
                  required
                >
                  <option value="">Select staff</option>
                  {staff.map(staffMember => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.name} ({staffMember.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time:</label>
                <select 
                  value={bookingData.time}
                  onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes (Optional):</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  placeholder="Any special requirements..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary red-bg">
                  Book Appointment
                </button>
                <button 
                  type="button" 
                  className="btn-secondary red-border"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <section className="services-cta red-bg">
        <div className="cta-content">
          <h2>Ready to Experience Luxury?</h2>
          <p>Book your appointment today and discover why we're the preferred choice for beauty and wellness.</p>
          <div className="cta-buttons">
            <button 
              className="cta-btn-primary"
              onClick={() => setShowBookingForm(true)}
            >
              Book Now
            </button>
            <button className="cta-btn-secondary">Call Us: +254 700 123 456</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;