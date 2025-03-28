// uslugiBG-frontend\src\feature-module\frontend\pages\booking\wizard-content\book-confirmation.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaCheckCircle, FaComments } from 'react-icons/fa';
import config from '../../../../../config/config';
import { all_routes } from '../../../../../core/data/routes/all_routes';
import { format } from 'date-fns';
import { useAuth } from '../../../../../core/contexts/AuthContext';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingConfirmationProps {
  setCurrentStep: (step: number) => void;
  bookingType?: 'DIRECT' | 'INQUIRY';
  bookingData: any;
  serviceData: any;
  customerInfo: CustomerInfo | null;
  handlePrev: () => void;
}

const BookConfirmation: React.FC<BookingConfirmationProps> = ({
  setCurrentStep,
  bookingType = 'DIRECT',
  bookingData,
  serviceData,
  customerInfo,
  handlePrev
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate a random booking reference number
  const bookingRef = `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Format the booking date if available, otherwise use current date
  const formattedDate = bookingData?.bookingDate || bookingData?.preferredDate
    ? format(new Date(bookingData?.bookingDate || bookingData?.preferredDate), 'EEE, MMMM d, yyyy')
    : format(new Date(), 'EEE, MMMM d, yyyy');
  
  // Get booking type text
  const isInquiry = bookingType === 'INQUIRY';
  const bookingTypeText = isInquiry ? 'Inquiry' : 'Direct Booking';

  // Format phone number to avoid double prefix
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'Not provided';
    
    // Remove any existing +359 prefix
    let cleanPhone = phone.replace(/^\+359/, '');
    // Remove any leading zeros
    cleanPhone = cleanPhone.replace(/^0+/, '');
    
    return `+359 ${cleanPhone}`;
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    // Here you would submit the booking to the API
    // For demo purposes, we'll simulate a delay
    setTimeout(() => {
      setIsConfirmed(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleStartNewBooking = () => {
    if (setCurrentStep) {
      setCurrentStep(1);
    }
  };

  // Function to check if the user is a provider
  const isProvider = (): boolean => {
    if (!user) return false;
    
    // Check user.role which is the standard property in our auth system
    // Cast to any to access role property since TypeScript definition might be lacking
    const userRole = (user as any).role;
    return userRole === 'PROVIDER';
  };

  // Determine the correct dashboard path based on user type
  const getDashboardPath = (): string => {
    if (!user) return '/'; // Home page if no user
    
    if (isProvider()) {
      return all_routes.providerDashboard; // Use routes constant for consistency
    } else {
      return all_routes.customerDashboard; // Use routes constant for consistency
    }
  };
  
  const handleBookAnotherService = () => {
    // Redirect to the service grid page with route constant
    navigate(all_routes.serviceGrid);
  };

  const handleGoToDashboard = () => {
    // Navigate to the appropriate dashboard
    navigate(getDashboardPath());
  };

  return (
    <div className="booking-confirmation-container">
      {isConfirmed ? (
        <div className="text-center">
          <div className="confirmed-icon mb-4">
            <FaCheckCircle size={64} className="text-success" />
          </div>
          <h2 className="mb-4">Booking Confirmed!</h2>
          <p className="mb-3">Your booking reference is: <strong>{bookingRef}</strong></p>
          <p className="mb-4">We have sent a confirmation email to: <strong>{customerInfo?.email}</strong></p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button 
              className="btn btn-outline-primary"
              onClick={handleBookAnotherService}
            >
              Book Another Service
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="section-header mb-4 text-center">
            <h3 className="mb-1 fw-bold">Booking Summary</h3>
            <p className="text-muted">Please review and confirm your booking details</p>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-header bg-transparent border-0 pt-4 px-4">
                  <h5 className="fw-bold mb-0">Service Details</h5>
                </div>
                <div className="card-body px-4 pb-4">
                  <div className="d-flex mb-3">
                    <div className="flex-shrink-0 me-3">
                      {serviceData?.serviceImages?.[0]?.imageUrl ? (
                        <img 
                          src={`${config.ASSETS_URL}${serviceData.serviceImages[0].imageUrl}`}
                          alt={serviceData?.title} 
                          className="img-fluid rounded"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "assets/img/services/service-01.jpg";
                          }}
                        />
                      ) : (
                        <img
                          src="assets/img/services/service-01.jpg"
                          alt="Service"
                          className="img-fluid rounded"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">{serviceData?.title || 'Service'}</h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className={`badge ${isInquiry ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'} me-2`}>
                          {bookingTypeText}
                        </span>
                        <div className="d-flex align-items-center">
                          <i className="fa fa-star text-warning me-1"></i>
                          <span>{serviceData?.rating || '4.5'}</span>
                        </div>
                      </div>
                      <p className="mb-0 small text-muted">{serviceData?.description?.substring(0, 100) || 'No description available'}...</p>
                    </div>
                  </div>
                  
                  {!isInquiry && (
                    <div className="price-details mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Base Price:</span>
                        <span>${serviceData?.price || '0.00'}</span>
                      </div>
                      {bookingData?.duration && (
                        <div className="d-flex justify-content-between mb-2">
                          <span>Duration:</span>
                          <span>{bookingData.duration} minutes</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span>${bookingData?.totalPrice || serviceData?.price || '0.00'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-header bg-transparent border-0 pt-4 px-4">
                  <h5 className="fw-bold mb-0">Appointment Details</h5>
                </div>
                <div className="card-body px-4 pb-4">
                  <ul className="list-unstyled">
                    <li className="d-flex align-items-center mb-3">
                      <FaCalendarAlt className="text-primary me-3" />
                      <div>
                        <p className="mb-0 fw-medium">Date</p>
                        <p className="mb-0 text-muted">{formattedDate}</p>
                      </div>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <FaClock className="text-primary me-3" />
                      <div>
                        <p className="mb-0 fw-medium">Time</p>
                        <p className="mb-0 text-muted">
                          {isInquiry 
                            ? bookingData?.preferredTimes?.join(', ') || 'Flexible'
                            : bookingData?.timeSlot || 'Not specified'}
                        </p>
                      </div>
                    </li>
                    {isInquiry && bookingData?.specialRequirements && (
                      <li className="d-flex align-items-start mb-3">
                        <FaUser className="text-primary me-3 mt-1" />
                        <div>
                          <p className="mb-0 fw-medium">Special Requirements</p>
                          <p className="mb-0 text-muted">{bookingData.specialRequirements}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-header bg-transparent border-0 pt-4 px-4">
                  <h5 className="fw-bold mb-0">Customer Information</h5>
                </div>
                <div className="card-body px-4 pb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-3">
                          <FaUser className="text-primary me-3" />
                          <div>
                            <p className="mb-0 fw-medium">Name</p>
                            <p className="mb-0 text-muted">{customerInfo?.firstName} {customerInfo?.lastName}</p>
                          </div>
                        </li>
                        <li className="d-flex align-items-center mb-3">
                          <FaEnvelope className="text-primary me-3" />
                          <div>
                            <p className="mb-0 fw-medium">Email</p>
                            <p className="mb-0 text-muted">{customerInfo?.email}</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-3">
                          <FaPhone className="text-primary me-3" />
                          <div>
                            <p className="mb-0 fw-medium">Phone</p>
                            <p className="mb-0 text-muted">{formatPhoneNumber(customerInfo?.phone || '')}</p>
                          </div>
                        </li>
                        <li className="d-flex align-items-center mb-3">
                          <FaComments className="text-primary me-3" />
                          <div>
                            <p className="mb-0 fw-medium">Notes</p>
                            <p className="mb-0 text-muted">{customerInfo?.notes || 'No notes provided'}</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-4">
            {handlePrev && (
              <button 
                type="button" 
                className="btn btn-outline-secondary px-4 py-2"
                onClick={handlePrev}
              >
                Back
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-primary px-4 py-2 ms-auto"
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : 'Confirm Booking'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookConfirmation;