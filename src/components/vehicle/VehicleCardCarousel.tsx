import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle, VehicleImage } from '../../types/database';
import { Badge } from '../ui/Badge';
import { VehicleImageWithFallback } from '../ui/VehicleImageWithFallback';
import { getVehiclePrimaryImage } from '../../lib/utils/imageResolver';

interface VehicleCardCarouselProps {
  vehicle: Vehicle;
  images: VehicleImage[];
}

export const VehicleCardCarousel: React.FC<VehicleCardCarouselProps> = ({ vehicle, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const validImages = images && images.length > 0 ? images : [];
  const hasMultipleImages = validImages.length > 1;

  // Auto-play random shuffle transition
  const autoShuffleSlide = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => {
      let nextIdx = Math.floor(Math.random() * validImages.length);
      if (nextIdx === prev && validImages.length > 1) {
        nextIdx = (prev + 1) % validImages.length;
      }
      return nextIdx;
    });
  }, [hasMultipleImages, validImages.length]);

  // Sequential navigation for manual arrow / swipe controls
  const nextSlide = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [hasMultipleImages, validImages.length]);

  const prevSlide = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [hasMultipleImages, validImages.length]);

  useEffect(() => {
    if (!hasMultipleImages || isPaused) return;

    const timer = setInterval(() => {
      autoShuffleSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [hasMultipleImages, isPaused, autoShuffleSlide]);

  // Pause & delayed resume on user interaction
  const pauseAndScheduleResume = useCallback(() => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  // Desktop arrow click handlers
  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pauseAndScheduleResume();
    prevSlide();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pauseAndScheduleResume();
    nextSlide();
  };

  // Touch handlers for mobile horizontal swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultipleImages || touchStartX.current === null || touchStartY.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Check if movement is predominantly horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    pauseAndScheduleResume();
  };

  // Image load error fallback
  const handleImageError = (imgId: string) => {
    setFailedImageIds((prev) => new Set(prev).add(imgId));
  };

  const currentImage = validImages[currentIndex] || getVehiclePrimaryImage(vehicle);
  const isCurrentImageFailed = currentImage?.id ? failedImageIds.has(currentImage.id) : false;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative aspect-[16/10] overflow-hidden bg-slate-100 touch-pan-y select-none group/carousel"
    >
      {/* Image Display with Smooth Fade-In Effect */}
      {isCurrentImageFailed || !currentImage ? (
        <VehicleImageWithFallback
          image={null}
          make={vehicle.make}
          model={vehicle.model}
          year={vehicle.year}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={currentImage.id || currentIndex}
            src={currentImage.image_url}
            alt={currentImage.alt_text || `${vehicle.year} ${vehicle.make} ${vehicle.model} - Photo ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onError={() => currentImage?.id && handleImageError(currentImage.id)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </AnimatePresence>
      )}

      {/* Navigation Arrows for Desktop */}
      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={handlePrevClick}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-[#1769E0] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 z-20 active:scale-90 shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            type="button"
            onClick={handleNextClick}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-[#1769E0] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 z-20 active:scale-90 shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Top Floating Overlay Badges */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
        {vehicle.verification_status === 'verified' && (
          <Badge variant="verified" size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified Listing
          </Badge>
        )}
        {vehicle.featured && (
          <Badge variant="warning" size="sm">
            Featured
          </Badge>
        )}
      </div>

      {/* Location Tag & Image Counter Badge */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-[#2D8CFF]" />
          <span>{vehicle.location}</span>
        </div>

        {hasMultipleImages && (
          <div className="bg-[#10233F]/85 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 shadow-xs tracking-tight">
            {currentIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Favorite Icon Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        aria-label="Save to favorites"
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#64748B] hover:text-red-500 hover:bg-white active:scale-90 transition-all z-20 shadow-xs"
      >
        <Heart className="w-4 h-4" />
      </button>
    </div>
  );
};
