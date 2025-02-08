// src/feature-module/router/service-routes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Services from '../frontend/services/services';
import CreateService from '../frontend/services/create-service/createServices';

const ServiceRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Services />} />
      <Route path="create" element={<CreateService />} />
    </Routes>
  );
};

export default ServiceRoutes;