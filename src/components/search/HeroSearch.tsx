import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Calendar, Car, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const HeroSearch: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // Search parameters
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [year, setYear] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'sell') {
      navigate('/sell');
      return;
    }

    const queryParams = new URLSearchParams();
    if (make) queryParams.set('make', make);
    if (model) queryParams.set('model', model);
    if (location) queryParams.set('location', location);
    if (minPrice) queryParams.set('minPrice', minPrice);
    if (maxPrice) queryParams.set('maxPrice', maxPrice);
    if (year) queryParams.set('minYear', year);

    navigate(`/buy?${queryParams.toString()}`);
  };

  const applyQuickFilter = (type: string, value: string) => {
    const queryParams = new URLSearchParams();
    if (type === 'bodyType') queryParams.set('bodyType', value);
    if (type === 'transmission') queryParams.set('transmission', value);
    if (type === 'maxPrice') queryParams.set('maxPrice', value);
    navigate(`/buy?${queryParams.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 -mt-12 lg:-mt-16 relative z-20">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#D9EAFF] overflow-hidden p-6 sm:p-8">
        
        {/* Tab Selection */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#D9EAFF] pb-4">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-6 py-2.5 rounded-full font-extrabold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'buy'
                ? 'bg-[#1769E0] text-white shadow-md shadow-[#1769E0]/20'
                : 'bg-[#F7FAFF] text-[#64748B] hover:text-[#10233F]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>BUY A CAR</span>
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-6 py-2.5 rounded-full font-extrabold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'sell'
                ? 'bg-[#1769E0] text-white shadow-md shadow-[#1769E0]/20'
                : 'bg-[#F7FAFF] text-[#64748B] hover:text-[#10233F]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>SELL YOUR CAR</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'buy' ? (
          <form onSubmit={handleSearchSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Make Input */}
              <div>
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                  Make
                </label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm text-[#10233F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  <option value="">All Makes (Toyota, Mazda, etc.)</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="BMW">BMW</option>
                  <option value="Isuzu">Isuzu</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Land Rover">Land Rover</option>
                  <option value="Ford">Ford</option>
                </select>
              </div>

              {/* Model Input */}
              <div>
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                  Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harrier, Prado, CX-5"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm text-[#10233F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                />
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm text-[#10233F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  <option value="">All Kenya Locations</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Nakuru">Nakuru</option>
                  <option value="Eldoret">Eldoret</option>
                  <option value="Kisumu">Kisumu</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                  Min Price (KES)
                </label>
                <select
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm text-[#10233F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  <option value="">No Minimum</option>
                  <option value="1000000">1,000,000</option>
                  <option value="2000000">2,000,000</option>
                  <option value="3000000">3,000,000</option>
                  <option value="5000000">5,000,000</option>
                </select>
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                  Max Price (KES)
                </label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm text-[#10233F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  <option value="">No Maximum</option>
                  <option value="2000000">2,000,000</option>
                  <option value="3000000">3,000,000</option>
                  <option value="5000000">5,000,000</option>
                  <option value="8000000">8,000,000</option>
                  <option value="12000000">12,000,000</option>
                </select>
              </div>

              {/* Minimum Year */}
              <div>
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                  Min Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm text-[#10233F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  <option value="">Any Year</option>
                  <option value="2016">2016+</option>
                  <option value="2018">2018+</option>
                  <option value="2020">2020+</option>
                  <option value="2022">2022+</option>
                </select>
              </div>

            </div>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#64748B]">
                <span className="text-[#10233F] font-bold uppercase">Quick Filters:</span>
                <button
                  type="button"
                  onClick={() => applyQuickFilter('bodyType', 'SUV')}
                  className="px-3 py-1.5 rounded-full bg-[#F7FAFF] border border-[#D0E6FD] hover:bg-[#D9EAFF] hover:text-[#0751C9] transition-colors"
                >
                  SUV
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickFilter('bodyType', 'Sedan')}
                  className="px-3 py-1.5 rounded-full bg-[#F7FAFF] border border-[#D0E6FD] hover:bg-[#D9EAFF] hover:text-[#0751C9] transition-colors"
                >
                  Sedan
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickFilter('bodyType', 'Pickup / Truck')}
                  className="px-3 py-1.5 rounded-full bg-[#F7FAFF] border border-[#D0E6FD] hover:bg-[#D9EAFF] hover:text-[#0751C9] transition-colors"
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickFilter('transmission', 'Automatic')}
                  className="px-3 py-1.5 rounded-full bg-[#F7FAFF] border border-[#D0E6FD] hover:bg-[#D9EAFF] hover:text-[#0751C9] transition-colors"
                >
                  Automatic
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickFilter('maxPrice', '2000000')}
                  className="px-3 py-1.5 rounded-full bg-[#F7FAFF] border border-[#D0E6FD] hover:bg-[#D9EAFF] hover:text-[#0751C9] transition-colors"
                >
                  Under KES 2M
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickFilter('maxPrice', '3000000')}
                  className="px-3 py-1.5 rounded-full bg-[#F7FAFF] border border-[#D0E6FD] hover:bg-[#D9EAFF] hover:text-[#0751C9] transition-colors"
                >
                  Under KES 3M
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto min-w-[200px] font-bold"
                icon={<Search className="w-5 h-5" />}
              >
                Find Cars
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4">
            <h3 className="text-2xl font-black text-[#10233F]">Ready to list your vehicle on Verban Auto?</h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto">
              Get maximum exposure to serious buyers across Kenya. Verified car-yard approval in less than 24 hours.
            </p>
            <Button
              onClick={() => navigate('/sell')}
              size="lg"
              className="font-bold"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Start Seller Listing
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};
