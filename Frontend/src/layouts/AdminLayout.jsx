import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import AccessibilityControls from "../components/AccessibilityControls/AccessibilityControls";

import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">

      <Sidebar />

      <main className="admin-content">

        <AccessibilityControls />

        <Outlet />

      </main>

    </div>
  );
}

export default AdminLayout;