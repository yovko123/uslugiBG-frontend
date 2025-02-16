import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import CustomerSideBar from '../common/sidebar';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import config from '../../../../config/config';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [isProviderMode, setIsProviderMode] = useState(user?.userType === 'provider');
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    totalBookings: 0
  });

  const [providerInfo, setProviderInfo] = useState({
    companyName: '',
    description: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/users/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats({
            totalBookings: data.data?.totalBookings || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProviderInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProviderUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.API_URL}/api/users/upgrade-to-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          companyName: providerInfo.companyName,
          description: providerInfo.description
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage with new user data
        localStorage.setItem('user', JSON.stringify(data.data.user));
        toast.success('Successfully upgraded to provider!');
        setIsProviderMode(true);
        setShowProviderForm(false);
        // Force page reload to update user context
        window.location.reload();
      } else {
        setError(data.message || 'Failed to upgrade to provider');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while upgrading to provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BreadCrumb title="Dashboard" item1="Customer" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-3 col-lg-4">
                <CustomerSideBar />
              </div>
              
              <div className="col-xl-9 col-lg-8">
                {/* Welcome Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <h4 className="mb-2">Welcome back, {user?.firstName}!</h4>
                            <p className="mb-0">
                              {isProviderMode 
                                ? 'Manage your services and bookings' 
                                : 'Find and book services or start offering your own'}
                            </p>
                          </div>
                          {!isProviderMode && (
                            <button 
                              className="btn btn-primary"
                              onClick={() => setShowProviderForm(true)}
                              disabled={loading}
                            >
                              Become a Service Provider
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provider Upgrade Form */}
                {showProviderForm && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">Complete Your Provider Profile</h5>
                          {error && (
                            <div className="alert alert-danger mb-4" role="alert">
                              {error}
                            </div>
                          )}
                          <form onSubmit={handleProviderUpgrade}>
                            <div className="form-group mb-3">
                              <label htmlFor="companyName">Company Name</label>
                              <input
                                type="text"
                                className="form-control"
                                id="companyName"
                                name="companyName"
                                value={providerInfo.companyName}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="description">Description</label>
                              <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                value={providerInfo.description}
                                onChange={handleInputChange}
                                rows={4}
                                required
                              />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowProviderForm(false)}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                              >
                                {loading ? 'Upgrading...' : 'Upgrade to Provider'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Card */}
                <div className="row mb-4">
                  <div className="col-sm-6 col-md-3">
                    <div className="card">
                      <div className="card-body">
                        <h4 className="card-title">Total Bookings</h4>
                        <p className="card-text h2">{stats.totalBookings}</p>
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

export default CustomerDashboard;