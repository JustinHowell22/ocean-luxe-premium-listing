import React from 'react';
import { Bed, Bath, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ListingStats({ beds, baths, sqft }) {
  const stats = [
    { icon: Bed, value: beds, label: 'Beds' },
    { icon: Bath, value: baths, label: 'Baths' },
    { icon: Maximize, value: sqft?.toLocaleString(), label: 'Sq Ft' }
  ].filter(stat => stat.value);

  if (stats.length === 0) return null;

  return (
    <div className="flex items-center gap-6 sm:gap-8">
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <stat.icon className="w-5 h-5 text-teal-400" />
            <span className="text-white font-semibold">{stat.value}</span>
            <span className="text-white/60 hidden sm:inline">{stat.label}</span>
          </motion.div>
          {index < stats.length - 1 && (
            <span className="text-white/20">•</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}