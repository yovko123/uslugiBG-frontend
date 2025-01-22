import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputOtp } from 'primereact/inputotp';
import PhoneInput from 'react-phone-input-2';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import PagesAuthHeader from './common/header';
import AuthFooter from './common/footer';
import { useAuth } from '../../../../core/contexts/AuthContext'; 
import { toast } from 'react-toastify';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  isProvider: boolean;
  providerProfile: {
    businessName: string;
    experience: string;
    description: string;
  };
}

const UnifiedSignup = () => {
  const navigate = useNavigate();
  const routes = all_routes;
  const { register } = useAuth();

  // Use the interface in your state definition
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    isProvider: false,
    providerProfile: {
      businessName: '',
      experience: '',
      description: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [step, setStep] = useState(1);

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('providerProfile.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        providerProfile: {
          ...prev.providerProfile,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Use & Privacy Policy');
      return;
    }
  
    setLoading(true);
    try {
      // Explicitly type the userType as 'provider' | 'customer'
      const userType = formData.isProvider ? 'provider' as const : 'customer' as const;
      
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType,
        ...(formData.isProvider && {
          providerProfile: {
            companyName: formData.providerProfile.businessName || undefined,
            description: formData.providerProfile.description || undefined
          }
        })
      };
  
      await register(userData);
      toast.success('Account created successfully!');
      navigate(routes.login);
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Registration failed. Please try again.');
      }
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
                  <div className="card p-sm-4">
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <h3 className="mb-2">Create Your Account</h3>
                        <p>Join UslugiBG to find or provide great services</p>
                      </div>

                      {step === 1 && (
                        <>
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
                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                              <label className="form-label">Password</label>
                              <p className="text-gray-6 fw-medium mb-1">Must be at least 8 characters</p>
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

                          <div className="form-check mb-3">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="providerToggle"
                              name="isProvider"
                              checked={formData.isProvider}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label" htmlFor="providerToggle">
                              I want to offer services on UslugiBG
                            </label>
                          </div>

                          <button
                            type="button"
                            className="btn btn-lg btn-linear-primary w-100"
                            onClick={() => setStep(2)}
                          >
                            Continue
                          </button>
                        </>
                      )}

                      {step === 2 && (
                        <>
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
                            <label className="form-label">Phone Number</label>
                            <PhoneInput
                              country={'bg'}
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              inputClass="form-control"
                            />
                          </div>

                          {formData.isProvider && (
                            <>
                              <div className="mb-3">
                                <label className="form-label">Business Name (Optional)</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="providerProfile.businessName"
                                  value={formData.providerProfile.businessName}
                                  onChange={handleInputChange}
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label">Years of Experience</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="providerProfile.experience"
                                  value={formData.providerProfile.experience}
                                  onChange={handleInputChange}
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label">About Your Services</label>
                                <textarea
                                  className="form-control"
                                  name="providerProfile.description"
                                  value={formData.providerProfile.description}
                                  onChange={handleInputChange}
                                  rows={3}
                                  placeholder="Describe the services you offer..."
                                />
                              </div>
                            </>
                          )}

                          <div className="form-check mb-4">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="terms"
                              checked={agreeToTerms}
                              onChange={(e) => setAgreeToTerms(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="terms">
                              I agree to the{" "}
                              <Link to="#" className="text-primary">Terms of Service</Link>
                              {" "}and{" "}
                              <Link to="#" className="text-primary">Privacy Policy</Link>
                            </label>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-lg btn-outline-primary w-50"
                              onClick={() => setStep(1)}
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="btn btn-lg btn-linear-primary w-50"
                              disabled={loading}
                            >
                              {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                          </div>
                        </>
                      )}

                      <div className="mt-4 text-center">
                        <p>
                          Already have an account?{" "}
                          <Link to={routes.login} className="text-primary">
                            Sign In
                          </Link>
                        </p>
                      </div>

                      <div className="login-or mt-4">
                        <span className="or-line" />
                        <span className="span-or">Or sign up with</span>
                      </div>

                      <div className="social-login mt-4">
                        <div className="row">
                          <div className="col-6">
                            <Link to="#" className="btn btn-google w-100">
                              <ImageWithBasePath
                                src="assets/img/icons/google.svg"
                                className="me-2"
                                alt="Google"
                              />
                              Google
                            </Link>
                          </div>
                          <div className="col-6">
                            <Link to="#" className="btn btn-google w-100">
                              <ImageWithBasePath
                                src="assets/img/icons/fb.svg"
                                className="me-2"
                                alt="Facebook"
                              />
                              Facebook
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <ImageWithBasePath
                        src="assets/img/bg/authentication-bg.png"
                        className="bg-left-top"
                        alt="Background"
                      />
                      <ImageWithBasePath
                        src="assets/img/bg/authentication-bg.png"
                        className="bg-right-bottom"
                        alt="Background"
                      />
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

export default UnifiedSignup;