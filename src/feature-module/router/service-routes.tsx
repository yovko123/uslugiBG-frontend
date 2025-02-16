// src/feature-module/router/service-routes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Services from '../frontend/services/services';
import CreateService from '../frontend/services/create-service/createServices';
import EditService from '../frontend/services/edit/EditService';
import { all_routes } from '../../core/data/routes/all_routes';

const ServiceRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Services />} />
      <Route path="create" element={<CreateService />} />
      <Route path="edit/:id" element={<EditService />} />
    </Routes>
  );
};

export default ServiceRoutes;