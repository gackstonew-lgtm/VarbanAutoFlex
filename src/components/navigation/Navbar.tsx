import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, ShieldCheck, Menu, X, PhoneCall, User, RefreshCw, Gavel, Globe, Wrench, Navigation, Key, Building, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../config/site';
import { AuthService, AuthUser } from '../../lib/supabase/client';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    AuthService.getCurrentUser().then(setUser).catch(() => setUser(null));
  }, [location.pathname]);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const adminRoute = user?.role === 'admin' ? '/admin' : '/admin/login';

  const navLinks = [
    { name: 'Buy Cars', path: '/buy', icon: Search },
    { name: 'Sell Your Car', path: '/sell', icon: PlusCircle },
    { name: 'Trade In', path: '/trade-in', icon: RefreshCw },
    { name: 'Auction', path: '/auction', icon: Gavel },
    { name: 'Import', path: '/import', icon: Globe },
    { name: 'Car Yard Admin', path: adminRoute, icon: ShieldCheck },
  ];

  const mobileMenuItems = [
    {
      name: 'Sign in / Register Account',
      path: user ? (user.role === 'admin' ? '/admin' : '/account') : '/login',
      icon: User
    },
    {
      name: 'Admin Portal',
      path: adminRoute,
      icon: ShieldCheck
    },
    {
      name: 'Car Accessories & Spares',
      path: '/accessories',
      icon: Wrench
    },
    {
      name: 'Tracker Installations',
      path: '/trackers',
      icon: Navigation
    },
    {
      name: 'Car Hire Services',
      path: '/car-hire',
      icon: Key
    },
    {
      name: 'Dealerships',
      path: '/dealerships',
      icon: Building
    },
    {
      name: 'About Us',
      path: '/about',
      icon: Info
    }
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
        <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#1769E0] rounded-xl p-1 shrink-0">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-[#D9EAFF] p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
            <img
              src="/logo.jpeg"
              alt="Varban Auto Flex Logo"
              className="h-full w-full object-contain rounded-lg"
            />
          </div>
          <div className="flex flex-col justify-center text-left min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#10233F] leading-none group-hover:text-[#1769E0] transition-colors font-sans truncate">
                {siteConfig.name}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#1769E0] tracking-wide mt-0.5 font-sans truncate">
              {siteConfig.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#1769E0] ${
                  isActive
                    ? 'bg-[#1769E0] text-white shadow-sm'
                    : 'text-[#10233F] hover:bg-[#F7FAFF] hover:text-[#1769E0]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#1769E0]'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF] text-[#10233F] text-xs font-bold hover:border-[#1769E0] hover:text-[#1769E0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-[#64748B] uppercase tracking-wider font-extrabold">Hotline</span>
            </div>
            <span className="hidden xl:inline">{siteConfig.contact.phone}</span>
          </a>

          <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} className="hidden md:block">
            <button className="px-4 py-2 rounded-xl bg-white border border-[#D9EAFF] text-[#10233F] text-xs font-extrabold flex items-center gap-1.5 hover:border-[#1769E0] hover:bg-[#F7FAFF] transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1769E0]">
              <User className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>{user ? (user.role === 'admin' ? 'Admin Hub' : 'My Account') : 'Sign In'}</span>
            </button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            className="min-w-[48px] min-h-[48px] p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D9EAFF] text-[#10233F] hover:text-[#1769E0] hover:bg-[#D9EAFF]/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#1769E0] md:hidden"
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

            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 z-50 bg-white border-b border-[#D9EAFF] px-4 py-5 shadow-2xl overflow-y-auto max-h-[calc(100vh-70px)] md:hidden pb-safe"
            >
              <div className="max-w-md mx-auto space-y-5">

                {/* Quick Action Grid */}
                <div className="bg-[#F7FAFF] p-3 rounded-2xl border border-[#D9EAFF] shadow-sm">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] mb-2 px-1 text-center sm:text-left">
                    Quick Services
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-[#D9EAFF]/80">
                    <Link
                      to="/buy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg hover:bg-[#F7FAFF] text-center"
                    >
                      <Search className="w-4 h-4 text-[#1769E0] mb-1" />
                      <span className="text-[11px] font-black text-[#1769E0]">BUY</span>
                    </Link>
                    <Link
                      to="/sell"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg hover:bg-[#F7FAFF] text-center"
                    >
                      <PlusCircle className="w-4 h-4 text-rose-600 mb-1" />
                      <span className="text-[11px] font-black text-rose-600">SELL</span>
                    </Link>
                    <Link
                      to="/trade-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg hover:bg-[#F7FAFF] text-center"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-600 mb-1" />
                      <span className="text-[11px] font-black text-emerald-600">TRADE IN</span>
                    </Link>
                  </div>
                </div>

                {/* Main 7 Mobile Navigation Items */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] px-2 mb-1">
                    Mobile Menu & Services
                  </div>
                  {mobileMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#1769E0] to-[#0751C9] text-white shadow-sm'
                            : 'bg-[#F7FAFF] text-[#10233F] hover:bg-[#D9EAFF]/60 border border-[#D9EAFF]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1769E0]'}`} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
