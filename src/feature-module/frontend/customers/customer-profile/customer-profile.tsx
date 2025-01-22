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
}


const CustomerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
  });

  useEffect(() => {
    // Add this effect to update form data when user data changes
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
        bio: user.bio || '',
        address: user.address || '',           // Make sure these fields
        country: user.country || '',           // are included in the
        state: user.state || '',               // response from your
        city: user.city || '',                 // backend API
        postalCode: user.postalCode || '',
        language: user.language ? user.language.split(',') : []
      });
    }
  }, [user]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.dateOfBirth || new Date()
  );
  
  const [selectedGender, setGender] = useState({ 
    name: formData.gender || 'Select Gender' 
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      console.log('Token being sent:', token);

      const response = await fetch('http://localhost:3005/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          language: (formData.language ?? []).join(',')
        })
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

  const gender = [
    { name: 'Select Gender' },
    { name: 'Male' },
    { name: 'Female' }
  ];

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
                          <label className="form-label">State</label>
                          <input 
                            type="text" 
                            className="form-control"
                            name="state"
                            value={formData.state}
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Postal Code</label>
                          <input 
                            type="text" 
                            className="form-control"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                          />
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