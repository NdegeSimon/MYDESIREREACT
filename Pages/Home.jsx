import React from "react";

import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar.jsx";
import "../src/App.css"; // your styles

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

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
        </>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-secondary text-white font-sans overflow-x-hidden">
      {/* Top Logo + Buttons */}
      <div className="fixed top-0 left-0 p-8 z-50 flex items-center justify-between w-full">
        <div>
          <a href="/">
            <img
              src="images/lg.png"
              alt="My Desire Salon Logo"
              className="h-24 w-auto brightness-0 invert hover:scale-110 transition-transform cursor-pointer"
            />
          </a>
        </div>
        <div className="flex gap-4">
          <a href="/signup">
            <button className="btn bg-primary hover:bg-red-700 text-white px-6 py-3 text-base font-bold rounded-lg transition-all hover:scale-105">
              SIGN UP
            </button>
          </a>
          <a href="/login">
            <button className="btn bg-primary hover:bg-red-700 text-white px-6 py-3 text-base font-bold rounded-lg transition-all hover:scale-105">
              LOG IN
            </button>
          </a>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Carousel */}
      <div className="relative w-full h-screen">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              currentSlide === index ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-start pl-4">
              <div>
                <h1
                  className="text-9xl font-bold mb-6 text-left"
                  style={{ fontFamily: "Backsteal, sans-serif" }}
                >
                  {slide.heading}
                </h1>
                <div className="mt-8">
                  <a href="/book">
                    <button
                      className="bg-primary hover:bg-red-700 text-white px-8 py-4 text-xl font-bold rounded-lg transition-all hover:scale-105"
                      style={{ fontFamily: "Backsteal, sans-serif" }}
                    >
                      BOOK NOW
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Media */}
      <div className="absolute bottom-20 left-1/4 transform -translate-x-1/2 z-40 flex space-x-6">
        <a href="#" className="text-lg" title="Facebook">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="#" className="text-lg" title="Instagram">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="#" className="text-lg" title="Twitter">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="#" className="text-lg" title="WhatsApp">
          <i className="fab fa-whatsapp"></i>
        </a>
        <a href="#" className="text-lg" title="TikTok">
          <i className="fab fa-tiktok"></i>
        </a>
      </div>

      {/* Carousel Dots */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-50">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot w-3 h-3 rounded-full ${
              currentSlide === index ? "bg-primary" : "bg-white opacity-50"
            }`}
            onClick={() => setCurrentSlide(index)}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default Home;
