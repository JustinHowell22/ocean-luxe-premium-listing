import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroGallery({ photos, onPhotoChange, activeIndex }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && activeIndex < photos.length - 1) {
      onPhotoChange(activeIndex + 1);
    }
    if (isRightSwipe && activeIndex > 0) {
      onPhotoChange(activeIndex - 1);
    }
  };

  const goNext = useCallback(() => {
    if (activeIndex < photos.length - 1) {
      onPhotoChange(activeIndex + 1);
    } else {
      onPhotoChange(0);
    }
  }, [activeIndex, photos.length, onPhotoChange]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      onPhotoChange(activeIndex - 1);
    } else {
      onPhotoChange(photos.length - 1);
    }
  }, [activeIndex, photos.length, onPhotoChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  if (!photos || photos.length === 0) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center">
        <div className="text-white/50 text-lg">No photos available</div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-screen w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Photos with Crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${photos[activeIndex]})` }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40" />
        </motion.div>
      </AnimatePresence>

      {/* Desktop Navigation Arrows */}
      <div className="hidden md:flex absolute inset-y-0 left-0 items-center z-20 pl-6">
        <button
          onClick={goPrev}
          className="group p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:text-teal-300 transition-colors" />
        </button>
      </div>
      <div className="hidden md:flex absolute inset-y-0 right-0 items-center z-20 pr-6">
        <button
          onClick={goNext}
          className="group p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:text-teal-300 transition-colors" />
        </button>
      </div>

      {/* Photo Counter - Mobile */}
      <div className="md:hidden absolute top-24 right-4 z-20">
        <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-lg border border-white/10">
          <span className="text-white/90 text-sm font-medium">
            {activeIndex + 1} / {photos.length}
          </span>
        </div>
      </div>
    </div>
  );
}