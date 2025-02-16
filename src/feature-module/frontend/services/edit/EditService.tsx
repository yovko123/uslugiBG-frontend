import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceApi } from '../../../../core/service/serviceApi';
import config from '../../../../config/config';

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
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        price: '',
        priceType: 'HOURLY',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch categories
            const categoriesResponse = await serviceApi.getCategories();
            setCategories(categoriesResponse.data || []);

            // Fetch service details
            if (!id) return;
            const response = await serviceApi.getService(parseInt(id, 10));
            const service = response.data;

            if (service) {
                setFormData({
                    title: service.title,
                    description: service.description,
                    categoryId: service.categoryId.toString(),
                    price: service.price.toString(),
                    priceType: service.priceType,
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        setNewImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    };

    const handleRemoveNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteImage = async (imageId: number) => {
        try {
            await serviceApi.deleteServiceImage(imageId);
            setCurrentImages(prev => prev.filter(img => img.id !== imageId));
            toast.success('Image deleted successfully');
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            setSubmitting(true);
            const submitData = new FormData();

            submitData.append('data', JSON.stringify({
                title: formData.title,
                description: formData.description,
                categoryId: parseInt(formData.categoryId),
                price: parseFloat(formData.price),
                priceType: formData.priceType,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                isActive: formData.isActive
            }));

            submitData.append('keepImageIds', JSON.stringify(currentImages.map(img => img.id)));
            newImages.forEach(image => submitData.append('files', image));

            await serviceApi.updateService(parseInt(id, 10), submitData);
            toast.success('Service updated successfully');
            navigate(-1);
        } catch (error) {
            toast.error('Failed to update service');
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

    return (
        <div className="page-wrapper">
            <div className="content container-fluid">
                <div className="row">
                    <div className="col-12">
                        <h4 className="mb-4">Edit Service</h4>
                        <form onSubmit={handleSubmit}>
                            
                            {/* Basic Information Section */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
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
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-select"
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
                                <div className="col-12">
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
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
                            </div>

                            {/* Pricing Section */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Price</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Price Type</label>
                                        <select
                                            className="form-select"
                                            name="priceType"
                                            value={formData.priceType}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="HOURLY">Hourly</option>
                                            <option value="FIXED">Fixed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="mb-3">
                                        <label className="form-label">Address</label>
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
                                        <label className="form-label">City</label>
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
                                        <label className="form-label">State</label>
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
                                        <label className="form-label">Postal Code</label>
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

                            {/* Image Management Section */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h5 className="mb-3">Service Images</h5>
                                    
                                    {/* Existing Images */}
                                    {currentImages.length > 0 && (
                                        <div className="mb-4">
                                            <h6 className="fw-bold mb-3">Current Images</h6>
                                            <div className="d-flex flex-wrap gap-3">
                                                {currentImages.map((img) => (
                                                    <div key={img.id} className="position-relative">
                                                        <img
                                                            src={`${config.ASSETS_URL}${img.imageUrl}`}
                                                            alt="Service image"
                                                            className="img-thumbnail rounded"
                                                            style={{
                                                                width: '150px',
                                                                height: '150px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                            onClick={() => handleDeleteImage(img.id)}
                                                        >
                                                            <i className="ti ti-trash" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Upload */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            {currentImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleImageChange}
                                            multiple
                                            accept="image/*"
                                        />
                                        <small className="text-muted">
                                            Maximum 5 images (JPEG, PNG, WEBP) • Max size: 5MB per image
                                        </small>
                                    </div>

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
                                                            className="img-thumbnail rounded"
                                                            style={{
                                                                width: '150px',
                                                                height: '150px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                            onClick={() => handleRemoveNewImage(index)}
                                                        >
                                                            <i className="ti ti-trash" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Buttons */}
                            <div className="row">
                                <div className="col-12 d-flex justify-content-end gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Updating...' : 'Update Service'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditService;