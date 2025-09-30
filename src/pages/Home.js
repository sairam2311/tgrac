import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form } from "react-bootstrap";
import MapComponent from "../components/MapComponent";
import Card from "../components/card";
import "./Home.css";

const Home = () => {
// const layersConfig = [
//   {
//     name: "Layer 1",
//     layerName: "TGRAC:District_Boundary",
//     url: "/geoserver/TGRAC/wms",
//   },
//   {
//     name: "Layer 2",
//     layerName: "TGRAC:Road_Network",
//     url: "/geoserver/TGRAC/wms",
//   },
//   {
//     name: "Layer 3",
//     layerName: "TGRAC:Village_Boundary",
//     url: "/geoserver/TGRAC/wms",
//   },
// ];

const layersConfig = [
  {
    groupName: "Base Layers",
    layers: [
      { name: "OSM", url: "...", layerName: "osm" },
      { name: "Satellite", url: "...", layerName: "satellite" }
    ]
  },
  {
    groupName: "WMS Layers",
    layers: [
      { name: "District", url: "/geoserver/TGRAC/wms", layerName: "TGRAC:District_Boundary" },
      { name: "Roads", url: "/geoserver/TGRAC/wms", layerName: "TGRAC:Road_Network" }
    ]
  }
];



  const [visibleLayers, setVisibleLayers] = React.useState({
    "Layer 1": true,
    "Layer 2": true,
    "Layer 3": true,
  });

  const toggleLayerVisibility = (layerName, groupName) => {
  if (groupName === "Base Layers") {
    // Turn off all base layers, then turn on the selected one
    const updatedLayers = { ...visibleLayers };
    layersConfig
      .find((g) => g.groupName === "Base Layers")
      .layers.forEach((layer) => {
        updatedLayers[layer.name] = false;
      });
    updatedLayers[layerName] = true;
    setVisibleLayers(updatedLayers);
  } else {
    // Toggle normal layers
    setVisibleLayers({
      ...visibleLayers,
      [layerName]: !visibleLayers[layerName],
    });
  }
};

  return (
    <div>
      <div className="container-fluid my-5">
        <div className="row">
          <div className="col-md-6">
            <section className="my-1">
              <div className="row">
                <Card title="Education" emoji="🎓" description="Schools, colleges, and literacy rates." link="/education" />
                <Card title="Health" emoji="🏥" description="Hospitals, health centers, and services." link="/health" />
                <Card title="Agriculture" emoji="🌾" description="Crop areas, irrigation, and productivity." link="/agriculture" />
                <Card title="Roads" emoji="🌍" description="Road Connectivity." link="/roads" />
              </div>
            </section>

            <section className="bg-light py-5">
              <div className="container-fluid">
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

          <div className="col-md-6">
            <section className="my-1">
            <MapComponent
  layersConfig={layersConfig}
  visibleLayers={visibleLayers}
  onLayerToggle={toggleLayerVisibility}
  center={[78.4867, 17.3850]} // Example: Hyderabad
  zoom={7}
/>

            </section>
          </div>
        </div>
      </div>

      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">© 2025 Unified Dashboard. All Rights Reserved.</p>
      </footer>

   
    </div>
  );
};

export default Home;
