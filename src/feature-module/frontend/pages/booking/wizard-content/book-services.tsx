//uslugiBG-frontend\src\feature-module\frontend\pages\booking\wizard-content\book-services.tsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../../../core/img/ImageWithBasePath'
import * as Icon from 'react-feather';

interface BookServicesProps {
    handleNext: (additionalServices: string[]) => void;
    handlePrev?: () => void;
    serviceData?: any;
}

const BookServices: React.FC<BookServicesProps> = ({
  handlePrev,
  handleNext,
  serviceData
}) => {
    // Track selected additional services
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toggle service selection
    const toggleService = (serviceId: string) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceId)) {
                return prev.filter(id => id !== serviceId);
            } else {
                return [...prev, serviceId];
            }
        });
    };

    // Handle form submission
    const handleSubmit = () => {
        setIsSubmitting(true);
        
        // Add a short delay to simulate API call
        setTimeout(() => {
            handleNext(selectedServices);
            setIsSubmitting(false);
        }, 500);
    };

    // Continue with the rest of the component...

    // Convert existing active state variables to use our new selection mechanism
    const isActive = (serviceId: string) => selectedServices.includes(serviceId);
    
    return (
    <fieldset className="booking-content" style={{ display: 'flex' }}>
                    <div className="book-card">
                      <div className="d-flex align-items-center justify-content-between flex-wrap booking-title">
                        <div className="d-flex align-items-center mb-2">
                          <span>
                            <i className="feather-message-square"></i>
                          </span>
                          <h5 className="ms-2 mb-0">Additional Services</h5>
                        </div>
                        <div>
                          <Link to="#" className="back_btn" onClick={handlePrev}>
                            <i className="feather-arrow-left"></i> Back
                          </Link>
                        </div>
                      </div>
                      
                      <div className="book-info">
                        <div className="book-service-data justify-content-center  mb-2">
                          <div className="services-option">
                            <div className="row gx-2">
                              <div className="col-lg-6">
                                <div className={`services-option-info ${isActive('conditioning') ? 'active' : ''}`}>
                                  <div className="services-option-img">
                                    <Link to="#">
                                      <ImageWithBasePath
                                        src="assets/img/icons/service-icon-01.svg"
                                        alt="img"
                                      />
                                    </Link>
                                  </div>
                                  <h6>
                                    <Link to="#">Conditioning</Link>
                                  </h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="service-prices">
                                      <span className="prices"> $35.00</span>
                                    </span>
                                    <Link 
                                        to="#" 
                                        className="services-check" 
                                        onClick={() => toggleService('conditioning')}
                                    >
                                      <Icon.Check />
                                    </Link>
                                  </div>
                                </div>
                              </div>

                              <div className="col-lg-6">
                                <div className={`services-option-info ${isActive('trimming') ? 'active' : ''}`}>
                                  <div className="services-option-img">
                                    <Link to="#">
                                      <ImageWithBasePath
                                        src="assets/img/icons/service-icon-02.svg"
                                        alt="img"
                                      />
                                    </Link>
                                  </div>
                                  <h6>
                                    <Link to="#">Trimming</Link>
                                  </h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="service-prices">
                                      <span className="prices"> $45.00</span>
                                    </span>
                                    <Link 
                                        to="#" 
                                        className="services-check" 
                                        onClick={() => toggleService('trimming')}
                                    >
                                      <Icon.Check />
                                    </Link>
                                  </div>
                                </div>
                              </div>

                              <div className="col-lg-6">
                                <div className={`services-option-info ${isActive('dyeing') ? 'active' : ''}`}>
                                  <div className="services-option-img">
                                    <Link to="#">
                                      <ImageWithBasePath
                                        src="assets/img/icons/service-icon-03.svg"
                                        alt="img"
                                      />
                                    </Link>
                                  </div>
                                  <h6>
                                    <Link to="#">Dyeing</Link>
                                  </h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="service-prices">
                                      <span className="prices"> $65.00</span>
                                    </span>
                                    <Link 
                                        to="#" 
                                        className="services-check" 
                                        onClick={() => toggleService('dyeing')}
                                    >
                                      <Icon.Check />
                                    </Link>
                                  </div>
                                </div>
                              </div>

                              <div className="col-lg-6">
                                <div className={`services-option-info ${isActive('shave') ? 'active' : ''}`}>
                                  <div className="services-option-img">
                                    <Link to="#">
                                      <ImageWithBasePath
                                        src="assets/img/icons/service-icon-04.svg"
                                        alt="img"
                                      />
                                    </Link>
                                  </div>
                                  <h6>
                                    <Link to="#">Shave</Link>
                                  </h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="service-prices">
                                      <span className="prices"> $30.00</span>
                                    </span>
                                    <Link 
                                        to="#" 
                                        className="services-check" 
                                        onClick={() => toggleService('shave')}
                                    >
                                      <Icon.Check />
                                    </Link>
                                  </div>
                                </div>
                              </div>

                              <div className="col-lg-6">
                                <div className={`services-option-info ${isActive('waxing') ? 'active' : ''}`}>
                                  <div className="services-option-img">
                                    <Link to="#">
                                      <ImageWithBasePath
                                        src="assets/img/icons/service-icon-05.svg"
                                        alt="img"
                                      />
                                    </Link>
                                  </div>
                                  <h6>
                                    <Link to="#">Waxing</Link>
                                  </h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="service-prices">
                                      <span className="prices"> $35.00</span>
                                    </span>
                                    <Link 
                                        to="#" 
                                        className="services-check" 
                                        onClick={() => toggleService('waxing')}
                                    >
                                      <Icon.Check />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="book-footer">
                        <Link
                          to="#"
                          onClick={handleSubmit}
                          className="btn btn-sm btn-dark d-inline-flex align-items-center next_btn"
                        >
                          {isSubmitting ? 'Processing...' : 'Next'} <i className="feather-arrow-right ms-2"></i>
                        </Link>
                      </div>
                    </div>
                  </fieldset>
  )
}

export default BookServices