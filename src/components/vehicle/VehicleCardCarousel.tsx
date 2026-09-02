import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const validImages = images && images.length > 0 ? images : [];
  const hasMultipleImages = validImages.length > 1;

  // Detect reduced-motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-play sequential advance
  const nextSlide = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [hasMultipleImages, validImages.length]);

  const prevSlide = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [hasMultipleImages, validImages.length]);

  // Preload adjacent images (prev & next) for zero-gap transitions
  useEffect(() => {
    if (!hasMultipleImages) return;
    const prevIdx = (currentIndex - 1 + validImages.length) % validImages.length;
    const nextIdx = (currentIndex + 1) % validImages.length;

    [prevIdx, nextIdx].forEach((idx) => {
      const imgObj = validImages[idx];
      if (imgObj?.image_url && !failedImageIds.has(imgObj.id || '')) {
        const img = new Image();
        img.src = imgObj.image_url;
      }
    });
  }, [currentIndex, hasMultipleImages, validImages, failedImageIds]);

  // Auto-play timer
  useEffect(() => {
    if (!hasMultipleImages || isPaused || isDragging) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [hasMultipleImages, isPaused, isDragging, nextSlide]);

  // Pause & delayed resume on interaction
  const pauseAndScheduleResume = useCallback(() => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
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

  // Touch & Pointer Gesture Handling (Real-Time Dragging)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!hasMultipleImages) return;
    // Only capture primary touch/mouse button
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    setIsDragging(true);
    setDragOffsetX(0);
    setIsPaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.clientX - touchStartX.current;
    const deltaY = e.clientY - touchStartY.current;

    // Follow finger horizontally if movement is predominantly horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDragOffsetX(deltaX);
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const containerWidth = containerRef.current?.offsetWidth || 300;
    const threshold = Math.min(containerWidth * 0.15, 45);

    if (dragOffsetX < -threshold) {
      nextSlide();
    } else if (dragOffsetX > threshold) {
      prevSlide();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsDragging(false);
    setDragOffsetX(0);
    pauseAndScheduleResume();
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMultipleImages) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      pauseAndScheduleResume();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      pauseAndScheduleResume();
      nextSlide();
    }
  };

  // Image load error fallback handler
  const handleImageError = (imgId: string) => {
    setFailedImageIds((prev) => new Set(prev).add(imgId));
  };

  // If no images or single image, render simple static image container
  if (!hasMultipleImages) {
    const singleImg = validImages[0] || getVehiclePrimaryImage(vehicle);
    return (
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 select-none">
        <VehicleImageWithFallback
          image={singleImg}
          make={vehicle.make}
          model={vehicle.model}
          year={vehicle.year}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay Badges */}
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

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <MapPin className="w-3 h-3 text-[#2D8CFF]" />
            <span>{vehicle.location}</span>
          </div>
        </div>

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
  }

  // Calculate sliding track transform style
  const transitionStyle = isDragging
    ? 'none'
    : prefersReducedMotion
    ? 'none'
    : 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)';

  const transformStyle = `translate3d(calc(${-currentIndex * 100}% + ${dragOffsetX}px), 0, 0)`;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      className="relative aspect-[16/10] overflow-hidden bg-slate-100 touch-pan-y select-none group/carousel focus:outline-none"
    >
      {/* GPU-Accelerated Physical Horizontal Sliding Track */}
      <div
        className="flex w-full h-full"
        style={{
          transform: transformStyle,
          transition: transitionStyle,
          willChange: 'transform',
        }}
      >
        {validImages.map((img, idx) => {
          const isFailed = img.id ? failedImageIds.has(img.id) : false;
          return (
            <div key={img.id || idx} className="w-full h-full shrink-0 flex-none relative aspect-[16/10]">
              {isFailed ? (
                <VehicleImageWithFallback
                  image={null}
                  make={vehicle.make}
                  model={vehicle.model}
                  year={vehicle.year}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={img.image_url}
                  alt={img.alt_text || `${vehicle.year} ${vehicle.make} ${vehicle.model} - Photo ${idx + 1}`}
                  onError={() => img.id && handleImageError(img.id)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Arrow Navigation */}
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

      {/* Top Overlay Badges */}
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

      {/* Location Tag & Image Counter */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-[#2D8CFF]" />
          <span>{vehicle.location}</span>
        </div>

        <div className="bg-[#10233F]/85 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 shadow-xs tracking-tight">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* Favorite Button */}
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
