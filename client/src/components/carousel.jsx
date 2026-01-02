import { useState, useEffect } from "react";

function Carousel({ slides, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [slides.length, interval]);

  if (!slides || slides.length === 0) {
    return <div>No slides available</div>;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="carousel-container">
      <div className="carousel-slide">
        {currentSlide.img && (
          <img
            src={currentSlide.img}
            alt="Slide"
            className="carousel-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="overlay"></div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1)}
            className="carousel-nav-button carousel-prev"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentIndex(currentIndex === slides.length - 1 ? 0 : currentIndex + 1)}
            className="carousel-nav-button carousel-next"
          >
            ›
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`carousel-indicator ${
                index === currentIndex ? "active" : ""
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;