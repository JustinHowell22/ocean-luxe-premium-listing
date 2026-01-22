import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';

export default function ThumbnailStrip({ photos, activeIndex, onSelect, maxVisible = 10, onFullscreen }) {
  if (!photos || photos.length === 0) return null;

  const visiblePhotos = photos.slice(0, maxVisible);
  const remainingCount = photos.length - maxVisible;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      {/* Fullscreen Button */}
      <motion.button
        onClick={() => onFullscreen?.(activeIndex)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center hover:from-teal-500/30 hover:to-cyan-500/30 transition-all duration-300"
        title="View fullscreen"
      >
        <Maximize2 className="w-5 h-5 text-teal-400" />
      </motion.button>
      {visiblePhotos.map((photo, index) => (
        <motion.button
          key={index}
          onClick={() => onSelect(index)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-300 ${
            activeIndex === index
              ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          <img
            src={photo}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {activeIndex === index && (
            <motion.div
              layoutId="activeThumb"
              className="absolute inset-0 border-2 border-teal-400 rounded-lg"
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.button>
      ))}
      
      {remainingCount > 0 && (
        <button
          onClick={() => onSelect(maxVisible)}
          className="flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
        >
          <span className="text-white font-semibold text-sm">+{remainingCount}</span>
        </button>
      )}
    </div>
  );
}