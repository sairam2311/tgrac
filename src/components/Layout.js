import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppNavbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div>
      {/* Navbar always on top */}
      <AppNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Page Layout: Sidebar + Content */}
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Main content */}
        <main style={{ flexGrow: 1, padding: "16px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
