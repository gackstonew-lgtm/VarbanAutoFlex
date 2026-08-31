import React, { useState } from 'react';
import { Camera, Shield } from 'lucide-react';
import { VehicleImage } from '../../types/database';

interface VehicleImageWithFallbackProps {
  image?: VehicleImage | null;
  make: string;
  model: string;
  year: number;
  alt?: string;
  className?: string;
  aspectRatio?: string;
}

export const VehicleImageWithFallback: React.FC<VehicleImageWithFallbackProps> = ({
  image,
  make,
  model,
  year,
  alt,
  className = '',
  aspectRatio = 'aspect-[16/10]'
}) => {
  const [imageError, setImageError] = useState(false);

  const isAuthorized = image && image.image_url && image.license_status === 'authorized' && !imageError;

  if (isAuthorized) {
    return (
      <img
        src={image.image_url}
        alt={alt || `${year} ${make} ${model}`}
        className={className}
        loading="lazy"
        onError={() => setImageError(true)}
      />
    );
  }

  // Branded "Photo Coming Soon" state (No generic stock photos)
  return (
    <div className={`w-full h-full bg-gradient-to-br from-[#0038BC] via-[#0751C9] to-[#1769E0] text-white flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 shadow-inner">
        <Camera className="w-6 h-6 text-[#D9EAFF]" />
      </div>
      <div className="font-extrabold text-sm tracking-tight text-white">{year} {make} {model}</div>
      <div className="text-[11px] font-semibold text-[#D9EAFF] mt-0.5">Verified Demo Listing</div>
      <div className="mt-3 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-white/90 border border-white/20">
        Photo Coming Soon
      </div>
    </div>
  );
};
