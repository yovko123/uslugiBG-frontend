import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import Lightbox from 'yet-another-react-lightbox';

interface ServiceImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

interface ServiceImageGalleryProps {
  images: ServiceImage[];
  config: {
    ASSETS_URL: string;
  };
}

interface SliderInstance extends Slider {
  slickGoTo: (slide: number) => void;
}

const ServiceImageGallery: React.FC<ServiceImageGalleryProps> = ({ images, config }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  
  const mainSliderRef = useRef<SliderInstance | null>(null);
  const thumbnailSliderRef = useRef<SliderInstance | null>(null);
  const [nav1, setNav1] = useState<SliderInstance | null>(null);
  const [nav2, setNav2] = useState<SliderInstance | null>(null);

  useEffect(() => {
    setNav1(mainSliderRef.current);
    setNav2(thumbnailSliderRef.current);
  }, []);

  const handleMainImageClick = (): void => {
    setLightboxIndex(currentSlide);
    setLightboxOpen(true);
  };

  const handleThumbnailClick = (index: number): void => {
    if (mainSliderRef.current) {
      mainSliderRef.current.slickGoTo(index);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.target as HTMLImageElement;
    target.src = '/api/placeholder/400/300';
  };

  const imageCount = images?.length || 0;

  const mainSliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: nav2 || undefined,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
    swipe: true,
    touchThreshold: 10
  };

  const thumbnailSliderSettings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: Math.min(4, imageCount),
    slidesToScroll: 1,
    swipe: true,
    centerMode: imageCount < 4,
    centerPadding: '0px',
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(3, imageCount),
          centerMode: imageCount < 3
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: Math.min(2, imageCount),
          centerMode: imageCount < 2
        }
      }
    ]
  };

  return (
    <div className="position-relative">
      {/* Main Slider */}
      <Slider
        ref={mainSliderRef}
        {...mainSliderSettings}
        className="service-main-slider mb-3"
      >
        {images.map((image, index) => (
          <div 
            key={`main-${image.id}`} 
            className="service-img"
            onClick={handleMainImageClick}
            style={{ cursor: 'zoom-in' }}
          >
            <img 
              src={`${config.ASSETS_URL}${image.imageUrl}`}
              className="img-fluid w-100"
              alt={`Service ${index + 1}`}
              style={{ 
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
              onError={handleImageError}
            />
          </div>
        ))}
      </Slider>

      {/* View All Button */}
      <button 
        type="button"
        onClick={() => setLightboxOpen(true)} 
        className="btn btn-light btn-sm position-absolute"
        style={{
          bottom: '1rem',
          right: '1rem',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '4px'
        }}
      >
        <i className="ti ti-photo me-1" />
        View all {images.length} Photos
      </button>

      {/* Thumbnail Slider */}
      <div className="thumbnails-container mt-3">
        <div className="thumbnail-slider-wrapper" style={{ maxWidth: '100%', margin: '0 auto' }}>
          <Slider
            ref={thumbnailSliderRef}
            {...thumbnailSliderSettings}
            className="service-thumbnail-slider"
          >
            {images.map((image, index) => (
              <div 
                key={`thumb-${image.id}`} 
                className="thumbnail-item px-2"
                onClick={() => handleThumbnailClick(index)}
              >
                <div
                  className="thumbnail-wrapper"
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: 'pointer',
                    width: '100%',
                    paddingBottom: '50%', 
                    position: 'relative'
                  }}
                >
                  <img 
                    src={`${config.ASSETS_URL}${image.imageUrl}`}
                    alt={`Thumbnail ${index + 1}`}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      opacity: currentSlide === index ? 1 : 0.7,
                      transition: 'all 0.3s ease',
                      border: currentSlide === index ? '2px solid #007bff' : '2px solid transparent'
                    }}
                    onError={handleImageError}
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images.map(img => ({ 
          src: `${config.ASSETS_URL}${img.imageUrl}`,
          alt: 'Service Image'
        }))}
      />
    </div>
  );
};

export default ServiceImageGallery;