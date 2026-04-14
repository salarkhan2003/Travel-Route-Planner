/**
 * TomTom Maps API — Search (Fuzzy) + Routing (Calculate Route)
 *
 * API Key: I1g8qmwAgnTEbeM7HAocNDWKOx3KYrjN
 *
 * APIs used:
 *  - Search API  : https://api.tomtom.com/search/2/search/{query}.json
 *  - Routing API : https://api.tomtom.com/routing/1/calculateRoute/{origin}:{dest}/json
 */

export const TOMTOM_API_KEY = 'I1g8qmwAgnTEbeM7HAocNDWKOx3KYrjN';

// ─── Search types ─────────────────────────────────────────────────────────────

export interface PlacePrediction {
  place_id: string;          // TomTom: result.id
  description: string;       // full address string
  structured_formatting: {
    main_text: string;       // POI name or street
    secondary_text: string;  // city / country
  };
}

export interface PlaceDetail {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
}

// ─── Route types ──────────────────────────────────────────────────────────────

export interface RouteStep {
  html_instructions: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  maneuver?: string;
}

export interface DirectionsResult {
  polylineCoords: { latitude: number; longitude: number }[];
  steps: RouteStep[];
  totalDistance: string;
  totalDuration: string;
  summary: string;
}

// ─── Search API ───────────────────────────────────────────────────────────────

/**
 * TomTom Fuzzy Search — returns up to `limit` place predictions.
 * Docs: https://developer.tomtom.com/search-api/documentation/search-service/fuzzy-search
 */
export async function fetchPlacePredictions(
  input: string,
  _sessionToken: string,   // kept for API-compat with callers
  limit = 6
): Promise<PlacePrediction[]> {
  if (input.length < 2) return [];
  try {
    const url =
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(input)}.json` +
      `?key=${TOMTOM_API_KEY}` +
      `&limit=${limit}` +
      `&language=en-GB` +
      `&typeahead=true`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const results: any[] = json.results ?? [];
    return results.map((r: any) => {
      const addr = r.address ?? {};
      const mainText =
        r.poi?.name ??
        addr.streetName ??
        addr.municipality ??
        addr.freeformAddress ??
        'Unknown';
      const secondaryText = [
        addr.municipality,
        addr.countrySubdivision,
        addr.country,
      ]
        .filter(Boolean)
        .join(', ');
      return {
        place_id: r.id ?? String(Math.random()),
        description: addr.freeformAddress ?? mainText,
        structured_formatting: {
          main_text: mainText,
          secondary_text: secondaryText,
        },
        // stash raw coords for instant detail lookup
        _lat: r.position?.lat,
        _lng: r.position?.lon,
        _address: addr.freeformAddress ?? mainText,
      } as PlacePrediction & { _lat?: number; _lng?: number; _address?: string };
    });
  } catch {
    return [];
  }
}

/**
 * TomTom "Place Detail" — we already have coords from the fuzzy search result,
 * so this just wraps them into the PlaceDetail shape.
 * For a true place_id lookup we use the Search API with the id.
 */
export async function fetchPlaceDetail(
  placeId: string,
  cachedResult?: any   // pass the raw TomTom result to avoid a second call
): Promise<PlaceDetail | null> {
  // If caller passes the raw result object, use it directly
  if (cachedResult?._lat != null) {
    return {
      place_id: placeId,
      name: cachedResult.structured_formatting?.main_text ?? '',
      formatted_address: cachedResult.description ?? '',
      geometry: { location: { lat: cachedResult._lat, lng: cachedResult._lng } },
    };
  }
  // Fallback: re-search by id isn't supported directly, so do a geocode by description
  return null;
}

// ─── Routing API ──────────────────────────────────────────────────────────────

/**
 * TomTom Calculate Route
 * Docs: https://developer.tomtom.com/routing-api/documentation/routing/calculate-route
 *
 * Endpoint: GET /routing/1/calculateRoute/{origin}:{dest}/json
 * travelMode: car | pedestrian | bus | truck | taxi | van | motorcycle | bicycle
 */
export async function fetchDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'driving' | 'walking' | 'transit' = 'driving'
): Promise<DirectionsResult | null> {
  const travelMode =
    mode === 'driving' ? 'car' :
    mode === 'walking' ? 'pedestrian' :
    'bus';  // transit → bus

  try {
    const url =
      `https://api.tomtom.com/routing/1/calculateRoute/` +
      `${origin.lat},${origin.lng}:${destination.lat},${destination.lng}/json` +
      `?key=${TOMTOM_API_KEY}` +
      `&travelMode=${travelMode}` +
      `&instructionsType=text` +
      `&language=en-GB` +
      `&routeRepresentation=polyline` +
      `&computeBestOrder=false` +
      `&traffic=true`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();

    const route = json.routes?.[0];
    if (!route) return null;

    const leg = route.legs?.[0];
    const summary = route.summary ?? {};

    // Extract polyline points from route legs
    const polylineCoords: { latitude: number; longitude: number }[] = [];
    for (const l of route.legs ?? []) {
      for (const pt of l.points ?? []) {
        polylineCoords.push({ latitude: pt.latitude, longitude: pt.longitude });
      }
    }

    // Build steps from guidance instructions
    const instructions: any[] = route.guidance?.instructions ?? [];
    const steps: RouteStep[] = instructions
      .filter((ins: any) => ins.routeOffsetInMeters != null)
      .map((ins: any, i: number, arr: any[]) => {
        const nextOffset = arr[i + 1]?.routeOffsetInMeters ?? summary.lengthInMeters ?? 0;
        const segDist = Math.max(0, nextOffset - (ins.routeOffsetInMeters ?? 0));
        const point = ins.point ?? {};
        const nextPoint = arr[i + 1]?.point ?? point;
        return {
          html_instructions: ins.message ?? ins.maneuver ?? 'Continue',
          distance: { text: formatDist(segDist), value: segDist },
          duration: { text: '', value: 0 },
          start_location: { lat: point.latitude ?? origin.lat, lng: point.longitude ?? origin.lng },
          end_location: { lat: nextPoint.latitude ?? destination.lat, lng: nextPoint.longitude ?? destination.lng },
          maneuver: ins.maneuver,
        };
      });

    const distM: number = summary.lengthInMeters ?? 0;
    const durS: number = summary.travelTimeInSeconds ?? 0;

    return {
      polylineCoords,
      steps,
      totalDistance: formatDist(distM),
      totalDuration: formatDur(durS),
      summary: travelMode,
    };
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDist(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatDur(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

// Keep for polyline decode compat (not needed for TomTom but exported for safety)
export function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}
