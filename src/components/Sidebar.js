import React from "react";
import { Link, useLocation } from "react-router-dom";
import { House, Mortarboard, Hospital, Tree } from "react-bootstrap-icons";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Home", icon: <House size={18} /> },
    { path: "/education", label: "Education", icon: <Mortarboard size={18} /> },
    { path: "/health", label: "Health", icon: <Hospital size={18} /> },
    { path: "/agriculture", label: "Agriculture", icon: <Tree size={18} /> },
    {path: "/map", label: "GIS", icon: <Mortarboard size={18} />}
  ];

  return (
    <div
      style={{
        width: isOpen ? "220px" : "70px",
        backgroundColor: "#fff",
        borderRight: "1px solid #e5e7eb",
        minHeight: "calc(100vh - 56px)", // subtract navbar height
        transition: "width 0.3s",
        padding: "12px",
      }}
    >
      {/* Section Header
      {isOpen && (
        <div
          style={{
            fontWeight: "bold",
            fontSize: "0.85rem",
            color: "#2563eb",
            marginBottom: "12px",
          }}
        >
          GARUDALYTICS ONLINE GIS
        </div>
      )} */}

      {/* Menu */}
      <nav>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                fontSize: "0.95rem",
                color: active ? "#000" : "#374151",
                fontWeight: active ? "600" : "400",
                backgroundColor: active ? "#e0f2fe" : "transparent",
                padding: "8px 10px",
                borderRadius: "6px",
                marginBottom: "6px",
              }}
            >
              {item.icon}
              {isOpen && <span style={{ marginLeft: "8px" }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
