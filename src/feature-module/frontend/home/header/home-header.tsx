// src\feature-module\frontend\home\header\home-header.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import {
  set_header_data,
  set_toggleSidebar_data,
} from '../../../../core/data/redux/action';
import * as Icon from 'react-feather';
import { AppState, Header } from '../../../../core/models/interface';
import { header } from '../../../../core/data/json/header';
import { useAuth } from '../../../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

type props = {
  type: number;
};

const HomeHeader: React.FC<props> = ({ type }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const routes = all_routes;
  const location = useLocation();
  const header_data = header;
  const toggle_data = useSelector((state: AppState) => state.toggleSidebar);
  const [scrollYPosition, setScrollYPosition] = useState<number>(0);
  const [close, setClose] = useState<boolean>(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imageUrl, setImageUrl] = useState({
    logo: '',
    logoSmall: '',
    logoSvg: '',
  });
  
  const dispatch = useDispatch();

  const toogle = () => {
    dispatch(set_toggleSidebar_data(!toggle_data));
  };

  const activeRouterPath = (routesArray: Header) => {
    let checkActive = false;
    header_data.map((mainMenus: { menu: any }) => {
      mainMenus.menu.map((menus: Header) => {
        checkActive = location.pathname == menus.routes ? true : false;
      });
    });
    const all_routes: string[] = [];
    routesArray.map((item: Header) => {
      all_routes.push(item.routes);
    });
    return all_routes.includes(location.pathname);
  };

  const setHeaderData = () => {
    dispatch(set_header_data([]));
  };

  const handleScroll = () => {
    setScrollYPosition(scrollY);
  };

  useEffect(() => {
    const submenus = document.querySelectorAll('.has-submenu');
    submenus.forEach((submenu) => {
      const listItems = submenu.querySelectorAll('li');
      const listItems2 = submenu.querySelectorAll('.single-demo');
      submenu.classList.remove('active');
      listItems.forEach((item) => {
        if (item.classList.contains('active')) {
          submenu.classList.add('active');
          return;
        }
      });
      listItems2.forEach((item) => {
        if (item.classList.contains('active')) {
          submenu.classList.add('active');
          return;
        }
      });
    });
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const routerPath = (pathType: number) => {
    switch (pathType) {
      case 1:
        return { path: routes.homeOne, className: 'header-one' };
      case 2:
        return { path: routes.homeOne, className: 'header-one' };
      case 3:
        return { path: routes.homeTwo, className: 'header-two' };
      case 4:
        return { path: routes.homeThree, className: 'header-three' };
      case 5:
        return { path: routes.homeFour, className: 'header-four' };
      case 6:
        return { path: routes.homeFive, className: 'header-five' };
      case 7:
        return { path: routes.homeSix, className: 'header-six' };
      case 8:
        return { path: routes.homeSeven, className: 'header-seven' };
      case 9:
        return { path: routes.homeEight, className: 'header-eight' };
      case 10:
        return { path: routes.homeNine, className: 'header-nine' };
      case 11:
        return { path: routes.index, className: 'header-one' };
      default:
        return { path: routes.homeOne, className: 'header-one' };
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // Make sure logout completes
      setShowLogoutModal(false);
      toast.success('Logged out successfully');
      navigate(routes.index); // Navigate to home page instead of login
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };


  const renderButtons = () => {
    if (isAuthenticated && user) {
      return (
        <>
          <ul className="nav header-navbar-rht">
            <div className="nav-item">
              <Link 
                to={user.userType === 'provider' ? routes.providerDashboard : routes.customerDashboard} 
                className="nav-link btn btn-light"
              >
                <i className="ti ti-user me-2"></i>Dashboard
              </Link>
            </div>
            <div className="nav-item">
              <Link 
                to="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowLogoutModal(true);
                }} 
                className="nav-link btn btn-primary"
              >
                <i className="ti ti-logout me-2"></i>Logout
              </Link>
            </div>
          </ul>

          {showLogoutModal && (
            <>
              <div 
                className="modal fade show" 
                style={{ display: 'block' }}
                tabIndex={-1}
                role="dialog"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirm Logout</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowLogoutModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      Are you sure you want to log out?
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowLogoutModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleLogout} // Use the new handler
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show"></div>
            </>
          )}
        </>
      );
    }
  
    return (
      <ul className="nav header-navbar-rht">
        <li className="nav-item pe-1">
          <Link className="nav-link btn btn-light" to={routes.signup}>
            <i className="ti ti-user-plus me-2"></i>Join Us
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link btn btn-primary" to={routes.login}>
            <i className="ti ti-lock me-2"></i>Login
          </Link>
        </li>
      </ul>
    );
  };
  useEffect(() => {
    type == 1 || type == 4 || type == 10
      ? setImageUrl({
          logo: 'assets/img/logo.png',
          logoSmall: 'assets/img/logo-small.png',
          logoSvg: 'assets/img/logo.svg',
        })
      : setImageUrl({
          logo: 'assets/img/logo-02.svg',
          logoSmall: 'assets/img/logo-icon.png',
          logoSvg: 'assets/img/logo-02.svg',
        });
  }, [type]);

  return (
    <>
      <header
        className={`header ${routerPath(type).className} ${
          scrollYPosition > 200 ? 'fixed' : ''
        }`} 
      >
        <div className={`${type == 4 || type == 1 ? 'container' : 'container'}`}>
          <nav className="navbar navbar-expand-lg header-nav">
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
              <Link to={routes.index} className="navbar-brand logo-small">
                <ImageWithBasePath
                  src="assets/img/logo-small.svg"
                  className="img-fluid"
                  alt="Logo"
                />
              </Link>
            </div>
            <div className="main-menu-wrapper">
              <div className="menu-header">
                <Link to={routerPath(type).path} className="menu-logo">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </Link>
                <Link onClick={toogle} id="menu_close" className="menu-close" to="#">
                  <i className="fas fa-times" />
                </Link>
              </div>
              <ul className="main-nav align-items-lg-center">
                {header_data.map((item: any, index: number) => (
                  <li key={index + 1} className="nav-item">
                    <Link to={item.routes}>{item.tittle}</Link>
                  </li>
                ))}
              </ul>
            </div>
            {renderButtons()}
          </nav>
        </div>
      </header>
    </>
  );
};

export default HomeHeader;