import MapComponent from "../components/MapComponent"; 

import React from "react";
 
 const Map = () => {
const layersConfig = [
  {
    groupName: "Base Layers",
    layers: [
      { name: "OSM", url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png", layerName: "osm" },
      { name: "ESRI Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", layerName: "esri_satellite" }
    ]
  },
  {
    groupName: "WMS Layers",
    layers: [
      { name: "District", url: "/geoserver/TGRAC/wms", layerName: "TGRAC:District_Boundary" },
      { name: "Roads", url: "/geoserver/TGRAC/wms", layerName: "TGRAC:Road_Network" },
      { name: "Dist Geom", url: "/geoserver/TGRAC/wms", layerName: "TGRAC:uploaded_shapefile_638945743141896868" }
    ]
  }
]; 


    

    //const height = {"calc(100vh - 60px)"};
    
    
      const [visibleLayers, setVisibleLayers] = React.useState({
        "Layer 1": false,
        "Layer 2": false,
        "Layer 3": false,
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
      <div className="container-fluid my-0">
  <div className="col-md-12">
            {/* <section className="my-1">
            <MapComponent
  layersConfig={layersConfig}
  visibleLayers={visibleLayers}
  onLayerToggle={toggleLayerVisibility}
  center={[78.4867, 17.3850]} // Example: Hyderabad
  zoom={7}
/>

            </section> */}

            <section  > 
  <MapComponent
    layersConfig={layersConfig}
    visibleLayers={visibleLayers}
    onLayerToggle={toggleLayerVisibility}
    center={[78.4867, 17.3850]} // Hyderabad
    zoom={7}
    height= {"calc(100vh - 120px)"}   // 👈 pass height as prop
  />
</section>
          </div>
      </div>
      </div>
 );
};
 export default Map;