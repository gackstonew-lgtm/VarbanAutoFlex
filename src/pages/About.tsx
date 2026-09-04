import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { ShieldCheck, Award, CheckCircle2, Zap, Phone, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '../config/site';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-8 font-sans">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0038BC] via-[#0751C9] to-[#1769E0] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold uppercase tracking-wider text-[#D9EAFF]">
            <ShieldCheck className="w-4 h-4 text-[#2D8CFF]" />
            <span>KENYA'S DIGITAL CAR YARD PLATFORM</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            About Varban Auto Flex
          </h1>
          <p className="text-sm sm:text-base text-[#D9EAFF] max-w-2xl mx-auto">
            {siteConfig.description} We connect car yards, direct importers, and vehicle buyers across Kenya with logbook-verified listings and secure deposit holding.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
        
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9EAFF]/60 text-[#1769E0] flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5 text-[#1769E0]" />
            </div>
            <h3 className="text-lg font-black text-[#10233F]">100% Logbook Audit</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Every vehicle listed on Varban Auto Flex undergoes mandatory logbook, NTSA/TIMS ownership, and chassis verification to eliminate fraud.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9EAFF]/60 text-[#1769E0] flex items-center justify-center font-black">
              <Zap className="w-5 h-5 text-[#1769E0]" />
            </div>
            <h3 className="text-lg font-black text-[#10233F]">Instant M-Pesa Holding</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Reserve your dream car with a fully refundable holding deposit (KES 50,000) locked safely for 3 days while scheduling physical yard inspection.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9EAFF]/60 text-[#1769E0] flex items-center justify-center font-black">
              <Award className="w-5 h-5 text-[#1769E0]" />
            </div>
            <h3 className="text-lg font-black text-[#10233F]">Digital Car Yard Network</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Partnered with top car yards and commercial importers in Nairobi, Mombasa, and Nakuru to give you maximum selection and competitive pricing.
            </p>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#D9EAFF] shadow-lg max-w-3xl mx-auto space-y-6 text-center">
          <h2 className="text-2xl font-black text-[#10233F]">Contact Varban Auto Flex Headquarters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#10233F] pt-2">
            <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#D9EAFF] space-y-1">
              <MapPin className="w-5 h-5 text-[#1769E0] mx-auto mb-1" />
              <div className="font-bold">{siteConfig.contact.address}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#D9EAFF] space-y-1">
              <Phone className="w-5 h-5 text-[#1769E0] mx-auto mb-1" />
              <div className="font-bold">{siteConfig.contact.phone}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#D9EAFF] space-y-1">
              <Mail className="w-5 h-5 text-[#1769E0] mx-auto mb-1" />
              <div className="font-bold">{siteConfig.contact.email}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
