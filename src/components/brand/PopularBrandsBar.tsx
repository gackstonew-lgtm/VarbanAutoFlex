import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface BrandItem {
  name: string;
  count?: string;
  svgLogo: React.ReactNode;
}

export const POPULAR_BRANDS: BrandItem[] = [
  {
    name: 'Toyota',
    count: '15+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 60" className="w-8 h-5 sm:w-10 sm:h-6 shrink-0" fill="none">
        <ellipse cx="50" cy="30" rx="46" ry="26" stroke="currentColor" strokeWidth="4.5" />
        <ellipse cx="50" cy="30" rx="36" ry="12" stroke="currentColor" strokeWidth="4" />
        <ellipse cx="50" cy="30" rx="14" ry="24" stroke="currentColor" strokeWidth="4" />
      </svg>
    )
  },
  {
    name: 'Mazda',
    count: '8+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 70" className="w-8 h-5 sm:w-10 sm:h-6 shrink-0" fill="none">
        <ellipse cx="50" cy="35" rx="44" ry="28" stroke="currentColor" strokeWidth="4.5" />
        <path d="M22 35 Q50 15 78 35 Q50 48 22 35 Q50 25 78 35" stroke="currentColor" strokeWidth="4" fill="none" />
      </svg>
    )
  },
  {
    name: 'Mercedes-Benz',
    count: '10+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" fill="none">
        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
        <path d="M50 10 L50 50 L20 75 M50 50 L80 75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: 'Honda',
    count: '6+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 80" className="w-7 h-5 sm:w-9 sm:h-6 shrink-0" fill="none">
        <rect x="8" y="8" width="84" height="64" rx="14" stroke="currentColor" strokeWidth="5" />
        <path d="M26 20 L26 60 M74 20 L74 60 M26 40 L74 40 M26 20 C40 18 60 18 74 20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: 'BMW',
    count: '7+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" fill="none">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="#10233F" />
        <circle cx="50" cy="50" r="32" stroke="#FFFFFF" strokeWidth="3" fill="#FFFFFF" />
        <path d="M50 18 A32 32 0 0 1 82 50 L50 50 Z" fill="#1769E0" />
        <path d="M18 50 A32 32 0 0 1 50 82 L50 50 Z" fill="#1769E0" />
        <text x="50" y="14" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">B M W</text>
      </svg>
    )
  },
  {
    name: 'Ford',
    count: '5+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 120 60" className="w-9 h-5 sm:w-11 sm:h-6 shrink-0" fill="none">
        <ellipse cx="60" cy="30" rx="54" ry="24" fill="#0038BC" stroke="currentColor" strokeWidth="3" />
        <text x="60" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="serif" fontStyle="italic">Ford</text>
      </svg>
    )
  },
  {
    name: 'Nissan',
    count: '9+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 120 70" className="w-9 h-5 sm:w-11 sm:h-6 shrink-0" fill="none">
        <circle cx="60" cy="35" r="28" stroke="currentColor" strokeWidth="5" />
        <rect x="10" y="27" width="100" height="16" fill="currentColor" rx="3" />
        <text x="60" y="39" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="1">NISSAN</text>
      </svg>
    )
  },
  {
    name: 'Subaru',
    count: '8+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 60" className="w-8 h-5 sm:w-10 sm:h-6 shrink-0" fill="none">
        <ellipse cx="50" cy="30" rx="45" ry="25" stroke="currentColor" strokeWidth="4" />
        <polygon points="35,22 39,30 35,38 31,30" fill="#1769E0" />
        <polygon points="50,16 53,22 50,28 47,22" fill="#1769E0" />
        <polygon points="65,22 68,27 65,32 62,27" fill="#1769E0" />
        <polygon points="52,34 55,39 52,44 49,39" fill="#1769E0" />
        <polygon points="68,36 71,40 68,44 65,40" fill="#1769E0" />
        <polygon points="38,36 41,40 38,44 35,40" fill="#1769E0" />
      </svg>
    )
  },
  {
    name: 'Audi',
    count: '4+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 140 60" className="w-10 h-5 sm:w-12 sm:h-6 shrink-0" fill="none">
        <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="4" />
        <circle cx="50" cy="30" r="18" stroke="currentColor" strokeWidth="4" />
        <circle cx="70" cy="30" r="18" stroke="currentColor" strokeWidth="4" />
        <circle cx="90" cy="30" r="18" stroke="currentColor" strokeWidth="4" />
      </svg>
    )
  },
  {
    name: 'Lexus',
    count: '6+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 60" className="w-8 h-5 sm:w-10 sm:h-6 shrink-0" fill="none">
        <ellipse cx="50" cy="30" rx="44" ry="24" stroke="currentColor" strokeWidth="4.5" />
        <path d="M30 42 L65 18 L70 42 L38 42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: 'Land Rover',
    count: '5+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 120 60" className="w-10 h-5 sm:w-12 sm:h-6 shrink-0" fill="none">
        <ellipse cx="60" cy="30" rx="54" ry="24" fill="#046A38" stroke="currentColor" strokeWidth="3" />
        <text x="60" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">LAND</text>
        <text x="60" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">ROVER</text>
      </svg>
    )
  },
  {
    name: 'Volkswagen',
    count: '5+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" fill="none">
        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="5" />
        <path d="M28 28 L40 60 L50 35 L60 60 L72 28" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 60 L50 82 L68 60" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: 'Porsche',
    count: '4+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 90" className="w-7 h-6 sm:w-8 sm:h-7 shrink-0" fill="none">
        <polygon points="50,8 90,30 80,82 20,82 10,30" stroke="currentColor" strokeWidth="4.5" fill="none" />
        <path d="M30 35 H70 M50 35 V82" stroke="currentColor" strokeWidth="4" />
        <text x="50" y="24" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="900">PORSCHE</text>
      </svg>
    )
  },
  {
    name: 'Hyundai',
    count: '6+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 60" className="w-8 h-5 sm:w-10 sm:h-6 shrink-0" fill="none">
        <ellipse cx="50" cy="30" rx="44" ry="24" stroke="currentColor" strokeWidth="4" />
        <path d="M32 45 L42 15 M68 45 L58 15 M36 30 H64" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: 'Kia',
    count: '5+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 50" className="w-9 h-5 sm:w-11 sm:h-6 shrink-0" fill="none">
        <ellipse cx="50" cy="25" rx="46" ry="20" stroke="#BB162B" strokeWidth="4" fill="none" />
        <text x="50" y="32" textAnchor="middle" fill="#BB162B" fontSize="20" fontWeight="900" letterSpacing="1">KIA</text>
      </svg>
    )
  },
  {
    name: 'Jeep',
    count: '4+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 45" className="w-9 h-4 sm:w-11 sm:h-5 shrink-0" fill="none">
        <text x="50" y="32" textAnchor="middle" fill="currentColor" fontSize="24" fontWeight="900" letterSpacing="2">Jeep</text>
      </svg>
    )
  },
  {
    name: 'Mitsubishi',
    count: '4+ Vehicles',
    svgLogo: (
      <svg viewBox="0 0 100 90" className="w-7 h-6 sm:w-8 sm:h-7 shrink-0" fill="none">
        <polygon points="50,10 65,35 35,35" fill="#E60012" />
        <polygon points="65,35 95,80 65,80" fill="#E60012" />
        <polygon points="35,35 5,80 35,80" fill="#E60012" />
      </svg>
    )
  }
];

