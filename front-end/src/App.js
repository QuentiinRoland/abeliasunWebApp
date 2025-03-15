import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { Customers } from "./pages/Customers";
import Prestations from "./pages/Prestations";
import Employee from "./pages/Employee";
import { Account } from "./pages/Account";

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Navbar />
        <div style={{ marginLeft: "0px", padding: "0px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Customers />} />
            <Route path="/prestations" element={<Prestations />} />
            <Route path="/account" element={<Account />} />
            <Route path="/employes" element={<Employee />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
