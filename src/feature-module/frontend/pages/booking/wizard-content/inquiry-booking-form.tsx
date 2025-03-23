// src/feature-module/frontend/pages/booking/wizard-content/inquiry-booking-form.tsx
import React, { useState } from 'react';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from 'date-fns';
import { FaCalendarAlt, FaClock, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../../core/img/ImageWithBasePath';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Service } from '../../../../../core/service/bookingApi';

// Define form data interface
interface InquiryFormData {
  preferredDate: Date;
  preferredTimes: string[];
  specialRequirements?: string | undefined;
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
  preferredTimes: yup.array()
    .of(yup.string().required())
    .min(1, 'At least one time slot must be selected')
    .required('At least one time slot is required'),
  specialRequirements: yup.string()
    .max(500, 'Special requirements cannot exceed 500 characters'),
});

// Props interface
interface InquiryBookingFormProps {
  handleNext: () => void;
  handlePrev: () => void;
  serviceData: any;
  onSubmit: (data: InquiryFormData) => Promise<boolean>;
}

const InquiryBookingForm: React.FC<InquiryBookingFormProps> = ({ 
  handleNext, 
  handlePrev, 
  serviceData,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<InquiryFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      preferredDate: addDays(new Date(), 1), // Default to tomorrow
      preferredTimes: [],
      specialRequirements: '',
    }
  });

  const selectedTimeSlots = watch('preferredTimes');

  const onFormSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const success = await onSubmit(data);
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

  const toggleTimeSlot = (timeSlot: string) => {
    const currentSelectedSlots = [...selectedTimeSlots];
    const index = currentSelectedSlots.indexOf(timeSlot);
    
    if (index === -1) {
      // Add time slot
      setValue('preferredTimes', [...currentSelectedSlots, timeSlot]);
    } else {
      // Remove time slot
      currentSelectedSlots.splice(index, 1);
      setValue('preferredTimes', currentSelectedSlots);
    }
  };

  return (
    <div className="inquiry-form-container p-md-3">
      <div className="section-header mb-4">
        <h3 className="mb-0 fw-bold">Inquiry Form</h3>
        <p className="text-muted mb-0">Please provide your preferred date, time and any special requirements</p>
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
              <h5 className="fw-bold mb-0">Preferred Date</h5>
            </div>
          </div>
          <div className="card-body px-4 pb-4">
            <div className="row">
              <div className="col-md-8 col-lg-6">
                <Controller
                  name="preferredDate"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<InquiryFormData, 'preferredDate'> }) => (
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
              <h5 className="fw-bold mb-0">Preferred Time Slots</h5>
            </div>
            <p className="text-muted small mt-2 mb-0">
              Select one or more time slots that would work for you
            </p>
          </div>
          <div className="card-body px-4 pb-4">
            <div className="time-slots-grid">
              <div className="row g-3">
                {TIME_SLOTS.map((timeSlot) => (
                  <div className="col-sm-6 col-md-4 col-lg-3" key={timeSlot}>
                    <div 
                      className={`time-slot-item p-3 rounded-3 cursor-pointer text-center ${
                        selectedTimeSlots.includes(timeSlot) ? 'bg-primary-subtle text-primary' : 'bg-light text-muted'
                      }`}
                      onClick={() => toggleTimeSlot(timeSlot)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      {timeSlot}
                    </div>
                  </div>
                ))}
              </div>
              {errors.preferredTimes && (
                <div className="invalid-feedback d-block mt-3">
                  {errors.preferredTimes.message}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-3 mb-4">
          <div className="card-header bg-transparent border-0 pt-4 px-4">
            <div className="d-flex align-items-center">
              <FaComments className="text-primary me-2" />
              <h5 className="fw-bold mb-0">Special Requirements</h5>
            </div>
            <p className="text-muted small mt-2 mb-0">
              Please let us know if you have any special requirements or questions
            </p>
          </div>
          <div className="card-body px-4 pb-4">
            <Controller
              name="specialRequirements"
              control={control}
              render={({ field }: { field: ControllerRenderProps<InquiryFormData, 'specialRequirements'> }) => (
                <textarea
                  {...field}
                  className={`form-control ${errors.specialRequirements ? 'is-invalid' : ''}`}
                  rows={4}
                  placeholder="Describe your requirements or ask questions about the service..."
                />
              )}
            />
            {errors.specialRequirements && (
              <div className="invalid-feedback d-block">
                {errors.specialRequirements.message}
              </div>
            )}
            <div className="form-text text-end mt-2">
              <small>{watch('specialRequirements')?.length || 0}/500 characters</small>
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

export default InquiryBookingForm;