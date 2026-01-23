import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import HeroGallery from '@/components/listing/HeroGallery';
import ThumbnailStrip from '@/components/listing/ThumbnailStrip';
import ContactBar, { FloatingContactButtons } from '@/components/listing/ContactBar';
import ScheduleDrawer from '@/components/listing/ScheduleDrawer';
import ListingStats from '@/components/listing/ListingStats';
import MortgageCalculator from '@/components/listing/MortgageCalculator';
import VirtualTours from '@/components/listing/VirtualTours';
import ListingAgent from '@/components/listing/ListingAgent';
import PropertyMap from '@/components/listing/PropertyMap';
import FullscreenGallery from '@/components/listing/FullscreenGallery';
import PropertyDescription from '@/components/listing/PropertyDescription';

export default function PremiumListing() {
  const [listing, setListing] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenStartIndex, setFullscreenStartIndex] = useState(0);

  // Get MLS ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const mlsId = urlParams.get('id');

  // Placeholder data for demo
  const placeholderListing = {
    id: 'DEMO',
    price: 2850000,
    address: { full: '1234 Ocean Boulevard, Miami Beach, FL 33139' },
    bedrooms: 4,
    bathrooms: 3.5,
    livingArea: 3200,
    virtualTourUrl: 'https://my.matterport.com/show/?m=example',
    videoTourUrl: 'https://www.youtube.com/watch?v=example',
    latitude: 25.7907,
    longitude: -80.13,
    description:
      "Discover unparalleled luxury in this stunning oceanfront residence located in the heart of Miami Beach. This architectural masterpiece features floor-to-ceiling windows with breathtaking ocean views, a gourmet chef's kitchen with top-of-the-line appliances, and an expansive open-concept living space perfect for entertaining.",
    photos: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
    ],
  };

  const toNumber = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const cleaned = v.replace(/[^\d.]/g, '');
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const normalizeListing = (raw) => {
    const safe = raw && typeof raw === 'object' ? raw : {};
    const priceNum = toNumber(safe.price);

    const addressFull =
      safe?.address?.full ||
      safe?.address?.streetAddress ||
      safe?.unparsedAddress ||
      safe?.property?.address?.full ||
      '';

    // Photos may be strings, objects, or nested
    const rawPhotos = safe?.photos || safe?.property?.photos || [];
    const normalizedPhotos = (Array.isArray(rawPhotos) ? rawPhotos : [])
      .map((p) => (typeof p === 'string' ? p : p?.url || p?.href || p?.src))
      .filter(Boolean);

    // Guarantee at least 1 photo to prevent gallery crashes
    const finalPhotos = normalizedPhotos.length ? normalizedPhotos : placeholderListing.photos;

    return {
      ...safe,
      price: priceNum ?? safe.price ?? null,
      address: {
        ...(safe.address || {}),
        full: addressFull || safe?.address?.full || '',
      },
      __photos: finalPhotos,
    };
  };

  const applyListingData = (listingData) => {
    const normalized = normalizeListing(listingData);
    setListing(normalized);
    setPhotos(normalized.__photos || placeholderListing.photos);
    setActivePhotoIndex(0);
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Receive listing data from parent (AgentFire page) when embedded in an iframe
  useEffect(() => {
    const onMessage = (event) => {
      // Allow onefloridagroup.com with or without www
      try {
        const host = new URL(event.origin).hostname;
        if (!host.endsWith('onefloridagroup.com')) return;

        const msg = event.data;
        if (msg?.type === 'OFG_LISTING' && msg?.listing) {
          try {
            setError(null);
            setIsLoading(false);
            applyListingData(msg.listing);
          } catch (e) {
            console.error('Apply listing error:', e);
            setError('Listing data format error');
          }
        }
      } catch (e) {
        // Ignore malformed origins
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch listing data (standalone mode). In iframe mode, parent sends data.
  useEffect(() => {
    const fetchListing = async () => {
      const isEmbedded = window.self !== window.top;

      if (!mlsId) {
        applyListingData(placeholderListing);
        setIsLoading(false);
        return;
      }

      if (isEmbedded) {
        // In iframe mode, parent will send listing via postMessage
        applyListingData(placeholderListing);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://onefloridagroup.com/wp-json/agentfire/v1/afx/listings/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locations: [{ id: 'nefmls', geoType: 'market' }],
            filters: { id: mlsId },
            options: { pageSize: 1, pageNumber: 1 },
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch listing');

        const data = await response.json();
        const listings = data?.data?.listings || [];
        if (!listings.length) throw new Error('Listing not found');

        applyListingData(listings[0]);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mlsId]);

  const getBeds = () => listing?.bedrooms || listing?.beds || listing?.property?.bedrooms || null;
  const getBaths = () => listing?.bathrooms || listing?.baths || listing?.property?.bathrooms || null;
  const getSqft = () =>
    listing?.livingArea ||
    listing?.sqft ||
    listing?.squareFeet ||
    listing?.property?.livingArea ||
    listing?.property?.sqft ||
    null;

  const handleFullscreen = (index) => {
    setFullscreenStartIndex(index);
    setIsFullscreenOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Unable to Load</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const safePhotos = photos?.length ? photos : placeholderListing.photos;
  const priceNumber = typeof listing?.price === 'number' ? listing.price : toNumber(listing?.price);

  return (
    <div className="min-h-screen bg-slate-950">
      <ContactBar isScrolled={isScrolled} onScheduleClick={() => setIsDrawerOpen(true)} />

      <div className="relative">
        <HeroGallery photos={safePhotos} activeIndex={activePhotoIndex} onPhotoChange={setActivePhotoIndex} />

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {priceNumber ? `$${priceNumber.toLocaleString()}` : ''}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6"
            >
              <p className="text-xl sm:text-2xl text-white/90 font-light">{listing?.address?.full || ''}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <ListingStats beds={getBeds()} baths={getBaths()} sqft={getSqft()} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <FloatingContactButtons onScheduleClick={() => setIsDrawerOpen(true)} />
            </motion.div>

            {safePhotos.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <ThumbnailStrip
                  photos={safePhotos}
                  activeIndex={activePhotoIndex}
                  onSelect={setActivePhotoIndex}
                  onFullscreen={handleFullscreen}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <PropertyDescription
          description={listing?.description || listing?.remarks || listing?.publicRemarks || ''}
        />

        {(listing?.virtualTourUrl || listing?.videoTourUrl) && (
          <VirtualTours virtualTourUrl={listing?.virtualTourUrl} videoTourUrl={listing?.videoTourUrl} />
        )}

        <MortgageCalculator propertyPrice={priceNumber || undefined} />

        <ListingAgent onScheduleClick={() => setIsDrawerOpen(true)} />

        <PropertyMap
          address={listing?.address?.full}
          latitude={listing?.latitude}
          longitude={listing?.longitude}
        />
      </div>

      <ScheduleDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} listing={listing} />

      <FullscreenGallery
        photos={safePhotos}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        initialIndex={fullscreenStartIndex}
      />
    </div>
  );
}
