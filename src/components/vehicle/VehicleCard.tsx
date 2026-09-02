import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Gauge, Fuel, Cog, Calendar, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Vehicle } from '../../types/database';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { VehicleCardCarousel } from './VehicleCardCarousel';
import { resolveVehicleImages } from '../../lib/utils/imageResolver';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const images = resolveVehicleImages(vehicle);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white rounded-3xl border border-[#D9EAFF] overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#1769E0]/40 transition-all duration-300 flex flex-col h-full"
    >
      {/* Interactive Image Header Container / Slideshow */}
      <VehicleCardCarousel vehicle={vehicle} images={images} />

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Seller / Dealer */}
        <div className="text-xs font-semibold text-[#0751C9] mb-1">
          {vehicle.dealer_name || (vehicle.seller_type === 'dealer' ? 'Verified Car Yard' : 'Private Seller')}
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-[#10233F] group-hover:text-[#1769E0] transition-colors line-clamp-1">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-xs text-[#64748B] line-clamp-1 mb-4">
          {vehicle.variant || `${vehicle.engine_cc}cc • ${vehicle.drive_type || '2WD'}`}
        </p>

        {/* Specs Pill Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#10233F] bg-[#F7FAFF] p-2.5 rounded-xl border border-[#D9EAFF] mb-4">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#1769E0] shrink-0" />
            <span className="font-bold truncate">{vehicle.mileage.toLocaleString()} KM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cog className="w-3.5 h-3.5 text-[#1769E0] shrink-0" />
            <span className="font-bold truncate">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-[#1769E0] shrink-0" />
            <span className="font-bold truncate">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1769E0] shrink-0" />
            <span className="font-bold truncate">{vehicle.year}</span>
          </div>
        </div>

        {/* Price & Actions Row */}
        <div className="mt-auto pt-2 border-t border-[#D9EAFF] flex items-center justify-between gap-2">
          <div className="min-w-0 shrink">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Cash Price</div>
            <div className="text-base sm:text-lg font-black text-[#0038BC] truncate">
              KES {vehicle.price.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link to={`/vehicles/${vehicle.id}`}>
              <Button size="sm" variant="outline" className="px-2.5 sm:px-3 text-xs active:scale-95 transition-transform">
                Details
              </Button>
            </Link>
            <Link to={`/vehicles/${vehicle.id}`}>
              <Button size="sm" variant="primary" className="px-2.5 sm:px-3 text-xs active:scale-95 transition-transform">
                Reserve
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
