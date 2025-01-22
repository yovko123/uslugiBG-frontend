import React from 'react';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import PagesAuthHeader from './common/header';
import { all_routes } from '../../../../core/data/routes/all_routes';

const ChooseSignup = () => {
  const routes = all_routes;
  return (
    <>
      <PagesAuthHeader />
      <div className="content" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-8 mx-auto">
              <div className="card p-4 shadow-sm">
                <div className="text-center mb-4">
                  <h3>Choose Account Type</h3>
                  <p>Select how you want to use UslugiBG</p>
                </div>
                <div className="row g-4">
                  {/* Provider Card */}
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm hover-card">
                      <div className="card-body text-center p-4">
                        <div className="mb-4">
                          <i className="ti ti-briefcase fs-1 text-primary"></i>
                        </div>
                        <h5 className="mb-3">Service Provider</h5>
                        <p className="text-muted mb-4">Want to offer your services to customers</p>
                        <Link
                          to={routes.providerSignup}
                          className="btn btn-primary w-100"
                        >
                          Continue as Provider
                          <i className="ti ti-arrow-right ms-2"></i>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Customer Card */}
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm hover-card">
                      <div className="card-body text-center p-4">
                        <div className="mb-4">
                          <i className="ti ti-user fs-1 text-primary"></i>
                        </div>
                        <h5 className="mb-3">Customer</h5>
                        <p className="text-muted mb-4">Looking to hire service providers</p>
                        <Link
                          to={routes.userSignup}
                          className="btn btn-primary w-100"
                        >
                          Continue as Customer
                          <i className="ti ti-arrow-right ms-2"></i>
                        </Link>
                      </div>
                    </div>
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

export default ChooseSignup;
