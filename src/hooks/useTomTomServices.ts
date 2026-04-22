// Enhanced TomTom Services Hook
// Includes: EV Charging, Traffic, Geocoding, Matrix Routing, Search, Waypoint Optimization

import { TOMTOM_API_KEY } from './useGoogleMaps';

const BASE_URL = 'https://api.tomtom.com';
const VERSION = 2;

// EV Charging Stations API
export async function fetchEVChargingStations(lat: number, lng: number, radius: number = 10000): Promise<any[]> {
  try {
    const url = `${BASE_URL}/search/${VERSION}/search/evcharging.json?key=${TOMTOM_API_KEY}&lat=${lat}&lon=${lng}&radius=${radius}&limit=20`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('EV Charging fetch error:', e);
    return [];
  }
}

// Traffic Flow API - Segment Data
export async function fetchTrafficFlow(lat: number, lng: number): Promise<any> {
  try {
    const url = `${BASE_URL}/traffic/services/${VERSION}/flowSegmentData/relative0/10/json?key=${TOMTOM_API_KEY}&point=${lat},${lng}`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error('Traffic flow fetch error:', e);
    return null;
  }
}

// Geocoding API
export async function geocodeAddress(address: string): Promise<any> {
  try {
    const url = `${BASE_URL}/search/${VERSION}/geocode/${encodeURIComponent(address)}.json?key=${TOMTOM_API_KEY}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results?.[0] || null;
  } catch (e) {
    console.error('Geocoding error:', e);
    return null;
  }
}

// Reverse Geocoding API
export async function reverseGeocode(lat: number, lng: number): Promise<any> {
  try {
    const url = `${BASE_URL}/search/${VERSION}/reverseGeocode/${lat},${lng}.json?key=${TOMTOM_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.addresses?.[0] || null;
  } catch (e) {
    console.error('Reverse geocoding error:', e);
    return null;
  }
}

// Matrix Routing API - Calculate distances and ETAs between multiple points
export async function calculateMatrix(
  origins: { lat: number; lng: number }[],
  destinations: { lat: number; lng: number }[]
): Promise<any> {
  try {
    const originsStr = origins.map(o => `${o.lat},${o.lng}`).join(':');
    const destStr = destinations.map(d => `${d.lat},${d.lng}`).join(':');
    const url = `${BASE_URL}/routing/1/matrix.json?key=${TOMTOM_API_KEY}&routeType=fastest&travelMode=car`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origins: origins.map(o => ({ point: { latitude: o.lat, longitude: o.lng } })),
        destinations: destinations.map(d => ({ point: { latitude: d.lat, longitude: d.lng } }))
      })
    });
    return await res.json();
  } catch (e) {
    console.error('Matrix routing error:', e);
    return null;
  }
}

// Waypoint Optimization API
export async function optimizeWaypoints(
  waypoints: { lat: number; lng: number }[],
  origin?: { lat: number; lng: number },
  destination?: { lat: number; lng: number }
): Promise<any> {
  try {
    const points = waypoints.map((w, i) => `${w.lat},${w.lng}`).join(':');
    const orig = origin ? `&origin=${origin.lat},${origin.lng}` : '';
    const dest = destination ? `&destination=${destination.lat},${destination.lng}` : '';
    const url = `${BASE_URL}/routing/1/waypointoptimization/${points}.json?key=${TOMTOM_API_KEY}${orig}${dest}&travelMode=car`;
    
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error('Waypoint optimization error:', e);
    return null;
  }
}

// Search API - Points of Interest
export async function searchPOI(
  query: string,
  lat: number,
  lng: number,
  radius: number = 10000
): Promise<any[]> {
  try {
    const url = `${BASE_URL}/search/${VERSION}/search/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}&lat=${lat}&lon=${lng}&radius=${radius}&limit=20`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('POI search error:', e);
    return [];
  }
}

// Snap to Roads API
export async function snapToRoads(points: { lat: number; lng: number }[]): Promise<any> {
  try {
    const pointsStr = points.map(p => `${p.lat},${p.lng}`).join(';');
    const url = `${BASE_URL}/snap-to-roads/1/snapToRoads?key=${TOMTOM_API_KEY}&points=${pointsStr}`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error('Snap to roads error:', e);
    return null;
  }
}

// Calculate Reachable Range (isochrones)
export async function calculateReachableRange(
  lat: number,
  lng: number,
  timeBudget: number = 30 // minutes
): Promise<any> {
  try {
    const url = `${BASE_URL}/routing/1/calculateReachableRange/${lat},${lng}/json?key=${TOMTOM_API_KEY}&timeBudget=${timeBudget * 60}&travelMode=car`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error('Reachable range error:', e);
    return null;
  }
}
