import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { BuyCars } from './pages/BuyCars';
import { SellCar } from './pages/SellCar';
import { VehicleDetails } from './pages/VehicleDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { Auth } from './pages/Auth';
import { TradeIn } from './pages/TradeIn';
import { AuctionMarketplace } from './pages/Auction';
import { ImportServicePage } from './pages/ImportService';
import { AccountDashboard } from './pages/Account';
import { AccessoriesPage } from './pages/Accessories';
import { TrackersPage } from './pages/Trackers';
import { CarHirePage } from './pages/CarHire';
import { DealershipsPage } from './pages/Dealerships';
import { AboutPage } from './pages/About';

import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy" element={<BuyCars />} />
        <Route path="/sell" element={<SellCar />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/trade-in" element={<TradeIn />} />
        <Route path="/auction" element={<AuctionMarketplace />} />
        <Route path="/import" element={<ImportServicePage />} />
        <Route path="/account" element={<AccountDashboard />} />
        <Route path="/accessories" element={<AccessoriesPage />} />
        <Route path="/trackers" element={<TrackersPage />} />
        <Route path="/car-hire" element={<CarHirePage />} />
        <Route path="/dealerships" element={<DealershipsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <MobileBottomNav />
      <PWAInstallPrompt />
    </BrowserRouter>
  );
};

export default App;
