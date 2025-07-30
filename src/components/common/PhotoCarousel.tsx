import React, { useState } from 'react';
import './PhotoCarousel.scss';

interface PhotoCarouselProps {
  photos: string[];
  altText: string;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="photo-carousel">
        <div className="carousel-main">
          <img
            src="https://via.placeholder.com/600x400?text=No+Image+Available"
            alt="No image available"
            className="carousel-image"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="photo-carousel">
      <div className="carousel-main">
        <img
          src={photos[currentIndex]}
          alt={`${altText} - Image ${currentIndex + 1}`}
          className="carousel-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
          }}
        />
        
        {photos.length > 1 && (
          <>
            <button
              className="carousel-nav carousel-nav-prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              ❮
            </button>
            <button
              className="carousel-nav carousel-nav-next"
              onClick={goToNext}
              aria-label="Next image"
            >
              ❯
            </button>
          </>
        )}

        {photos.length > 1 && (
          <div className="carousel-counter">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="carousel-thumbnails">
          {photos.map((photo, index) => (
            <button
              key={index}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
              <img
                src={photo}
                alt={`${altText} thumbnail ${index + 1}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/100x80?text=No+Image';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoCarousel; 