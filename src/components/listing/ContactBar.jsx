import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactBar({ onScheduleClick, isScrolled }) {
  const phoneNumber = "+18082581945";
  const displayPhone = "(808) 258-1945";

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="bg-slate-950/80 backdrop-blur-2xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="hidden sm:block">
                  <span className="text-white/80 text-sm font-medium">Contact Agent</span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 hover:bg-teal-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">{displayPhone}</span>
                    <span className="text-sm font-medium sm:hidden">Call</span>
                  </a>
                  
                  <a
                    href={`sms:${phoneNumber}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Text</span>
                  </a>
                  
                  <button
                    onClick={onScheduleClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-teal-500/25"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FloatingContactButtons({ onScheduleClick }) {
  const phoneNumber = "+18082581945";
  const displayPhone = "(808) 258-1945";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={`tel:${phoneNumber}`}
        className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
      >
        <Phone className="w-5 h-5 text-teal-400 group-hover:text-teal-300" />
        <span className="font-medium">{displayPhone}</span>
      </a>
      
      <a
        href={`sms:${phoneNumber}`}
        className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
      >
        <MessageSquare className="w-5 h-5 text-teal-400 group-hover:text-teal-300" />
        <span className="font-medium">Text Us</span>
      </a>
      
      <button
        onClick={onScheduleClick}
        className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 hover:scale-105 shadow-xl shadow-teal-500/30"
      >
        <Calendar className="w-5 h-5" />
        <span>Schedule a Tour</span>
      </button>
    </div>
  );
}