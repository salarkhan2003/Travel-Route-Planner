import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { TOMTOM_API_KEY } from '../hooks/useGoogleMaps';

let ExpoLocation: any = null;
try { ExpoLocation = require('expo-location'); } catch (_) {}

export interface TomTomMapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitBounds: (points: { lat: number; lng: number }[]) => void;
  setMarker: (id: string, lat: number, lng: number, color: string, label: string) => void;
  removeMarker: (id: string) => void;
  setPolyline: (id: string, coords: { lat: number; lng: number }[], color: string, width: number, pulse?: boolean) => void;
  removePolyline: (id: string) => void;
  clearAll: () => void;
  setUserLocation: (lat: number, lng: number) => void;
}

interface Props {
  style?: object;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  onMarkerPress?: (id: string) => void;
  onPolylinePress?: (id: string) => void;
  onMapReady?: () => void;
}

// Build the full HTML with TomTom SDK — loads immediately, no waiting
const buildHTML = (apiKey: string, lat: number, lng: number, zoom: number) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body,#map{width:100%;height:100%;background:#f2f9ea;}
.user-dot{width:20px;height:20px;border-radius:50%;background:#39653f;border:3px solid #fff;box-shadow:0 0 0 4px rgba(57,101,63,0.25),0 4px 12px rgba(0,0,0,0.3);}
.city-pin{width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;display:flex;align-items:center;justify-content:center;}
.city-pin span{transform:rotate(45deg);color:#fff;font-size:9px;font-weight:800;font-family:sans-serif;text-align:center;line-height:1;}

@keyframes pulse {
  0% { opacity: 0.6; stroke-width: inherit; }
  50% { opacity: 1; stroke-width: 8; }
  100% { opacity: 0.6; stroke-width: inherit; }
}
.pulsing { animation: pulse 2s infinite ease-in-out; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js"></script>
<script>
(function(){
var map,markers={},polylines={},userMarker=null;
function postRN(o){try{window.ReactNativeWebView.postMessage(JSON.stringify(o));}catch(e){}}
function init(){
  try{
    map=tt.map({
      key:'${apiKey}',
      container:'map',
      center:[${lng},${lat}],
      zoom:${zoom},
      dragPan:true,
      scrollZoom:true
    });
    map.on('load',function(){
      map.addControl(new tt.NavigationControl({showZoom:true,showCompass:false}),'bottom-right');
      postRN({type:'ready'});
    });
    map.on('click', function(e) {
      var features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        var f = features[0];
        if (f.layer.id.startsWith('lay_')) {
          postRN({type:'polylinePress', id: f.layer.id.replace('lay_', '')});
        }
      }
    });
  }catch(e){postRN({type:'error',msg:String(e)});}
}
function handle(cmd){
  if(!map)return;
  switch(cmd.type){
    case 'flyTo':
      map.flyTo({center:[cmd.lng,cmd.lat],zoom:cmd.zoom||10,speed:1.4,essential:true});
      break;
    case 'fitBounds':
      if(!cmd.points||!cmd.points.length)return;
      var b=new tt.LngLatBounds();
      cmd.points.forEach(function(p){b.extend([p.lng,p.lat]);});
      map.fitBounds(b,{padding:{top:100,bottom:220,left:40,right:40},maxZoom:13,duration:800});
      break;
    case 'setUserLocation':
      if(userMarker)userMarker.remove();
      var el=document.createElement('div');
      el.className='user-dot';
      userMarker=new tt.Marker({element:el}).setLngLat([cmd.lng,cmd.lat]).addTo(map);
      map.flyTo({center:[cmd.lng,cmd.lat],zoom:cmd.zoom||10,speed:1.4});
      break;
    case 'setMarker':
      if(markers[cmd.id])markers[cmd.id].remove();
      var mel=document.createElement('div');
      mel.className='city-pin';
      mel.style.background=cmd.color;
      var sp=document.createElement('span');
      sp.textContent=(cmd.label||'').substring(0,3).toUpperCase();
      mel.appendChild(sp);
      mel.onclick=function(){postRN({type:'markerPress',id:cmd.id});};
      markers[cmd.id]=new tt.Marker({element:mel,anchor:'bottom'}).setLngLat([cmd.lng,cmd.lat]).addTo(map);
      break;
    case 'removeMarker':
      if(markers[cmd.id]){markers[cmd.id].remove();delete markers[cmd.id];}
      break;
    case 'setPolyline':
      var sid='src_'+cmd.id,lid='lay_'+cmd.id,lid2='lay2_'+cmd.id;
      if(map.getLayer(lid2))map.removeLayer(lid2);
      if(map.getLayer(lid))map.removeLayer(lid);
      if(map.getSource(sid))map.removeSource(sid);
      map.addSource(sid,{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:cmd.coords.map(function(c){return[c.lng,c.lat];})}}});
      map.addLayer({id:lid2,type:'line',source:sid,layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'rgba(255,255,255,0.6)','line-width':(cmd.width||4)+4}});
      map.addLayer({id:lid,type:'line',source:sid,layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':cmd.color,'line-width':cmd.width||4}});
      
      if (cmd.pulse) {
        // Simple visual pulse simulation via width variation if supported, or just label it
        // Note: Mapbox/TomTom layers don't support CSS animations directly easily, but we can animate properties
        var w = cmd.width||4;
        var up = true;
        setInterval(function() {
          if (!map.getLayer(lid)) return;
          w = up ? w + 0.2 : w - 0.2;
          if (w > (cmd.width||4) + 2) up = false;
          if (w < (cmd.width||4)) up = true;
          map.setPaintProperty(lid, 'line-width', w);
        }, 100);
      }
      polylines[cmd.id]={sid:sid,lid:lid,lid2:lid2};
      break;
    case 'removePolyline':
      var p=polylines[cmd.id];
      if(p){
        if(map.getLayer(p.lid2))map.removeLayer(p.lid2);
        if(map.getLayer(p.lid))map.removeLayer(p.lid);
        if(map.getSource(p.sid))map.removeSource(p.sid);
        delete polylines[cmd.id];
      }
      break;
    case 'clearAll':
      Object.keys(markers).forEach(function(k){markers[k].remove();});markers={};
      Object.keys(polylines).forEach(function(k){
        var p=polylines[k];
        if(map.getLayer(p.lid2))map.removeLayer(p.lid2);
        if(map.getLayer(p.lid))map.removeLayer(p.lid);
        if(map.getSource(p.sid))map.removeSource(p.sid);
      });polylines={};
      break;
  }
}
window.addEventListener('message',function(e){try{handle(JSON.parse(e.data));}catch(_){}});
document.addEventListener('message',function(e){try{handle(JSON.parse(e.data));}catch(_){}});
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{setTimeout(init,0);}
})();
</script>
</body>
</html>`;

export const TomTomMap = forwardRef<TomTomMapRef, Props>(function TomTomMap(
  { style, initialLat = 22.5937, initialLng = 78.9629, initialZoom = 5, onMarkerPress, onPolylinePress, onMapReady },
  ref
) {
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const pendingCmds = useRef<object[]>([]);

  const send = (cmd: object) => {
    if (!mapReady) { pendingCmds.current.push(cmd); return; }
    const js = `(function(){var d=${JSON.stringify(JSON.stringify(cmd))};var e=new MessageEvent('message',{data:d});window.dispatchEvent(e);document.dispatchEvent(e);})();true;`;
    webRef.current?.injectJavaScript(js);
  };

  // Request location immediately on mount
  useEffect(() => {
    (async () => {
      if (!ExpoLocation) return;
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: 3 });
        const { latitude: lat, longitude: lng } = pos.coords;
        send({ type: 'setUserLocation', lat, lng, zoom: 10 });
      } catch (_) {}
    })();
  }, [mapReady]);

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom = 12) => send({ type: 'flyTo', lat, lng, zoom }),
    fitBounds: (points) => send({ type: 'fitBounds', points }),
    setMarker: (id, lat, lng, color, label) => send({ type: 'setMarker', id, lat, lng, color, label }),
    removeMarker: (id) => send({ type: 'removeMarker', id }),
    setPolyline: (id, coords, color, width, pulse) => send({ type: 'setPolyline', id, coords, color, width, pulse }),
    removePolyline: (id) => send({ type: 'removePolyline', id }),
    clearAll: () => send({ type: 'clearAll' }),
    setUserLocation: (lat, lng) => send({ type: 'setUserLocation', lat, lng, zoom: 12 }),
  }));

  const handleReady = () => {
    setMapReady(true);
    onMapReady?.();
    // Flush pending commands
    pendingCmds.current.forEach(cmd => {
      const js = `(function(){var d=${JSON.stringify(JSON.stringify(cmd))};var e=new MessageEvent('message',{data:d});window.dispatchEvent(e);document.dispatchEvent(e);})();true;`;
      webRef.current?.injectJavaScript(js);
    });
    pendingCmds.current = [];
  };

  return (
    <View style={[st.container, style]}>
      <WebView
        ref={webRef}
        style={st.webview}
        source={{ html: buildHTML(TOMTOM_API_KEY, initialLat, initialLng, initialZoom) }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'ready') handleReady();
            if (msg.type === 'markerPress') onMarkerPress?.(msg.id);
            if (msg.type === 'polylinePress') onPolylinePress?.(msg.id);
          } catch (_) {}
        }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowFileAccess
        allowUniversalAccessFromFileURLs
        geolocationEnabled
        scrollEnabled={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={false}
        cacheEnabled={false}
      />
      {!mapReady && (
        <View style={st.loader}>
          <ActivityIndicator size="large" color="#39653f" />
          <Text style={st.loaderText}>Loading map...</Text>
        </View>
      )}
    </View>
  );
});

const st = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: '#f2f9ea' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f2f9ea',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: { color: '#39653f', fontSize: 13, fontWeight: '700' },
});
