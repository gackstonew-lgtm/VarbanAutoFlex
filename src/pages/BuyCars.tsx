import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/navigation/Navbar';
import { PopularBrandsBar } from '../components/brand/PopularBrandsBar';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { VehicleService } from '../lib/supabase/client';
import { Vehicle, FuelType, TransmissionType, BodyType } from '../types/database';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Reveal } from '../components/motion/Reveal';

export const BuyCars: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [bodyType, setBodyType] = useState<BodyType | ''>((searchParams.get('bodyType') as BodyType) || '');
  const [transmission, setTransmission] = useState<TransmissionType | ''>((searchParams.get('transmission') as TransmissionType) || '');
  const [fuelType, setFuelType] = useState<FuelType | ''>((searchParams.get('fuelType') as FuelType) || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  // Load Vehicles based on filters
  useEffect(() => {
    async function loadFilteredVehicles() {
      setLoading(true);
      try {
        const filters = {
          make: make || undefined,
          model: model || undefined,
          body_type: bodyType || undefined,
          transmission: transmission || undefined,
          fuel_type: fuelType || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy: (sortBy === 'price_asc' ? 'price_low' : sortBy === 'price_desc' ? 'price_high' : sortBy === 'mileage_asc' ? 'mileage_low' : 'newest') as 'newest' | 'price_low' | 'price_high' | 'mileage_low',
        };

        // Sync with browser URL search parameters
        const newParams: Record<string, string> = {};
        if (make) newParams.make = make;
        if (model) newParams.model = model;
        if (bodyType) newParams.bodyType = bodyType;
        if (transmission) newParams.transmission = transmission;
        if (fuelType) newParams.fuelType = fuelType;
        if (minPrice) newParams.minPrice = minPrice;
        if (maxPrice) newParams.maxPrice = maxPrice;
        if (sortBy) newParams.sortBy = sortBy;
        setSearchParams(newParams, { replace: true });

        const results = await VehicleService.filterVehicles(filters);
        setVehicles(results);
      } catch (err) {
        console.error('Failed to load vehicles', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadFilteredVehicles, 150);
    return () => clearTimeout(timer);
  }, [make, model, bodyType, transmission, fuelType, minPrice, maxPrice, sortBy]);

  const resetFilters = () => {
    setMake('');
    setModel('');
    setBodyType('');
    setTransmission('');
    setFuelType('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col font-sans">
      <Navbar />

      {/* Popular Brands Logo Bar */}
      <PopularBrandsBar />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0038BC] via-[#0751C9] to-[#1769E0] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <Reveal direction="up" distance={15}>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Buy Cars in Kenya
            </h1>
            <p className="text-xs sm:text-sm text-[#D9EAFF]">
              Browse verified vehicle inventory across Nairobi, Mombasa, and Nakuru car yards.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] lg:pb-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm sticky top-28 space-y-6">
              <div className="flex items-center justify-between border-b border-[#D9EAFF] pb-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#10233F]">
                  <SlidersHorizontal className="w-4 h-4 text-[#1769E0]" />
                  <span>Filter Vehicles</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-[#1769E0] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase mb-1">Make</label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] p-2.5 text-xs font-bold text-[#10233F] focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                  >
                    <option value="">All Makes</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Subaru">Subaru</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Land Rover">Land Rover</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="BMW">BMW</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Volvo">Volvo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase mb-1">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] p-2.5 text-xs font-bold text-[#10233F]"
                  >
                    <option value="">All Transmissions</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] p-2.5 text-xs font-bold text-[#10233F]"
                  >
                    <option value="">All Fuel Types</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Min Price (KES)"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="e.g. 1000000"
                  />
                  <Input
                    label="Max Price (KES)"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 10000000"
                  />
                </div>
              </div>

            </div>
          </aside>

          {/* Main Results Display */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-[#D9EAFF] shadow-sm flex items-center justify-between gap-4">
              <div className="text-xs font-extrabold text-[#10233F]">
                Showing <span className="text-[#1769E0]">{vehicles.length}</span> Verified Vehicles
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-2 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF] text-xs font-bold text-[#10233F] flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5 text-[#1769E0]" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#10233F]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#1769E0]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] p-2 text-xs font-bold text-[#10233F]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="mileage_low">Lowest Mileage</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Animated Vehicle Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#D9EAFF] space-y-4">
                <Search className="w-12 h-12 text-[#1769E0] mx-auto opacity-40" />
                <h3 className="text-lg font-extrabold text-[#10233F]">No Vehicles Found</h3>
                <p className="text-xs text-[#64748B]">Try broadening your filter criteria or reset your filters.</p>
                <Button variant="outline" onClick={resetFilters}>Reset All Filters</Button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {vehicles.map((vehicle) => (
                    <motion.div
                      key={vehicle.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <VehicleCard vehicle={vehicle} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

          </main>

        </div>
      </div>

    </div>
  );
};
