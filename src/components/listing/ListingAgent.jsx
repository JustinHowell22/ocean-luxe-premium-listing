import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ListingAgent({ onScheduleClick }) {
  const phoneNumber = "+18082581945";
  const displayPhone = "(808) 258-1945";
  const agentLogo = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972970fa6e1ef72ccbe866b/82e22ab18_appicon.png";

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Agent Logo */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-teal-500/30 shadow-lg shadow-teal-500/20">
            <img 
              src={agentLogo} 
              alt="O.N.E. Florida Group"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white mb-2">
            O.N.E. Florida Group
          </h3>
          <p className="text-white/60 mb-4">
            Your trusted real estate partner in Florida
          </p>
          
          {/* Contact Methods */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <a
              href={`tel:${phoneNumber}`}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <Phone className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium">{displayPhone}</span>
            </a>
            
            <a
              href={`sms:${phoneNumber}`}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium">Text</span>
            </a>

            <a
              href="mailto:contact@onefloridagroup.com"
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <Mail className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium">Email</span>
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <Button
            onClick={onScheduleClick}
            className="px-6 py-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-teal-500/30"
          >
            Contact O.N.E. Florida Group
          </Button>
        </div>
      </div>
    </div>
  );
}