export const PopularBrandsBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeMake = searchParams.get('make') || '';
  const [isPaused, setIsPaused] = useState(false);

  const handleBrandClick = (brandName: string) => {
    if (activeMake.toLowerCase() === brandName.toLowerCase()) {
      // Toggle off / Clear filter
      navigate('/buy');
    } else {
      // Apply brand filter
      navigate(`/buy?make=${encodeURIComponent(brandName)}`);
    }
  };

  // Duplicate brand array for seamless 100% infinite looping
  const tickerItems = [...POPULAR_BRANDS, ...POPULAR_BRANDS];

  return (
    <div className="w-full bg-[#F7FAFF] border-b border-[#D9EAFF] py-3.5 px-2 sm:px-4 overflow-hidden relative z-30 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#10233F]">
            Popular Automotive Brands
          </span>
        </div>
        <button
          onClick={() => navigate('/buy')}
          className="text-[11px] font-extrabold text-[#1769E0] hover:text-[#0038BC] hover:underline transition-colors focus:outline-none"
        >
          View All Makes →
        </button>
      </div>

      {/* Infinite Horizontal Ticker Container */}
      <div
        className="w-full overflow-x-auto scrollbar-none py-1 flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className={`flex items-center gap-2.5 sm:gap-3 transition-all duration-300 ${
            isPaused ? 'animate-none' : 'animate-brand-ticker'
          }`}
          style={{
            animationDuration: '32s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite'
          }}
        >
          {tickerItems.map((brand, idx) => {
            const isActive = activeMake.toLowerCase() === brand.name.toLowerCase();
            return (
              <button
                key={`${brand.name}-${idx}`}
                onClick={() => handleBrandClick(brand.name)}
                aria-label={`Filter inventory by ${brand.name} vehicles`}
                className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1769E0] ${
                  isActive
                    ? 'bg-[#1769E0] text-white border-[#1769E0] shadow-md scale-105'
                    : 'bg-white text-[#10233F] border-[#D9EAFF] hover:border-[#1769E0] hover:bg-[#F7FAFF] shadow-xs active:scale-95'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-[#1769E0] group-hover:scale-110'} transition-transform duration-200 flex items-center`}>
                  {brand.svgLogo}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-[#10233F]'}`}>
                    {brand.name}
                  </span>
                  {brand.count && (
                    <span className={`text-[9px] font-extrabold ${isActive ? 'text-white/80' : 'text-[#64748B]'}`}>
                      {brand.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
