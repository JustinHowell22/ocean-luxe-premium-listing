import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PropertyDescription({ description }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  const previewLength = 280;
  const needsExpansion = description.length > previewLength;
  const displayText = isExpanded || !needsExpansion 
    ? description 
    : description.slice(0, previewLength) + '...';

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
          <FileText className="w-6 h-6 text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">About This Property</h2>
      </div>

      <div className="space-y-4">
        <motion.p 
          className="text-white/80 text-base leading-relaxed"
          initial={false}
        >
          {displayText}
        </motion.p>

        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          >
            <span className="text-sm font-medium">
              {isExpanded ? 'Read Less' : 'Read More'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-teal-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-teal-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}