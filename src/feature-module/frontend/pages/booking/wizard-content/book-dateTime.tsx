//uslugiBG-frontend\src\feature-module\frontend\pages\booking\wizard-content\book-dateTime.tsx

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../../../core/img/ImageWithBasePath'
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

interface BookDateTimeProps {
  handleNext?: (date: Date, timeSlot: string) => void;
  handlePrev?: () => void;
  serviceData?: any;
}

// Define the type for the calendar value
type CalendarValue = Date | Date[] | null;

const BookDateTime: React.FC<BookDateTimeProps> = ({
  handlePrev,
  handleNext,
  serviceData
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlots = [
    { slot: '07:00 - 07:30', available: false },
    { slot: '07:30 - 08:00', available: false },
    { slot: '08:00 - 08:30', available: false },
    { slot: '08:30 - 09:00', available: false },
    { slot: '09:00 - 09:30', available: true },
    { slot: '09:30 - 10:00', available: true },
    { slot: '10:00 - 10:30', available: true },
    { slot: '10:30 - 11:00', available: true },
    { slot: '11:00 - 11:30', available: true },
    { slot: '11:30 - 12:00', available: true },
    { slot: '12:00 - 12:30', available: true },
    { slot: '12:30 - 13:00', available: true },
    { slot: '13:00 - 13:30', available: true },
    { slot: '13:30 - 14:00', available: true },
    { slot: '14:00 - 14:30', available: true },
    { slot: '14:30 - 15:00', available: true },
    { slot: '15:00 - 15:30', available: true },
    { slot: '15:30 - 16:00', available: true },
    { slot: '16:00 - 16:30', available: true },
    { slot: '16:30 - 17:00', available: true },
    { slot: '17:00 - 17:30', available: true },
    { slot: '17:30 - 18:00', available: true },
  ];

  // Handle date selection with any type to avoid TS errors
  const onDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setSelectedTimeSlot(null); // Reset time slot when date changes
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Add a short delay to simulate API call
    setTimeout(() => {
      if (handleNext) {
        handleNext(selectedDate, selectedTimeSlot);
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="booking-date-time-container">
      <div className="section-header mb-4">
        <h3 className="mb-0 fw-bold">Select Date & Time</h3>
        <p className="text-muted mb-0">Choose your preferred appointment date and time</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <p className="mb-0">{error}</p>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-primary me-2" />
                <h5 className="fw-bold mb-0">Select Date</h5>
              </div>
            </div>
            <div className="card-body px-4 pb-4">
              <Calendar
                onChange={onDateChange}
                value={selectedDate}
                minDate={new Date()}
                className="w-100 border-0"
              />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <div className="d-flex align-items-center">
                <FaClock className="text-primary me-2" />
                <h5 className="fw-bold mb-0">Select Time</h5>
              </div>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="time-slots-grid">
                <div className="row g-3">
                  {timeSlots.map((timeSlot, index) => (
                    <div className="col-sm-6 col-lg-4" key={index}>
                      <div 
                        className={`time-slot-item p-3 rounded-3 text-center ${
                          !timeSlot.available ? 'bg-light text-muted opacity-50' : 
                          selectedTimeSlot === timeSlot.slot ? 'bg-primary-subtle text-primary' : 'bg-light text-muted'
                        }`}
                        onClick={() => timeSlot.available && handleTimeSlotSelect(timeSlot.slot)}
                        style={{ 
                          cursor: timeSlot.available ? 'pointer' : 'not-allowed', 
                          transition: 'all 0.2s ease' 
                        }}
                      >
                        {timeSlot.slot}
                        {!timeSlot.available && <div className="small mt-1">(Not Available)</div>}
                      </div>
                    </div>
                  ))}
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
          type="button" 
          className="btn btn-primary px-4 py-2"
          onClick={handleSubmit}
          disabled={!selectedTimeSlot || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default BookDateTime;