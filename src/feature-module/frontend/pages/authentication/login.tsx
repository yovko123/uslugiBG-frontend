// src/components/auth/login.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import AuthFooter from './common/footer';
import PagesAuthHeader from './common/header';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();  // Get both login and user from useAuth
  const routes = all_routes;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Call the login function from AuthContext - don't check its return value directly
      await login(formData.email, formData.password);
      
      // After login, use the user from context instead
      const currentUser = user;
      
      if (!currentUser) {
        throw new Error('Authentication failed');
      }
      
      // Get user type from the current user object
      // Use a type assertion to tell TypeScript that admin is a possible value
      const userType = (currentUser.userType || 'customer') as 'admin' | 'provider' | 'customer';
      
      // Log successful login
      console.log(`User logged in successfully as: ${userType}`);
      
      // Determine redirect path based on user type
      let targetPath;
      if (userType === 'admin') {
        targetPath = routes.admin || '/admin'; // Fallback if route doesn't exist
      } else if (userType === 'provider') {
        targetPath = routes.providerDashboard;
      } else {
        targetPath = routes.customerDashboard;
      }
      
      // Redirect user to appropriate dashboard
      navigate(targetPath);
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Login error:', error);
      // Improved error handling
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same
  return (
    <>
      <PagesAuthHeader />
      <div className="main-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column justify-content-center">
                  <div className="card p-sm-4 my-5">
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <h3 className="mb-2">Welcome Back</h3>
                        <p>Enter your credentials to access your account</p>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <label className="form-label">Password</label>
                          <Link to={routes.forgotPassword} className="text-primary">
                            Forgot Password?
                          </Link>
                        </div>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-lg btn-linear-primary w-100"
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </button>

                      <div className="mt-3 text-center">
                        <p>Don&apos;t have an account? <Link to={routes.signup} className="text-primary">Join us Today</Link></p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
};

export default Login;