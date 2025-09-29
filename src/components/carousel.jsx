import { useEffect, useState } from "react";

function Carousel({ slides, interval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const autoSlide = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(autoSlide);
  }, [slides.length, interval]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-start pl-8">
            <h1 className="text-6xl font-bold text-white">{slide.heading}</h1>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              currentSlide === index ? "bg-red-600" : "bg-white opacity-50"
            }`}
            onClick={() => setCurrentSlide(index)}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
