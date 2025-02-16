import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import CustomerSideBar from '../common/sidebar';
import { useAuth } from '../../../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import config from '../../../../config/config';

const SecuritySetting = () => {
  const routes = all_routes;
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState(Array(6).fill(false));
  const [phone, setPhone] = useState(user?.phone || '');
  const [phone2, setPhone2] = useState('');
  
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };

  const handleOnChange = (value: string, country: string) => {
    setPhone(value);
  };

  const handleOnChange2 = (value: string, country: string) => {
    setPhone2(value);
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    try {
      const formData = new FormData(form);
      const currentPassword = formData.get('currentPassword') as string;
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${config.API_URL}/api/users/settings/security`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      // Success case
      toast.success(data.message || 'Password updated successfully');
      
      // Reset form fields manually
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => input.value = '');

      // Close modal using data-bs-dismiss
      const closeButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }

    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password. Please try again.');
    }
  };

  return (
    <>
      <BreadCrumb title="Settings" item1="Customer" item2="Settings" />
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-3 col-lg-4 ">
                <CustomerSideBar />
              </div>
              <div className="col-xl-9 col-lg-8">
                <h4 className="mb-3">Security Settings</h4>
                {/* Keep existing card structure */}
                <div className="row justify-content-center align-items-center">
                  {/* Password Card */}
                  <div className="col-xxl-4 col-md-6">
                    <div className="card dash-widget-2">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <span className="set-icon bg-light d-flex justify-content-center align-items-center rounded-circle p-1 me-2">
                            <i className="ti ti-lock text-dark fs-20" />
                          </span>
                          <div>
                            <p className="mb-0 text-gray-9 fw-medium">Password</p>
                            <span className="fs-12 text-truncate">
                              Last Changed: {" "}
                              <span className="text-gray-9">
                                {user?.lastPasswordChange 
                                  ? new Date(user.lastPasswordChange).toLocaleDateString('en-GB')
                                  : "Never changed"}
                              </span>
                            </span>
                          </div>
                        </div>
                        <Link
                          to="#"
                          className="btn btn-dark"
                          data-bs-toggle="modal"
                          data-bs-target="#change-password"
                        >
                          Change Password
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* Keep other existing cards */}
                  {/* ... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <div className="modal fade custom-modal" id="change-password">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content doctor-profile">
        <div className="modal-header d-flex align-items-center justify-content-between border-bottom">
          <h5 className="modal-title">Change Password</h5>
          <Link
            to="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-circle-x-filled fs-20" />
          </Link>
        </div>
        <form onSubmit={handlePasswordUpdate}>
          <div className="modal-body p-4">
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <div className="pass-group">
                <input
                  type={selectedItems[1] ? 'text' : 'password'}
                  className="form-control pass-input"
                  name="currentPassword"
                  placeholder="*************"
                  required
                />
                <span 
                  onClick={() => handleItemClick(1)} 
                  className={`toggle-password feather ${selectedItems[1] ? 'icon-eye' : 'icon-eye-off'}`}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="pass-group" id="passwordInput">
                <input
                  type={selectedItems[2] ? 'text' : 'password'}
                  className="form-control pass-input"
                  name="newPassword"
                  placeholder="*************"
                  required
                />
                <span 
                  onClick={() => handleItemClick(2)} 
                  className={`toggle-password feather ${selectedItems[2] ? 'icon-eye' : 'icon-eye-off'}`}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <div className="pass-group">
                <input
                  type={selectedItems[3] ? 'text' : 'password'}
                  className="form-control pass-input"
                  name="confirmPassword"
                  placeholder="*************"
                  required
                />
                <span 
                  onClick={() => handleItemClick(3)} 
                  className={`toggle-password feather ${selectedItems[3] ? 'icon-eye' : 'icon-eye-off'}`}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-top">
            <div className="acc-submit">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <button type="submit" className="btn btn-dark">
                Update Password
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

      {/* Keep other existing modals */}
      {/* ... */}
    </>
  );
};

export default SecuritySetting;