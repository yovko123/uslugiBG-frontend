//uslugiBG-frontend\src\feature-module\frontend\pages\booking\wizard-content\book-dateTime.tsx

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from 'date-fns';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

interface BookDateTimeFormData {
  preferredDate: Date;
  timeSlot: string;
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

// Validation schema
const schema = yup.object().shape({
  preferredDate: yup.date()
    .required('Date is required')
    .min(new Date(), 'Date cannot be in the past'),
  timeSlot: yup.string()
    .required('Please select a time slot'),
});

interface BookDateTimeProps {
  handleNext?: (date: Date, timeSlot: string) => void;
  handlePrev?: () => void;
  serviceData?: any;
}

const BookDateTime: React.FC<BookDateTimeProps> = ({
  handlePrev,
  handleNext,
  serviceData
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<BookDateTimeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      preferredDate: addDays(new Date(), 1), // Default to tomorrow
      timeSlot: '',
    }
  });

  const selectedTimeSlot = watch('timeSlot');

  const onFormSubmit = async (data: BookDateTimeFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (handleNext) {
        handleNext(data.preferredDate, data.timeSlot);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the form';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeSlotSelect = (slot: string) => {
    setValue('timeSlot', slot === selectedTimeSlot ? '' : slot);
  };

  return (
    <div className="booking-date-time-container p-md-3">
      <div className="section-header mb-4">
        <h3 className="mb-0 fw-bold">Select Date & Time</h3>
        <p className="text-muted mb-0">Choose your preferred appointment date and time</p>
      </div>

      {submitError && (
        <div className="alert alert-danger mb-4">
          <p className="mb-0">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="card shadow-sm border-0 rounded-3 mb-4">
          <div className="card-header bg-transparent border-0 pt-4 px-4">
            <div className="d-flex align-items-center">
              <FaCalendarAlt className="text-primary me-2" />
              <h5 className="fw-bold mb-0">Select Date</h5>
            </div>
          </div>
          <div className="card-body px-4 pb-4">
            <div className="row">
              <div className="col-md-8 col-lg-6">
                <Controller
                  name="preferredDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      minDate={new Date()}
                      className={`form-control ${errors.preferredDate ? 'is-invalid' : ''}`}
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select your preferred date"
                    />
                  )}
                />
                {errors.preferredDate && (
                  <div className="invalid-feedback d-block">
                    {errors.preferredDate.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-3 mb-4">
          <div className="card-header bg-transparent border-0 pt-4 px-4">
            <div className="d-flex align-items-center">
              <FaClock className="text-primary me-2" />
              <h5 className="fw-bold mb-0">Available Time Slots</h5>
            </div>
            <p className="text-muted small mt-2 mb-0">
              Select a time slot for your appointment
            </p>
          </div>
          <div className="card-body px-4 pb-4">
            <div className="time-slots-grid">
              <div className="row g-3">
                {TIME_SLOTS.map((timeSlot) => (
                  <div className="col-sm-6 col-md-4 col-lg-3" key={timeSlot}>
                    <div 
                      className={`time-slot-item p-3 rounded-3 cursor-pointer text-center ${
                        selectedTimeSlot === timeSlot ? 'bg-primary-subtle text-primary' : 'bg-light text-muted'
                      }`}
                      onClick={() => handleTimeSlotSelect(timeSlot)}
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
                Processing...
              </>
            ) : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookDateTime;