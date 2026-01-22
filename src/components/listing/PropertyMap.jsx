import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
if (typeof window !== 'undefined') {
  delete window.L.Icon.Default.prototype._getIconUrl;
  window.L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

export default function PropertyMap({ address, latitude, longitude }) {
  const [coords, setCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If we have coordinates from the listing, use them
    if (latitude && longitude) {
      setCoords([latitude, longitude]);
      setIsLoading(false);
      return;
    }

    // Otherwise, geocode the address
    if (address) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0]) {
            setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            // Default to Miami if geocoding fails
            setCoords([25.7617, -80.1918]);
          }
          setIsLoading(false);
        })
        .catch(() => {
          // Default to Miami if geocoding fails
          setCoords([25.7617, -80.1918]);
          setIsLoading(false);
        });
    } else {
      // Default to Miami
      setCoords([25.7617, -80.1918]);
      setIsLoading(false);
    }
  }, [address, latitude, longitude]);

  if (isLoading || !coords) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
            <MapPin className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Location</h2>
        </div>
        <div className="h-96 rounded-2xl bg-slate-800/50 flex items-center justify-center">
          <p className="text-white/60">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
          <MapPin className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Location</h2>
          {address && <p className="text-white/60 text-sm mt-1">{address}</p>}
        </div>
      </div>

      <div className="h-96 rounded-2xl overflow-hidden border border-white/10">
        <MapContainer
          center={coords}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords}>
            <Popup>{address || 'Property Location'}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}