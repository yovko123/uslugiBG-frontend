import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays, format } from 'date-fns';
import { FaCalendarAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { Service } from '../../../../../core/service/bookingApi';

// Define form data interface
interface DirectBookingFormData {
  bookingDate: Date;
  timeSlot: string;
  duration: number; // in minutes
}

// Define the time slots for the day
const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];

// Service durations in minutes
const SERVICE_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
];

// Validation schema
const schema = yup.object().shape({
  bookingDate: yup.date()
    .required('Date is required')
    .min(new Date(), 'Date cannot be in the past'),
  timeSlot: yup.string()
    .required('Time slot is required'),
  duration: yup.number()
    .required('Duration is required')
    .min(30, 'Minimum duration is 30 minutes')
});

// Props interface
interface DirectBookingCalendarProps {
  handleNext: () => void;
  handlePrev: () => void;
  serviceData: Service;
  onSubmit: (data: DirectBookingFormData) => Promise<boolean>;
}

const DirectBookingCalendar: React.FC<DirectBookingCalendarProps> = ({ 
  handleNext, 
  handlePrev, 
  serviceData,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(serviceData.price || 0);

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<DirectBookingFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      bookingDate: addDays(new Date(), 1), // Default to tomorrow
      timeSlot: '',
      duration: serviceData.priceType === 'HOURLY' ? 60 : 0, // Default to 1 hour for hourly services
    }
  });

  const selectedDuration = watch('duration');

  // Calculate total price based on duration for hourly services
  useEffect(() => {
    if (serviceData.priceType === 'HOURLY' && selectedDuration) {
      // Convert duration from minutes to hours and multiply by hourly rate
      const hours = selectedDuration / 60;
      setTotalPrice(serviceData.price * hours);
    } else {
      setTotalPrice(serviceData.price);
    }
  }, [selectedDuration, serviceData.price, serviceData.priceType]);

  const onFormSubmit = async (data: DirectBookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const success = await onSubmit({
        ...data,
        // Include calculated total price in the submission
        duration: data.duration
      });
      
      if (success) {
        handleNext();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the form';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="direct-booking-container p-md-3">
      <div className="section-header mb-4">
        <h3 className="mb-0 fw-bold">Book {serviceData.title}</h3>
        <p className="text-muted mb-0">Please select your preferred date, time and service duration</p>
      </div>

      {submitError && (
        <div className="alert alert-danger mb-4">
          <p className="mb-0">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="row">
          <div className="col-lg-8">
            {/* Date Selection */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="text-primary me-2" />
                  <h5 className="fw-bold mb-0">Select Date</h5>
                </div>
              </div>
              <div className="card-body px-4 pb-4">
                <div className="row">
                  <div className="col-md-8">
                    <Controller
                      name="bookingDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => field.onChange(date)}
                          minDate={new Date()}
                          className={`form-control ${errors.bookingDate ? 'is-invalid' : ''}`}
                          dateFormat="MMMM d, yyyy"
                          placeholderText="Select your preferred date"
                        />
                      )}
                    />
                    {errors.bookingDate && (
                      <div className="invalid-feedback d-block">
                        {errors.bookingDate.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <div className="d-flex align-items-center">
                  <FaClock className="text-primary me-2" />
                  <h5 className="fw-bold mb-0">Select Time Slot</h5>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Choose a time that works best for you
                </p>
              </div>
              <div className="card-body px-4 pb-4">
                <div className="time-slots-grid">
                  <div className="row g-3">
                    {TIME_SLOTS.map((timeSlot) => (
                      <div className="col-sm-6 col-md-4 col-lg-3" key={timeSlot}>
                        <div 
                          className={`time-slot-item p-3 rounded-3 cursor-pointer text-center ${
                            watch('timeSlot') === timeSlot ? 'bg-primary-subtle text-primary' : 'bg-light text-muted'
                          }`}
                          onClick={() => setValue('timeSlot', timeSlot)}
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                          {timeSlot}
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.timeSlot && (
                    <div className="invalid-feedback d-block mt-3">
                      {errors.timeSlot.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Service Duration (for hourly services) */}
            {serviceData.priceType === 'HOURLY' && (
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-header bg-transparent border-0 pt-4 px-4">
                  <div className="d-flex align-items-center">
                    <FaClock className="text-primary me-2" />
                    <h5 className="fw-bold mb-0">Service Duration</h5>
                  </div>
                  <p className="text-muted small mt-2 mb-0">
                    How long do you need the service for?
                  </p>
                </div>
                <div className="card-body px-4 pb-4">
                  <div className="row">
                    <div className="col-md-8">
                      <Controller
                        name="duration"
                        control={control}
                        render={({ field }) => (
                          <select 
                            className={`form-select ${errors.duration ? 'is-invalid' : ''}`}
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          >
                            <option value="">Select duration</option>
                            {SERVICE_DURATIONS.map((duration) => (
                              <option key={duration.value} value={duration.value}>
                                {duration.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.duration && (
                        <div className="invalid-feedback d-block">
                          {errors.duration.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <div className="d-flex align-items-center">
                  <FaMoneyBillWave className="text-primary me-2" />
                  <h5 className="fw-bold mb-0">Price Summary</h5>
                </div>
              </div>
              <div className="card-body px-4 pb-4">
                <div className="price-summary">
                  <div className="d-flex justify-content-between mb-3">
                    <span>Service:</span>
                    <span className="fw-bold">{serviceData.title}</span>
                  </div>
                  
                  {serviceData.priceType === 'HOURLY' && (
                    <div className="d-flex justify-content-between mb-3">
                      <span>Duration:</span>
                      <span>{selectedDuration ? `${selectedDuration / 60} hour(s)` : '-'}</span>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span>Base Price:</span>
                    <span>{formatPrice(serviceData.price)} {serviceData.priceType === 'HOURLY' ? '/ hour' : ''}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total:</span>
                    <span className="fw-bold fs-5 text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary px-4 py-2"
            onClick={handlePrev}
          >
            Back
          </button>
          <button 
            type="submit" 
            className="btn btn-primary px-4 py-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DirectBookingCalendar; 