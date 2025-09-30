import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import TileWMS from "ol/source/TileWMS";
import { fromLonLat } from "ol/proj";
import { Form } from "react-bootstrap"; // Use Form.Check from react-bootstrap

import Card from "../components/card"; // Import the reusable Card component
import "./Home.css"; // Import custom styles

const Home = () => {
//   useEffect(() => {
//     const map = new Map({
//       target: "map",
//       layers: [
//         new TileLayer({
//           source: new OSM(),
//         }),
//       ],
//       view: new View({
//         center: [0, 0],
//         zoom: 2,
//       }),
//     });

//     return () => {
//       map.setTarget(null);
//     };
//   }, []);

  // Layer configuration
  const layers = [
    { 
      name: "Layer 1", 
      layerName: "TGRAC:District_Boundary", // Replace with actual layer name
    },
    { 
      name: "Layer 2", 
      layerName: "TGRAC:Road_Network",
    },
    { 
      name: "Layer 3", 
      layerName: "TGRAC:District_Boundary",
    },
  ];

  // To manage map and layers without recreating the map
  const mapRef = useRef(null);
  const layerRefs = useRef([]);

  const [visibleLayers, setVisibleLayers] = React.useState({
    "Layer 1": true,
    "Layer 2": true,
    "Layer 3": true,
  });

  const toggleLayerVisibility = (layerName) => {
    setVisibleLayers(prevState => ({
      ...prevState,
      [layerName]: !prevState[layerName],
    }));
  };

  useEffect(() => {
    // Create the base map
    if (!mapRef.current) {
      const map = new Map({
        target: "map",
        layers: [
          // OpenStreetMap as base layer
          new TileLayer({
            source: new OSM(),
          }),

          // Dynamically create WMS layers
          ...layers.map((layer, index) => {
            const wmsSource = new TileWMS({
              url: "/geoserver/TGRAC/wms",
              params: {
                "LAYERS": layer.layerName,
                "TILED": true,
              },
               serverType: "geoserver", // Specify the server type (GeoServer)
  crossOrigin: "anonymous", // Ensure cross-origin requests are allowed
            });

            const tileLayer = new TileLayer({
              source: wmsSource,
              visible: visibleLayers[layer.name], // Set initial visibility
              title: layer.name,
            });

            // Save reference to the layer for later use (to toggle visibility)
            layerRefs.current[index] = tileLayer;

            return tileLayer;
          }),
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });

      // Save map reference
      mapRef.current = map;
    } else {
      // If the map is already created, update the layers visibility based on the state
      layers.forEach((layer, index) => {
        const layerRef = layerRefs.current[index];
        if (layerRef) {
          layerRef.setVisible(visibleLayers[layer.name]); // Toggle visibility based on state
        }
      });
    }

    return () => {
      // Cleanup when the component unmounts
      if (mapRef.current) {
        mapRef.current.setTarget(null);
      }
    };
  }, [visibleLayers]); // Re-run effect only when `visibleLayers` changes

  return (
    <div>
      <div className="container-fluid my-5">
        <div className="row">
          {/* Left Half: Departments and Stats */}
          <div className="col-md-6">
            {/* Department Cards Section */}
            <section className="my-1">
              {/* <h2 className="text-center mb-4 text-primary">Departments</h2> */}
              <div className="row">
                <Card 
                  title="Education"
                  emoji="🎓"
                  description="Schools, colleges, and literacy rates."
                  link="/education"
                />
                <Card 
                  title="Health"
                  emoji="🏥"
                  description="Hospitals, health centers, and services."
                  link="/health"
                />
                <Card 
                  title="Agriculture"
                  emoji="🌾"
                  description="Crop areas, irrigation, and productivity."
                  link="/agriculture"
                />
                <Card 
                  title="Roads"
                  emoji="🌍"
                  description="Road Connectivity."
                  link="/roads"
                />
              </div>
            </section>

            {/* Stats Section */}
            <section className="bg-light py-5">
              <div className="container-fluid">
                {/* <h2 className="text-center mb-4 text-primary">Quick Stats</h2> */}
                <div className="row text-center">
                  <div className="col-md-4">
                    <h3>50,000+</h3>
                    <p>Schools</p>
                  </div>
                  <div className="col-md-4">
                    <h3>2,300+</h3>
                    <p>Hospitals</p>
                  </div>
                  <div className="col-md-4">
                    <h3>1.2M ha</h3>
                    <p>Cultivable Area</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Half: Map Section */}
          <div className="col-md-6">
            <section className="my-1">
              {/* <h2 className="text-center mb-4 text-primary">Interactive Overview Map</h2> */}
              <div
                id="map"
                style={{
                  width: "100%",
                  height: "500px", // Ensure the map is large enough for visibility
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                }}
              ></div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">© 2025 Unified Dashboard. All Rights Reserved.</p>
      </footer>
   {/* Layer Switcher UI */}
      <div style={{
        position: "absolute", top: "10px", right: "10px", background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0 0 10px rgba(0,0,0,0.2)"
      }}>
        <h4>Layer Control</h4>
        {layers.map(layer => (
          <div key={layer.name}>
            <Form.Check
              type="checkbox"
              id={layer.name}
              label={layer.name}
              checked={visibleLayers[layer.name]}
              onChange={() => toggleLayerVisibility(layer.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
