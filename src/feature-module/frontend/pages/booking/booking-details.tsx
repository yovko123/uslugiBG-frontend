// uslugiBG-frontend\src\feature-module\frontend\pages\booking\booking-details.tsx
// Enhanced booking-details.tsx with completion and dispute options
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { bookingApi } from '../../../../core/service/bookingApi';

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Additional states for completion and disputes
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await bookingApi.getBookingById(id);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [id]);
  
  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;
  
  // Check if the booking is eligible for completion marking (only if in progress)
  const canMarkComplete = booking.status === 'in_progress';
  
  // Check if the booking can be disputed (completed or in progress)
  const canDispute = ['completed', 'in_progress'].includes(booking.status);
  
  // Check if the booking is eligible for a review
  const canReview = booking.reviewEligible && new Date() < new Date(booking.reviewEligibleUntil);
  
  // Function to mark booking as complete
  const handleMarkComplete = async () => {
    try {
      await bookingApi.markBookingCompletion(id, {
        completedByCustomer: true
      });
      // Refresh booking data
      const response = await bookingApi.getBookingById(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Error marking booking as complete:', error);
    }
  };
  
  // Function to submit a dispute
  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for the dispute');
      return;
    }
    
    try {
      await bookingApi.createDispute(id, {
        disputeReason
      });
      // Refresh booking data
      const response = await bookingApi.getBookingById(id);
      setBooking(response.data);
      setShowDisputeForm(false);
    } catch (error) {
      console.error('Error submitting dispute:', error);
    }
  };
  
  return (
    <div className="booking-details">
      {/* Existing booking details UI */}
      
      {/* Add action buttons based on booking status */}
      <div className="booking-actions mt-4">
        {canMarkComplete && (
          <button 
            className="btn btn-success me-2" 
            onClick={handleMarkComplete}
          >
            Mark as Complete
          </button>
        )}
        
        {canDispute && (
          <button 
            className="btn btn-warning me-2" 
            onClick={() => setShowDisputeForm(!showDisputeForm)}
          >
            {booking.hasDispute ? 'View Dispute' : 'Open Dispute'}
          </button>
        )}
        
        {canReview && (
          <button 
            className="btn btn-primary me-2" 
            data-bs-toggle="modal" 
            data-bs-target="#add-review"
          >
            Leave Review
          </button>
        )}
      </div>
      
      {/* Dispute form */}
      {showDisputeForm && !booking.hasDispute && (
        <div className="dispute-form mt-3">
          <h4>Submit Dispute</h4>
          <div className="form-group">
            <label>Reason for Dispute</label>
            <textarea 
              className="form-control" 
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
            ></textarea>
          </div>
          <div className="mt-2">
            <button 
              className="btn btn-primary" 
              onClick={handleSubmitDispute}
            >
              Submit Dispute
            </button>
            <button 
              className="btn btn-light ms-2" 
              onClick={() => setShowDisputeForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Show existing dispute details if any */}
      {booking.hasDispute && (
        <div className="dispute-details mt-3">
          <h4>Dispute Information</h4>
          <div className="alert alert-warning">
            <p><strong>Status:</strong> {booking.disputeStatus}</p>
            <p><strong>Reason:</strong> {booking.disputeReason}</p>
            {booking.disputeResolvedAt && (
              <p><strong>Resolved:</strong> {new Date(booking.disputeResolvedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Booking status visualization */}
      <div className="booking-status-timeline mt-4">
        <h4>Booking Status</h4>
        <div className="timeline">
          {booking.statusHistory.map((statusChange, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h5>{statusChange.newStatus}</h5>
                <p>{new Date(statusChange.changedAt).toLocaleString()}</p>
                {statusChange.reason && <p>Reason: {statusChange.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;