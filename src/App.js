import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Map from "./pages/Map";
// import EducationDashboard from "./features/Education/EducationDashboard";
// import HealthDashboard from "./features/Health/HealthDashboard";
// import AgriDashboard from "./features/Agriculture/AgriDashboard";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/Map" element={<Map />}/>
        {/* <Route path="/education" element={<EducationDashboard />} />
        <Route path="/health" element={<HealthDashboard />} />
        <Route path="/agriculture" element={<AgriDashboard />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
