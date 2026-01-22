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
    address: {
      full: '1234 Ocean Boulevard, Miami Beach, FL 33139'
    },
    bedrooms: 4,
    bathrooms: 3.5,
    livingArea: 3200,
    virtualTourUrl: 'https://my.matterport.com/show/?m=example',
    videoTourUrl: 'https://www.youtube.com/watch?v=example',
    latitude: 25.7907,
    longitude: -80.1300,
    description: 'Discover unparalleled luxury in this stunning oceanfront residence located in the heart of Miami Beach. This architectural masterpiece features floor-to-ceiling windows with breathtaking ocean views, a gourmet chef\'s kitchen with top-of-the-line appliances, and an expansive open-concept living space perfect for entertaining. The primary suite offers a private balcony overlooking the Atlantic, while the spa-inspired bathrooms provide a serene retreat. Enjoy resort-style amenities including a private pool, state-of-the-art fitness center, and direct beach access. This is coastal living at its finest.',
    photos: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1920&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1920&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920&q=80',
      'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1920&q=80'
    ]
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      if (!mlsId) {
        // Use placeholder data for demo
        setListing(placeholderListing);
        setPhotos(placeholderListing.photos);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://onefloridagroup.com/wp-json/agentfire/v1/afx/listings/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            locations: [{ id: 'nefmls', geoType: 'market' }],
            filters: { id: mlsId },
            options: { pageSize: 1, pageNumber: 1 }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }

        const data = await response.json();
        
        if (!data.listings || data.listings.length === 0) {
          throw new Error('Listing not found');
        }

        const listingData = data.listings[0];
        setListing(listingData);

        // Normalize photos
        const rawPhotos = listingData.photos || listingData.property?.photos || [];
        const normalizedPhotos = rawPhotos.map(photo => 
          typeof photo === 'string' ? photo : photo.url
        ).filter(Boolean);
        
        setPhotos(normalizedPhotos);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [mlsId]);

  // Extract listing fields with fallbacks
  const getBeds = () => {
    return listing?.bedrooms || listing?.beds || listing?.property?.bedrooms || null;
  };

  const getBaths = () => {
    return listing?.bathrooms || listing?.baths || listing?.property?.bathrooms || null;
  };

  const getSqft = () => {
    return listing?.livingArea || listing?.sqft || listing?.squareFeet || 
           listing?.property?.livingArea || listing?.property?.sqft || null;
  };

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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky Contact Bar */}
      <ContactBar 
        isScrolled={isScrolled} 
        onScheduleClick={() => setIsDrawerOpen(true)} 
      />

      {/* Hero Gallery */}
      <div className="relative">
        <HeroGallery
          photos={photos}
          activeIndex={activePhotoIndex}
          onPhotoChange={setActivePhotoIndex}
        />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                ${listing?.price?.toLocaleString()}
              </h1>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6"
            >
              <p className="text-xl sm:text-2xl text-white/90 font-light">
                {listing?.address?.full}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <ListingStats
                beds={getBeds()}
                baths={getBaths()}
                sqft={getSqft()}
              />
            </motion.div>

            {/* Contact Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <FloatingContactButtons onScheduleClick={() => setIsDrawerOpen(true)} />
            </motion.div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <ThumbnailStrip
                  photos={photos}
                  activeIndex={activePhotoIndex}
                  onSelect={setActivePhotoIndex}
                  onFullscreen={handleFullscreen}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Property Description */}
        <PropertyDescription description={listing?.description || listing?.remarks || listing?.publicRemarks} />

        {/* Virtual Tours */}
        {(listing?.virtualTourUrl || listing?.videoTourUrl) && (
          <VirtualTours 
            virtualTourUrl={listing?.virtualTourUrl}
            videoTourUrl={listing?.videoTourUrl}
          />
        )}

        {/* Mortgage Calculator */}
        <MortgageCalculator propertyPrice={listing?.price} />

        {/* Listing Agent */}
        <ListingAgent onScheduleClick={() => setIsDrawerOpen(true)} />

        {/* Property Map */}
        <PropertyMap 
          address={listing?.address?.full}
          latitude={listing?.latitude}
          longitude={listing?.longitude}
        />
      </div>

      {/* Schedule Tour Drawer */}
      <ScheduleDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        listing={listing}
      />

      {/* Fullscreen Gallery */}
      <FullscreenGallery
        photos={photos}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        initialIndex={fullscreenStartIndex}
      />
    </div>
  );
}