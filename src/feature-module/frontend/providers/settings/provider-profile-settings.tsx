import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Dropdown } from 'primereact/dropdown';
import { TagsInput } from 'react-tag-input-component';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { useAuth } from '../../../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import { MultiSelect } from 'primereact/multiselect';
import config from '../../../../config/config';

const languageOptions = [
  { label: 'Bulgarian', value: 'bg' },
  { label: 'English', value: 'en' },
  { label: 'German', value: 'de' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'Italian', value: 'it' }
];

interface ProviderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: Date | null;
  bio: string;
  address: string;
  countryId: number | null;
  stateId: number | null;
  cityId: number | null;
  postalCode: string;
  currencyCode: string;
  language: string[];
}

// Location interface definitions
interface Country {
  id: number;
  name: string;
  code: string;
}

interface State {
  id: number;
  name: string;
  countryId: number;
}

interface City {
  id: number;
  name: string;
  stateId: number;
  postalCode: string;
}

// Add this type extension to handle the user type properly
interface UserWithExtendedProperties {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  bio?: string;
  address?: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  currencyCode?: string;
  language?: string;
}

// Add this constant at the top of your file, after imports
const BULGARIA_COUNTRY = { id: 1, name: 'Bulgaria', code: 'BG' };

const ProviderProfileSettings = () => {
  const { user } = useAuth();
  // Access token from localStorage or another source
  const token = localStorage.getItem('auth_token');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [birthdateError, setBirthdateError] = useState<string | null>(null);
  
  // Location data states
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  // Safely cast user to our extended type to avoid TypeScript errors
  const typedUser = user as UserWithExtendedProperties;
  
  // Gender options
  const gender = [
    { name: 'Select Gender' },
    { name: 'Male' },
    { name: 'Female' },
  ];
  
  // Simplified currency options - only BGN and EUR
  const currency = [
    { name: 'BGN', code: 'BGN' },
    { name: 'EUR', code: 'EUR' },
  ];

  // Calculate minimum valid date (must be at least 16 years old)
  const getMaxDate = () => {
    const today = new Date();
    return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  };

  // Always set Bulgaria as the selected country
  const [selectedCountry, setSelectedCountry] = useState<Country>(BULGARIA_COUNTRY);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Initialize form data with Bulgaria as country
  const [formData, setFormData] = useState<ProviderFormData>({
    firstName: typedUser?.firstName || '',
    lastName: typedUser?.lastName || '',
    email: typedUser?.email || '',
    phone: typedUser?.phone || '',
    gender: typedUser?.gender || '',
    dateOfBirth: typedUser?.dateOfBirth ? new Date(typedUser.dateOfBirth) : null,
    bio: typedUser?.bio || '',
    address: typedUser?.address || '',
    countryId: BULGARIA_COUNTRY.id, // Always set to Bulgaria
    stateId: typedUser?.stateId || null,
    cityId: typedUser?.cityId || null,
    postalCode: typedUser?.postalCode || '',
    currencyCode: typedUser?.currencyCode || 'BGN', // Default to BGN
    language: typedUser?.language ? typedUser.language.split(',') : [],
  });

  // Initialize UI component states
  const [selectedGender, setGender] = useState(() => {
    return gender.find(g => g.name === typedUser?.gender) || gender[0];
  });
  
  const [selectedCurrency, setCurrency] = useState(() => {
    // Default to BGN if not set
    const userCurrency = typedUser?.currencyCode || 'BGN';
    return currency.find(c => c.name === userCurrency) || currency[0];
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (typedUser?.dateOfBirth) {
      try {
        return new Date(typedUser.dateOfBirth);
      } catch (e) {
        console.error('Error parsing date:', e);
        return null;
      }
    }
    return null;
  });

  // Replace the fetchCountries useEffect with one that just fetches states
  useEffect(() => {
    const fetchStatesForBulgaria = async () => {
      setLoadingLocations(true);
      try {
        const response = await fetch(`${config.API_URL}/api/locations/states?countryId=${BULGARIA_COUNTRY.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }
        const data = await response.json();
        console.log("States loaded:", data.data);
        setStates(data.data || []);
      } catch (error) {
        console.error('Error fetching states:', error);
        toast.error('Failed to load states');
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchStatesForBulgaria();
  }, [token]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.stateId) {
        setCities([]);
        return;
      }
      
      setLoadingLocations(true);
      try {
        const response = await fetch(`${config.API_URL}/api/locations/cities?stateId=${formData.stateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        const data = await response.json();
        setCities(data.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to load cities');
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchCities();
  }, [formData.stateId]);

  // Set selected location objects when user data loads or IDs change
  useEffect(() => {
    // Set selected state
    if (formData.stateId && states.length > 0) {
      const state = states.find(s => s.id === formData.stateId) || null;
      setSelectedState(state);
    }
    
    // Set selected city
    if (formData.cityId && cities.length > 0) {
      const city = cities.find(c => c.id === formData.cityId) || null;
      setSelectedCity(city);
      
      // Update postal code based on selected city
      if (city && city.postalCode) {
        setFormData(prev => ({
          ...prev,
          postalCode: city.postalCode
        }));
      }
    }
  }, [formData.stateId, formData.cityId, states, cities]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      console.log('User data loaded:', user);
      
      // Safely cast user to extended type
      const typedUser = user as UserWithExtendedProperties;
      
      // Update form data
      setFormData({
        firstName: typedUser.firstName || '',
        lastName: typedUser.lastName || '',
        email: typedUser.email || '',
        phone: typedUser.phone || '',
        gender: typedUser.gender || '',
        dateOfBirth: typedUser.dateOfBirth ? new Date(typedUser.dateOfBirth) : null,
        bio: typedUser.bio || '',
        address: typedUser.address || '',
        countryId: BULGARIA_COUNTRY.id, // Always set to Bulgaria
        stateId: typedUser.stateId || null,
        cityId: typedUser.cityId || null,
        postalCode: typedUser.postalCode || '',
        currencyCode: typedUser.currencyCode || 'BGN', // Default to BGN
        language: typedUser.language ? typedUser.language.split(',') : []
      });
      
      // Update UI component states
      setGender(gender.find(g => g.name === typedUser.gender) || gender[0]);
      setCurrency(currency.find(c => c.name === (typedUser.currencyCode || 'BGN')) || currency[0]);
      setSelectedDate(typedUser.dateOfBirth ? new Date(typedUser.dateOfBirth) : null);
    }
  }, [user]);

  // Add this after your useState declarations
  useEffect(() => {
    // Temporary test data
    setStates([
      { id: 1, name: 'Sofia', countryId: 1 },
      { id: 2, name: 'Plovdiv', countryId: 1 },
      { id: 3, name: 'Varna', countryId: 1 }
    ]);
    setLoadingLocations(false);
  }, []);

  const handleDateChange = (date: Date) => {
    setBirthdateError(null);
    
    // Check if date is not in the future and user is at least 16
    const today = new Date();
    const maxDate = getMaxDate();
    
    if (date > today) {
      setBirthdateError("Birth date cannot be in the future");
      return;
    }
    
    if (date > maxDate) {
      setBirthdateError("Provider must be at least 16 years old");
      return;
    }
    
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
  };

  const validatePhoneNumber = (phone: string) => {
    // Bulgarian phone number format: +359 followed by 9 digits
    // or 0 followed by 9 digits
    const bulgarianPhoneRegex = /^(\+359|0)[0-9]{9}$/;
    
    // Allow spaces and dashes that we'll remove for validation
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    
    if (!cleanedPhone) {
      return null; // Empty is allowed
    }
    
    if (!bulgarianPhoneRegex.test(cleanedPhone)) {
      return "Please enter a valid Bulgarian phone number (+359XXXXXXXXX or 0XXXXXXXXX)";
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const error = validatePhoneNumber(value);
      setPhoneError(error);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenderChange = (e: { value: { name: string } }) => {
    setGender(e.value);
    setFormData(prev => ({
      ...prev,
      gender: e.value.name !== 'Select Gender' ? e.value.name : ''
    }));
  };

  const handleCurrencyChange = (e: { value: { name: string, code: string } }) => {
    setCurrency(e.value);
    setFormData(prev => ({
      ...prev,
      currencyCode: e.value.name
    }));
  };

  const handleStateChange = (e: { value: State | null }) => {
    setSelectedState(e.value);
    
    // When state changes, reset city
    setSelectedCity(null);
    
    setFormData(prev => ({
      ...prev,
      stateId: e.value ? e.value.id : null,
      cityId: null,
      postalCode: ''
    }));
  };

  const handleCityChange = (e: { value: City | null }) => {
    setSelectedCity(e.value);
    
    setFormData(prev => ({
      ...prev,
      cityId: e.value ? e.value.id : null,
      // Automatically set postal code from city
      postalCode: e.value ? e.value.postalCode : ''
    }));
  };

  const handleLanguageChange = (e: { value: string[] }) => {
    setFormData(prev => ({
      ...prev,
      language: e.value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validate phone number
    const phoneError = validatePhoneNumber(formData.phone);
    setPhoneError(phoneError);
    if (phoneError) isValid = false;
    
    // Validate birthdate
    if (formData.dateOfBirth) {
      const today = new Date();
      const maxDate = getMaxDate();
      
      if (formData.dateOfBirth > today) {
        setBirthdateError("Birth date cannot be in the future");
        isValid = false;
      } else if (formData.dateOfBirth > maxDate) {
        setBirthdateError("Provider must be at least 16 years old");
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      // Format the phone number if needed
      let formattedPhone = formData.phone;
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+359' + formattedPhone.substring(1);
        }
      }

      const dataToSend = {
        ...formData,
        phone: formattedPhone,
        language: (formData.language ?? []).join(',')
      };

      console.log('Form data being sent:', dataToSend);

      const response = await fetch(`${config.API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage with new user data
      if (data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="row">
            <div className="col-md-10 mx-auto">
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                <h5>Account Settings</h5>
              </div>
            </div>
          </div>
          {/* Profile settings */}
          <div className="row">
            <div className="col-md-10 mx-auto">
              {/* Account Settings */}
              <div className="card mb-0">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <h6 className="user-title">Profile Picture</h6>
                    <div className="pro-picture">
                      <div className="pro-img avatar avatar-xl">
                        <ImageWithBasePath
                          src="assets/img/user/user-02.jpg"
                          alt="user"
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="pro-info">
                        <div className="d-flex mb-2">
                          <Link
                            to="#"
                            className="btn btn-dark btn-sm d-flex align-items-center me-3"
                          >
                            <i className="ti ti-cloud-upload me-1" />
                            Upload
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-light btn-sm d-flex align-items-center"
                          >
                            Remove
                          </Link>
                        </div>
                        <p className="fs-14">
                          *image size should be at least 320px big,and less then
                          500kb. Allowed files .png and .jpg.
                        </p>
                      </div>
                    </div>
                    <h6 className="user-title">General Information</h6>
                    <div className="general-info">
                      <div className="row">
                        <div className="col-md-6">
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
                        </div>
                        <div className="col-md-6">
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
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input 
                              type="email" 
                              className="form-control"
                              value={formData.email}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Mobile Number</label>
                            <input 
                              type="text" 
                              className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+359XXXXXXXXX or 0XXXXXXXXX"
                            />
                            {phoneError && <div className="invalid-feedback">{phoneError}</div>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Gender</label>
                            <Dropdown
                              value={selectedGender}
                              onChange={handleGenderChange}
                              options={gender}
                              optionLabel="name"
                              placeholder="Select Gender"
                              className="select w-100"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Date of birth</label>
                            <div className={`input-icon react-calender position-relative ${birthdateError ? 'is-invalid' : ''}`}>
                              <span className="input-icon-addon">
                                <i className="ti ti-calendar" />
                              </span>
                              <DatePicker
                                selected={selectedDate}
                                onChange={handleDateChange}               
                                placeholderText='DD/MM/YYYY'
                                className={`form-control datetimepicker w-100 ${birthdateError ? 'is-invalid' : ''}`}
                                dateFormat="dd/MM/yyyy"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                yearDropdownItemNumber={100}
                                maxDate={new Date()}
                                onFocus={e => e.target.blur()}
                              />
                            </div>
                            {birthdateError && <div className="invalid-feedback d-block">{birthdateError}</div>}
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div>
                            <label className="form-label">Your Bio</label>
                            <textarea 
                              className="form-control" 
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <h6 className="user-title">Address </h6>
                    <div className="row address-info">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input 
                            type="text" 
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6" style={{ display: 'none' }}> {/* Hide it completely */}
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <input 
                            type="text" 
                            className="form-control"
                            value="Bulgaria"
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">State/Province</label>
                          <Dropdown
                            value={selectedState}
                            onChange={handleStateChange}
                            options={states}
                            optionLabel="name"
                            placeholder="Select State"
                            className="select w-100"
                            disabled={false}
                            emptyMessage="Select a state"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <Dropdown
                            value={selectedCity}
                            onChange={handleCityChange}
                            options={cities}
                            optionLabel="name"
                            placeholder="Select City"
                            className="select w-100"
                            disabled={loadingLocations || !selectedState || cities.length === 0}
                            emptyMessage={loadingLocations ? "Loading cities..." : selectedState ? "No cities available" : "Select a state first"}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Postal Code</label>
                          <input 
                            type="text" 
                            className="form-control"
                            name="postalCode"
                            value={formData.postalCode}
                            readOnly={!!selectedCity} // Make read-only if a city is selected
                            placeholder={selectedCity ? "Automatically set from city" : "Enter postal code"}
                            onChange={handleInputChange}
                          />
                          {selectedCity && 
                            <small className="form-text text-muted">
                              Postal code is automatically set based on the selected city.
                            </small>
                          }
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Currency Code</label>
                          <Dropdown
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            options={currency}
                            optionLabel="name"
                            placeholder="Choose Currency"
                            className="select w-100"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Language</label>
                          <MultiSelect
                            value={formData.language}
                            onChange={(e) => handleLanguageChange(e)}
                            options={languageOptions}
                            placeholder="Select Languages"
                            className="w-100"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="acc-submit d-flex justify-content-end">
                      <Link to="#" className="btn btn-light me-3">
                        Cancel
                      </Link>
                      <button 
                        type="submit"
                        className="btn btn-dark"
                        disabled={loading || !!phoneError || !!birthdateError}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            {/* /Account Settings */}
          </div>
          {/* /profile-settings */}
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default ProviderProfileSettings;
