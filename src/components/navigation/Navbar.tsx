import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, ShieldCheck, Menu, X, PhoneCall, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../config/site';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu automatically when route location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key press, body scroll locking, and window resize listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('menu-open');
    }

    window.addEventListener('resize', handleResize);

    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Buy Cars', path: '/buy', icon: Search },
    { name: 'Sell Your Car', path: '/sell', icon: PlusCircle },
    { name: 'Car Yard Admin', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-[#D9EAFF]'
          : 'bg-white py-3.5 border-b border-[#D9EAFF]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Official Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#1769E0] rounded-xl p-1">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-[#D9EAFF] p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
            <img
              src="/logo.jpeg"
              alt="Yardly Automotive Logo"
              className="h-full w-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-[#10233F] group-hover:text-[#1769E0] transition-colors leading-none">
              {siteConfig.name}
            </div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-0.5">
              Automotive Hub
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F7FAFF] p-1.5 rounded-2xl border border-[#D9EAFF]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1769E0] ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-[#1769E0] to-[#0751C9] shadow-sm'
                    : 'text-[#10233F] hover:text-[#1769E0] hover:bg-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#1769E0]'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Button & Contact */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="flex items-center gap-2 text-xs font-bold text-[#10233F] hover:text-[#1769E0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1769E0] rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-full bg-[#D9EAFF] flex items-center justify-center text-[#1769E0]">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="hidden lg:inline">{siteConfig.contact.phone}</span>
          </a>

          <Link to="/auth">
            <button className="px-4 py-2.5 rounded-xl bg-white border border-[#D9EAFF] text-[#10233F] text-xs font-extrabold flex items-center gap-1.5 hover:border-[#1769E0] hover:bg-[#F7FAFF] transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1769E0]">
              <User className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Portal</span>
            </button>
          </Link>
        </div>

        {/* Semantic Mobile Menu Toggle Button (Min 48px Touch Target) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            className="min-w-[48px] min-h-[48px] p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF] text-[#10233F] hover:text-[#1769E0] hover:bg-[#D9EAFF]/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
          >
            {mobileMenuOpen ? (
              <>
                <X className="w-5 h-5 text-[#10233F]" />
                <span className="text-xs font-bold text-[#10233F]">Close</span>
              </>
            ) : (
              <>
                <Menu className="w-5 h-5 text-[#1769E0]" />
                <span className="text-xs font-bold text-[#10233F]">Menu</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Backdrop & Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Subtle Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setMobileMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="fixed inset-0 top-[65px] bg-[#10233F]/40 backdrop-blur-xs z-40 md:hidden"
              aria-hidden="true"
            />

            {/* Mobile Animated Panel Container */}
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 z-50 bg-white border-b border-[#D9EAFF] px-4 py-5 shadow-2xl overflow-y-auto max-h-[calc(100vh-70px)] md:hidden pb-safe"
            >
              <div className="max-w-md mx-auto space-y-6">

                {/* Inspired Quick Action Bar (BUY | SELL | YARD ADMIN) */}
                <div className="bg-[#F7FAFF] p-3 rounded-2xl border border-[#D9EAFF] shadow-sm">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] mb-2 px-1 text-center sm:text-left">
                    Quick Navigation Actions
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-[#D9EAFF]/80">
                    
                    {/* BUY */}
                    <Link
                      to="/buy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#F7FAFF] transition-all group text-center active:scale-95 border border-transparent hover:border-[#D9EAFF]"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#D9EAFF]/60 flex items-center justify-center mb-1 group-hover:bg-[#1769E0] transition-colors">
                        <Search className="w-4 h-4 text-[#1769E0] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-black tracking-wider text-[#1769E0]">BUY</span>
                      <span className="text-[9px] font-semibold text-[#64748B] hidden xs:block mt-0.5">Browse</span>
                    </Link>

                    {/* SELL */}
                    <Link
                      to="/sell"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#F7FAFF] transition-all group text-center active:scale-95 border border-transparent hover:border-[#D9EAFF]"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mb-1 group-hover:bg-[#DC2626] transition-colors">
                        <PlusCircle className="w-4 h-4 text-[#DC2626] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-black tracking-wider text-[#DC2626]">SELL</span>
                      <span className="text-[9px] font-semibold text-[#64748B] hidden xs:block mt-0.5">List Car</span>
                    </Link>

                    {/* YARD ADMIN */}
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#F7FAFF] transition-all group text-center active:scale-95 border border-transparent hover:border-[#D9EAFF]"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#D9EAFF]/60 flex items-center justify-center mb-1 group-hover:bg-[#0038BC] transition-colors">
                        <ShieldCheck className="w-4 h-4 text-[#0038BC] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-black tracking-wider text-[#0038BC]">YARD ADMIN</span>
                      <span className="text-[9px] font-semibold text-[#64748B] hidden xs:block mt-0.5">Dashboard</span>
                    </Link>

                  </div>
                </div>

                {/* MAIN NAVIGATION */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] px-2 mb-1">
                    Main Pages
                  </div>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all active:scale-[0.99] ${
                          isActive
                            ? 'bg-gradient-to-r from-[#1769E0] to-[#0751C9] text-white shadow-sm'
                            : 'bg-[#F7FAFF] text-[#10233F] hover:bg-[#D9EAFF]/60 border border-[#D9EAFF]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1769E0]'}`} />
                          <span>{link.name}</span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* MARKETPLACE QUICK FILTERS */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] px-2 mb-1">
                    Popular Marketplace Categories
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/buy?make=Toyota"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF]/60 text-xs font-bold text-[#10233F] hover:text-[#1769E0] hover:bg-white flex items-center justify-between transition-colors"
                    >
                      <span>Toyota Vehicles</span>
                      <span className="text-[10px] text-[#64748B]">→</span>
                    </Link>
                    <Link
                      to="/buy?transmission=Automatic"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF]/60 text-xs font-bold text-[#10233F] hover:text-[#1769E0] hover:bg-white flex items-center justify-between transition-colors"
                    >
                      <span>Automatic Cars</span>
                      <span className="text-[10px] text-[#64748B]">→</span>
                    </Link>
                    <Link
                      to="/buy?maxPrice=5000000"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF]/60 text-xs font-bold text-[#10233F] hover:text-[#1769E0] hover:bg-white flex items-center justify-between transition-colors"
                    >
                      <span>Under KES 5M</span>
                      <span className="text-[10px] text-[#64748B]">→</span>
                    </Link>
                    <Link
                      to="/buy?fuelType=Hybrid"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF]/60 text-xs font-bold text-[#10233F] hover:text-[#1769E0] hover:bg-white flex items-center justify-between transition-colors"
                    >
                      <span>Hybrid Models</span>
                      <span className="text-[10px] text-[#64748B]">→</span>
                    </Link>
                  </div>
                </div>

                {/* ACCOUNT & PARTNER PORTAL */}
                <div className="pt-2 border-t border-[#D9EAFF]">
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-[#0038BC] hover:bg-[#0751C9] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <User className="w-4 h-4 text-white" />
                    <span>Sign In / Partner Portal</span>
                  </Link>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

