import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { toast } from 'react-toastify';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import { serviceApi } from '../../../../core/service/serviceApi';

interface ServiceFormData {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  priceType: 'fixed' | 'hourly';
  bookingType: 'DIRECT' | 'INQUIRY';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  images: File[];
}

const CreateService = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    categoryId: '',
    price: 0,
    priceType: 'fixed',
    bookingType: 'DIRECT',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    images: []
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 3);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('Service title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.categoryId) errors.push('Category is required');
    if (!formData.price || formData.price <= 0) errors.push('Valid price is required');
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.city.trim()) errors.push('City is required');
    if (!formData.state.trim()) errors.push('State is required');
    if (!formData.postalCode.trim()) errors.push('Postal code is required');
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    const isValid = currentStep === 1 ? validateStep1() : validateStep2();
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
      setFormErrors([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setFormErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images') {
          submitData.append(key, value.toString());
        }
      });
      formData.images.forEach(image => {
        submitData.append('images', image);
      });

      const response = await serviceApi.createService(submitData);

      if (response.success) {
        toast.success('Service created successfully!');
        navigate('/providers/provider-service');
      } else {
        toast.error(response.message || 'Failed to create service');
        setFormErrors([response.message || 'Failed to create service']);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred while creating the service';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <BreadCrumb title='Create a Service' item1="Service" item2="Create a Service"/>
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                {formErrors.length > 0 && formErrors.map((error, index) => (
                  <Alert key={index} variant="destructive" className="mb-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
                
                <div className="service-wizard mb-4">
                  <ul className="d-flex align-items-center">
                    <li className={currentStep === 1 ? 'active' : ''}>
                      <span><i className="ti ti-info-circle" /></span>
                      <h6>Basic Information</h6>
                    </li>
                    <li className={currentStep === 2 ? 'active' : ''}>
                      <span><i className="ti ti-map-pin" /></span>
                      <h6>Location</h6>
                    </li>
                  </ul>
                </div>

                {currentStep === 1 && (
                  <div className="card">
                    <div className="card-body">
                      <h4 className="mb-3">Basic Information</h4>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Service Title <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Category <span className="text-danger">*</span></label>
                            <select
                              className="form-control"
                              name="categoryId"
                              value={formData.categoryId}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Category</option>
                              <option value="1">House Cleaning</option>
                              <option value="2">Car Wash</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Price Type <span className="text-danger">*</span></label>
                            <div className="d-flex gap-3 mb-2">
                              <div className="form-check">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  id="priceTypeFixed"
                                  name="priceType"
                                  value="fixed"
                                  checked={formData.priceType === 'fixed'}
                                  onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="priceTypeFixed">
                                  Fixed Price
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  id="priceTypeHourly"
                                  name="priceType"
                                  value="hourly"
                                  checked={formData.priceType === 'hourly'}
                                  onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="priceTypeHourly">
                                  Per Hour
                                </label>
                              </div>
                            </div>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                min="0"
                                required
                                placeholder={`Enter ${formData.priceType === 'fixed' ? 'fixed' : 'hourly'} price`}
                              />
                              <span className="input-group-text">BGN</span>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Booking Type <span className="text-danger">*</span></label>
                            <div className="d-flex gap-3 mb-2">
                              <div className="form-check">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  id="bookingTypeDirect"
                                  name="bookingType"
                                  value="DIRECT"
                                  checked={formData.bookingType === 'DIRECT'}
                                  onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="bookingTypeDirect">
                                  Direct Booking
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  id="bookingTypeInquiry"
                                  name="bookingType"
                                  value="INQUIRY"
                                  checked={formData.bookingType === 'INQUIRY'}
                                  onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="bookingTypeInquiry">
                                  Inquiry Booking
                                </label>
                              </div>
                            </div>
                            <small className="form-text text-muted">
                              {formData.bookingType === 'DIRECT' ? 
                                'Direct booking allows customers to book the service immediately.' : 
                                'Inquiry booking allows customers to send requests with details for your approval.'}
                            </small>
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Description <span className="text-danger">*</span></label>
                            <textarea
                              className="form-control"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows={4}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Images (Max 3)</label>
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                            />
                            <div className="mt-2 d-flex gap-2">
                              {imagePreviewUrls.map((url, index) => (
                                <div key={index} className="position-relative">
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                    onClick={() => removeImage(index)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-light" disabled>
                          Previous
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleNext}>
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="card">
                    <div className="card-body">
                      <h4 className="mb-3">Location</h4>
                      <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Address <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">City <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">State <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">Postal Code <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between">
                          <button type="button" className="btn btn-light" onClick={handlePrev}>
                            Previous
                          </button>
                          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                            Create Service
                          </button>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateService;