// src/feature-module/frontend/pages/booking/booking-wizard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BookConfirmation from './wizard-content/book-confirmation';
import BookPayment from './wizard-content/book-payment';
import BookCart from './wizard-content/book-cart';
import BookInfo from './wizard-content/book-info';
import BookDateTime from './wizard-content/book-dateTime';
import BookServices from './wizard-content/book-services';
import BookStaff from './wizard-content/book-staff';
import BookServiceDetails from './wizard-content/book-service-details';
import InquiryBookingForm from './wizard-content/inquiry-booking-form';
import { serviceApi } from '../../../../core/service/serviceApi';
import { Alert } from '../../../components/ui/alert';
import { bookingApi } from '../../../../core/service/bookingApi';

// Define interface for customer info (matching BookInfo's FormData)
interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

// Define interface for inquiry data
interface InquiryData {
  preferredDate: Date;
  preferredTimes: string[];
  specialRequirements?: string;
}

// Define interface for direct booking data
interface DirectBookingData {
  bookingDate: Date;
  timeSlot?: string;
  duration?: number;
  totalPrice?: number;
  staffId?: number;
  additionalServices?: any[];
}

const BookingWizard = () => {
  const routes = all_routes;
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  // State for the booking flow
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceData, setServiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<'DIRECT' | 'INQUIRY' | string | null>(null);
  
  // Customer and booking data
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [inquiryData, setInquiryData] = useState<InquiryData | null>(null);
  const [directBookingData, setDirectBookingData] = useState<DirectBookingData>({
    bookingDate: new Date(),
    timeSlot: undefined,
    duration: undefined,
    totalPrice: undefined,
    staffId: undefined,
    additionalServices: []
  });
  const [bookingDate, setBookingDate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch service details to determine booking type
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) {
        setError('Service ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await serviceApi.getService(Number(serviceId));
        
        if (response.success && response.data) {
          setServiceData(response.data);
          setBookingType(response.data.bookingType || 'DIRECT'); // Default to DIRECT if not specified
        } else {
          setError(response.message || 'Failed to fetch service details');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  // Handle navigation between steps
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo({
      top: 0,
      behavior: "smooth" // smooth scrolling
    });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Handle saving customer information
  const saveCustomerInfo = (data: CustomerInfo) => {
    setCustomerInfo(data);
    handleNext();
  };

  // Handle saving inquiry form data
  const saveInquiryData = async (data: InquiryData): Promise<boolean> => {
    setInquiryData(data);
    setBookingDate(data.preferredDate);
    return true;
  };

  // Handle saving direct booking date and time
  const saveDirectDateTime = (date: Date, timeSlot: string) => {
    setDirectBookingData({
      ...directBookingData,
      bookingDate: date,
      timeSlot: timeSlot
    });
    setBookingDate(date);
    handleNext();
  };

  // Handle saving staff selection
  const saveStaffSelection = (staffId: number) => {
    setDirectBookingData({
      ...directBookingData,
      staffId
    });
    handleNext();
  };

  // Handle saving additional services
  const saveAdditionalServices = (services: string[]) => {
    setDirectBookingData({
      ...directBookingData,
      additionalServices: services
    });
    handleNext();
  };

  // Submit booking data - updated to handle both booking types
  const submitBooking = async () => {
    if (!serviceId || !customerInfo) {
      setBookingError('Missing required booking information');
      return false;
    }
    
    setSubmitting(true);
    setBookingError(null);
    
    try {
      // Create base booking data
      const bookingData: any = {
        serviceId: Number(serviceId),
        customerInfo,
        bookingDate: bookingDate.toISOString()
      };
      
      // Add type-specific data
      if (bookingType === 'INQUIRY' && inquiryData) {
        bookingData.inquiryDetails = inquiryData;
      } else if (directBookingData) {
        // For direct bookings, add relevant data
        bookingData.staffId = directBookingData.staffId;
        bookingData.timeSlot = directBookingData.timeSlot;
        bookingData.duration = directBookingData.duration;
        bookingData.totalPrice = directBookingData.totalPrice;
        bookingData.additionalServices = directBookingData.additionalServices;
      }
      
      // Call API to create booking
      const response = await bookingApi.createBooking(bookingData);
      
      if (response.success) {
        handleNext(); // Move to confirmation step
        return true;
      } else {
        setBookingError(response.message || 'Failed to create booking');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the booking';
      setBookingError(errorMessage);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-body text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading service details...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <Alert variant="destructive">
                  <p>{error}</p>
                  <div className="mt-3">
                    <Link to={routes.serviceGrid} className="btn btn-primary">
                      Return to Services
                    </Link>
                  </div>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine the steps based on booking type
  const isInquiryBooking = bookingType === 'INQUIRY';
  const maxSteps = isInquiryBooking ? 4 : 8; // Fewer steps for inquiry booking

  // Calculate progress percentage
  const progressPercentage = Math.round((currentStep / maxSteps) * 100);

  // Function to render the correct booking form based on type
  const renderBookingForm = () => {
    if (isInquiryBooking) {
      // Inquiry Booking Flow
      switch (currentStep) {
        case 1:
          return (
            <BookServiceDetails 
              handleNext={handleNext} 
              serviceData={serviceData} 
            />
          );
        case 2:
          return (
            <InquiryBookingForm 
              handleNext={handleNext} 
              handlePrev={handlePrev}
              serviceData={serviceData}
              onSubmit={saveInquiryData}
            />
          );
        case 3:
          return (
            <BookInfo 
              handleNext={saveCustomerInfo}
              handlePrev={handlePrev} 
              isInquiry={true}
              customerInfo={customerInfo || undefined}
            />
          );
        case 4:
          return (
            <BookConfirmation 
              setCurrentStep={setCurrentStep}
              bookingType="INQUIRY"
              serviceData={serviceData}
              customerInfo={customerInfo}
              handlePrev={handlePrev}
              bookingData={{
                preferredDate: inquiryData?.preferredDate,
                preferredTimes: inquiryData?.preferredTimes,
                specialRequirements: inquiryData?.specialRequirements
              }}
            />
          );
        default:
          return null;
      }
    } else {
      // Direct Booking Flow
      switch (currentStep) {
        case 1:
          return (
            <BookServiceDetails 
              handleNext={handleNext} 
              serviceData={serviceData} 
            />
          );
        case 2:
          return (
            <BookStaff 
              handleNext={saveStaffSelection} 
              handlePrev={handlePrev} 
              serviceData={serviceData}
            />
          );
        case 3:
          return (
            <BookServices 
              handleNext={saveAdditionalServices} 
              handlePrev={handlePrev}
              serviceData={serviceData}
            />
          );
        case 4:
          return (
            <BookDateTime 
              handleNext={saveDirectDateTime} 
              handlePrev={handlePrev}
              serviceData={serviceData}
            />
          );
        case 5:
          return (
            <BookInfo 
              handleNext={saveCustomerInfo}
              handlePrev={handlePrev}
              customerInfo={customerInfo || undefined}
            />
          );
        case 6:
          return (
            <BookCart 
              handleNext={handleNext} 
              handlePrev={handlePrev}
            />
          );
        case 7:
          return (
            <BookPayment 
              handleNext={submitBooking} 
              handlePrev={handlePrev}
            />
          );
        case 8:
          return (
            <BookConfirmation 
              setCurrentStep={setCurrentStep}
              bookingType="DIRECT"
              serviceData={serviceData}
              customerInfo={customerInfo}
              handlePrev={handlePrev}
              bookingData={directBookingData}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container">
          {/* Booking */}
          <div className="row">
            <div className="col-xxl-10 col-xl-11 mx-auto">
              <div className="card border-0 mb-0">
                <div className="card-body p-3 fieldset-wizard">
                  <div className="row">
                    {/* Booking Sidebar */}
                    <div className="col-lg-3 theiaStickySidebar">
                      <div className="card bg-dark booking-sidebar mb-4 mb-lg-0">
                        <div className="card-body">
                          <h6 className="text-white fs-14 mb-2">Service Details</h6>
                          <div className="service-info d-flex align-items-center">
                            <span className="avatar avatar-md me-2 flex-shrink-0">
                              {serviceData?.serviceImages?.[0]?.imageUrl ? (
                                <img 
                                  src={serviceData.serviceImages[0].imageUrl} 
                                  alt={serviceData.title} 
                                  className="img-fluid"
                                />
                              ) : (
                                <ImageWithBasePath
                                  src="assets/img/services/service-02.jpg"
                                  alt="Service"
                                />
                              )}
                            </span>
                            <div>
                              <p className="fs-12 text-white fw-medium mb-1">
                                {serviceData?.title || 'Service'}
                              </p>
                              <span className="fs-10">
                                <i className="ti ti-star-filled text-warning me-1" />
                                {serviceData?.rating || '4.5'} ({serviceData?.reviews?.length || '0'} reviews)
                              </span>
                            </div>
                          </div>
                          <div className="booking-wizard">
                            <h6 className="text-white fs-14 mb-3">
                              {isInquiryBooking ? 'Inquiry Booking' : 'Direct Booking'}
                            </h6>
                            <ul className="wizard-progress" id="bokingwizard">
                              {isInquiryBooking ? (
                                // Inquiry booking steps
                                <>
                                  <li className={`${currentStep === 1 ? 'active' : currentStep > 1 ? 'activated' : ''} pb-3`}>
                                    <span>1. Service Details</span>
                                  </li>
                                  <li className={`${currentStep === 2 ? 'active' : currentStep > 2 ? 'activated' : ''} pb-3`}>
                                    <span>2. Inquiry Form</span>
                                  </li>
                                  <li className={`${currentStep === 3 ? 'active' : currentStep > 3 ? 'activated' : ''} pb-3`}>
                                    <span>3. Personal Information</span>
                                  </li>
                                  <li className={`${currentStep === 4 ? 'active' : currentStep > 4 ? 'activated' : ''}`}>
                                    <span>4. Confirmation</span>
                                  </li>
                                </>
                              ) : (
                                // Direct booking steps
                                <>
                                  <li className={`${currentStep === 1 ? 'active' : currentStep > 1 ? 'activated' : ''} pb-3`}>
                                    <span>1. Service Details</span>
                                  </li>
                                  <li className={`${currentStep === 2 ? 'active' : currentStep > 2 ? 'activated' : ''} pb-3`}>
                                    <span>2. Staffs</span>
                                  </li>
                                  <li className={`${currentStep === 3 ? 'active' : currentStep > 3 ? 'activated' : ''} pb-3`}>
                                    <span>3. Additional Services</span>
                                  </li>
                                  <li className={`${currentStep === 4 ? 'active' : currentStep > 4 ? 'activated' : ''} pb-3`}>
                                    <span>4. Date & Time</span>
                                  </li>
                                  <li className={`${currentStep === 5 ? 'active' : currentStep > 5 ? 'activated' : ''} pb-3`}>
                                    <span>5. Personal Information</span>
                                  </li>
                                  <li className={`${currentStep === 6 ? 'active' : currentStep > 6 ? 'activated' : ''} pb-3`}>
                                    <span>6. Cart</span>
                                  </li>
                                  <li className={`${currentStep === 7 ? 'active' : currentStep > 7 ? 'activated' : ''} pb-3`}>
                                    <span>7. Payment</span>
                                  </li>
                                  <li className={`${currentStep === 8 ? 'active' : currentStep > 8 ? 'activated' : ''}`}>
                                    <span>8. Confirmation</span>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                          <div className="status-report">
                            <h6 className="text-white fs-14 mb-2 pb-2">Progress</h6>
                            <div className="progress mb-2" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                role="progressbar" 
                                style={{ width: `${progressPercentage}%` }} 
                                aria-valuenow={progressPercentage} 
                                aria-valuemin={0} 
                                aria-valuemax={100}
                              ></div>
                            </div>
                            <p className="fs-10 text-white">{progressPercentage}% complete</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Booking Sidebar */}
                    <div className="col-lg-9">
                      {bookingError && (
                        <Alert variant="destructive" className="mb-4">
                          <p>{bookingError}</p>
                        </Alert>
                      )}
                      {renderBookingForm()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Booking */}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;