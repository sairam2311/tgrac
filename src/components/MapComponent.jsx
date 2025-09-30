// Fixed MapComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import TileWMS from "ol/source/TileWMS";
import { fromLonLat } from "ol/proj";
import ZoomControl from "ol/control/Zoom";
import ScaleLine from "ol/control/ScaleLine";
import { useDraggable } from "../hooks/useDraggable";
import MeasurementToolbox from "./MeasurementToolbox";
import Draw from "ol/interaction/Draw";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { getLength, getArea } from "ol/sphere";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Overlay from "ol/Overlay";
import { unByKey } from "ol/Observable";
import { LineString, Polygon } from "ol/geom";

const MapComponent = ({ layersConfig, visibleLayers, onLayerToggle, center = [0, 0], zoom = 5 }) => {
  const mapRef = useRef(null);
  const layerRefs = useRef([]);
  const measureLayerRef = useRef(null);
  const drawRef = useRef(null);

  const tooltipElementRef = useRef();
  const tooltipOverlayRef = useRef();

  const [legendOpen, setLegendOpen] = useState(true);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);

  const [openGroups, setOpenGroups] = useState(
    layersConfig.reduce((acc, group) => {
      acc[group.groupName] = true; // initially open
      return acc;
    }, {})
  );

  const toggleGroup = (groupName) => {
    setOpenGroups({ ...openGroups, [groupName]: !openGroups[groupName] });
  };

  const [layersPanelRef, layersPanelPos, resetLayersPanel] = useDraggable(
    { bottom: "150px", left: "10px" },
    "map"
  );
  const [legendPanelRef, legendPanelPos, resetLegendPanel] = useDraggable({ bottom: "150px", left: "550px" }, "map");
  const [toolboxRef, toolboxPos, resetToolbox] = useDraggable({ top: "250px", left: "10px" }, "map");

  const onMeasure = (type) => {
    if (drawRef.current && mapRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
    }
    if (measureLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(measureLayerRef.current);
      measureLayerRef.current = null;
    }
    if (tooltipOverlayRef.current && mapRef.current) {
      mapRef.current.removeOverlay(tooltipOverlayRef.current);
      tooltipOverlayRef.current = null;
    }
    if (!type) return;

    const source = new VectorSource();
    const vectorLayer = new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({ color: "red", width: 2 }),
        fill: new Fill({ color: "rgba(255,0,0,0.1)" }),
        image: new CircleStyle({ radius: 5, fill: new Fill({ color: "red" }) }),
      }),
    });

    mapRef.current.addLayer(vectorLayer);
    measureLayerRef.current = vectorLayer;

    const tooltipElement = document.createElement("div");
    tooltipElement.className = "tooltip-measure";
    tooltipElement.style.background = "rgba(0,0,0,0.7)";
    tooltipElement.style.color = "#fff";
    tooltipElement.style.padding = "4px";
    tooltipElement.style.borderRadius = "4px";
    tooltipElement.style.fontSize = "12px";
    tooltipElement.style.whiteSpace = "nowrap";
    tooltipElementRef.current = tooltipElement;

    const tooltipOverlay = new Overlay({
      element: tooltipElement,
      offset: [10, 0],
      positioning: "center-left",
    });
    mapRef.current.addOverlay(tooltipOverlay);
    tooltipOverlayRef.current = tooltipOverlay;

    const draw = new Draw({ source, type });
    let listener;

    draw.on("drawstart", (evt) => {
      const feature = evt.feature;
      listener = feature.getGeometry().on("change", (evt) => {
        const geom = evt.target;
        let output = "";
        let coord;

        if (geom instanceof LineString) {
          output = (getLength(geom) / 1000).toFixed(2) + " km";
          coord = geom.getLastCoordinate();
        } else if (geom instanceof Polygon) {
          output = (getArea(geom) / 1000000).toFixed(2) + " km²";
          coord = geom.getInteriorPoint().getCoordinates();
        }

        tooltipElement.innerHTML = output;
        tooltipOverlay.setPosition(coord);
      });
    });

    draw.on("drawend", (evt) => {
      unByKey(listener);

      const geom = evt.feature.getGeometry();
      let output = "";
      let coord;

      if (geom instanceof LineString) {
        output = (getLength(geom) / 1000).toFixed(2) + " km";
        coord = geom.getLastCoordinate();
      } else if (geom instanceof Polygon) {
        const area_m2 = getArea(geom);
        const area_acres = area_m2 / 4046.8564224;
        output = `${area_acres.toFixed(2)} acres (${(area_m2 / 10000).toFixed(2)} ha)`;
        coord = geom.getInteriorPoint().getCoordinates();
      }

      tooltipElement.innerHTML = output;
      tooltipOverlay.setPosition(coord);

      tooltipOverlayRef.current = tooltipOverlay;
    });

    mapRef.current.addInteraction(draw);
    drawRef.current = draw;
  };

  useEffect(() => {
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({ source: new OSM() }),
        ...layersConfig.flatMap((group) =>
          group.layers.map((layer, index) => {
            const wmsSource = new TileWMS({
              url: layer.url,
              params: { LAYERS: layer.layerName, TILED: true },
              serverType: "geoserver",
              crossOrigin: "anonymous",
            });

            const tileLayer = new TileLayer({
              source: wmsSource,
              visible: visibleLayers[layer.name],
              title: layer.name,
            });

            layerRefs.current.push(tileLayer);
            return tileLayer;
          })
        ),
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
      controls: [],
    });

    map.addControl(new ZoomControl());
    map.addControl(new ScaleLine());

    mapRef.current = map;

    return () => map.setTarget(null);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    layersConfig.forEach((group) => {
      group.layers.forEach((layer, index) => {
        const layerRef = layerRefs.current[index];
        if (layerRef) layerRef.setVisible(visibleLayers[layer.name]);
      });
    });
  }, [visibleLayers, layersConfig, center, zoom]);

  return (
    <div style={{ position: "relative" }}>
      <div id="map" style={{ width: "100%", height: "500px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}></div>

      {/* Layers Panel */}
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          right: "10px",
          background: "white",
          borderRadius: "5px",
          padding: "8px",
          boxShadow: "0 0 8px rgba(0,0,0,0.2)",
          zIndex: 1000,
          minWidth: "200px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <div style={{ background: "#28a745", color: "white", padding: "6px 10px", fontWeight: "bold" }}>
          Layers
        </div>

        {layersConfig.map((group) => (
          <div key={group.groupName} style={{ marginBottom: "5px" }}>
            {/* Group Header */}
            <div
              onClick={() => toggleGroup(group.groupName)}
              style={{ background: "#f1f1f1", padding: "5px 10px", cursor: "pointer", fontWeight: "bold" }}
            >
              {group.groupName} {openGroups[group.groupName] ? "▾" : "▸"}
            </div>

            {/* Layers in Group */}
            {openGroups[group.groupName] &&
              group.layers.map((layer) => (
                <div key={`${group.groupName}-${layer.name}`} style={{ padding: "5px 15px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={visibleLayers[layer.name] || false}
                      onChange={() => onLayerToggle(layer.name)}
                    />{" "}
                    {layer.name}
                  </label>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Measurement Toolbox */}
      <MeasurementToolbox ref={toolboxRef} position={toolboxPos} reset={resetToolbox} onMeasure={onMeasure} />

      {/* Legend Panel */}
      <div
        ref={legendPanelRef}
        style={{
          position: "absolute",
          bottom: legendPanelPos.bottom,
          left: legendPanelPos.left,
          background: "white",
          borderRadius: "5px",
          padding: "8px",
          boxShadow: "0 0 8px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        <div
          className="drag-header"
          style={{
            background: "#007bff",
            color: "white",
            padding: "6px 10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span onClick={() => setLegendOpen(!legendOpen)} style={{ cursor: "pointer" }}>
            Legend {legendOpen ? "▾" : "▸"}
          </span>
          <button
            className="reset-btn"
            onClick={resetLegendPanel}
            style={{ border: "none", background: "transparent", color: "white", cursor: "pointer" }}
          >
            ⟳
          </button>
        </div>
        {legendOpen && (
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
{layersConfig
  .flatMap((group) =>
    group.layers.map((layer) => ({ ...layer, groupName: group.groupName }))
  )
  .map((layer) => (
    <div key={`${layer.groupName}-${layer.name}`}>
      <strong>{layer.name}</strong>
      <br />
      {visibleLayers[layer.name] && (
        <img
          src={`${layer.url}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${layer.layerName}`}
          alt={`${layer.name} legend`}
          style={{ maxWidth: "140px" }}
        />
      )}
    </div>
  ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
