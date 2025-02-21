import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { serviceApi } from '../../../../core/service/serviceApi';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import config from '../../../../config/config';

interface ServiceType {
  id: number;
  title: string;
  description: string;
  price: number;
  priceType: string;
  city: string;
  state: string;
  address: string;
  postalCode: string;
  categoryId: number;
  category: {
    name: string;
  };
  serviceImages: Array<{
    imageUrl: string;
  }>;
  rating?: number;
}

interface ServiceFormData {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  priceType: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 6;

const ProviderServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState<ServiceFormData>({
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalServices, setTotalServices] = useState(0);

  const routes = all_routes;

  useEffect(() => {
    fetchServices();
  }, [activeTab, sortBy, currentPage]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Pass pagination parameters (page & limit) along with sort and active status
      const response = await serviceApi.getMyServices({
        isActive: activeTab === 'active',
        sortBy,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });
      if (response.success) {
        setServices(response.data || []);
        setTotalServices(response.total || 0);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (service: ServiceType) => {
    navigate(`${routes.editService}/${service.id}`);
  };

  const handleStatusChange = async () => {
    if (!selectedService) return;
    
    try {
      await serviceApi.updateService(selectedService.id, {
        isActive: targetStatus === 'active'
      });
      toast.success(`Service ${targetStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      setShowStatusModal(false);
      fetchServices();
    } catch (error) {
      toast.error('Failed to update service status');
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      await serviceApi.deleteService(selectedService.id);
      toast.success('Service deleted successfully');
      setShowDeleteModal(false);
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const renderServiceCard = (service: ServiceType) => (
    <div key={service.id} className="col-lg-3 col-md-4 col-sm-6">
      <div className="card p-0" style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div className="card-body p-0" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="img-sec position-relative" style={{ 
              paddingTop: '60%', // 5:3 aspect ratio
              width: '100%',
              overflow: 'hidden',
              backgroundColor: '#f8f9fa'
            }}>
            <Link 
              to={`${routes.serviceDetails1}?id=${service.id}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'block'
              }}
            >
              {service.serviceImages?.[0]?.imageUrl ? (
                <img
                  src={`${config.ASSETS_URL}${service.serviceImages[0].imageUrl}`}
                  alt={service.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'assets/img/services/service-01.jpg';
                  }}
                />
              ) : (
                <ImageWithBasePath
                  src="assets/img/services/service-01.jpg"
                  alt={service.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              )}
            </Link>
            <div className="image-tag d-flex justify-content-between align-items-center">
              <span className="trend-tag">{service.category?.name}</span>
              {service.rating && (
                <span className="trend-tag-2 d-flex justify-content-center align-items-center rating text-gray">
                  <i className="fa fa-star filled me-1" />
                  {service.rating?.toFixed(1)}
                </span>
              )}
            </div>
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
              <h5>
                {service.price} BGN
                {service.priceType === 'HOURLY' && '/hr'}
              </h5>
            </div>
            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              {activeTab === 'active' ? (
                <>
                  <Link 
                    to={`${routes.editService.replace(':id', service.id.toString())}`} 
                    className="btn btn-outline-primary btn-sm me-2"
                  >
                    <i className="ti ti-edit me-1" />Edit
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setSelectedService(service);
                      setTargetStatus('inactive');
                      setShowStatusModal(true);
                    }}
                  >
                    <i className="ti ti-info-circle me-1" />Inactive
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="#"
                    className="btn btn-outline-danger btn-sm me-2"
                    onClick={() => {
                      setSelectedService(service);
                      setShowDeleteModal(true);
                    }}
                  >
                    <i className="ti ti-trash me-1" />Delete
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-outline-success btn-sm"
                    onClick={() => {
                      setSelectedService(service);
                      setTargetStatus('active');
                      setShowStatusModal(true);
                    }}
                  >
                    <i className="ti ti-info-circle me-1" />Active
                  </Link>
                </>
              )}
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
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="row">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
              <h5>My Services</h5>
              <div className="d-flex align-items-center">
                <span className="fs-14 me-2">Sort</span>
                <div className="dropdown me-2">
                  <button
                    className="btn btn-light dropdown-toggle"
                    type="button"
                    id="sortDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {sortBy === 'newest' && 'Newly Added'}
                    {sortBy === 'oldest' && 'Oldest First'}
                    {sortBy === 'a-z' && 'A to Z'}
                    {sortBy === 'z-a' && 'Z to A'}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="sortDropdown">
                    <li>
                      <button
                        className={`dropdown-item ${sortBy === 'newest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy('newest');
                          setCurrentPage(1);
                        }}
                      >
                        Recently Added
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${sortBy === 'oldest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy('oldest');
                          setCurrentPage(1);
                        }}
                      >
                        Oldest First
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${sortBy === 'a-z' ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy('a-z');
                          setCurrentPage(1);
                        }}
                      >
                        A to Z
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${sortBy === 'z-a' ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy('z-a');
                          setCurrentPage(1);
                        }}
                      >
                        Z to A
                      </button>
                    </li>
                  </ul>
                </div>
                <Link to={routes.createService} className="btn btn-dark d-flex align-items-center">
                  <i className="ti ti-circle-plus me-2" />Add Services
                </Link>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="tab-list mb-4" role="tablist">
                <ul className="nav d-flex align-items-center">
                  <li>
                    <Link
                      to="#"
                      className={`act-btn ${activeTab === 'active' ? 'active' : ''} me-3 p-2 rounded fs-14`}
                      onClick={() => {
                        setActiveTab('active');
                        setCurrentPage(1);
                      }}
                    >
                      Active Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className={`act-btn ${activeTab === 'inactive' ? 'active' : ''} p-2 rounded fs-14`}
                      onClick={() => {
                        setActiveTab('inactive');
                        setCurrentPage(1);
                      }}
                    >
                      Inactive Services
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="tab-content pt-0">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center">
                    <p>No {activeTab} services found.</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {services.map(service => renderServiceCard(service))}
                  </div>
                )}
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

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this service?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleDelete}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Status Change Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {targetStatus === 'active' ? 'Activate' : 'Deactivate'} Service
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to {targetStatus === 'active' ? 'activate' : 'deactivate'} this service?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleStatusChange}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProviderServices;
