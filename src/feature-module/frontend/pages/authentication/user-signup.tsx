// src/feature-module/pages/authentication/user-signup.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PhoneInput from 'react-phone-input-2';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import PagesAuthHeader from './common/header';
import { all_routes } from '../../../../core/data/routes/all_routes';
import AuthFooter from './common/footer';
import { useAuth } from '../../../../core/contexts/AuthContext';

const UserSignup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const routes = all_routes;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    userType: 'customer' as const  // Changed from 'as "customer"'
  });
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Use & Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful!');
      navigate(routes.login);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
                        <h3 className="mb-2">User Signup</h3>
                        <p>Enter your credentials to create your account</p>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input 
                          type="text" 
                          className="form-control"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input 
                          type="text" 
                          className="form-control"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
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
                        <label className="form-label">Phone Number</label>
                        <PhoneInput
                          country={'bg'}
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder='359 888 123 456'
                        />
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <label className="form-label">Password</label>
                          <p className="text-gray-6 fw-medium mb-1">
                            Must be 8 Characters at Least
                          </p>
                        </div>
                        <input 
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={8}
                        />
                      </div>

                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            id="terms"
                          />
                          <label className="form-check-label" htmlFor="terms">
                            I agree to {" "}
                            <Link to="#" className="text-primary">Terms of use</Link>
                            {" "} & {" "}
                            <Link to="#" className="text-primary">Privacy policy</Link>
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-lg btn-linear-primary w-100"
                        disabled={loading}
                      >
                        {loading ? 'Signing up...' : 'Sign Up'}
                      </button>

                      <div className="login-or mb-3">
                        <span className="span-or">Or sign up with </span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <Link to="#" className="btn btn-light flex-fill d-flex align-items-center justify-content-center me-3">
                          <ImageWithBasePath
                            src="assets/img/icons/google-icon.svg"
                            className="me-2"
                            alt="Img"
                          />
                          Google
                        </Link>
                        <Link to="#" className="btn btn-light flex-fill d-flex align-items-center justify-content-center">
                          <ImageWithBasePath
                            src="assets/img/icons/fb-icon.svg"
                            className="me-2"
                            alt="Img"
                          />
                          Facebook
                        </Link>
                      </div>

                      <div className="text-center">
                        <p>
                          Already have an account?{" "}
                          <Link to={routes.login} className="text-primary">
                            Sign In
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter/>
    </>
  );
};

export default UserSignup;