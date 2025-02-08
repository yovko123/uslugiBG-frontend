import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { serviceApi } from '../../../../core/service/serviceApi';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

interface ServiceType {
  id: number;
  title: string;
  description: string;
  price: number;
  priceType: string;
  city: string;
  state: string;
  category: {
    name: string;
  };
  serviceImages: Array<{
    imageUrl: string;
  }>;
  rating?: number;
}

const ProviderServices = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive' | null>(null);
  const routes = all_routes;

  useEffect(() => {
    fetchServices();
  }, [activeTab, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceApi.getMyServices({
        isActive: activeTab === 'active',
        sortBy
      });
      setServices(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
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
    <div key={service.id} className="col-xl-4 col-md-6">
      <div className="card p-0">
        <div className="card-body p-0">
          <div className="img-sec w-100">
            <Link to={`\${routes.serviceDetails1}?id=\${service.id}`}>
              {service.serviceImages?.[0]?.imageUrl ? (
                <img
                  src={service.serviceImages[0].imageUrl}
                  className="img-fluid rounded-top w-100"
                  alt={service.title}
                />
              ) : (
                <ImageWithBasePath
                  src="assets/img/services/default.jpg"
                  className="img-fluid rounded-top w-100"
                  alt={service.title}
                />
              )}
            </Link>
            <div className="image-tag d-flex justify-content-end align-items-center">
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
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3">
                {activeTab === 'active' ? (
                  <>
                    <Link to={`/services/edit/${service.id}`}>
                      <i className="ti ti-edit me-2" />Edit
                    </Link>
                    <Link to="#" onClick={() => {
                      setSelectedService(service);
                      setTargetStatus('inactive');
                      setShowStatusModal(true);
                    }}>
                      <i className="ti ti-info-circle me-2" />Inactive
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="#" onClick={() => {
                      setSelectedService(service);
                      setShowDeleteModal(true);
                    }}>
                      <i className="ti ti-trash me-2" />Delete
                    </Link>
                    <Link to="#" onClick={() => {
                      setSelectedService(service);
                      setTargetStatus('active');
                      setShowStatusModal(true);
                    }}>
                      <i className="ti ti-info-circle me-2" />Active
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
                          onClick={() => setSortBy('newest')}
                        >
                          Recently Added
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'oldest' ? 'active' : ''}`}
                          onClick={() => setSortBy('oldest')}
                        >
                          Oldest First
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'a-z' ? 'active' : ''}`}
                          onClick={() => setSortBy('a-z')}
                        >
                          A to Z
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'z-a' ? 'active' : ''}`}
                          onClick={() => setSortBy('z-a')}
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

          <div className="row justify-content-center">
            <div className="col-xl-12 col-lg-12">
              <div className="tab-list mb-4" role="tablist">
                <ul className="nav d-flex align-items-center">
                  <li>
                    <Link to="#" 
                      className={`act-btn ${activeTab === 'active' ? 'active' : ''} me-3 p-2 rounded fs-14`}
                      onClick={() => setActiveTab('active')}>
                      Active Services
                    </Link>
                  </li>
                  <li>
                    <Link to="#"
                      className={"act-btn " + (activeTab === 'inactive' ? 'active' : '') + " p-2 rounded fs-14"}
                      onClick={() => setActiveTab('inactive')}>
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
                  <div className="row justify-content-center align-items-center">
                    {services.map(service => renderServiceCard(service))}
                  </div>
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
          {targetStatus ? `${targetStatus === 'active' ? 'Activate' : 'Deactivate'}` : ''} Service
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