// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import { Provider } from 'react-redux';
import { AuthProvider } from './core/contexts/AuthContext';  // Add this import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './core/data/redux/store';
import "../src/style/icon/tabler-icons/webfont/tabler-icons.css";
import "../src/style/icon/feather/css/iconfont.css";
import 'aos/dist/aos.css';
import { base_path } from './environment';
import AllRoutes from './feature-module/router/router';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter basename={base_path}>
          <AuthProvider>  {/* Add AuthProvider here */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />
            <AllRoutes />
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
  );
} else {
  console.error("Element with id 'root' not found.");
}