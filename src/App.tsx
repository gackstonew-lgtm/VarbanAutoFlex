import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { BuyCars } from './pages/BuyCars';
import { SellCar } from './pages/SellCar';
import { VehicleDetails } from './pages/VehicleDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { Auth } from './pages/Auth';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy" element={<BuyCars />} />
        <Route path="/sell" element={<SellCar />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
