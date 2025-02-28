import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { all_routes } from '../../../../core/data/routes/all_routes'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'
import CustomDropdown from '../../common/dropdown/commonSelect'
import { paymentOption, serviceOption, staffOption, statusOption2 } from '../../../../core/data/json/dropDownData'
import CommonDatePicker from '../../../../core/hooks/commonDatePicker'
import { useAuth } from '../../../../core/contexts/AuthContext'
import config from '../../../../config/config'

// Add these interfaces to match provider-profile-settings.tsx
interface Booking {
  id: number;
  serviceName: string;
  serviceImage: string;
  date: string;
  providerName: string;
  providerImage: string;
  paymentMethod: string;
  amount: number;
  status: string;
}

const CustomerDetails = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer bookings/transactions
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config.API_URL}/api/bookings/provider/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        setBookings(data.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id, token]);

  // Function to get CSS class based on status
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'badge-success-100';
      case 'pending':
        return 'badge-info-transparent';
      case 'overdue':
        return 'badge-danger-transparent';
      case 'draft':
        return 'bg-warning-transparent';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content container-fluid">
          <h4 className="mb-4">Customers Details</h4>
          <div className="row">
            <div className="col-xxl-6 col-lg-6">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between pb-3 border-bottom mb-3">
                    <h6>Personal Info</h6>
                    <span className="badge badge-success-100 d-flex align-items-center">
                      <i className="ti ti-point-filled me-1" />
                      Active
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-4">
                    <span className="avatar avatar-lg flex-shrink-0 me-2">
                      <ImageWithBasePath
                        src="assets/img/user/user-01.jpg"
                        className="rounded-circle"
                        alt="Img"
                      />
                    </span>
                    <div>
                      <div className="d-flex flex-wrap row-gap-2">
                        <h6 className="me-2 fw-medium">Harvey Smith</h6>
                        <span className="badge bg-primary-transparent">
                          Last Booking : 16/04/2024
                        </span>
                      </div>
                      <span className="fs-14">harvey@example.com</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                    <div>
                      <h6 className="fs-14">Phone</h6>
                      <span className="fs-14">+1 634 967 2145</span>
                    </div>
                    <div>
                      <h6 className="fs-14">Total Bookings</h6>
                      <span className="fs-14">60</span>
                    </div>
                    <div>
                      <h6 className="fs-14">Payments</h6>
                      <span className="fs-14">4</span>
                    </div>
                    <div>
                      <h6 className="fs-14">Created On</h6>
                      <span className="fs-14">14/01/2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-6 col-lg-6">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex pb-3 border-bottom mb-4">
                    <h6>Address Info</h6>
                  </div>
                  <div className="d-flex align-items-center mb-4">
                    <div>
                      <h6 className="me-2 fs-14">Adddress</h6>
                      <span className="fs-14">
                        {" "}
                        7865 Oakwood Drive, Apt 5B, Willow Creek Estates
                      </span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                    <div>
                      <h6 className="fs-14">Country</h6>
                      <span className="fs-14">United States</span>
                    </div>
                    <div>
                      <h6 className="fs-14">State</h6>
                      <span className="fs-14">California</span>
                    </div>
                    <div>
                      <h6 className="fs-14">City</h6>
                      <span className="fs-14">Greenfield</span>
                    </div>
                    <div>
                      <h6 className="fs-14">Zip Code</h6>
                      <span className="fs-14">93927</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
              <h4>Services Info</h4>
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <span className="fs-14 me-2">Sort</span>
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Newly Added
                  </Link>
                  <div className="dropdown-menu">
                    <Link to="#" className="dropdown-item active">
                      Ascending
                    </Link>
                    <Link to="#" className="dropdown-item">
                      Descending
                    </Link>
                  </div>
                </div>
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Export
                  </Link>
                  <div className="dropdown-menu">
                    <Link to="#" className="dropdown-item active">
                      Export as PDF
                    </Link>
                    <Link to="#" className="dropdown-item">
                      Export as Excel
                    </Link>
                  </div>
                </div>
                <Link
                  to="#"
                  className="tags d-flex justify-content-center align-items-center border rounded me-2"
                >
                  <i className="ti ti-printer" />
                </Link>
                <Link
                  to="#"
                  className="tags d-flex justify-content-center align-items-center border rounded me-2"
                  id="filter_search"
                >
                  <i className="ti ti-sort-descending" />
                </Link>
              </div>
            </div>
            <div id="filter_inputs">
              <div className="row">
                <div className="col-lg-3 col-md-6 col-xl">
                  <div className="mb-3">
                    <div className="sel-cal react-calender Calendar-icon">
                      <span>
                        <i className="ti ti-calendar-month" />
                      </span>
                      <CommonDatePicker/>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-xl">
                  <div className="mb-3">
                  <CustomDropdown
                    options={serviceOption}
                    className="select d-flex"
                    placeholder="Select"
                />
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-xl">
                  <div className="mb-3">
                  <CustomDropdown
                    options={staffOption}
                    className="select d-flex"
                    placeholder="Select"
                />
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-xl">
                  <div className="mb-3">
                  <CustomDropdown
                    options={paymentOption}
                    className="select d-flex"
                    placeholder="Select"
                />
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-xl">
                  <div className="mb-3">
                  <CustomDropdown
                    options={statusOption2}
                    className="select d-flex"
                    placeholder="Select"
                />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card-table">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-center table-hover datatable">
                      <thead className="thead-light">
                        <tr>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Provider</th>
                          <th>Payment Method</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="text-center">Loading...</td>
                          </tr>
                        ) : bookings.length > 0 ? (
                          bookings.map((booking, index) => (
                            <tr key={booking.id || index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Link
                                    to={all_routes.serviceDetails1}
                                    className="avatar avatar-lg me-2"
                                  >
                                    <ImageWithBasePath
                                      src={booking.serviceImage || "assets/img/providers/provider-default.jpg"}
                                      className="rounded"
                                      alt="service"
                                    />
                                  </Link>
                                  <h6 className="fs-14">
                                    <Link to={all_routes.serviceDetails1}>{booking.serviceName}</Link>
                                  </h6>
                                </div>
                              </td>
                              <td>{booking.date}</td>
                              <td className="d-flex align-items-center">
                                <Link
                                  to={all_routes.staffDetails}
                                  className="avatar avatar-lg me-2"
                                >
                                  <ImageWithBasePath
                                    src={booking.providerImage || "assets/img/profiles/avatar-default.jpg"}
                                    className="rounded-circle"
                                    alt="provider"
                                  />
                                </Link>
                                <h6 className="fs-14">
                                  <Link to={all_routes.staffDetails}>{booking.providerName}</Link>
                                </h6>
                              </td>
                              <td>{booking.paymentMethod}</td>
                              <td>${booking.amount}</td>
                              <td>
                                <div className="d-flex justify-content-center align-items-center">
                                  <span className={`badge ${getStatusClass(booking.status)} d-flex align-items-center`}>
                                    <i className="ti ti-point-filled" />
                                    {booking.status}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center">No bookings found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  )
}

export default CustomerDetails