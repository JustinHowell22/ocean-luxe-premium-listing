import React from 'react';
import { ExternalLink, Video, Eye } from 'lucide-react';

export default function VirtualTours({ virtualTourUrl, videoTourUrl }) {
  // Check if we have any tours
  if (!virtualTourUrl && !videoTourUrl) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
          <Eye className="w-6 h-6 text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Virtual Tours</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {virtualTourUrl && (
          <a
            href={virtualTourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 p-6 hover:border-teal-500/40 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-teal-500/20">
                <Eye className="w-6 h-6 text-teal-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">3D Virtual Tour</h3>
                <p className="text-white/60 text-sm">Explore every corner</p>
              </div>
              <ExternalLink className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        )}

        {videoTourUrl && (
          <a
            href={videoTourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Video Walkthrough</h3>
                <p className="text-white/60 text-sm">Watch guided tour</p>
              </div>
              <ExternalLink className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        )}
      </div>
    </div>
  );
}