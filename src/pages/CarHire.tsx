import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Key, ShieldCheck, Calendar, MapPin, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CarHirePage: React.FC = () => {
  const hireCategories = [
    { title: 'Executive SUVs & Prado', price: 'From KES 12,000 / day', desc: 'Ideal for upcountry trips, executive travel, and corporate site visits.' },
    { title: 'Saloon & Economy Cars', price: 'From KES 4,500 / day', desc: 'Efficient automatic sedans and hatchbacks for Nairobi city mobility.' },
    { title: 'Chauffeur-Driven Luxury', price: 'From KES 25,000 / day', desc: 'Mercedes-Benz E/S-Class and Range Rover with professional uniformed drivers.' },
    { title: 'Pickups & Commercial Vans', price: 'From KES 8,000 / day', desc: 'Double-cab Hilux and Hiace vans for cargo, haulage, and team transport.' }
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-8 font-sans">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0038BC] via-[#0751C9] to-[#1769E0] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold uppercase tracking-wider text-[#D9EAFF]">
            <Key className="w-4 h-4 text-[#2D8CFF]" />
            <span>FLEXIBLE SHORT & LONG TERM VEHICLE HIRE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Car Hire Services
          </h1>
          <p className="text-sm sm:text-base text-[#D9EAFF] max-w-2xl mx-auto">
            Rent fully insured, logbook-verified vehicles directly from verified Varban Auto Flex fleet partners across Kenya. Self-drive and chauffeur-driven options available.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
        
        {/* Hire Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hireCategories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-[#1769E0] uppercase tracking-wider">{cat.price}</div>
                <h3 className="text-lg font-black text-[#10233F]">{cat.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{cat.desc}</p>
              </div>
              <div className="pt-2 border-t border-[#D9EAFF]">
                <a href="https://wa.me/254712052104?text=Hi%2C%20I%20want%20to%20inquire%20about%20car%20hire%20services" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" fullWidth className="font-extrabold">
                    Inquire Hire Availability
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-3xl p-8 border border-[#D9EAFF] shadow-sm max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-[#10233F] text-center">Why Hire Through Varban Auto Flex?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <div className="font-extrabold text-[#10233F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fully Insured Vehicles
              </div>
              <p className="text-[#64748B]">Comprehensive PSV & commercial car hire insurance included.</p>
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-[#10233F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> GPS Tracked Fleet
              </div>
              <p className="text-[#64748B]">24/7 roadside assistance & GPS monitoring for total peace of mind.</p>
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-[#10233F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Easy M-Pesa Booking
              </div>
              <p className="text-[#64748B]">Reserve with transparent deposit via secure M-Pesa STK push.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
