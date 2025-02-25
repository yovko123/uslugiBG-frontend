import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Slider } from 'antd';
import { Dropdown } from 'primereact/dropdown';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import StickyBox from 'react-sticky-box';
import { serviceApi, ServiceParams } from '../../../../core/service/serviceApi';
import { toast } from 'react-toastify';
import config from '../../../../config/config';

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  priceType: string;
  city: string;
  state: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  serviceImages: Array<{
    imageUrl: string;
  }>;
  provider: {
    user: {
      profileImage?: string;
    };
  };
  rating?: number;
}

interface Category {
  id: number;
  name: string;
}

interface ServiceFilters {
  keyword: string;
  categoryIds: number[];
  city: string;
  priceMin: string;
  priceMax: string;
  sortBy: SortType;
}

type SortType = 'newest' | 'price_asc' | 'price_desc';

const ITEMS_PER_PAGE = 6;

const ServiceGrid = () => {
  const routes = all_routes;
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [globalPriceRange, setGlobalPriceRange] = useState<[number, number]>([0, 1000]);

  // Separate form values from applied filters
  const [formValues, setFormValues] = useState<ServiceFilters>({
    keyword: '',
    categoryIds: [],
    city: '',
    priceMin: '0',
    priceMax: '1000',
    sortBy: 'newest'
  });
  
  // Applied filters will only change when the Apply button is clicked
  const [appliedFilters, setAppliedFilters] = useState<ServiceFilters>({
    keyword: '',
    categoryIds: [],
    city: '',
    priceMin: '0',
    priceMax: '1000',
    sortBy: 'newest'
  });
  
  // Calculate actual price range from services

  useEffect(() => {
    if (services.length > 0 && globalPriceRange[0] === 0 && globalPriceRange[1] === 1000) {
      const prices = services.map(service => service.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      // Set a bit of padding on the range for better UX
      const paddedMin = Math.max(0, Math.floor(minPrice * 0.9));
      const paddedMax = Math.ceil(maxPrice * 1.1);
      
      setGlobalPriceRange([paddedMin, paddedMax]);
      
      // Initialize form values with this range
      setFormValues(prev => ({
        ...prev,
        priceMin: paddedMin.toString(),
        priceMax: paddedMax.toString()
      }));
      
      setAppliedFilters(prev => ({
        ...prev,
        priceMin: paddedMin.toString(),
        priceMax: paddedMax.toString()
      }));
    }
  }, [services]);

  const [isExpanded, setIsExpanded] = useState(false);
  const filterCheckboxStyle = {
    height: isExpanded ? 'auto' : '150px',
    overflow: 'hidden',
    transition: 'height 0.3s ease'
  };

  // Only fetch services when appliedFilters or page changes
  useEffect(() => {
    fetchServices();
  }, [currentPage, appliedFilters]);

  // Fetch categories once on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await serviceApi.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
      setCategories([]);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const apiParams: ServiceParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isActive: true,
        keyword: appliedFilters.keyword || undefined,
        city: appliedFilters.city || undefined,
        priceMin: appliedFilters.priceMin,
        priceMax: appliedFilters.priceMax,
        sortBy: appliedFilters.sortBy
      };
      
      // Add category IDs if any are selected
      if (appliedFilters.categoryIds && appliedFilters.categoryIds.length > 0) {
        // Send the category IDs as a comma-separated string
        apiParams.categoryId = appliedFilters.categoryIds.join(',');
      }
  
      const response = await serviceApi.getServices(apiParams);
      
      if (response.success) {
        setServices(response.data);
        setTotalServices(response.total);
      } else {
        setServices([]);
        setTotalServices(0);
      }
    } catch (error) {
      toast.error('Failed to fetch services');
      setServices([]);
      setTotalServices(0);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters on form submission
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when applying filters
    setAppliedFilters(formValues); // Apply the form values as filters
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetValues = {
      keyword: '',
      categoryIds: [],
      city: '',
      priceMin: globalPriceRange[0].toString(),
      priceMax: globalPriceRange[1].toString(),
      sortBy: appliedFilters.sortBy // Keep the current sort type
    };
    
    setFormValues(resetValues);
    setAppliedFilters(resetValues);
  };

  // Update form values without triggering API calls
  const handlePriceChange = (value: [number, number]): void => {
    setFormValues(prev => ({
      ...prev,
      priceMin: value[0].toString(),
      priceMax: value[1].toString()
    }));
  };

  const handleCategoryChange = (categoryId: number): void => {
    setFormValues(prev => {
      // Check if category is already selected
      const isSelected = prev.categoryIds.includes(categoryId);
      
      if (isSelected) {
        // Remove the category if already selected
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter(id => id !== categoryId)
        };
      } else {
        // Add the category if not selected
        return {
          ...prev,
          categoryIds: [...prev.categoryIds, categoryId]
        };
      }
    });
  };

  const toggleHeight = () => {
    setIsExpanded(!isExpanded);
  };

  // Apply sort immediately as it's typically expected behavior
  const handleSort = (sortType: SortType): void => {
    const newSortValue = {
      ...formValues,
      sortBy: sortType
    };
    
    setFormValues(newSortValue);
    setAppliedFilters(newSortValue); // Apply sort immediately
  };

  const handleSliderChange = (value: number | number[]): void => {
    if (Array.isArray(value) && value.length === 2) {
      handlePriceChange([value[0], value[1]]);
    }
  };

  const renderServiceCard = (service: Service) => (
    <div key={service.id} className="col-xl-4 col-md-6">
      <div className="card p-0">
        <div className="card-body p-0">
          <div className="img-sec w-100 position-relative" style={{ height: '200px', overflow: 'hidden' }}>
            <Link to={`${routes.serviceDetails1}?id=${service.id}`}>
              {service.serviceImages?.[0]?.imageUrl ? (
                <img
                  src={`${config.ASSETS_URL}${service.serviceImages[0].imageUrl}`}
                  className="img-fluid w-100 h-100"
                  alt={service.title}
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'assets/img/services/service-01.jpg';
                  }}
                />
              ) : (
                <ImageWithBasePath
                  src="assets/img/services/service-01.jpg"
                  className="img-fluid w-100 h-100"
                  alt={service.title}
                  style={{ objectFit: 'cover' }}
                />
              )}
            </Link>
            <div className="image-tag d-flex justify-content-end align-items-center">
              <span className="trend-tag">{service.category?.name}</span>
            </div>
            <span className="image-logo avatar avatar-md border rounded-circle">
              {service.provider?.user?.profileImage ? (
                <img
                  src={`${config.ASSETS_URL}${service.provider.user.profileImage}`}
                  className="img-fluid rounded-circle"
                  alt="Provider"
                />
              ) : (
                <ImageWithBasePath
                  src="assets/img/providers/provider-01.jpg"
                  className="img-fluid rounded-circle"
                  alt="Provider"
                />
              )}
            </span>
          </div>
          <div className="p-3">
            <h5 className="mb-2 text-truncate">
              <Link to={`${routes.serviceDetails1}?id=${service.id}`}>
                {service.title}
              </Link>
            </h5>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="fs-14 mb-0">
                <i className="ti ti-map-pin me-2" />
                {service.city}, {service.state}
              </p>
              {service.rating && (
                <span className="rating text-gray fs-14">
                  <i className="fa fa-star filled me-1" />
                  {service.rating?.toFixed(1)}
                </span>
              )}
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <h5>
                {service.price} BGN
                {service.priceType === 'HOURLY' && '/hr'}
              </h5>
              <Link
                to={`${routes.booking}?serviceId=${service.id}`}
                className="btn bg-primary-transparent"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const totalPages = Math.ceil(totalServices / ITEMS_PER_PAGE);
  const pagination = [];
  for (let i = 1; i <= totalPages; i++) {
    pagination.push(
      <li key={i} className={`page-item me-2 ${currentPage === i ? 'active' : ''}`}>
        <Link
          className="page-link-1 d-flex justify-content-center align-items-center"
          to="#"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Link>
      </li>
    );
  }

  return (
    <>
      <BreadCrumb title='Services' item1='Services'/>
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row">
              {/* Filter Sidebar */}
              <div className="col-xl-3 col-lg-4 theiaStickySidebar">
                <StickyBox>
                  <div className="card">
                    <div className="card-body">
                      <form onSubmit={handleApplyFilters}>
                        <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                          <h5>
                            <i className="ti ti-filter-check me-2" />
                            Filters
                          </h5>
                          <Link to="#" onClick={handleResetFilters}>Reset Filter</Link>
                        </div>

                        {/* Search Keyword */}
                        <div className="mb-3 pb-3 border-bottom">
                          <label className="form-label">Search By Keyword</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="What are you looking for?"
                            value={formValues.keyword}
                            onChange={(e) => setFormValues(prev => ({ 
                              ...prev, 
                              keyword: e.target.value 
                            }))}
                          />
                        </div>

                        {/* Categories */}
                        <div className="mb-3 pb-3 border-bottom">
                          <h6 className="mb-3">Categories <small className="text-muted">(Select multiple)</small></h6>
                          <div style={filterCheckboxStyle}>
                            {categories.map(category => (
                              <div key={category.id} className="form-check mb-2">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={formValues.categoryIds.includes(category.id)}
                                  onChange={() => handleCategoryChange(category.id)}
                                  id={`category-${category.id}`}
                                />
                                <label className="form-check-label" htmlFor={`category-${category.id}`}>
                                  {category.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          {formValues.categoryIds.length > 0 && (
                            <div className="mt-2 mb-2">
                              <span className="badge bg-primary me-1">{formValues.categoryIds.length} categories selected</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setFormValues(prev => ({...prev, categoryIds: []}))}
                              >
                                Clear All
                              </button>
                            </div>
                          )}
                          {(categories?.length > 5) && (
                            <button
                              type="button"
                              className="more-view text-primary border-0 bg-transparent"
                              onClick={toggleHeight}
                            >
                              {isExpanded ? 'View Less' : 'View More'}
                            </button>
                          )}
                        </div>

                        {/* Location */}
                        <div className="mb-3 pb-3 border-bottom">
                          <label className="form-label">Location</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter city"
                            value={formValues.city}
                            onChange={(e) => setFormValues(prev => ({ ...prev, city: e.target.value }))}
                          />
                        </div>

                        {/* Price Range */}
                        <div className="mb-3 pb-3 border-bottom">
                          <label className="form-label">Price Range (BGN)</label>
                          <Slider
                            range
                            min={globalPriceRange[0]}
                            max={globalPriceRange[1]}
                            value={[parseFloat(formValues.priceMin), parseFloat(formValues.priceMax)]}
                            onChange={handleSliderChange}
                          />
                          <div className="mt-2">
                            <span>BGN {formValues.priceMin} - BGN {formValues.priceMax}</span>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                          Apply Filters
                        </button>
                      </form>
                    </div>
                  </div>
                </StickyBox>
              </div>

              {/* Service Grid */}
              <div className="col-xl-9 col-lg-8">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Found <span className="text-primary">{totalServices} Services</span></h4>
                  <div className="d-flex align-items-center">
                    <span className="me-2">Sort by:</span>
                    <div className="dropdown">
                      <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        {appliedFilters.sortBy === 'price_asc' ? 'Price Low to High' :
                         appliedFilters.sortBy === 'price_desc' ? 'Price High to Low' :
                         'Newest First'}
                      </button>
                      <ul className="dropdown-menu">
                        <li><button className="dropdown-item" onClick={() => handleSort('newest')}>Newest First</button></li>
                        <li><button className="dropdown-item" onClick={() => handleSort('price_asc')}>Price Low to High</button></li>
                        <li><button className="dropdown-item" onClick={() => handleSort('price_desc')}>Price High to Low</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center p-5">
                    <p>No services found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {services.map(service => renderServiceCard(service))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-4">
                    <ul className="paginations d-flex justify-content-center align-items-center">
                      <li className={`page-item me-3 ${currentPage === 1 ? 'disabled' : ''}`}>
                        <Link 
                          to="#" 
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                          <i className="ti ti-arrow-left me-2" />Prev
                        </Link>
                      </li>
                      {pagination}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <Link 
                          to="#" 
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        >
                          Next<i className="ti ti-arrow-right ms-2" />
                        </Link>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceGrid;