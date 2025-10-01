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
import XYZ from "ol/source/XYZ";

import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";

const MapComponent = ({
  layersConfig,
  visibleLayers,
  onLayerToggle,
  center = [0, 0],
  zoom = 5,
  height = "100vh",
}) => {
  const mapRef = useRef(null);
  const layerRefs = useRef([]);
  const measureLayerRef = useRef(null);
  const drawRef = useRef(null);

  const tooltipElementRef = useRef();
  const tooltipOverlayRef = useRef();


  const [getInfoActive, setGetInfoActive] = useState(false); // for WMS Get Info toggle

  const [legendOpen, setLegendOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState(
    layersConfig.reduce((acc, group) => {
      acc[group.groupName] = true;
      return acc;
    }, {})
  );

  const toggleGroup = (groupName) => {
    setOpenGroups({ ...openGroups, [groupName]: !openGroups[groupName] });
  };

  const [layersPanelRef] = useDraggable(
    { top: "50px", left: "10px" },
    "map"
  );
  const [legendPanelRef] = useDraggable(
    { bottom: "50px", left: "10px" },
    "map"
  );
  const [toolboxRef] = useDraggable({ top: "250px", left: "10px" }, "map");

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
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: "red" }),
        }),
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

  // useEffect(() => {
  //   const map = new Map({
  //     target: "map",
  //     layers: [
  //       new TileLayer({ source: new OSM() }), // Default OSM
  //       ...layersConfig.flatMap((group) =>
  //         group.layers.map((layer, index) => {
  //           const wmsSource = new TileWMS({
  //             url: layer.url,
  //             params: { LAYERS: layer.layerName, TILED: true },
  //             serverType: "geoserver",
  //             crossOrigin: "anonymous",
  //           });

  //           const tileLayer = new TileLayer({
  //             source: wmsSource,
  //             visible: visibleLayers[layer.name],
  //             title: layer.name,
  //           });

  //           layerRefs.current.push(tileLayer);
  //           return tileLayer;
  //         })
  //       ),
  //     ],
  //     view: new View({
  //       center: fromLonLat(center),
  //       zoom: zoom,
  //     }),
  //     controls: [],
  //   });

  //   map.addControl(new ZoomControl());
  //   map.addControl(new ScaleLine());

  //   mapRef.current = map;

  //   return () => map.setTarget(null);
  // }, []);

  useEffect(() => {
    const layerObjects = {};

    const baseLayers = layersConfig[0].layers.map(layer => {
      const tileLayer = new TileLayer({
        source: new XYZ({
          url: layer.url
        }),
        visible: visibleLayers[layer.name] || false,
        title: layer.name
      });
      layerObjects[layer.name] = tileLayer;
      layerRefs.current.push(tileLayer);
      return tileLayer;
    });

    const wmsLayers = layersConfig[1].layers.map(layer => {
      const tileLayer = new TileLayer({
        source: new TileWMS({
          url: layer.url,
          params: { LAYERS: layer.layerName, TILED: true },
          serverType: "geoserver",
          crossOrigin: "anonymous"
        }),
        visible: visibleLayers[layer.name] || false,
        title: layer.name
      });
      layerObjects[layer.name] = tileLayer;
      layerRefs.current.push(tileLayer);
      return tileLayer;
    });

    const map = new Map({
      target: "map",
      layers: [...baseLayers, ...wmsLayers],
      view: new View({
        center: fromLonLat(center),
        zoom
      }),
      controls: []
    });

           // Mouse position control
    const mousePos = new MousePosition({
      coordinateFormat: createStringXY(5),
      projection: "EPSG:4326",
      className: "mousePosition",
      target: document.getElementById("mouse-position"),
    });
    map.addControl(mousePos);

    map.addControl(new ZoomControl());
    map.addControl(new ScaleLine());

    mapRef.current = map;

 

    // setMap(mapObj);

    return () => map.setTarget(null);
  }, []);



  useEffect(() => {
    if (!mapRef.current) return;
    layersConfig.forEach((group) => {
      group.layers.forEach((layer) => {
        const layerRef = layerRefs.current.find(
          (l) => l.get("title") === layer.name
        );
        if (layerRef) layerRef.setVisible(visibleLayers[layer.name]);
      });
    });
  }, [visibleLayers, layersConfig]);


  
  useEffect(() => {
  if (!mapRef.current) return;

  const handleClick = (evt) => {
    if (!getInfoActive) return;

    const viewResolution = mapRef.current.getView().getResolution();

    // Loop through visible WMS layers
    layersConfig
      .filter((group) => group.groupName !== "Base Layers")
      .forEach((group) => {
        group.layers.forEach((layer) => {
          if (visibleLayers[layer.name]) {
            const olLayer = layerRefs.current.find(
              (l) => l.get("title") === layer.name
            );
            if (!olLayer) return;

            const source = olLayer.getSource();
            if (source.getFeatureInfoUrl) {
              const url = source.getFeatureInfoUrl(
                evt.coordinate,
                viewResolution,
                mapRef.current.getView().getProjection(),
                { INFO_FORMAT: "application/json" }
              );

              if (url) {
                fetch(url)
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.features?.length > 0) {
                      const props = data.features[0].properties;
                      alert(
                        `Layer: ${layer.name}\n\n` +
                          JSON.stringify(props, null, 2)
                      );
                    } else {
                      alert(`No feature info in ${layer.name}`);
                    }
                  })
                  .catch((err) => console.error("GetFeatureInfo error", err));
              }
            }
          }
        });
      });
  };

  mapRef.current.on("singleclick", handleClick);
  return () => {
    mapRef.current.un("singleclick", handleClick);
  };
}, [getInfoActive, visibleLayers, layersConfig]);

  return (
    <div style={{ position: "relative", width: "100%", height: height }}>
      {/* Map */}
      <div
        id="map"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      ></div>

      {/* Layer Control */}
      <div
        //ref={layersPanelRef}
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
          cursor: "move",
        }}
      >
        <div
          style={{
            background: "#28a745",
            color: "white",
            padding: "6px 10px",
            fontWeight: "bold",
          }}
        >
          Layers
        </div>
        {layersConfig.map((group) => (
          <div key={group.groupName}>
            <div
              onClick={() => toggleGroup(group.groupName)}
              style={{
                background: "#3697c4ff",
                padding: "5px 10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {group.groupName} {openGroups[group.groupName] ? "▾" : "▸"}
            </div>
            {openGroups[group.groupName] &&
              group.layers.map((layer) => (
                <div
                  key={`${group.groupName}-${layer.name}`}
                  style={{ padding: "5px 15px" }}
                >
                  <label>
                    {group.groupName === "Base Layers" ? (
                      <>
                        <input
                          type="radio"
                          name="baseLayer"
                          checked={visibleLayers[layer.name] || false}
                          onChange={() =>
                            onLayerToggle(layer.name, group.groupName)
                          }
                        />{" "}
                        {layer.name}
                      </>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={visibleLayers[layer.name] || false}
                          onChange={() =>
                            onLayerToggle(layer.name, group.groupName)
                          }
                        />{" "}
                        {layer.name}
                      </>
                    )}
                  </label>
                </div>
              ))}
          </div>
        ))}
      </div>

      <button
  onClick={() => setGetInfoActive(!getInfoActive)}
  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 1100,
    padding: "6px 10px",
    background: getInfoActive ? "#dc3545" : "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  }}
>
  {getInfoActive ? "Get Info (On)" : "Get Info"}
</button>


<div
  //ref={toolboxRef}
  style={{
    position: "absolute",
    top: "70px",
    left: "10px",
    background: "white",
    borderRadius: "5px",
    padding: "0px",
    boxShadow: "0 0 8px rgba(0,0,0,0.2)",
    zIndex: 1003,
    cursor: "default",
  }}
>
  {/* <div
    style={{
      background: "#007bff",
      color: "white",
      padding: "6px 10px",
      cursor: "move",
    }}
  >
    Measurement Toolbox
  </div> */}
  <MeasurementToolbox onMeasure={onMeasure} />
</div>



      {/* Mouse Position */}
      <div
        id="mouse-position"
        style={{
          position: "absolute",
          bottom: "5px",
          right: "10px",
          background: "rgba(255, 255, 255, 0.16)",
          padding: "2px 6px",
          fontSize: "14px",
          borderRadius: "8px",
          zIndex: 1000,
        }}
      ></div>
      {/* Legend Panel */}
    <div
  //ref={legendPanelRef}
  style={{
    position: "absolute",
    bottom: "50px",
    left: "10px",
    background: "white",
    borderRadius: "5px",
    padding: "8px",
    boxShadow: "0 0 8px rgba(0,0,0,0.2)",
    zIndex: 1002,
    maxHeight: "300px",
    overflowY: "auto",
    cursor: "move",
  }}
>
        <div
          style={{
            background: "#007bff",
            color: "white",
            padding: "6px 10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => setLegendOpen(!legendOpen)}
        >
          Legend {legendOpen ? "▾" : "▸"}
        </div>
{legendOpen &&
  layersConfig
    .filter((group) => group.groupName !== "Base Layers") // ⬅️ skip Base Layers
    .map((group) => (
      <div key={group.groupName} style={{ marginBottom: "10px" }}>
        {/* Group heading */}
        {group.groupName && (
          <h6 style={{ margin: "5px 0", borderBottom: "1px solid #ccc" }}>
            {group.groupName}
          </h6>
        )}

        {/* Group layers */}
        {group.layers.map((layer) => (
          <div
            key={`${group.groupName}-${layer.name}`}
            style={{ margin: "5px 0 5px 10px" }}
          >
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
    ))}


      </div>
    </div>
  );
};

export default MapComponent;
