import React, { useState } from 'react';
import { X, Check, Loader2, Home, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ZAPIER_WEBHOOK_URL = "";

export default function ScheduleDrawer({ isOpen, onClose, listing }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message || '',
      listingId: listing?.id || '',
      listingAddress: listing?.address?.full || '',
      listingPrice: listing?.price || '',
      pageUrl: window.location.href,
      createdAt: new Date().toISOString()
    };

    try {
      if (ZAPIER_WEBHOOK_URL) {
        await fetch(ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        console.log('Tour Request Payload:', payload);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-slate-950 border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                    <Calendar className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Schedule a Tour</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Listing Preview */}
              {listing && (
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/20">
                      <Home className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {listing.address?.full || 'Property'}
                      </p>
                      <p className="text-teal-400 font-medium">
                        ${listing.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State */}
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <div className="p-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Sent ✓</h3>
                    <p className="text-white/60 text-center">
                      We'll be in touch shortly!
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-white/80">Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={handleChange('name')}
                        placeholder="Your full name"
                        className={`bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500 focus:ring-teal-500/20 h-12 ${
                          errors.name ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Phone *</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange('phone')}
                        placeholder="(555) 123-4567"
                        className={`bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500 focus:ring-teal-500/20 h-12 ${
                          errors.phone ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder="you@example.com"
                        className={`bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500 focus:ring-teal-500/20 h-12 ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Message (Optional)</Label>
                      <Textarea
                        value={formData.message}
                        onChange={handleChange('message')}
                        placeholder="Tell us about your ideal showing time..."
                        rows={4}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500 focus:ring-teal-500/20 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Request Tour'
                      )}
                    </Button>

                    <p className="text-white/40 text-xs text-center">
                      By submitting, you agree to be contacted about this property.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}