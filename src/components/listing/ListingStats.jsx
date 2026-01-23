import React from 'react';
import { BedDouble, Bath, Ruler } from 'lucide-react';

function safeNumber(value) {
  if (value === null || value === undefined) return null;

  // Handle object baths like { total, full, half }
  if (typeof value === 'object') {
    if (typeof value.total === 'number') return value.total;

    const full = Number(value.full) || 0;
    const half = Number(value.half) || 0;
    const quarter = Number(value.quarter) || 0;
    const threeQuarter = Number(value.threeQuarter) || 0;

    const total = full + half * 0.5 + quarter * 0.25 + threeQuarter * 0.75;
    return total > 0 ? total : null;
  }

  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

export default function ListingStats({ beds, baths, sqft }) {
  const safeBeds = safeNumber(beds);
  const safeBaths = safeNumber(baths);
  const safeSqft = safeNumber(sqft);

  // If nothing valid, render nothing (prevents crashes)
  if (!safeBeds && !safeBaths && !safeSqft) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-6 text-white/90">
      {safeBeds !== null && (
        <div className="flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-teal-400" />
          <span className="text-lg font-medium">{safeBeds} Beds</span>
        </div>
      )}

      {safeBaths !== null && (
        <div className="flex items-center gap-2">
          <Bath className="w-5 h-5 text-teal-400" />
          <span className="text-lg font-medium">{safeBaths} Baths</span>
        </div>
      )}

      {safeSqft !== null && (
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-teal-400" />
          <span className="text-lg font-medium">
            {safeSqft.toLocaleString()} Sq Ft
          </span>
        </div>
      )}
    </div>
  );
}
