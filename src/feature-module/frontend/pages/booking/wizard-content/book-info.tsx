//uslugiBG-frontend\src\feature-module\frontend\pages\booking\wizard-content\book-info.tsx

import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../../../../../core/contexts/AuthContext';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookInfoProps {
  handleNext: (data: FormData) => void;
  handlePrev: () => void;
  isInquiry?: boolean;
  customerInfo?: FormData;
}

const BookInfo: React.FC<BookInfoProps> = ({ handleNext, handlePrev, isInquiry = false, customerInfo }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Initialize form with customer info if provided
  useEffect(() => {
    if (customerInfo) {
      setFormData(customerInfo);
    }
  }, [customerInfo]);

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone ? user.phone.replace(/^\+359/, '') : '', // Remove +359 prefix if present
        notes: ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext(formData);
  };

  return (
    <div className="personal-info-container p-md-3">
      <div className="section-header mb-4">
        <h3 className="mb-0 fw-bold">Personal Information</h3>
        <p className="text-muted mb-0">Please provide your contact details to complete your {isInquiry ? 'inquiry' : 'booking'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm border-0 rounded-3 mb-4">
          <div className="card-header bg-transparent border-0 pt-4 px-4">
            <div className="d-flex align-items-center">
              <FaUser className="text-primary me-2" />
              <h5 className="fw-bold mb-0">Basic Information</h5>
            </div>
          </div>
          <div className="card-body px-4 pb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-3 mb-4">
          <div className="card-header bg-transparent border-0 pt-4 px-4">
            <div className="d-flex align-items-center">
              <FaEnvelope className="text-primary me-2" />
              <h5 className="fw-bold mb-0">Contact Information</h5>
            </div>
          </div>
          <div className="card-body px-4 pb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email Address <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone Number <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text">+359</span>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isInquiry && (
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <div className="d-flex align-items-center">
                <FaClipboardList className="text-primary me-2" />
                <h5 className="fw-bold mb-0">Additional Information</h5>
              </div>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="notes" className="form-label">Special Requests or Notes</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    rows={4}
                    placeholder="Enter any special requests or notes for your booking"
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

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
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookInfo;