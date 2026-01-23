import React, { useEffect, useMemo, useState } from 'react';
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

/** Error boundary so the page never goes "white" again */
class PremiumErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || String(err) };
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error('PremiumListing render crash:', err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Something crashed</h2>
            <p className="text-white/60 mb-6">
              {this.state.message || 'A component failed while rendering the listing.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function toNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^\d.]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizePhotoUrl(p) {
  if (!p) return null;
  if (typeof p === 'string') return p;

  // try common fields
  return (
    p.url ||
    p.full ||
    p.lg ||
    p.large ||
    p.src ||
    p.href ||
    p.original ||
    p.image ||
    p.permalink ||
    null
  );
}

function extractPhotosAnyShape(listingObj) {
  if (!listingObj || typeof listingObj !== 'object') return [];

  const candidates =
    listingObj.photos ||
    listingObj.property?.photos ||
    listingObj.media?.photos ||
    listingObj.property?.media?.photos ||
    listingObj.images ||
    listingObj.property?.images ||
    listingObj.media ||
    listingObj.property?.media ||
    [];

  const arr = Array.isArray(candidates) ? candidates : [];

  const urls = arr
    .map(normalizePhotoUrl)
    .filter(Boolean);

  // sometimes photos come under “media” but as objects with nested keys; try deeper
  if (urls.length) return urls;

  // fallback: scan a few likely nested arrays
  const deepArrays = [
    listingObj?.property?.media?.photos,
    listingObj?.property?.media?.images,
    listingObj?.media?.images,
    listingObj?.media?.photo,
  ].filter(Array.isArray);

  for (const a of deepArrays) {
    const u = a.map(normalizePhotoUrl).filter(Boolean);
    if (u.length) return u;
  }

  return [];
}

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

  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const mlsId = urlParams.get('id');

  const placeholderListing = useMemo(
    () => ({
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
    }),
    []
  );

  const normalizeListing = (raw) => {
    const safe = raw && typeof raw === 'object' ? raw : {};
    const priceNum = toNumber(safe.price);

    const addressFull =
      safe?.address?.full ||
      safe?.unparsedAddress ||
      safe?.property?.address?.full ||
      safe?.property?.unparsedAddress ||
      '';

    const normalizedPhotos = extractPhotosAnyShape(safe);
    const finalPhotos = normalizedPhotos.length ? normalizedPhotos : [];

    return {
      ...safe,
      price: priceNum ?? safe.price ?? null,
      address: { ...(safe.address || {}), full: addressFull || safe?.address?.full || '' },
      __photos: finalPhotos,
    };
  };

  const applyListingData = (listingData) => {
    // ✅ expose to console
    window.__LAST_LISTING__ = listingData;

    const normalized = normalizeListing(listingData);

    setListing(normalized);

    // Only use photos if we actually have them
    if (normalized.__photos && normalized.__photos.length) {
      setPhotos(normalized.__photos);
      window.__LAST_LISTING_PHOTOS__ = normalized.__photos;
    } else {
      setPhotos([]); // allow hydration to fill
      window.__LAST_LISTING_PHOTOS__ = [];
    }

    setActivePhotoIndex(0);
  };

  const hydratePhotosById = async (id) => {
    if (!id) return;

    try {
      const response = await fetch('https://onefloridagroup.com/wp-json/agentfire/v1/afx/listings/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: [{ id: 'nefmls', geoType: 'market' }],
          filters: { id },
          options: { pageSize: 1, pageNumber: 1 },
        }),
      });

      if (!response.ok) return;

      const data = await response.json();

      // handle both shapes
      const listingData = data?.data?.listings?.[0] || data?.listings?.[0];
      if (!listingData) return;

      // ✅ expose hydrated raw too
      window.__LAST_LISTING_HYDRATED__ = listingData;

      const hydratedPhotos = extractPhotosAnyShape(listingData);

      if (hydratedPhotos.length) {
        setPhotos(hydratedPhotos);
        window.__LAST_LISTING_PHOTOS__ = hydratedPhotos;
        setActivePhotoIndex(0);
      }
    } catch (e) {
      // don’t break the page if photos fail
      // eslint-disable-next-line no-console
      console.warn('Photo hydrate failed:', e);
    }
  };

  // Catch crashes so we never go white
  useEffect(() => {
    const onError = (e) => {
      // eslint-disable-next-line no-console
      console.error('window.onerror', e?.error || e);
      setError((e?.error?.message || e?.message || 'A script error occurred') + '');
    };
    const onRejection = (e) => {
      // eslint-disable-next-line no-console
      console.error('unhandledrejection', e?.reason || e);
      setError((e?.reason?.message || e?.reason || 'A promise error occurred') + '');
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Receive listing from parent iframe postMessage
  useEffect(() => {
    const onMessage = (event) => {
      try {
        const host = new URL(event.origin).hostname;
        if (!host.endsWith('onefloridagroup.com')) return;

        const msg = event.data;

        if (msg?.type === 'OFG_LISTING' && msg?.listing) {
          setError(null);
          setIsLoading(false);

          applyListingData(msg.listing);

          // If parent payload had no photos, hydrate them
          const incomingPhotos = extractPhotosAnyShape(msg.listing);
          if (!incomingPhotos.length) {
            const id = msg.listing?.id || msg.listing?.mlsId || mlsId;
            hydratePhotosById(id);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mlsId]);

  // Standalone fetch (not iframe). In iframe mode parent sends data.
  useEffect(() => {
    const fetchListing = async () => {
      const isEmbedded = window.self !== window.top;

      // No id? demo
      if (!mlsId) {
        applyListingData(placeholderListing);
        setPhotos(placeholderListing.photos);
        setIsLoading(false);
        return;
      }

      // Embedded? show placeholder while waiting for postMessage
      if (isEmbedded) {
        applyListingData(placeholderListing);
        setPhotos(placeholderListing.photos);
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
        const listingData = data?.data?.listings?.[0] || data?.listings?.[0];
        if (!listingData) throw new Error('Listing not found');

        setError(null);
        applyListingData(listingData);

        // If still no photos, try hydrating (sometimes search returns summary)
        const foundPhotos = extractPhotosAnyShape(listingData);
        if (!foundPhotos.length) hydratePhotosById(mlsId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Fetch error:', err);
        setError(err?.message || 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mlsId]);

  const safePhotos = photos?.length ? photos : placeholderListing.photos;

  const priceNumber =
    typeof listing?.price === 'number'
      ? listing.price
      : toNumber(listing?.price);

  const beds = listing?.bedrooms || listing?.beds || listing?.property?.bedrooms || null;
  const baths = listing?.bathrooms || listing?.baths || listing?.property?.bathrooms || null;
  const sqft =
    listing?.livingArea ||
    listing?.sqft ||
    listing?.squareFeet ||
    listing?.property?.livingArea ||
    listing?.property?.sqft ||
    null;

  const lat = toNumber(listing?.latitude);
  const lng = toNumber(listing?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

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
          <p className="text-white/60 mb-6">{String(error)}</p>
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
    <PremiumErrorBoundary>
      <div className="min-h-screen bg-slate-950">
        <ContactBar isScrolled={isScrolled} onScheduleClick={() => setIsDrawerOpen(true)} />

        <div className="relative">
          <HeroGallery
            photos={safePhotos}
            activeIndex={activePhotoIndex}
            onPhotoChange={setActivePhotoIndex}
          />

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
                <p className="text-xl sm:text-2xl text-white/90 font-light">
                  {listing?.address?.full || ''}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <ListingStats beds={beds} baths={baths} sqft={sqft} />
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
            <VirtualTours
              virtualTourUrl={listing?.virtualTourUrl}
              videoTourUrl={listing?.videoTourUrl}
            />
          )}

          <MortgageCalculator propertyPrice={priceNumber || undefined} />

          <ListingAgent onScheduleClick={() => setIsDrawerOpen(true)} />

          {hasCoords && (
            <PropertyMap
              address={listing?.address?.full}
              latitude={lat}
              longitude={lng}
            />
          )}
        </div>

        <ScheduleDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          listing={listing}
        />

        <FullscreenGallery
          photos={safePhotos}
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
          initialIndex={fullscreenStartIndex}
        />
      </div>
    </PremiumErrorBoundary>
  );
}
