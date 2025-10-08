import React, { useState } from 'react';
import './Services.css';

const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);

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

  // Services data with images, descriptions, and pricing
  const services = [
    // Hair Services
    {
      id: 1,
      name: "Women's Haircut & Style",
      category: "hair",
      price: "Ksh 1,500 - 2,500",
      duration: "45-60 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Professional haircut tailored to your face shape and style preferences",
      fullDesc: "Our expert stylists will consult with you to create the perfect haircut that complements your face shape, hair texture, and lifestyle. Includes shampoo, conditioning treatment, and professional blow-dry styling.",
      features: ["Personalized consultation", "Precision cutting", "Shampoo & conditioner", "Blow-dry styling", "Style advice"]
    },
    {
      id: 2,
      name: "Men's Haircut",
      category: "hair",
      price: "Ksh 800 - 1,200",
      duration: "30 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Classic or modern men's haircut with styling",
      fullDesc: "Traditional or contemporary men's haircut performed by our skilled barbers. Includes shampoo, precise cutting, and finishing with product application.",
      features: ["Style consultation", "Precision cutting", "Neck shave", "Product application", "Hot towel service"]
    },
    {
      id: 3,
      name: "Full Hair Color",
      category: "hair",
      price: "Ksh 3,500 - 6,000",
      duration: "2-3 hours",
      image: "/api/placeholder/300/200",
      shortDesc: "Complete hair color transformation with premium products",
      fullDesc: "Full head application of permanent or demi-permanent color using premium ammonia-free products. Includes consultation, color application, processing, and finishing style.",
      features: ["Color consultation", "Premium color products", "Root-to-end coverage", "Color protection treatment", "Style finish"]
    },
    {
      id: 4,
      name: "Highlights/Balayage",
      category: "hair",
      price: "Ksh 4,500 - 8,000",
      duration: "3-4 hours",
      image: "/api/placeholder/300/200",
      shortDesc: "Hand-painted highlights for natural, sun-kissed look",
      fullDesc: "Custom hand-painted highlights or balayage technique for dimensional, natural-looking color. Includes toner application and deep conditioning treatment.",
      features: ["Custom color design", "Hand-painted technique", "Toner application", "Deep conditioning", "Style finish"]
    },
    {
      id: 5,
      name: "Keratin Treatment",
      category: "hair",
      price: "Ksh 6,000 - 10,000",
      duration: "2-3 hours",
      image: "/api/placeholder/300/200",
      shortDesc: "Smoothing treatment for frizz-free, shiny hair",
      fullDesc: "Professional keratin smoothing treatment that eliminates frizz, reduces styling time, and adds brilliant shine. Lasts 3-5 months.",
      features: ["Frizz elimination", "Up to 90% straightening", "Adds shine & softness", "Reduces styling time", "Lasts 3-5 months"]
    },

    // Skincare Services
    {
      id: 6,
      name: "Classic Facial",
      category: "skincare",
      price: "Ksh 2,000 - 3,000",
      duration: "60 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Deep cleansing and hydrating facial treatment",
      fullDesc: "A relaxing facial that includes deep cleansing, exfoliation, extractions, massage, mask, and hydration tailored to your skin type.",
      features: ["Skin analysis", "Deep cleansing", "Gentle exfoliation", "Facial massage", "Hydrating mask"]
    },
    {
      id: 7,
      name: "Anti-Aging Facial",
      category: "skincare",
      price: "Ksh 3,500 - 5,000",
      duration: "75 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Targeted treatment to reduce fine lines and wrinkles",
      fullDesc: "Advanced facial targeting signs of aging with potent ingredients like retinol, peptides, and antioxidants to firm and rejuvenate skin.",
      features: ["Collagen boosting", "Fine line reduction", "Firming massage", "Antioxidant treatment", "LED therapy"]
    },
    {
      id: 8,
      name: "Acne Treatment Facial",
      category: "skincare",
      price: "Ksh 2,800 - 4,000",
      duration: "60 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Medicated facial for acne-prone skin",
      fullDesc: "Therapeutic facial designed to treat active acne, reduce inflammation, and prevent future breakouts using clinical-grade products.",
      features: ["Medicated cleansing", "Anti-inflammatory treatment", "Professional extractions", "Calming mask", "Oil control"]
    },

    // Nail Services
    {
      id: 9,
      name: "Spa Manicure",
      category: "nails",
      price: "Ksh 1,200 - 1,800",
      duration: "45 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Luxurious manicure with hand massage and treatment",
      fullDesc: "Indulgent manicure experience including nail shaping, cuticle care, relaxing hand massage, mask treatment, and polish application.",
      features: ["Nail shaping", "Cuticle treatment", "Hand massage", "Hydrating mask", "Polish application"]
    },
    {
      id: 10,
      name: "Gel Manicure",
      category: "nails",
      price: "Ksh 2,000 - 2,800",
      duration: "60 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Long-lasting chip-free polish",
      fullDesc: "Gel polish application that provides shiny, chip-resistant color for 2-3 weeks. Includes nail prep, base coat, color, and top coat cured under LED light.",
      features: ["Chip-resistant", "Lasts 2-3 weeks", "High-gloss finish", "Quick drying", "LED curing"]
    },
    {
      id: 11,
      name: "Spa Pedicure",
      category: "nails",
      price: "Ksh 1,800 - 2,500",
      duration: "60 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Revitalizing foot treatment and polish",
      fullDesc: "Luxurious pedicure including foot soak, exfoliation, nail care, lower leg & foot massage, mask treatment, and polish.",
      features: ["Foot soak", "Exfoliation", "Callus treatment", "Leg massage", "Polish application"]
    },

    // Waxing Services
    {
      id: 12,
      name: "Full Body Wax",
      category: "waxing",
      price: "Ksh 4,000 - 6,000",
      duration: "90 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Complete hair removal from head to toe",
      fullDesc: "Comprehensive waxing service covering all body areas including arms, legs, underarms, bikini, and facial areas using premium hard wax.",
      features: ["Full body coverage", "Premium hard wax", "Soothing aftercare", "Experienced technician", "Hygienic process"]
    },
    {
      id: 13,
      name: "Brazilian Wax",
      category: "waxing",
      price: "Ksh 2,000 - 3,000",
      duration: "30 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Complete intimate area hair removal",
      fullDesc: "Thorough hair removal from the intimate area including front, back, and everything in between using gentle hard wax for minimal discomfort.",
      features: ["Complete hair removal", "Gentle hard wax", "Quick service", "Professional technique", "Discreet service"]
    },

    // Makeup Services
    {
      id: 14,
      name: "Bridal Makeup",
      category: "makeup",
      price: "Ksh 3,500 - 6,000",
      duration: "90 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Professional makeup for your special day",
      fullDesc: "Luxurious bridal makeup application using high-quality, long-wearing products. Includes consultation, trial session, and day-of service.",
      features: ["Pre-wedding trial", "Long-lasting products", "Photo-ready finish", "Touch-up kit", "Professional lashes"]
    },

    // Massage Services
    {
      id: 15,
      name: "Swedish Massage",
      category: "massage",
      price: "Ksh 2,500 - 4,000",
      duration: "60 min",
      image: "/api/placeholder/300/200",
      shortDesc: "Relaxing full-body massage therapy",
      fullDesc: "Classic Swedish massage using long, flowing strokes to promote relaxation, improve circulation, and relieve muscle tension throughout the body.",
      features: ["Full body massage", "Relaxing strokes", "Improved circulation", "Muscle tension relief", "Aromatherapy oils"]
    },

    // Specialty Services
    {
      id: 16,
      name: "Bridal Package",
      category: "specialty",
      price: "Ksh 12,000 - 20,000",
      duration: "4-5 hours",
      image: "/api/placeholder/300/200",
      shortDesc: "Complete bridal beauty package",
      fullDesc: "All-inclusive bridal package featuring hair styling, makeup application, manicure, and pedicure. Includes trial session and day-of coordination.",
      features: ["Hair & makeup", "Manicure & pedicure", "Trial session", "Day-of coordination", "Touch-up kit"]
    }
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
                    src={service.image} 
                    alt={service.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200/DC2626/FFFFFF?text=${encodeURIComponent(service.name)}`;
                    }}
                  />
                  <div className="service-price-tag red-bg">
                    {service.price}
                  </div>
                </div>
                
                <div className="service-content">
                  <h3 className="service-name red-text">{service.name}</h3>
                  <p className="service-duration">{service.duration}</p>
                  <p className="service-short-desc">{service.shortDesc}</p>
                  
                  <div className="service-features">
                    {service.features.slice(0, 3).map((feature, index) => (
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
                  src={selectedService.image} 
                  alt={selectedService.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/500x300/DC2626/FFFFFF?text=${encodeURIComponent(selectedService.name)}`;
                  }}
                />
              </div>
              
              <div className="modal-details">
                <h2 className="modal-title red-text">{selectedService.name}</h2>
                <div className="modal-meta">
                  <span className="modal-price red-text">{selectedService.price}</span>
                  <span className="modal-duration">{selectedService.duration}</span>
                </div>
                
                <div className="modal-description">
                  <h4>Service Description</h4>
                  <p>{selectedService.fullDesc}</p>
                </div>

                <div className="modal-features">
                  <h4>What's Included</h4>
                  <ul>
                    {selectedService.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-actions">
                  <button className="btn-primary red-bg">Book This Service</button>
                  <button className="btn-secondary red-border" onClick={closeServiceModal}>
                    View Other Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <section className="services-cta red-bg">
        <div className="cta-content">
          <h2>Ready to Experience Luxury?</h2>
          <p>Book your appointment today and discover why we're the preferred choice for beauty and wellness.</p>
          <div className="cta-buttons">
            <button className="cta-btn-primary">Book Now</button>
            <button className="cta-btn-secondary">Call Us: +254 700 123 456</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;