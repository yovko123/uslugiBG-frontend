import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { serviceApi } from '../../../../core/service/serviceApi';
import StickyBox from 'react-sticky-box';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import config from '../../../../config/config';
import { all_routes } from '../../../../core/data/routes/all_routes';
import ServiceImageGallery from './ServiceImageGallery';
import { MapPin, Phone, Mail, Building2, UserCircle } from 'lucide-react';

interface ServiceImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

interface ServiceData {
  id: number;
  title: string;
  description: string;
  categoryId: string;
  price: number;
  priceType: 'fixed' | 'hourly';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  serviceImages: ServiceImage[];
  bookings: any[];
  provider: {
    id: number;
    companyName?: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

const ServiceDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error('Service ID is required');
        }

        const response = await serviceApi.getService(Number(id));
        
        if (response.success && response.data) {
          setService(response.data);
        } else {
          setError(response.message || 'Failed to fetch service details');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!service) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Service not found</AlertDescription>
      </Alert>
    );
  }

  const fullAddress = [
    service.address,
    service.city,
    service.state,
    service.postalCode
  ].filter(Boolean).join(', ');

  return (
    <>
      <BreadCrumb title="Service Details" item1="Service" item2="Service Details" />
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row">
              <div className="col-xl-8">
                <div className="card border-0">
                  <div className="card-body">
                    {/* Service Header */}
                    <div className="service-head mb-4">
                      <div className="d-flex align-items-start justify-content-between flex-wrap">
                        <div>
                          <h3 className="mb-2">{service.title}</h3>
                          {fullAddress && (
                            <div className="d-flex align-items-center text-muted mb-2">
                              <MapPin className="me-2" size={16} />
                              <p className="mb-0">{fullAddress}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Image Gallery */}
                    {service.serviceImages?.length > 0 && (
                      <div className="service-wrap mb-4">
                        <ServiceImageGallery 
                          images={service.serviceImages}
                          config={config}
                        />
                      </div>
                    )}

                    {/* Service Details */}
                    <div className="service-details mb-4">
                      <h4 className="mb-3">Service Overview</h4>
                      <div className="card bg-light-200 border-0">
                        <div className="card-body">
                          <div className="service-description mb-4">
                            <p>{service.description}</p>
                          </div>
                          <div className="price-info">
                            <h5 className="mb-3">Price Information</h5>
                            <div className="bg-white p-3 rounded">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fs-16 fw-medium">
                                  {service.priceType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                                </span>
                                <span className="fs-18 fw-bold text-primary">
                                  BGN {service.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="col-xl-4">
                <StickyBox>
                  <div className="card border-0">
                    <div className="card-body">
                      <h4 className="mb-4">Service Provider</h4>
                      <div className="provider-info">
                        <div className="d-flex align-items-center mb-3">
                          <UserCircle className="me-2" size={24} />
                          <h5 className="mb-0">
                            {service.provider.user.firstName} {service.provider.user.lastName}
                          </h5>
                        </div>
                        
                        {service.provider.companyName && (
                          <div className="d-flex align-items-center mb-3">
                            <Building2 className="me-2" size={16} />
                            <p className="mb-0">{service.provider.companyName}</p>
                          </div>
                        )}

                        {service.provider.user.phone && (
                          <div className="d-flex align-items-center mb-3">
                            <Phone className="me-2" size={16} />
                            <a 
                              href={`tel:${service.provider.user.phone}`}
                              className="text-decoration-none"
                            >
                              {service.provider.user.phone}
                            </a>
                          </div>
                        )}

                        {service.provider.user.email && (
                          <div className="d-flex align-items-center mb-4">
                            <Mail className="me-2" size={16} />
                            <a 
                              href={`mailto:${service.provider.user.email}`}
                              className="text-decoration-none text-break"
                            >
                              {service.provider.user.email}
                            </a>
                          </div>
                        )}
                      </div>

                      <Link 
                        to={all_routes.booking} 
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                      >
                        Book Service
                      </Link>
                    </div>
                  </div>
                </StickyBox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetails;