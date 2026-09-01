import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const items = [
    {
      name: 'Buy',
      path: '/buy',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#0038BC]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H7c-.7 0-1.3.3-1.8.7C4.3 8.6 3 10 3 10s-2.7.6-4.5 1.1C-.7 11.3-1.4 12.1-1.4 13v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M5 10l1.5-3h11L19 10" />
        </svg>
      )
    },
    {
      name: 'Sell',
      path: '/sell',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#0038BC]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14l1.5-4.5c.3-.9 1.1-1.5 2-1.5h9c.9 0 1.7.6 2 1.5L20 14v6H4v-6z" />
          <circle cx="7" cy="17" r="1.5" />
          <circle cx="17" cy="17" r="1.5" />
          <path d="M16 8l4-4m0 0h-3m3 0v3" />
        </svg>
      )
    },
    {
      name: 'Import',
      path: '/import',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#0038BC]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
          <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
        </svg>
      )
    },
    {
      name: 'Auction',
      path: '/auction',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#0038BC]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m14 13 5 5m-4-1 2 2" />
          <path d="m16 16 2-2" />
          <path d="m8.7 10.7 6.6-6.6a1 1 0 0 1 1.4 0l2.2 2.2a1 1 0 0 1 0 1.4l-6.6 6.6" />
          <path d="m2 22 5.5-5.5" />
          <path d="M10 22h8" />
        </svg>
      )
    },
    {
      name: 'Trade In',
      path: '/trade-in',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#0038BC]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-3 pt-1 pointer-events-none">
      {/* Floating 5-Column Curved Container matching uploaded reference image */}
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-[#E2EEFF] py-2 px-1 grid grid-cols-5 pointer-events-auto items-center">
        
        {items.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center text-center group focus:outline-none py-0.5"
            >
              {/* Soft Light-Blue Circular Backdrop for Icon */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group-active:scale-95 ${
                isActive 
                  ? 'bg-[#1769E0] shadow-md shadow-[#1769E0]/30' 
                  : 'bg-[#EBF3FF] hover:bg-[#D9EAFF]'
              }`}>
                {item.icon(isActive)}
              </div>

              {/* Label Centered Below Icon */}
              <span className={`text-[11px] font-extrabold mt-1 tracking-tight transition-colors whitespace-nowrap ${
                isActive ? 'text-[#1769E0]' : 'text-[#0038BC] group-hover:text-[#1769E0]'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}

      </div>
    </div>
  );
};
