import { useEffect, useState } from "react";
import "../index.css";
import "../App.css";

function Carousel({ slides, interval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const autoSlide = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(autoSlide);
  }, [slides.length, interval]);

  // If no slides, return nothing
  if (!slides || slides.length === 0) {
    return <div>No slides available</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div 
          key={index} 
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img 
            src={slide.img} 
            alt={`Slide ${index + 1}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="text-center">
              {slide.heading}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Carousel;