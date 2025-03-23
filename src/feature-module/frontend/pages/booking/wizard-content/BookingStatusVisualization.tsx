// BookingStatusVisualization.tsx
import React from 'react';

interface StatusHistoryItem {
  previousStatus: string;
  newStatus: string;
  changedBy: number;
  changedAt: string;
  reason?: string;
}

interface BookingStatusVisualizationProps {
  currentStatus: string;
  statusHistory: StatusHistoryItem[];
  autoCompletionDate?: string | null;
}

const BookingStatusVisualization: React.FC<BookingStatusVisualizationProps> = ({
  currentStatus,
  statusHistory,
  autoCompletionDate
}) => {
  // Define the order of statuses for visualization
  const statusOrder = [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'disputed',
    'no_show_customer',
    'no_show_provider'
  ];
  
  // Get index of current status in the order
  const currentStatusIndex = statusOrder.indexOf(currentStatus);
  
  return (
    <div className="booking-status-visualization">
      <h5 className="mb-3">Booking Status</h5>
      
      <div className="status-timeline">
        {statusOrder.map((status, index) => {
          // Determine if this status is active, past, or future
          const isActive = status === currentStatus;
          const isPast = statusOrder.indexOf(status) < currentStatusIndex;
          const isFuture = !isActive && !isPast;
          
          // Get the timestamp for this status change if it exists
          const statusChange = statusHistory.find(item => item.newStatus === status);
          
          return (
            <div 
              key={status} 
              className={`status-step ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''}`}
            >
              <div className="status-indicator"></div>
              <div className="status-content">
                <h6>{status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                {statusChange && (
                  <p>{new Date(statusChange.changedAt).toLocaleString()}</p>
                )}
                {status === 'in_progress' && autoCompletionDate && (
                  <p className="auto-complete-info">
                    Auto-completion if not confirmed: {new Date(autoCompletionDate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStatusVisualization;