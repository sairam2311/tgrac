import React, { useState } from "react";
import { useDraggable } from "../hooks/useDraggable";

const LayerController = ({ layersConfig, visibleLayers, onLayerToggle }) => {
  const [controllerRef, position, reset] = useDraggable({ top: "50px", left: "10px" });

  const [openGroups, setOpenGroups] = useState(
    layersConfig.reduce((acc, group) => {
      acc[group.groupName] = true; // initially open
      return acc;
    }, {})
  );

  const toggleGroup = (groupName) => {
    setOpenGroups({ ...openGroups, [groupName]: !openGroups[groupName] });
  };

  return (
    <div
      ref={controllerRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "white",
        borderRadius: "5px",
        boxShadow: "0 0 8px rgba(0,0,0,0.2)",
        fontSize: "14px",
        minWidth: "200px",
        maxHeight: "400px",
        overflowY: "auto",
        zIndex: 1000
      }}
    >
      <div
        className="drag-header"
        style={{
          background: "#28a745",
          color: "white",
          padding: "6px 10px",
          cursor: "move",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span>Layers</span>
        <button
          className="reset-btn"
          onClick={reset}
          style={{ border: "none", background: "transparent", color: "white", cursor: "pointer" }}
        >
          ⟳
        </button>
      </div>

      {layersConfig.map((group) => (
        <div key={group.groupName}>
          <div
            onClick={() => toggleGroup(group.groupName)}
            style={{
              background: "#f1f1f1",
              padding: "5px 10px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {group.groupName} {openGroups[group.groupName] ? "▾" : "▸"}
          </div>

         {openGroups[group.groupName] &&
            group.layers.map((layer) => (
              <div key={`${group.groupName}-${layer.name}`} style={{ padding: "5px 15px" }}>
                <label>
                  {group.groupName === "Base Layers" ? (
                    <>
                      <input
                        type="radio"
                        name="baseLayer"
                        checked={visibleLayers[layer.name] || false}
                        onChange={() => onLayerToggle(layer.name, group.groupName)}
                      />{" "}
                      {layer.name}
                    </>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={visibleLayers[layer.name] || false}
                        onChange={() => onLayerToggle(layer.name, group.groupName)}
                      />{" "}
                      {layer.name}
                    </>
                  )}
                </label>

                {/* 🔹 Opacity slider */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="1"
                  onChange={(e) => {
                    if (layer.olLayer) {
                      layer.olLayer.setOpacity(parseFloat(e.target.value));
                    }
                  }}
                  style={{ width: "100%", marginTop: "3px" }}
                />
              </div>
            ))}
        </div>
      ))}
  
    </div>
  );
};

export default LayerController;
