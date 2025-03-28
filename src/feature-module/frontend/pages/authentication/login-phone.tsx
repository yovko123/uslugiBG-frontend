import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import * as Icon from 'react-feather';
import PagesAuthHeader from './common/header';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';

const LoginPhone = () => {
  const routes = all_routes;
  const [phone, setPhone] = useState('');
  const handleOnChange = (value: string, country: string) => {
    console.log(value, country);
    setPhone(value);
  };
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  return (
    <>
      <PagesAuthHeader />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-lg-6 mx-auto">
              <div className="login-wrap">
                <div className="login-header">
                  <h3>Login</h3>
                  <p>Please enter your details</p>
                  <h6>
                    Login with <Link to={routes.login}>Email</Link>
                  </h6>
                </div>
                {/* Login Form */}
                <form action={routes.customerDashboard}>
                  <div className="log-form">
                    <div className="row">
                      <div className="col-md-12">
                        <label className="col-form-label">Phone Number</label>
                        <div className="form-group">
                          <PhoneInput
                            country={'us'}
                            value={phone}
                            onChange={handleOnChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <div className="col">
                          <label className="col-form-label">Password</label>
                        </div>
                        <div className="col-auto">
                          <Link
                            className="forgot-link"
                            to={routes.passwordRecovery}
                          >
                            Forgot password?
                          </Link>
                        </div>
                      </div>
                      <div className="pass-group">
                        <input
                          type="text"
                          className="form-control pass-input"
                          placeholder="*************"
                        />
                        <span
                          className="toggle-password"
                          onClick={togglePasswordVisibility}
                        >
                          {passwordVisible ? <Icon.EyeOff /> : <Icon.Eye />}
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label className="custom_check">
                          <input
                            type="checkbox"
                            name="rememberme"
                            className="rememberme"
                          />
                          <span className="checkmark" />
                          Remember Me
                        </label>
                      </div>
                      <div className="col-6 text-end">
                        <label className="custom_check">
                          <input
                            type="checkbox"
                            name="loginotp"
                            className="loginotp"
                          />
                          <span className="checkmark" />
                          Login with OTP
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary w-100 login-btn"
                    type="submit"
                  >
                    Login
                  </button>
                  <div className="login-or">
                    <span className="or-line" />
                    <span className="span-or">OR</span>
                  </div>
                  <div className="social-login">
                    <Link to="#" className="btn btn-google w-100">
                      <ImageWithBasePath
                        src="assets/img/icons/google.svg"
                        className="me-2"
                        alt="img"
                      />
                      Login with Google
                    </Link>
                    <Link to="#" className="btn btn-google w-100">
                      <ImageWithBasePath
                        src="assets/img/icons/fb.svg"
                        className="me-2"
                        alt="img"
                      />
                      Login with Facebook
                    </Link>
                  </div>
                  <p className="no-acc">
                    Donot have an account ?{' '}
                    <Link to={routes.chooseSignUp}>Register</Link>
                  </p>
                </form>
                {/* /Login Form */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPhone;
