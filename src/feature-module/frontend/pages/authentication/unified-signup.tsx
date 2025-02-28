import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import PagesAuthHeader from './common/header';
import AuthFooter from './common/footer';
import { useAuth } from '../../../../core/contexts/AuthContext'; 
import { toast } from 'react-toastify';
import { Dropdown } from 'primereact/dropdown';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MultiSelect } from 'primereact/multiselect';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import bgLocale from 'date-fns/locale/bg';

// Language options
const languageOptions = [
  { label: 'Bulgarian', value: 'bg' },
  { label: 'English', value: 'en' },
  { label: 'German', value: 'de' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'Italian', value: 'it' }
];

interface SignupFormData {
  // Essential account info
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  
  // Profile info
  gender: string;
  dateOfBirth: Date | null;
  language: string[];
  
  // Address info (optional during signup)
  country: string;
  city: string;
  
  // Provider-specific
  isProvider: boolean;
  providerProfile: {
    businessName: string;
    experience: string;
    description: string;
  };
}

// After imports, register the locale
registerLocale('bg', {
  ...bgLocale,
  options: {
    ...bgLocale.options,
    weekStartsOn: 1  // Monday
  }
});

const UnifiedSignup = () => {
  const navigate = useNavigate();
  const routes = all_routes;
  const { register } = useAuth();

  // Gender options
  const genderOptions = [
    { name: 'Select Gender' },
    { name: 'Male' },
    { name: 'Female' }
  ];

  const [selectedGender, setGender] = useState(genderOptions[0]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form data with sensible defaults
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    dateOfBirth: null,
    language: ['bg'], // Default to Bulgarian
    country: 'Bulgaria', // Default country
    city: '',
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleGenderChange = (e: { value: { name: string } }) => {
    setGender(e.value);
    setFormData(prev => ({
      ...prev,
      gender: e.value.name === 'Select Gender' ? '' : e.value.name
    }));
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
  };

  const handleLanguageChange = (e: { value: string[] }) => {
    setFormData(prev => ({
      ...prev,
      language: e.value
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (currentStep === 2) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }
    
    if (currentStep === 3 && formData.isProvider) {
      if (!formData.providerProfile.description) {
        newErrors['providerProfile.description'] = 'Please describe your services';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      // If on step 2 and not a provider, go straight to final submit
      if (step === 2 && !formData.isProvider) {
        // No need to go to step 3, as that's for provider info
        return;
      }
      // Otherwise, proceed to next step
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }
    
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
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        language: formData.language.join(','),
        country: formData.country || undefined,
        city: formData.city || undefined,
        userType,
        ...(formData.isProvider && {
          providerProfile: {
            companyName: formData.providerProfile.businessName || undefined,
            experience: formData.providerProfile.experience || undefined,
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Email <span className="text-danger">*</span></label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Password <span className="text-danger">*</span></label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              <small className="text-muted">Must be at least 8 characters</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
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
              onClick={goToNextStep}
            >
              Continue
            </button>
          </>
        );
        
      case 2:
        return (
          <>
            <h6 className="mb-3">Personal Information</h6>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">First Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Last Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number <span className="text-danger">*</span></label>
              <PhoneInput
                country={'bg'}
                value={formData.phone}
                onChange={handlePhoneChange}
                inputClass={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              />
              {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Gender</label>
                  <Dropdown
                    value={selectedGender}
                    onChange={handleGenderChange}
                    options={genderOptions}
                    optionLabel="name"
                    placeholder="Select Gender"
                    className="select w-100"
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Date of Birth</label>
                  <div className="input-icon react-calender position-relative">
                    <span className="input-icon-addon">
                      <i className="ti ti-calendar" />
                    </span>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      placeholderText='DD/MM/YYYY'
                      className="form-control datetimepicker w-100"
                      dateFormat="dd/MM/yyyy"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      maxDate={new Date()}
                      minDate={new Date(1900, 0, 1)}
                      locale="bg"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Preferred Languages</label>
              <MultiSelect
                value={formData.language}
                onChange={handleLanguageChange}
                options={languageOptions}
                placeholder="Select Languages"
                className="select w-100"
                style={{ width: '100%' }}
              />
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
                type="button"
                className="btn btn-lg btn-linear-primary w-50"
                onClick={formData.isProvider ? goToNextStep : handleSubmit}
              >
                {formData.isProvider ? 'Continue' : 'Create Account'}
              </button>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h6 className="mb-3">Provider Information</h6>
            
            <div className="mb-3">
              <label className="form-label">Business Name <span className="text-muted">(Optional)</span></label>
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
              <label className="form-label">About Your Services <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${errors['providerProfile.description'] ? 'is-invalid' : ''}`}
                name="providerProfile.description"
                value={formData.providerProfile.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the services you offer..."
              />
              {errors['providerProfile.description'] && 
                <div className="invalid-feedback">{errors['providerProfile.description']}</div>
              }
            </div>

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
                onClick={() => setStep(2)}
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
        );
        
      default:
        return (
          <>
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
                onClick={() => setStep(2)}
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
        );
    }
  };

  return (
    <>
      <PagesAuthHeader />
      <div className="main-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-10 mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column justify-content-center">
                  <div className="card p-sm-4">
                    <div className="card-body">
                      <div className="text-center mb-4">
                        <h3 className="mb-2">Create Your Account</h3>
                        <p>Join UslugiBG to find or provide great services</p>
                        
                        {/* Progress indicator with theme-aligned colors */}
                        <div style={{ margin: '30px 0', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                backgroundColor: step >= 1 ? '#FF0080' : '#e9ecef', // Updated to site's primary accent color
                                color: step >= 1 ? 'white' : '#74788D',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 600,
                                marginBottom: '10px',
                                boxShadow: step >= 1 ? '0 0 0 3px rgba(255, 0, 128, 0.2)' : 'none' // Updated shadow color
                              }}>
                                1
                              </div>
                              <div style={{ 
                                fontSize: '14px',
                                color: step >= 1 ? '#FF0080' : '#74788D', // Updated to match site colors
                                fontWeight: step >= 1 ? 600 : 500
                              }}>
                                Account
                              </div>
                            </div>
                            
                            <div style={{ 
                              height: '3px', 
                              width: '60px', 
                              backgroundColor: step >= 2 ? '#FF0080' : '#e9ecef', // Updated to site's primary accent color
                              position: 'relative', 
                              top: '-20px' 
                            }}></div>
                            
                            {/* Apply the same color updates to the second step */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                backgroundColor: step >= 2 ? '#FF0080' : '#e9ecef',
                                color: step >= 2 ? 'white' : '#74788D',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 600,
                                marginBottom: '10px',
                                boxShadow: step >= 2 ? '0 0 0 3px rgba(255, 0, 128, 0.2)' : 'none'
                              }}>
                                2
                              </div>
                              <div style={{ 
                                fontSize: '14px',
                                color: step >= 2 ? '#FF0080' : '#74788D',
                                fontWeight: step >= 2 ? 600 : 500
                              }}>
                                Profile
                              </div>
                            </div>
                            
                            {formData.isProvider && (
                              <>
                                <div style={{ 
                                  height: '3px', 
                                  width: '60px', 
                                  backgroundColor: step >= 3 ? '#FF0080' : '#e9ecef',
                                  position: 'relative', 
                                  top: '-20px' 
                                }}></div>
                                
                                {/* Apply the same color updates to the third step */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                                  <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    backgroundColor: step >= 3 ? '#FF0080' : '#e9ecef',
                                    color: step >= 3 ? 'white' : '#74788D',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    marginBottom: '10px',
                                    boxShadow: step >= 3 ? '0 0 0 3px rgba(255, 0, 128, 0.2)' : 'none'
                                  }}>
                                    3
                                  </div>
                                  <div style={{ 
                                    fontSize: '14px',
                                    color: step >= 3 ? '#FF0080' : '#74788D',
                                    fontWeight: step >= 3 ? 600 : 500
                                  }}>
                                    Services
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {renderStep()}

                      {step === 1 && (
                        <div className="mt-4 text-center">
                          <p>
                            Already have an account?{" "}
                            <Link to={routes.login} className="text-primary">
                              Sign In
                            </Link>
                          </p>
                        </div>
                      )}

                      {step === 1 && (
                        <>
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
                        </>
                      )}
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