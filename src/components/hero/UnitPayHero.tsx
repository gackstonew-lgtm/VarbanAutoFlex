import React from 'react';
import { ShieldCheck, ArrowRight, Zap, CheckCircle2, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../config/site';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { VehicleImageWithFallback } from '../ui/VehicleImageWithFallback';

interface UnitPayHeroProps {
  onSearchClick?: () => void;
}

export const UnitPayHero: React.FC<UnitPayHeroProps> = ({ onSearchClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F7FAFF] via-[#D9EAFF]/20 to-[#F7FAFF] pt-12 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Decorative Radial Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-[#1769E0]/10 via-[#0751C9]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* 1. Eyebrow Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
              <Badge variant="verified" className="px-3.5 py-1 text-xs shadow-sm bg-white/90 backdrop-blur-md border border-[#D9EAFF]">
                <ShieldCheck className="w-4 h-4 text-[#1769E0]" />
                <span>Verified Digital Car Yard Platform</span>
              </Badge>
            </motion.div>

            {/* 2. Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#10233F] tracking-tight leading-[1.1]"
            >
              {siteConfig.tagline}
              <span className="block mt-2 bg-gradient-to-r from-[#1769E0] via-[#0751C9] to-[#0038BC] bg-clip-text text-transparent">
                Kenya's Smarter Car Yard
              </span>
            </motion.h1>

            {/* 3. Subtitle Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-[#64748B] font-normal leading-relaxed max-w-xl"
            >
              {siteConfig.secondaryTagline} Browse verified vehicles, request physical inspections, and reserve instantly via M-Pesa STK push.
            </motion.p>

            {/* 4. CTA Button Group & Mobile Action Bar */}
            <motion.div variants={itemVariants} className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={onSearchClick}
                  className="font-bold shadow-lg shadow-[#1769E0]/25 group active:scale-95 transition-transform"
                >
                  <span>Browse Inventory</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <a href="/sell">
                  <Button size="lg" variant="outline" className="font-bold bg-white active:scale-95 transition-transform">
                    Sell Your Car
                  </Button>
                </a>
              </div>

              {/* Inspiration Action Bar Container for Mobile & Tablet Overview */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#D9EAFF] shadow-sm max-w-xl">
                <div className="grid grid-cols-3 divide-x divide-[#D9EAFF] text-center">
                  <a
                    href="/buy"
                    className="flex flex-col items-center justify-center py-2 px-1 hover:bg-[#F7FAFF] rounded-xl transition-all group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#D9EAFF]/60 flex items-center justify-center mb-1 group-hover:bg-[#1769E0] transition-colors">
                      <ArrowRight className="w-4 h-4 text-[#1769E0] group-hover:text-white transition-colors rotate-[315deg]" />
                    </div>
                    <span className="text-xs font-black tracking-wider text-[#1769E0]">BUY</span>
                  </a>

                  <a
                    href="/sell"
                    className="flex flex-col items-center justify-center py-2 px-1 hover:bg-[#F7FAFF] rounded-xl transition-all group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mb-1 group-hover:bg-[#DC2626] transition-colors">
                      <Zap className="w-4 h-4 text-[#DC2626] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-black tracking-wider text-[#DC2626]">SELL</span>
                  </a>

                  <a
                    href="/admin"
                    className="flex flex-col items-center justify-center py-2 px-1 hover:bg-[#F7FAFF] rounded-xl transition-all group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#D9EAFF]/60 flex items-center justify-center mb-1 group-hover:bg-[#0038BC] transition-colors">
                      <ShieldCheck className="w-4 h-4 text-[#0038BC] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-black tracking-wider text-[#0038BC]">YARD ADMIN</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* 5. Trust Metrics Row */}
            <motion.div variants={itemVariants} className="pt-4 border-t border-[#D9EAFF] flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-[#10233F]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Logbook Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#1769E0] shrink-0" />
                <span>Instant M-Pesa Holding</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>0% Escrow Fraud</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: UnitPay Glass Floating Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            {/* Smooth Floating Container Wrapper */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: [0.45, 0, 0.55, 1], // Ultra smooth sine curve float
              }}
              className="relative"
            >
              {/* Primary Main Glass Card */}
              <div className="relative rounded-3xl bg-white/90 backdrop-blur-xl border border-white p-4 sm:p-6 shadow-2xl shadow-[#0751C9]/15 hover:shadow-[#0751C9]/25 transition-shadow duration-500">
                
                {/* Featured Vehicle Showcase Image */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-[#D9EAFF]">
                  <VehicleImageWithFallback
                    make="Toyota"
                    model="Land Cruiser 300"
                    year={2024}
                    image={{
                      id: 'hero-img',
                      vehicle_id: 'v2',
                      image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.29 (2)_Yardy_Imports.jpg',
                      display_order: 1,
                      is_primary: true,
                      license_status: 'authorized',
                      source_type: 'local_image_library',
                      created_at: ''
                    }}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlaid Live Price Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D9EAFF] shadow-lg">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">Featured Verified Listing</div>
                    <div className="text-sm font-black text-[#0038BC]">KES 15,050,000</div>
                  </div>
                </div>

                {/* Vehicle Spec Badges Row */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-[#F7FAFF] p-2.5 rounded-xl border border-[#D9EAFF] text-center">
                    <div className="text-[9px] font-bold text-[#64748B] uppercase">Engine</div>
                    <div className="text-xs font-black text-[#10233F]">3.3L Twin Turbo</div>
                  </div>
                  <div className="bg-[#F7FAFF] p-2.5 rounded-xl border border-[#D9EAFF] text-center">
                    <div className="text-[9px] font-bold text-[#64748B] uppercase">Mileage</div>
                    <div className="text-xs font-black text-[#10233F]">8,000 KM</div>
                  </div>
                  <div className="bg-[#F7FAFF] p-2.5 rounded-xl border border-[#D9EAFF] text-center">
                    <div className="text-[9px] font-bold text-[#64748B] uppercase">Import Status</div>
                    <div className="text-xs font-black text-emerald-600">Container Ready</div>
                  </div>
                </div>

              </div>

              {/* Smooth Floating Counter-Moving Pill Badge */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: [0.45, 0, 0.55, 1],
                }}
                className="absolute -top-5 -right-3 sm:top-2 sm:right-2 bg-gradient-to-br from-[#0038BC] to-[#1769E0] text-white p-3.5 rounded-2xl shadow-xl border border-white/20 hidden sm:flex items-center gap-3 z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-black">99.4% Verified</div>
                  <div className="text-[10px] text-[#D9EAFF]">Clean Logbook History</div>
                </div>
              </motion.div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
