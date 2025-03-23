import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { toast } from 'react-toastify';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import { serviceApi } from '../../../../core/service/serviceApi';
import config from '../../../../config/config';
import heic2any from 'heic2any';

interface ServiceImage {
    id: number;
    imageUrl: string;
    isMain: boolean;
}

interface Service {
    id: number;
    title: string;
    description: string;
    categoryId: string;
    price: string;
    priceType: 'HOURLY' | 'FIXED';
    bookingType: 'DIRECT' | 'INQUIRY';
    address: string;
    city: string;
    state: string;
    postalCode: string;
    isActive: boolean;
    serviceImages?: ServiceImage[];
}

interface Category {
    id: number;
    name: string;
}

const EditService = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentImages, setCurrentImages] = useState<ServiceImage[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        price: '',
        priceType: 'HOURLY' as 'HOURLY' | 'FIXED',
        bookingType: 'DIRECT' as 'DIRECT' | 'INQUIRY',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        isActive: true
    });

    const IMAGE_LIMITS = {
        MAX_FILES: 5,
        MAX_FILE_SIZE: 3 * 1024 * 1024,
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'],
        ALLOWED_MIME_TYPES: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif'
        ]
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            newImagePreviews.forEach(URL.revokeObjectURL);
        };
    }, [newImagePreviews]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesResponse, serviceResponse] = await Promise.all([
                serviceApi.getCategories(),
                id ? serviceApi.getService(parseInt(id, 10)) : Promise.resolve(null)
            ]);

            setCategories(categoriesResponse.data || []);

            if (serviceResponse?.data) {
                const service = serviceResponse.data;
                setFormData({
                    title: service.title,
                    description: service.description,
                    categoryId: service.categoryId.toString(),
                    price: service.price.toString(),
                    priceType: service.priceType,
                    bookingType: service.bookingType || 'DIRECT',
                    address: service.address || '',
                    city: service.city || '',
                    state: service.state || '',
                    postalCode: service.postalCode || '',
                    isActive: service.isActive
                });

                if (service.serviceImages) {
                    setCurrentImages(service.serviceImages);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch service details');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Will continue in Part 2...
    // ... continued from Part 1

    const validateForm = (): boolean => {
        const errors: string[] = [];
        
        if (!formData.title.trim()) errors.push('Service title is required');
        if (!formData.description.trim()) errors.push('Description is required');
        if (!formData.categoryId) errors.push('Category is required');
        if (!formData.price || parseFloat(formData.price) <= 0) errors.push('Valid price is required');
        if (!formData.address.trim()) errors.push('Address is required');
        if (!formData.city.trim()) errors.push('City is required');
        if (!formData.state.trim()) errors.push('State is required');
        if (!formData.postalCode.trim()) errors.push('Postal code is required');
        
        setFormErrors(errors);
        return errors.length === 0;
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        const totalCurrentImages = currentImages.length - imagesToDelete.length;
        const availableSlots = IMAGE_LIMITS.MAX_FILES - totalCurrentImages - newImages.length;
        
        if (availableSlots <= 0) {
            toast.error(`Maximum ${IMAGE_LIMITS.MAX_FILES} images allowed`);
            return;
        }
    
        const files = Array.from(e.target.files);
        const filesToProcess = files.slice(0, availableSlots);
        
        try {
            // Process all files at once
            const processedFiles = await Promise.all(
                filesToProcess.map(async (file) => {
                    if (file.size > IMAGE_LIMITS.MAX_FILE_SIZE) {
                        throw new Error(`File ${file.name} is too large. Maximum size is ${IMAGE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
                    }

                    // Generate preview and process file
                    let processedFile = file;
                    let previewUrl: string;
                    
                    if (file.name.toLowerCase().match(/\.(heic|heif)$/)) {
                        const convertedBlob = await heic2any({
                            blob: file,
                            toType: 'image/jpeg',
                            quality: 0.85
                        }) as Blob;
                        processedFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                            type: 'image/jpeg'
                        });
                        previewUrl = URL.createObjectURL(convertedBlob);
                    } else {
                        previewUrl = URL.createObjectURL(file);
                    }

                    return { file: processedFile, previewUrl };
                })
            );
    
            // Update state with valid files and their previews
            setNewImages(prev => [...prev, ...processedFiles.map(p => p.file)]);
            setNewImagePreviews(prev => [...prev, ...processedFiles.map(p => p.previewUrl)]);
    
            // Show message if some files were skipped
            if (files.length > availableSlots) {
                toast.warning(`Only ${availableSlots} more image${availableSlots === 1 ? '' : 's'} can be added`);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error processing images');
        }
    };

    const handleRemoveNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        
        // Clean up the preview URL before removing it from state
        URL.revokeObjectURL(newImagePreviews[index]);
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteImage = (imageId: number) => {
        setImagesToDelete(prev => [...prev, imageId]);
        setCurrentImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !validateForm()) return;

        const totalImages = currentImages.length - imagesToDelete.length + newImages.length;
        if (totalImages > IMAGE_LIMITS.MAX_FILES) {
            toast.error(`Maximum ${IMAGE_LIMITS.MAX_FILES} images allowed. Please remove some images.`);
            return;
        }

        try {
            setSubmitting(true);
            const submitData = new FormData();
    
            // Append all form fields
            Object.entries(formData).forEach(([key, value]) => {
                submitData.append(key, value.toString());
            });
            
            // Append image IDs to delete
            submitData.append('deleteImageIds', JSON.stringify(imagesToDelete));

            // Append new images
            newImages.forEach(image => {
                submitData.append('images', image);
            });
    
            const response = await serviceApi.updateService(parseInt(id, 10), submitData);
            
            if (response.success) {
                toast.success('Service updated successfully');
                navigate(-1);
            } else {
                toast.error(response.message || 'Failed to update service');
                setFormErrors([response.message || 'Failed to update service']);
            }
        } catch (error: any) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update service';
            toast.error(errorMessage);
            setFormErrors([errorMessage]);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading service details...</p>
            </div>
        );
    }

// ... continued from Part 2

return (
    <>
        <BreadCrumb title="Edit Service" item1="Service" item2="Edit Service"/>
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

                            <div className="card">
                                <div className="card-body">
                                    <h4 className="mb-4">Basic Information</h4>
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            {/* Basic Information Section */}
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
                                                        {categories.map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
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
                                                                value="FIXED"
                                                                checked={formData.priceType === 'FIXED'}
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
                                                                value="HOURLY"
                                                                checked={formData.priceType === 'HOURLY'}
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
                                                            placeholder={`Enter ${formData.priceType.toLowerCase()} price`}
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

{/* Location Section */}
<div className="col-12">
                                                    <h4 className="mb-3 mt-4">Location</h4>
                                                </div>

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

                                                {/* Images Section */}
                                                <div className="col-12">
                                                    <h4 className="mb-3 mt-4">Service Images</h4>
                                                    
                                                    {/* Image Upload Input */}
                                                    <div className="mb-4">
                                                        <label className="form-label">
                                                            Images ({currentImages.length - imagesToDelete.length + newImages.length}/{IMAGE_LIMITS.MAX_FILES})
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            onChange={handleImageChange}
                                                            multiple
                                                            accept={[...IMAGE_LIMITS.ALLOWED_MIME_TYPES, "image/heic", "image/heif", ".heic", ".heif"].join(',')}
                                                            disabled={currentImages.length - imagesToDelete.length >= IMAGE_LIMITS.MAX_FILES}
                                                        />
                                                        <small className="text-muted d-block mt-1">
                                                            Maximum {IMAGE_LIMITS.MAX_FILES} images
                                                        </small>
                                                        <small className="text-muted d-block">
                                                            Allowed types: {IMAGE_LIMITS.ALLOWED_EXTENSIONS.join(', ')} • Max size: {IMAGE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB
                                                        </small>
                                                    </div>

                                                    {/* Current Images */}
                                                    {currentImages.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="d-flex flex-wrap gap-3">
                                                                {currentImages.map((img) => (
                                                                    <div key={img.id} className="position-relative">
                                                                        <img
                                                                            src={`${config.ASSETS_URL}${img.imageUrl}`}
                                                                            alt="Service"
                                                                            className="img-thumbnail"
                                                                            style={{
                                                                                width: '150px',
                                                                                height: '150px',
                                                                                objectFit: 'cover'
                                                                            }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                                            onClick={() => handleDeleteImage(img.id)}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* New Image Previews */}
                                                    {newImagePreviews.length > 0 && (
                                                        <div className="mt-3">
                                                            <h6 className="fw-bold mb-3">New Images Preview</h6>
                                                            <div className="d-flex flex-wrap gap-3">
                                                                {newImagePreviews.map((preview, index) => (
                                                                    <div key={index} className="position-relative">
                                                                        <img
                                                                            src={preview}
                                                                            alt={`New image ${index + 1}`}
                                                                            className="img-thumbnail"
                                                                            style={{
                                                                                width: '150px',
                                                                                height: '150px',
                                                                                objectFit: 'cover'
                                                                            }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                                            onClick={() => handleRemoveNewImage(index)}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

{/* Form Buttons */}
<div className="col-12">
                                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            onClick={() => navigate(-1)}
                                                            disabled={submitting}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary"
                                                            disabled={submitting}
                                                        >
                                                            {submitting ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Updating...
                                                                </>
                                                            ) : (
                                                                'Update Service'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditService;