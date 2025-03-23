import React from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import config from '../../../../../config/config';

interface ServiceDetailsProps {
  handleNext: () => void;
  serviceData: any;
}

const BookServiceDetails: React.FC<ServiceDetailsProps> = ({ handleNext, serviceData }) => {
  // Check if service data is available
  if (!serviceData) {
    return (
      <div className="alert alert-warning">
        <p>Service information is not available. Please try selecting a service again.</p>
      </div>
    );
  }

  // Format price display based on price type
  const formatPrice = () => {
    if (!serviceData.price) return 'Price not available';
    
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(serviceData.price);
    
    if (serviceData.priceType === 'FIXED' || serviceData.priceType === 'fixed') {
      return formattedPrice;
    } else if (serviceData.priceType === 'HOURLY' || serviceData.priceType === 'hourly') {
      return `${formattedPrice} / hour`;
    } else if (serviceData.priceType === 'RANGE' || serviceData.priceType === 'range') {
      return `Starts from ${formattedPrice}`;
    }
    
    return formattedPrice;
  };

  // Get booking type badge class and text
  const getBookingTypeBadge = () => {
    if (serviceData.bookingType === 'DIRECT' || serviceData.bookingType === 'direct') {
      return {
        class: 'bg-primary-subtle text-primary',
        text: 'Direct Booking'
      };
    } else {
      return {
        class: 'bg-info-subtle text-info',
        text: 'Inquiry Booking'
      };
    }
  };

  // Get full address
  const getAddress = () => {
    // Direct mapping from service-details structure
    if (serviceData.address || serviceData.city || serviceData.state || serviceData.postalCode) {
      const addressParts = [
        serviceData.address,
        serviceData.city,
        serviceData.state,
        serviceData.postalCode
      ].filter(Boolean);
      
      return addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';
    }
    
    // Fallback to location property if present (original structure)
    if (serviceData.location) {
      const address = serviceData.location.address || '';
      const city = serviceData.location.city || '';
      const state = serviceData.location.state || '';
      const postalCode = serviceData.location.postalCode || '';
      
      const addressParts = [address, city, state, postalCode].filter(Boolean);
      return addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';
    }
    
    return 'Address not available';
  };

  // Get provider information
  const getProviderName = () => {
    // Handle the structure from service-details.tsx
    if (serviceData.provider?.user) {
      return `${serviceData.provider.user.firstName} ${serviceData.provider.user.lastName}`;
    }
    
    // Handle provider with businessName property
    if (serviceData.provider?.businessName) {
      return serviceData.provider.businessName;
    }
    
    // Handle provider with companyName property
    if (serviceData.provider?.companyName) {
      return serviceData.provider.companyName;
    }
    
    return 'Unknown';
  };

  const getProviderType = () => {
    if (serviceData.provider?.businessType) {
      return serviceData.provider.businessType;
    }
    
    if (serviceData.provider?.companyName) {
      return 'Business Provider';
    }
    
    return 'Service Provider';
  };

  const bookingTypeBadge = getBookingTypeBadge();

  return (
    <div className="service-details-container p-md-3">
      <div className="section-header mb-4">
        <h3 className="mb-0 fw-bold">Service Details</h3>
        <p className="text-muted mb-0">Review the service details before proceeding to book</p>
      </div>

      <div className="card shadow-sm border-0 rounded-3 mb-4 service-header-card">
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-4 mb-4 mb-md-0">
              {serviceData.serviceImages && serviceData.serviceImages.length > 0 ? (
                <img
                  src={`${config.ASSETS_URL}${serviceData.serviceImages[0].imageUrl}`}
                  alt={serviceData.title}
                  className="img-fluid rounded-3 w-100 service-main-image"
                  style={{ height: '220px', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "assets/img/services/service-02.jpg";
                  }}
                />
              ) : (
                <img
                  src="assets/img/services/service-02.jpg"
                  alt="Service"
                  className="img-fluid rounded-3 w-100 service-main-image"
                  style={{ height: '220px', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="col-md-8">
              <h4 className="fw-bold mb-2">{serviceData.title}</h4>
              
              <div className="d-flex align-items-center mb-3">
                <div className="me-3 d-flex align-items-center">
                  <FaStar className="text-warning me-1" />
                  <span className="fw-semibold">{serviceData.rating || '0'}</span>
                  <span className="text-muted ms-1">({serviceData.reviews?.length || '0'} reviews)</span>
                </div>
                <span className={`badge ${bookingTypeBadge.class} px-3 py-2`}>
                  {bookingTypeBadge.text}
                </span>
              </div>
              
              <div className="price-tag mb-3">
                <h5 className="mb-0">
                  <span className="fw-bold">{formatPrice()}</span>
                  <small className="text-muted ms-1">
                    {(serviceData.priceType === 'HOURLY' || serviceData.priceType === 'hourly') ? '/ hour' : ''}
                  </small>
                </h5>
              </div>
              
              <div className="service-provider mb-3 p-3 rounded-3 bg-light">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-3">
                    {serviceData.provider?.profileImageUrl ? (
                      <img
                        src={`${config.ASSETS_URL}${serviceData.provider.profileImageUrl}`}
                        alt={getProviderName()}
                        className="rounded-circle"
                        width="50"
                        height="50"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "assets/img/provider/provider-01.jpg";
                        }}
                      />
                    ) : (
                      <img
                        src="assets/img/provider/provider-01.jpg"
                        alt="Provider"
                        className="rounded-circle"
                        width="50"
                        height="50"
                      />
                    )}
                  </div>
                  <div>
                    <h6 className="mb-1 fw-semibold">Provider: {getProviderName()}</h6>
                    <p className="mb-0 small text-muted">
                      {getProviderType()}
                    </p>
                    {!serviceData.provider && (
                      <p className="mb-0 small text-danger">Provider information not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-7 mb-4 mb-md-0">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Description</h5>
            </div>
            <div className="card-body px-4 pb-4">
              <p className="mb-0">{serviceData.description || 'No description available for this service.'}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Location</h5>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="d-flex align-items-start">
                <FaMapMarkerAlt className="text-primary mt-1 me-2" />
                <p className="mb-0">{getAddress()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <button 
          type="button" 
          className="btn btn-primary px-4 py-2"
          onClick={handleNext}
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};

export default BookServiceDetails; 