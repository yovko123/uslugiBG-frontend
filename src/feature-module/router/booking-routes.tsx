import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BookingWizard from '../frontend/pages/booking/booking-wizard';
import BookingDetails from '../frontend/pages/booking/booking-details';
import { all_routes } from '../../core/data/routes/all_routes';

const BookingRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BookingWizard />} />
      <Route path="wizard" element={<BookingWizard />} />
      <Route path="details/:id" element={<BookingDetails />} />
    </Routes>
  );
};

export default BookingRoutes; 