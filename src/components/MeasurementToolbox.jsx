import React, { useState } from "react";
import { useDraggable } from "../hooks/useDraggable";
import { FaRulerHorizontal, FaDrawPolygon, FaTimes, FaExpand } from "react-icons/fa";
import FullScreen from "ol/control/FullScreen";

const MeasurementToolbox = ({ onMeasure }) => {
  const [toolboxRef, position, reset] = useDraggable({ top: "100px", left: "10px" });
  const [open, setOpen] = useState(true);

const toolboxStyle = {
  position: "absolute",
  top: position.top,
  left: position.left,
  background: "#fff",
  borderRadius: "4px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",     // horizontal centering
  justifyContent: "center", // vertical centering
  padding: "4px",
  cursor: "move",
};


  const iconButtonStyle = {
    background: "none",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    fontSize: "18px",
    color: "#333",
  };

  const toggleFullScreen = () => {
  const mapContainer = document.getElementById("map"); // your map container ID
  if (!document.fullscreenElement) {
    mapContainer.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};


  const activeStyle = { color: "#ffc107" }; // Active icon highlight

  return (
    <div ref={toolboxRef} style={toolboxStyle}>
      {/* Drag Header */}
      {/* <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button
          style={iconButtonStyle}
          title="Toggle Toolbox"
          onClick={() => setOpen(!open)}
        >
          <FaExpand />
          
        </button>
        <button style={iconButtonStyle} title="Reset Position" onClick={reset}>
          ⟳
        </button>
      </div> */}

      {/* Toolbox Icons */}
      {open && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
          <button
            style={iconButtonStyle}
            title="Measure Distance"
            onClick={() => onMeasure("LineString")}
          >
            <FaRulerHorizontal />
          </button>
          <button
            style={iconButtonStyle}
            title="Measure Area"
            onClick={() => onMeasure("Polygon")}
          >
            <FaDrawPolygon />
          </button>
          <button
            style={{ ...iconButtonStyle, color: "red" }}
            title="Cancel Measurement"
            onClick={() => onMeasure(null)}
          >
            <FaTimes />
          </button>

            <button style={{ ...iconButtonStyle, color: "blue" }} title="Toggle Fullscreen" onClick={toggleFullScreen}>
      <FaExpand />
    </button>
        </div>
      )}
    </div>
  );
};

export default MeasurementToolbox;
