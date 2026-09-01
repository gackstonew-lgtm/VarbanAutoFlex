import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Award, ArrowRight, CheckCircle2, PhoneCall, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { PopularBrandsBar } from '../components/brand/PopularBrandsBar';
import { UnitPayHero } from '../components/hero/UnitPayHero';
import { HeroSearch } from '../components/search/HeroSearch';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { VehicleService } from '../lib/supabase/client';
import { Vehicle } from '../types/database';
import { Button } from '../components/ui/Button';
import { siteConfig } from '../config/site';
import { Reveal } from '../components/motion/Reveal';
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger';

export const Home: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const all = await VehicleService.getAll();
        const featured = all.filter(v => v.featured);
        setFeaturedVehicles(featured.length > 0 ? featured : all.slice(0, 6));
      } catch (err) {
        console.error('Failed to load featured vehicles', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col font-sans selection:bg-[#1769E0] selection:text-white pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <Navbar />

      {/* Popular Brands Logo Bar */}
      <PopularBrandsBar />

      {/* Hero Section */}
      <UnitPayHero onSearchClick={scrollToSearch} />

      {/* Hero Search Panel Container */}
      <div ref={searchRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full mb-6 sm:mb-16">
        <Reveal direction="up" distance={20}>
          <HeroSearch />
        </Reveal>
      </div>

      {/* Featured Vehicles Grid Section */}
      <section className="pt-4 pb-12 sm:py-12 bg-[#F7FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <Reveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9EAFF] pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#1769E0] mb-1">
                  Handpicked Stock
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10233F]">
                  Featured Verified Vehicles
                </h2>
              </div>

              <Link to="/buy" className="inline-flex items-center gap-1 text-xs font-bold text-[#1769E0] hover:text-[#0038BC] transition-colors group">
                <span>View All 20+ Vehicles</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

          {/* Skeleton or Vehicle Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <StaggerItem key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

        </div>
      </section>

      {/* How YARDLY Works 3-Step Guide */}
      <section className="py-16 bg-white border-y border-[#D9EAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <Reveal direction="up" className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-[#1769E0]">
              Transparent & Secure
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10233F]">
              How Buying On YARDLY Works
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              We take the friction out of buying a quality vehicle in Kenya with full logbook verification and secure M-Pesa holding deposits.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="bg-[#F7FAFF] p-8 rounded-3xl border border-[#D9EAFF] relative h-full space-y-4 hover:border-[#1769E0]/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#D9EAFF] text-[#1769E0] flex items-center justify-center font-black text-lg">
                  01
                </div>
                <h3 className="text-lg font-extrabold text-[#10233F]">Browse & Filter</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Filter verified listings by make, model, year, transmission, and price. Every vehicle includes verified specifications.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-[#F7FAFF] p-8 rounded-3xl border border-[#D9EAFF] relative h-full space-y-4 hover:border-[#1769E0]/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#D9EAFF] text-[#1769E0] flex items-center justify-center font-black text-lg">
                  02
                </div>
                <h3 className="text-lg font-extrabold text-[#10233F]">Reserve via M-Pesa</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Pay a refundable deposit (KES 50,000) via M-Pesa STK push to hold the vehicle for 3 days while scheduling physical inspection.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-[#F7FAFF] p-8 rounded-3xl border border-[#D9EAFF] relative h-full space-y-4 hover:border-[#1769E0]/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#D9EAFF] text-[#1769E0] flex items-center justify-center font-black text-lg">
                  03
                </div>
                <h3 className="text-lg font-extrabold text-[#10233F]">Inspect & Drive Away</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Visit the yard in Nairobi, inspect the car with your mechanic, complete payment transfer, and drive away with guaranteed logbook transfer.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>

        </div>
      </section>

      {/* Trust & Verification CTA Banner */}
      <section className="py-16 bg-[#F7FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="rounded-3xl bg-gradient-to-r from-[#0038BC] via-[#0751C9] to-[#1769E0] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="space-y-4 max-w-xl text-center md:text-left z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/20">
                  <ShieldCheck className="w-4 h-4 text-[#D9EAFF]" />
                  <span>Selling Your Vehicle?</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  List Your Car On Kenya's Digital Car Yard
                </h2>
                <p className="text-xs sm:text-sm text-[#D9EAFF] leading-relaxed">
                  Reach thousands of verified buyers daily. Submit your vehicle details, upload logbook documentation, and let our yard managers handle sales inquiries.
                </p>
              </div>

              <div className="shrink-0 z-10">
                <Link to="/sell">
                  <Button size="lg" variant="secondary" className="font-extrabold text-[#0038BC] bg-white hover:bg-[#F7FAFF] shadow-lg active:scale-95 transition-transform">
                    Submit Vehicle For Sale
                  </Button>
                </Link>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#10233F] text-[#F7FAFF] pt-12 pb-8 border-t border-[#10233F]/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-black">{siteConfig.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{siteConfig.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Marketplace</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/buy?make=Toyota" className="hover:text-white">Toyota Vehicles</Link></li>
                <li><Link to="/buy?transmission=Automatic" className="hover:text-white">Automatic SUVs</Link></li>
                <li><Link to="/buy?maxPrice=5000000" className="hover:text-white">Under KES 5M</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Car Yard</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/sell" className="hover:text-white">Sell Your Car</Link></li>
                <li><Link to="/admin" className="hover:text-white">Admin Dashboard</Link></li>
                <li><Link to="/auth" className="hover:text-white">Partner Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Contact</h4>
              <div className="text-xs text-slate-300 space-y-1">
                <p>{siteConfig.contact.address}</p>
                <p>{siteConfig.contact.phone}</p>
                <p>{siteConfig.contact.email}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};
