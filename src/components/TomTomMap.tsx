/**
 * TomTomMap — renders real TomTom map tiles via WebView + TomTom Maps JS SDK.
 * Communicates with the parent via postMessage / onMessage.
 *
 * Messages FROM parent → WebView  (call webRef.current.injectJavaScript(js))
 * Messages FROM WebView → parent  (onMessage handler)
 */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { TOMTOM_API_KEY } from '../hooks/useGoogleMaps';

export interface TomTomMapRef {
  /** Move camera to lat/lng with optional zoom */
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  /** Fit map to an array of {lat,lng} points */
  fitBounds: (points: { lat: number; lng: number }[]) => void;
  /** Add or update a named marker */
  setMarker: (id: string, lat: number, lng: number, color: string, label: string) => void;
  /** Remove a named marker */
  removeMarker: (id: string) => void;
  /** Draw a polyline (replaces previous with same id) */
  setPolyline: (id: string, coords: { lat: number; lng: number }[], color: string, width: number) => void;
  /** Remove a polyline */
  removePolyline: (id: string) => void;
  /** Clear all markers and polylines */
  clearAll: () => void;
}

interface Props {
  style?: object;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  onMarkerPress?: (id: string) => void;
  onMapReady?: () => void;
}

const HTML = (apiKey: string, lat: number, lng: number, zoom: number) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<link rel="stylesheet" href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; overflow:hidden; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js"></script>
<script>
var map = tt.map({
  key: '${apiKey}',
  container: 'map',
  center: [${lng}, ${lat}],
  zoom: ${zoom},
  style: 'tomtom://vector/1/basic-main'
});

var markers = {};
var polylines = {};

map.on('load', function() {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
});

// ── receive commands from RN ──────────────────────────────────────────────────
window.addEventListener('message', function(e) {
  try { handle(JSON.parse(e.data)); } catch(_) {}
});
document.addEventListener('message', function(e) {
  try { handle(JSON.parse(e.data)); } catch(_) {}
});

function handle(cmd) {
  if (cmd.type === 'flyTo') {
    map.flyTo({ center: [cmd.lng, cmd.lat], zoom: cmd.zoom || 10, speed: 1.4 });
  } else if (cmd.type === 'fitBounds') {
    if (!cmd.points || cmd.points.length === 0) return;
    var bounds = new tt.LngLatBounds();
    cmd.points.forEach(function(p) { bounds.extend([p.lng, p.lat]); });
    map.fitBounds(bounds, { padding: { top:120, bottom:260, left:40, right:40 }, maxZoom:14 });
  } else if (cmd.type === 'setMarker') {
    if (markers[cmd.id]) { markers[cmd.id].remove(); }
    var el = document.createElement('div');
    el.style.cssText = 'width:32px;height:32px;border-radius:50% 50% 50% 0;background:' + cmd.color +
      ';border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(-45deg);cursor:pointer;';
    var inner = document.createElement('div');
    inner.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;transform:rotate(45deg);';
    inner.innerHTML = '<span style="color:#fff;font-size:11px;font-weight:800;text-align:center;line-height:1;">' + (cmd.label||'').substring(0,3) + '</span>';
    el.appendChild(inner);
    el.addEventListener('click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: cmd.id }));
    });
    markers[cmd.id] = new tt.Marker({ element: el })
      .setLngLat([cmd.lng, cmd.lat])
      .addTo(map);
  } else if (cmd.type === 'removeMarker') {
    if (markers[cmd.id]) { markers[cmd.id].remove(); delete markers[cmd.id]; }
  } else if (cmd.type === 'setPolyline') {
    var srcId = 'src_' + cmd.id;
    var layId = 'lay_' + cmd.id;
    if (map.getLayer(layId)) map.removeLayer(layId);
    if (map.getSource(srcId)) map.removeSource(srcId);
    map.addSource(srcId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: cmd.coords.map(function(c) { return [c.lng, c.lat]; })
        }
      }
    });
    map.addLayer({
      id: layId,
      type: 'line',
      source: srcId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': cmd.color, 'line-width': cmd.width || 4 }
    });
    polylines[cmd.id] = { srcId, layId };
  } else if (cmd.type === 'removePolyline') {
    var p = polylines[cmd.id];
    if (p) {
      if (map.getLayer(p.layId)) map.removeLayer(p.layId);
      if (map.getSource(p.srcId)) map.removeSource(p.srcId);
      delete polylines[cmd.id];
    }
  } else if (cmd.type === 'clearAll') {
    Object.keys(markers).forEach(function(k) { markers[k].remove(); });
    markers = {};
    Object.keys(polylines).forEach(function(k) {
      var p = polylines[k];
      if (map.getLayer(p.layId)) map.removeLayer(p.layId);
      if (map.getSource(p.srcId)) map.removeSource(p.srcId);
    });
    polylines = {};
  }
}
</script>
</body>
</html>
`;

export const TomTomMap = forwardRef<TomTomMapRef, Props>(function TomTomMap(
  { style, initialLat = 22.5937, initialLng = 78.9629, initialZoom = 5, onMarkerPress, onMapReady },
  ref
) {
  const webRef = useRef<WebView>(null);

  const send = (cmd: object) => {
    webRef.current?.injectJavaScript(
      `(function(){ window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(cmd))}})); })()`
    );
  };

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom = 12) => send({ type: 'flyTo', lat, lng, zoom }),
    fitBounds: (points) => send({ type: 'fitBounds', points }),
    setMarker: (id, lat, lng, color, label) => send({ type: 'setMarker', id, lat, lng, color, label }),
    removeMarker: (id) => send({ type: 'removeMarker', id }),
    setPolyline: (id, coords, color, width) => send({ type: 'setPolyline', id, coords, color, width }),
    removePolyline: (id) => send({ type: 'removePolyline', id }),
    clearAll: () => send({ type: 'clearAll' }),
  }));

  const handleMessage = (e: any) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') onMapReady?.();
      if (msg.type === 'markerPress') onMarkerPress?.(msg.id);
    } catch (_) {}
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        style={styles.webview}
        source={{ html: HTML(TOMTOM_API_KEY, initialLat, initialLng, initialZoom) }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowFileAccess
        geolocationEnabled
        scrollEnabled={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: '#E8F5E9' },
});
