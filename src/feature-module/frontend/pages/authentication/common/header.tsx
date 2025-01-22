import React from 'react'
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../../core/data/routes/all_routes';
import { useDispatch, useSelector } from 'react-redux';
import {
  set_header_data,
  set_toggleSidebar_data,
} from '../../../../../core/data/redux/action';
import { AppState, Header } from '../../../../../core/models/interface';

const PagesAuthHeader = () => {
  const routes = all_routes;
  const toggle_data = useSelector((state: AppState) => state.toggleSidebar);
  const dispatch = useDispatch();
  const toogle = () => {
    dispatch(set_toggleSidebar_data(toggle_data ? false : true));
  };
  return (

    <>
  {/* Header */}
  <div className="authentication-header">
    <div className="container">
      <div className="col-md-12">
        <div className="text-center">
          <div className="navbar-header">
                <Link onClick={toogle} id="mobile_btn" to="#">
                  <span className="bar-icon">
                    <span />
                    <span />
                    <span />
                  </span>
                </Link>
                <Link to={routes.index} className="navbar-brand logo">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </Link>
                <Link
                  to={routes.index}
                  className="navbar-brand logo-small"
                >
                  <ImageWithBasePath
                    src="assets/img/logo-small.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </Link>
              </div>
          
        </div>
      </div>
    </div>
  </div>
  {/* /Header */}
</>

  );
}

export default PagesAuthHeader