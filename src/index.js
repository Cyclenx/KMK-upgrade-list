import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Report from './page/Report.jsx';
import Organisasi from './page/organisasi';
import Home from './page/Home.jsx'
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/organisasi",
    element: <organisasi />
  },
  {
    path: "/Cadangan",
    element: <Report />
  }
])
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />,
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
