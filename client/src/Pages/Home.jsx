// Pages/Home.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Carousel from "../components/carousel";
import "../App.css";
import "../index.css";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext"; // Updated to correct location
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import p2Image from "../assets/p2.jpg";
import p3Image from "../assets/p3.jpg";
import lg from "../assets/lg.png";

function Home() {
  const [currentOffer, setCurrentOffer] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const slides = [
    { img: p2Image },
    { img: p3Image },
  ];

  const offers = [
    {
      id: 1,
      badge: "NEW CLIENT",
      title: "20% Off First Visit",
      description: "Full service package",
      code: "WELCOME20",
      color: "#e63946"
    },
    {
      id: 2,
      badge: "SEASONAL", 
      title: "Free Manicure",
      description: "With any hair service",
      code: "FREEMANI",
      color: "#2a9d8f"
    },
    {
      id: 3,
      badge: "LIMITED",
      title: "Couples Package",
      description: "Save 25% for two",
      code: "COUPLE25",
      color: "#e76f51"
    }
  ];

  // Auto-rotate offers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [offers.length]);

  const goToOffer = (index) => {
    setCurrentOffer(index);
  };

  const handleBookNow = () => {
    if (user) {
      // User is logged in, navigate to booking page
      navigate('/bookappointments');
    } else {
      // User is not logged in, redirect to login
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      <Carousel slides={slides} interval={5000} />
      
      <div className="overlay-content">
        <nav className="navbar-overlay">
          <div className="navbar-logo">
            <Link to="/">
              <img
                src={lg}
                alt="My Desire Salon Logo"
                className="logo-image"
              />
            </Link>
          </div>

          <div className="navbar-buttons">
            <Link to="/signup">
              <button className="btn glow-red">SIGN UP</button>
            </Link>
            <Link to="/Login">
              <button className="btn glow-red">LOG IN</button>
            </Link>
          </div>
        </nav>

        <div className="left-content-overlay">
          <div className="left-text-content">
            <span className="primary-text">MY</span>
            <span className="white-text">DESIRE</span>
            <span className="white-text">SALON</span>
          </div>

          <div className="left-button-container">
            <button 
              className="book-now-button glow-red" 
              onClick={handleBookNow}
            >
              BOOK NOW
            </button>
          </div>

          <div className="social-icons-overlay">
            <a href="#" className="social-icon glow-red" title="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="social-icon glow-red" title="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="social-icon glow-red" title="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="social-icon glow-red" title="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href="#" className="social-icon glow-red" title="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>

        {/* Rotating Offers Carousel */}
        <div className="right-offers-overlay">
          <div className="offers-container">
            <h3 className="offers-title">Special Offers</h3>
            
            <div className="offers-carousel">
              {offers.map((offer, index) => (
                <div 
                  key={offer.id}
                  className={`offer-slide ${index === currentOffer ? 'active' : ''}`}
                  style={{ display: index === currentOffer ? 'block' : 'none' }}
                >
                  <div 
                    className="offer-badge"
                    style={{ backgroundColor: offer.color }}
                  >
                    {offer.badge}
                  </div>
                  <h4 className="offer-heading">{offer.title}</h4>
                  <p className="offer-desc">{offer.description}</p>
                  <div className="offer-code">{offer.code}</div>
                </div>
              ))}
            </div>

            <div className="offers-indicators">
              {offers.map((_, index) => (
                <span
                  key={index}
                  className={`indicator ${index === currentOffer ? 'active' : ''}`}
                  onClick={() => goToOffer(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;