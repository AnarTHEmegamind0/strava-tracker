'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ActivityMapProps {
  latlng?: [number, number][];
  polyline?: string;
}

// Decode polyline string to coordinates
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export default function ActivityMap({ latlng, polyline }: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Get coordinates from either latlng or polyline
    let coordinates: [number, number][] = [];
    
    if (latlng && latlng.length > 0) {
      coordinates = latlng;
    } else if (polyline) {
      coordinates = decodePolyline(polyline);
    }

    if (coordinates.length === 0) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Create polyline
    const routeLine = L.polyline(coordinates, {
      color: '#FC4C02',
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    // Add start marker
    const startIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker(coordinates[0], { icon: startIcon }).addTo(map);

    // Add end marker
    const endIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker(coordinates[coordinates.length - 1], { icon: endIcon }).addTo(map);

    // Fit bounds
    map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latlng, polyline]);

  return (
    <div 
      ref={mapRef} 
      className="h-[400px] rounded-xl overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
