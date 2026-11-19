import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Report from "./page/Report.jsx";
import Organisasi from "./page/organisasi.jsx";
import Home from "./page/Home.jsx";
import MemberProfile from "./page/MemberProfile.jsx";
import LiveBoard from "./page/LiveBoard.jsx";
import Admin from "./page/Admin.jsx";
import Takwim from "./page/Takwim.jsx";
import MaintenanceGuard from "./components/MaintenanceGuard.jsx";
import { trackPageView } from "./firebase";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MaintenanceGuard>
        <Home />
      </MaintenanceGuard>
    ),
  },
  {
    path: "/organisasi",
    element: (
      <MaintenanceGuard>
        <Organisasi />
      </MaintenanceGuard>
    ),
  },
  {
    path: "/Cadangan",
    element: (
      <MaintenanceGuard>
        <Report />
      </MaintenanceGuard>
    ),
  },
  {
    path: "/member/:id",
    element: (
      <MaintenanceGuard>
        <MemberProfile />
      </MaintenanceGuard>
    ),
  },
  {
    path: "/live-board",
    element: (
      <MaintenanceGuard>
        <LiveBoard />
      </MaintenanceGuard>
    ),
  },
  {
    path: "/takwim",
    element: (
      <MaintenanceGuard>
        <Takwim />
      </MaintenanceGuard>
    ),
  },
  {
    path: "/admin",
    element: <Admin />,
  },
]);

if (typeof window !== "undefined") {
  trackPageView(window.location.pathname + window.location.search);
  router.subscribe((state) => {
    trackPageView(state.location.pathname + state.location.search);
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
