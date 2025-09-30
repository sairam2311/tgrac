import React from "react";
import { List } from "react-bootstrap-icons";

const AppNavbar = ({ onToggleSidebar }) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
      }}
    >
      {/* Left Section: Logo, Name, and Toggle Button */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="http://tgracgis.telangana.gov.in/tankinformationsystem/images/Telangana_State_Emblem.png"
          alt="TGRAC logo"
          style={{ marginRight: "12px", width:"30px" }}
        />
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: "bold", color: "#2563eb" }}>TGRAC</div>
            <div style={{ fontSize: "0.75rem", color: "green" }}>Think Geo Spatial</div>
          </div>
          {/* Toggle Button placed right next to the text */}
          <button
            onClick={onToggleSidebar}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginLeft: "12px", // Ensures button is next to the text
            }}
            aria-label="Toggle Sidebar"
          >
            <List />
          </button>
        </div>
      </div>

      {/* Center Section: Heading and Caption */}
      <div
        style={{
          flexGrow: 1, // Ensures the section takes up available space and centers the content
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center", // This centers the heading and caption
          textAlign: "center", // Ensure text is centered horizontally
        }}
      >
        <h1 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>
          Unified Departmental Dashboard
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "4px" }}>
          Explore insights, statistics, and interactive maps across departments.
        </p>
      </div>
    </div>
  );
};

export default AppNavbar;
