import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { TagsInput } from 'react-tag-input-component';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import CustomerSideBar from '../common/sidebar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

// Make sure the path matches your project structure
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: Date | null;
  bio: string;
  address: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  language: string[];
  countryId: number;
  stateId: number | null;
  cityId: number | null;
}

// Add these location interfaces
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

// Add this constant for Bulgaria
const BULGARIA_COUNTRY = { id: 1, name: 'Bulgaria', code: 'BG' };

const CustomerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
    bio: user?.bio || '',
    address: user?.address || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    language: user?.language ? user.language.split(',') : [],
    countryId: BULGARIA_COUNTRY.id,
    stateId: null as number | null,
    cityId: null as number | null,
  });

  // Gender options - move this before the state initialization
  const gender = [
    { name: 'Select Gender' },
    { name: 'Male' },
    { name: 'Female' }
  ];

  // Initialize UI component states
  const [selectedGender, setGender] = useState(() => {
    // Find the matching gender object or default to "Select Gender"
    return gender.find(g => g.name === user?.gender) || gender[0];
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    // Try to parse the date in different formats if it exists
    if (user?.dateOfBirth) {
      // Log for debugging
      console.log('Initial dateOfBirth:', user.dateOfBirth);
      
      try {
        return new Date(user.dateOfBirth);
      } catch (e) {
        console.error('Error parsing date:', e);
        return null;
      }
    }
    return null;
  });

  // Add these location states
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  // Create state variables for selections
  const [selectedCountry] = useState<Country>(BULGARIA_COUNTRY);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  useEffect(() => {
    // Update form data and UI component states when user data changes
    if (user) {
      // Use type assertion to avoid TypeScript errors with location IDs
      const typedUser = user as any;
      
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
        country: typedUser.country || 'Bulgaria',
        state: typedUser.state || '',
        city: typedUser.city || '',
        postalCode: typedUser.postalCode || '',
        language: typedUser.language ? typedUser.language.split(',') : [],
        countryId: BULGARIA_COUNTRY.id,
        stateId: typedUser.stateId || null,
        cityId: typedUser.cityId || null,
      });
      
      // Update UI component states
      setGender(gender.find(g => g.name === typedUser.gender) || gender[0]);
      setSelectedDate(typedUser.dateOfBirth ? new Date(typedUser.dateOfBirth) : null);
    }
  }, [user]);

  useEffect(() => {
    const fetchStates = async () => {
      setLoadingLocations(true);
      try {
        const response = await fetch(`${config.API_URL}/api/locations/states?countryId=${BULGARIA_COUNTRY.id}`);
        if (!response.ok) throw new Error('Failed to fetch states');
        
        const data = await response.json();
        setStates(data.data || []);
        
        // If user has a stateId, find and select that state - fix type issues
        const typedUser = user as any;
        if (typedUser?.stateId) {
          const userState = data.data.find((state: State) => state.id === typedUser.stateId);
          if (userState) {
            setSelectedState(userState);
            fetchCities(userState.id);
          }
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoadingLocations(false);
      }
    };
    
    fetchStates();
  }, [user]);
  
  const fetchCities = async (stateId: number) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`${config.API_URL}/api/locations/cities?stateId=${stateId}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      
      const data = await response.json();
      setCities(data.data || []);
      
      // If user has a cityId, find and select that city - fix type issues
      const typedUser = user as any;
      if (typedUser?.cityId) {
        const userCity = data.data.find((city: City) => city.id === typedUser.cityId);
        if (userCity) {
          setSelectedCity(userCity);
          // Auto-set postal code
          setFormData(prev => ({
            ...prev,
            postalCode: userCity.postalCode
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenderChange = (e: { value: { name: string } }) => {
    setGender(e.value);
    setFormData(prev => ({
      ...prev,
      gender: e.value.name
    }));
  };

  const handleLanguageChange = (e: { value: string[] }) => {
    setFormData(prev => ({
      ...prev,
      language: e.value
    }));
  };

  const handleStateChange = (e: { value: State | null }) => {
    setSelectedState(e.value);
    
    // Reset city when state changes
    setSelectedCity(null);
    
    setFormData(prev => ({
      ...prev,
      stateId: e.value ? e.value.id : null,
      cityId: null,
      postalCode: ''
    }));
    
    // Fetch cities for the selected state
    if (e.value) {
      fetchCities(e.value.id);
    } else {
      setCities([]);
    }
  };
  
  const handleCityChange = (e: { value: City | null }) => {
    setSelectedCity(e.value);
    
    setFormData(prev => ({
      ...prev,
      cityId: e.value ? e.value.id : null,
      // Auto-populate postal code
      postalCode: e.value ? e.value.postalCode : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use auth_token instead of token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      // Prepare the data for submission
      const dataToSubmit = {
        ...formData,
        language: (formData.language ?? []).join(','),
        // Ensure location IDs are sent correctly
        countryId: BULGARIA_COUNTRY.id,
        stateId: formData.stateId || null,
        cityId: formData.cityId || null
      };

      const response = await fetch(`${config.API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
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
      <BreadCrumb title="Settings" item1="Customer" item2="Settings" />
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-3 col-lg-4">
                <CustomerSideBar />
              </div>
              <div className="col-xl-9 col-lg-8">
                <h4 className="mb-3">Account Settings</h4>
                <form onSubmit={handleSubmit}>
                  {/* Profile Picture Section */}
                  <h6 className="mb-4">Profile Picture</h6>
                  <div className="d-flex align-items-center mb-4">
                    <span className="avatar avatar-xl me-2">
                      <ImageWithBasePath
                        src="assets/img/profiles/avatar-02.jpg"
                        className="rounded-circle"
                        alt={`${formData.firstName}'s profile`}
                      />
                    </span>
                    <div>
                      <Link to="#" className="btn btn-dark me-2 mb-2">
                        <i className="feather icon-upload-cloud me-1" />
                        Upload
                      </Link>
                      <Link to="#" className="btn btn-light mb-2">
                        Remove
                      </Link>
                      <p>
                        *image size should be at least 320px big, and less than 500kb. Allowed
                        files .png and .jpg.
                      </p>
                    </div>
                  </div>

                  {/* General Information */}
                  <h6>General Information</h6>
                  <div className="general-info mb-0">
                    <div className="row mb-4">
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
                            className="form-control"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
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
                              onFocus={e => e.target.blur()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Your Bio</label>
                          <textarea 
                            className="form-control" 
                            rows={5}
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <h6 className="user-title">Address</h6>
                    <div className="row">
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
                      <div className="col-md-6" style={{ display: 'none' }}> {/* Hide country */}
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
                            disabled={loadingLocations}
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
                            readOnly={!!selectedCity}
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
                          <label className="form-label">Language</label>
                          <MultiSelect
                            value={formData.language}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                language: e.value
                              }));
                            }}
                            options={languageOptions}
                            placeholder="Select Languages"
                            className="select w-100"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="acc-submit d-flex justify-content-end align-items-center">
                      <Link to="#" className="btn btn-light me-2">
                        Cancel
                      </Link>
                      <button 
                        type="submit" 
                        className="btn btn-dark"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProfile;