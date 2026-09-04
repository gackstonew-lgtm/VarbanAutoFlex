import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Package, Wrench, ShieldCheck, Search, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const AccessoriesPage: React.FC = () => {
  const categories = [
    { title: 'Body Parts & Bumper Guards', desc: 'Grilles, side steps, bull bars, roof racks, and OEM body trims.' },
    { title: 'Engine & Performance Spares', desc: 'Air filters, brake pads, spark plugs, timing belts, and oil filters.' },
    { title: 'Electronics & Audio', desc: 'Android infotainment screens, dashcams, sound systems, and LED headlights.' },
    { title: 'Wheels & Tyres', desc: 'Alloy rims, all-terrain tyres, run-flat tyres, and wheel alignment accessories.' },
    { title: 'Interior Accessories', desc: 'Custom leather seat covers, 7D floor mats, steering covers, and sunshades.' },
    { title: 'Fluids & Care Products', desc: 'Synthetic engine oils, ceramic coating kits, car shampoos, and detailing polishes.' }
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-8 font-sans">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0038BC] via-[#0751C9] to-[#1769E0] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold uppercase tracking-wider text-[#D9EAFF]">
            <Wrench className="w-4 h-4 text-[#2D8CFF]" />
            <span>OEM & AFTERMARKET AUTO SPARES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Car Accessories & Spare Parts
          </h1>
          <p className="text-sm sm:text-base text-[#D9EAFF] max-w-2xl mx-auto">
            Source genuine Japanese, European, and American auto spare parts, accessories, and performance upgrades verified by Verban Auto partner car yards across Kenya.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
        
        {/* Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm max-w-3xl mx-auto space-y-4">
          <h3 className="text-base font-extrabold text-[#10233F]">Search Parts & Accessories</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="e.g. Prado TX Brake Pads, RAV4 Headlight, 7D Mats" className="flex-grow" />
            <Button variant="primary" className="font-extrabold" icon={<Search className="w-4 h-4" />}>
              Search Catalog
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[#10233F]">Parts Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm hover:border-[#1769E0]/50 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#D9EAFF]/60 text-[#1769E0] flex items-center justify-center font-black">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#10233F]">{cat.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{cat.desc}</p>
                </div>
                <div className="pt-2 border-t border-[#D9EAFF]">
                  <a href={`tel:+254712052104`} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1769E0] hover:underline">
                    <span>Inquire Part Stock</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact/Inquiry Box */}
        <div className="bg-white rounded-3xl p-8 border border-[#D9EAFF] shadow-lg max-w-3xl mx-auto space-y-4 text-center">
          <ShieldCheck className="w-10 h-10 text-[#1769E0] mx-auto" />
          <h3 className="text-xl font-black text-[#10233F]">Need Specific OEM Parts?</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Our Nairobi and Mombasa car-yard logistics teams source rare mechanical, body, and electrical spare parts directly from verified suppliers.
          </p>
          <div className="pt-2">
            <a href="https://wa.me/254712052104?text=Hi%2C%20I%20am%20looking%20for%20car%20accessories%20and%20spares" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="font-extrabold">
                Chat with Parts Specialist
              </Button>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
