import Navbar from "../components/Navbar";
import Carousel from "../components/carousel";
import "../App.css";
import "../index.css";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

function Home() {
  const slides = [
    {
      img: "images/p2.jpg",
      heading: (
        <>
          <span className="text-primary">MY </span>
          <br />
          <span className="text-white">DESIRE</span>
          <br />
          <span className="text-white">SALON</span>
          {/* BOOK NOW Button inside first slide */}
          <div className="mt-8">
            <Link to="/book">
              <button
                className="bg-primary hover:bg-red-700 text-white px-8 py-4 text-xl font-bold rounded-lg transition-all hover:scale-105"
                style={{ fontFamily: "'Backsteal', sans-serif" }}
              >
                BOOK NOW
              </button>
            </Link>
          </div>
        </>
      ),
    },
    {
      img: "images/p3.jpg",
      heading: (
        <>
          <span className="text-primary">MY </span>
          <br />
          <span className="text-white">DESIRE</span>
          <br />
          <span className="text-white">SALON</span>
          {/* BOOK NOW Button inside second slide too */}
          <div className="mt-8">
            <Link to="/book">
              <button
                className="bg-primary hover:bg-red-700 text-white px-8 py-4 text-xl font-bold rounded-lg transition-all hover:scale-105"
                style={{ fontFamily: "'Backsteal', sans-serif" }}
              >
                BOOK NOW
              </button>
            </Link>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="bg-secondary text-white font-sans overflow-x-hidden relative">
      <Navbar />

      {/* Carousel with slides */}
      <Carousel slides={slides} interval={5000} />

      {/* Social Media Icons */}
      <div className="absolute bottom-20 left-1/4 transform -translate-x-1/2 z-40 flex space-x-6">
        <a href="#" className="social-icon text-lg" title="Facebook">
          <FaFacebookF />
        </a>
        <a href="#" className="social-icon text-lg" title="Instagram">
          <FaInstagram />
        </a>
        <a href="#" className="social-icon text-lg" title="Twitter">
          <FaTwitter />
        </a>
        <a href="#" className="social-icon text-lg" title="WhatsApp">
          <FaWhatsapp />
        </a>
        <a href="#" className="social-icon text-lg" title="TikTok">
          <FaTiktok />
        </a>
      </div>
    </div>
  );
}

export default Home;
