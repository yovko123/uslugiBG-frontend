import React, { useEffect, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { serviceApi } from '../../../../core/service/serviceApi';
import StickyBox from 'react-sticky-box';
import VideoModal from '../../../../core/hooks/video-modal';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import config from '../../../../config/config';
import { all_routes } from '../../../../core/data/routes/all_routes';

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
    };
  };
}

const ServiceDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nav1, setNav1] = useState<Slider | null>(null);
  const [nav2, setNav2] = useState<Slider | null>(null);
  const sliderRef1 = useRef<Slider | null>(null);
  const sliderRef2 = useRef<Slider | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

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

  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);

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

  const settings1 = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: nav2 || undefined,
  };

  const settings2 = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    focusOnSelect: true,
    asNavFor: nav1 || undefined,
  };

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
                    <div className="service-head mb-2">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <h3 className="mb-2">{service.title}</h3>
                        <span className="badge badge-purple-transparent mb-2">
                          <i className="ti ti-calendar-check me-1" />
                          {service.bookings?.length || 0} Bookings
                        </span>
                      </div>
                      {(service.address || service.city) && (
                        <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                          <div className="d-flex align-items-center flex-wrap">
                            <p className="me-3 mb-2">
                              <i className="ti ti-map-pin me-2" />
                              {[service.address, service.city, service.state].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {service.serviceImages?.length > 0 && (
                      <div className="service-wrap mb-4">
                        <div className="slider-wrap">
                          <Slider ref={sliderRef1} {...settings1} className="service-carousel nav-center mb-3">
                            {service.serviceImages.map((image, index) => (
                              <div key={index} className="service-img">
                                <img 
                                  src={`${config.ASSETS_URL}${image.imageUrl}`}
                                  className="img-fluid"
                                  alt={`Service ${index + 1}`}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'assets/img/services/service-01.jpg';
                                  }}
                                />
                              </div>
                            ))}
                          </Slider>
                          <button onClick={() => setOpen(true)} className="btn btn-white btn-sm view-btn">
                            <i className="feather icon-image me-1" />
                            View all {service.serviceImages.length} Images
                          </button>
                        </div>
                        <Slider ref={sliderRef2} {...settings2} className="slider-nav-thumbnails nav-center">
                          {service.serviceImages.map((image, index) => (
                            <div key={index}>
                              <img 
                                src={`${config.ASSETS_URL}${image.imageUrl}`}
                                className="img-fluid"
                                alt={`Thumbnail ${index + 1}`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = 'assets/img/services/service-01.jpg';
                                }}
                              />
                            </div>
                          ))}
                        </Slider>
                      </div>
                    )}

                    <div className="accordion service-accordion">
                      <div className="accordion-item mb-4">
                        <h2 className="accordion-header">
                          <button className="accordion-button p-0" type="button">
                            Service Overview
                          </button>
                        </h2>
                        <div className="accordion-collapse collapse show">
                          <div className="accordion-body border-0 p-0 pt-3">
                            <div className="more-text">
                              <p>{service.description}</p>
                            </div>
                            <div className="bg-light-200 p-3 offer-wrap">
                              <h4 className="mb-3">Price Information</h4>
                              <div className="offer-item d-md-flex align-items-center justify-content-between bg-white mb-2">
                                <div className="d-sm-flex align-items-center mb-2">
                                  <div className="mb-2">
                                    <h6 className="fs-16 fw-medium">
                                      {service.priceType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                                    </h6>
                                    <p className="fs-14">
                                      BGN {service.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-4">
                <StickyBox>
                  <div className="card border-0">
                    <div className="card-body">
                      <h4 className="mb-3">Service Provider</h4>
                      <div className="provider-info">
                        <h5>
                          {service.provider.user.firstName} {service.provider.user.lastName}
                        </h5>
                        {service.provider.companyName && (
                          <p>{service.provider.companyName}</p>
                        )}
                      </div>
                      <div className="mt-4">
                        <Link to={all_routes.booking} className="btn btn-primary w-100">
                          Book Service
                        </Link>
                      </div>
                    </div>
                  </div>
                </StickyBox>
              </div>
            </div>
          </div>
        </div>
      </div>

      {service.serviceImages?.length > 0 && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={service.serviceImages.map(img => ({ 
            src: `${config.ASSETS_URL}${img.imageUrl}`,
            alt: 'Service Image'
          }))}
        />
      )}
    </>
  );
};

export default ServiceDetails;