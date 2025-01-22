// src/feature-module/router/auth-routes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UnifiedSignup from '../frontend/pages/authentication/unified-signup';
import Login from '../frontend/pages/authentication/login';
import EmailOtp from '../frontend/pages/authentication/email-otp';
import FreeTrail from '../frontend/pages/authentication/free-trail';
import PasswordRecovery from '../frontend/pages/authentication/password-recovery';
import PhoneOtp from '../frontend/pages/authentication/phone-otp';
import ResetPassword from '../frontend/pages/authentication/reset-password';
import Success from '../frontend/pages/authentication/success';
import Error404 from '../frontend/pages/Error page/error404';
import Error500 from '../frontend/pages/Error page/error500';

const AuthenticationRoutes = () => {
  return (
    <Routes>
      <Route path="signup" element={<UnifiedSignup />} />
      <Route path="login" element={<Login />} />
      <Route path="email-otp" element={<EmailOtp />} />
      <Route path="free-trail" element={<FreeTrail />} />
      <Route path="forgot-password" element={<PasswordRecovery />} />
      <Route path="phone-otp" element={<PhoneOtp />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="success" element={<Success />} />
      <Route path="error-404" element={<Error404 />} />
      <Route path="error-500" element={<Error500 />} />
    </Routes>
  );
};

export default AuthenticationRoutes;