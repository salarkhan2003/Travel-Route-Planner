import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Modal, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTripStore } from '../../src/store/tripStore';
import {
  ALL_LOCATIONS, INDIA_LOCATIONS, SINGAPORE_LOCATIONS,
  Location as TripLocation,
} from '../../src/constants/locations';
import { TRANSPORT_COLORS } from '../../src/constants/tripData';
import { useSavedStore } from '../../src/store/savedStore';
import {
  fetchPlacePredictions, fetchPlaceDetail, fetchDirections,
  PlacePrediction, PlaceDetail, DirectionsResult,
} from '../../src/hooks/useGoogleMaps';
import { TomTomMap, TomTomMapRef } from '../../src/components/TomTomMap';

let ExpoLocation: any = null;
try { ExpoLocation = require('expo-location'); } catch (_) {}

const FILTERS = [
  { id: 'all',       label: 'All',       lat: 15.0,    lng: 90.0  },
  { id: 'india',     label: 'India',     lat: 22.5937, lng: 78.9629 },
  { id: 'singapore', label: 'Singapore', lat: 1.3521,  lng: 103.82 },
  { id: 'spiritual', label: 'Spiritual', lat: 26.0,    lng: 76.0  },
  { id: 'beach',     label: 'Beach',     lat: 15.0,    lng: 74.0  },
  { id: 'heritage',  label: 'Heritage',  lat: 27.0,    lng: 78.0  },
  { id: 'food',      label: 'Food',      lat: 20.0,    lng: 78.0  },
  { id: 'nature',    label: 'Nature',    lat: 12.0,    lng: 76.0  },
];

function getFilteredLocs(id: string): TripLocation[] {
  switch (id) {
    case 'india':     return INDIA_LOCATIONS;
    case 'singapore': return SINGAPORE_LOCATIONS;
    case 'spiritual': return ALL_LOCATIONS.filter(l => l.tags.some(t => ['spiritual','pilgrimage','sufi'].includes(t)));
    case 'beach':     return ALL_LOCATIONS.filter(l => l.tags.includes('beach'));
    case 'heritage':  return ALL_LOCATIONS.filter(l => l.tags.some(t => ['heritage','UNESCO'].includes(t)));
    case 'food':      return ALL_LOCATIONS.filter(l => l.tags.includes('food'));
    case 'nature':    return ALL_LOCATIONS.filter(l => l.tags.some(t => ['nature','backwaters'].includes(t)));
    default:          return ALL_LOCATIONS;
  }
}

function markerColor(loc: TripLocation) {
  if (loc.country === 'Singapore') return '#1565C0';
  if (loc.tags.some(t => ['spiritual','pilgrimage','sufi'].includes(t))) return '#6A1B9A';
  if (loc.tags.includes('beach')) return '#00838F';
  if (loc.tags.includes('heritage')) return '#E65100';
  return '#2E7D32';
}

const NAV_MODES = [
  { id: 'driving', label: '🚗 Drive',   mode: 'driving'  as const },
  { id: 'walking', label: '� Walk',    mode: 'walking'  as const },
  { id: 'transit', label: '� Transit', mode: 'transit'  as const },
];

export default function ExploreScreen() {
  const mapRef = useRef<TomTomMapRef>(null);
  const nodes = useTripStore(s => s.nodes);
  const paths = useTripStore(s => s.paths);
  const selectNode = useTripStore(s => s.selectNode);
  const selectPath = useTripStore(s => s.selectPath);
  const { toggle, isSaved } = useSavedStore();

  const [search, setSearch] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [localResults, setLocalResults] = useState<TripLocation[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const sessionToken = useRef(Math.random().toString(36).slice(2));

  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleLocs, setVisibleLocs] = useState<TripLocation[]>(ALL_LOCATIONS);
  const [selectedLoc, setSelectedLoc] = useState<TripLocation | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const [navRoute, setNavRoute] = useState<DirectionsResult | null>(null);
  const [navDest, setNavDest] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [navMode, setNavMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [navLoading, setNavLoading] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  const cardAnim = useRef(new Animated.Value(400)).current;

  // ── Sync markers/polylines to map when ready ──────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    // Draw trip node markers
    nodes.forEach((node, i) => {
      mapRef.current?.setMarker(`node_${node.id}`, node.coordinates[1], node.coordinates[0], '#2E7D32', `${i+1}`);
    });
    // Draw trip path polylines
    paths.forEach(path => {
      const from = nodes.find(n => n.id === path.fromNodeId);
      const to = nodes.find(n => n.id === path.toNodeId);
      if (!from || !to) return;
      const color = TRANSPORT_COLORS[path.selectedMode] ?? '#4CAF50';
      const mid = { lat: (from.coordinates[1] + to.coordinates[1]) / 2 + 0.3, lng: (from.coordinates[0] + to.coordinates[0]) / 2 };
      mapRef.current?.setPolyline(`path_${path.id}`, [
        { lat: from.coordinates[1], lng: from.coordinates[0] },
        mid,
        { lat: to.coordinates[1], lng: to.coordinates[0] },
      ], color, 4);
    });
    // Draw discover markers
    visibleLocs.filter(loc => !nodes.find(n => n.city === loc.city)).forEach(loc => {
      mapRef.current?.setMarker(`loc_${loc.id}`, loc.coordinates[1], loc.coordinates[0], markerColor(loc), loc.city.substring(0,3));
    });
  }, [mapReady, nodes, paths, visibleLocs]);

  // ── Nav route polyline ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    if (navRoute && navRoute.polylineCoords.length > 1) {
      mapRef.current?.setPolyline('nav_route', navRoute.polylineCoords.map(c => ({ lat: c.latitude, lng: c.longitude })), '#1565C0', 5);
      if (navDest) mapRef.current?.setMarker('nav_dest', navDest.lat, navDest.lng, '#E65100', navDest.name.substring(0,3));
      mapRef.current?.fitBounds(navRoute.polylineCoords.map(c => ({ lat: c.latitude, lng: c.longitude })));
    } else {
      mapRef.current?.removePolyline('nav_route');
      mapRef.current?.removeMarker('nav_dest');
    }
  }, [mapReady, navRoute, navDest]);

  useEffect(() => { fetchLocation(); }, []);

  const fetchLocation = async () => {
    if (!ExpoLocation) return;
    setLocLoading(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocLoading(false); return; }
      const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: 3 });
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserCoords(c);
      mapRef.current?.flyTo(c.lat, c.lng, 8);
    } catch (_) {}
    setLocLoading(false);
  };

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) { setPredictions([]); setLocalResults([]); return; }
    const q = text.toLowerCase();
    setLocalResults(ALL_LOCATIONS.filter(l =>
      l.city.toLowerCase().includes(q) || l.region.toLowerCase().includes(q) ||
      l.tags.some(t => t.includes(q)) || l.highlights.some(h => h.toLowerCase().includes(q))
    ).slice(0, 4));
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      const preds = await fetchPlacePredictions(text, sessionToken.current);
      setPredictions(preds.slice(0, 5));
      setSearchLoading(false);
    }, 350);
  }, []);

  const clearSearch = useCallback(() => { setSearch(''); setPredictions([]); setLocalResults([]); }, []);

  const selectPrediction = useCallback(async (pred: PlacePrediction) => {
    setSearch(pred.structured_formatting.main_text);
    setPredictions([]); setLocalResults([]);
    const raw = pred as any;
    if (raw._lat != null) {
      const detail: PlaceDetail = {
        place_id: pred.place_id, name: pred.structured_formatting.main_text,
        formatted_address: pred.description,
        geometry: { location: { lat: raw._lat, lng: raw._lng } },
      };
      setSelectedPlace(detail); setSelectedLoc(null);
      mapRef.current?.flyTo(raw._lat, raw._lng, 13);
      mapRef.current?.setMarker('search_result', raw._lat, raw._lng, '#E65100', pred.structured_formatting.main_text.substring(0,3));
      cardAnim.setValue(400);
      Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }).start();
      return;
    }
    setSearchLoading(true);
    const detail = await fetchPlaceDetail(pred.place_id, raw);
    setSearchLoading(false);
    if (!detail) return;
    setSelectedPlace(detail); setSelectedLoc(null);
    mapRef.current?.flyTo(detail.geometry.location.lat, detail.geometry.location.lng, 13);
    cardAnim.setValue(400);
    Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }).start();
  }, [cardAnim]);

  const openCard = useCallback((loc: TripLocation) => {
    setSearch(loc.city); setPredictions([]); setLocalResults([]);
    setSelectedLoc(loc); setSelectedPlace(null);
    mapRef.current?.flyTo(loc.coordinates[1], loc.coordinates[0], 11);
    cardAnim.setValue(400);
    Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }).start();
  }, [cardAnim]);

  const closeCard = useCallback(() => {
    Animated.timing(cardAnim, { toValue: 400, useNativeDriver: true, duration: 200 }).start(() => {
      setSelectedLoc(null); setSelectedPlace(null);
    });
    setSearch('');
  }, [cardAnim]);

  const startNav = useCallback(async (destLat: number, destLng: number, destName: string, mode: 'driving' | 'walking' | 'transit' = 'driving') => {
    const origin = userCoords ?? { lat: destLat - 0.05, lng: destLng - 0.05 };
    setNavLoading(true);
    setNavDest({ name: destName, lat: destLat, lng: destLng });
    setNavMode(mode); setCurrentStepIdx(0); setShowSteps(false);
    closeCard(); setShowGuide(false);
    const result = await fetchDirections(origin, { lat: destLat, lng: destLng }, mode);
    setNavLoading(false);
    if (result) {
      setNavRoute(result);
    } else {
      setNavRoute({
        polylineCoords: [{ latitude: origin.lat, longitude: origin.lng }, { latitude: destLat, longitude: destLng }],
        steps: [], totalDistance: '—', totalDuration: '—', summary: '',
      });
    }
  }, [userCoords, closeCard]);

  const endNav = useCallback(() => { setNavRoute(null); setNavDest(null); setShowSteps(false); }, []);

  const handleFilter = useCallback((f: typeof FILTERS[0]) => {
    setActiveFilter(f.id); clearSearch();
    const locs = getFilteredLocs(f.id);
    setVisibleLocs(locs);
    mapRef.current?.flyTo(f.lat, f.lng, f.id === 'singapore' ? 11 : 5);
    if (locs.length > 1) {
      setTimeout(() => {
        mapRef.current?.fitBounds(locs.map(l => ({ lat: l.coordinates[1], lng: l.coordinates[0] })));
      }, 600);
    }
  }, [clearSearch]);

  const handleMarkerPress = useCallback((id: string) => {
    if (id.startsWith('loc_')) {
      const locId = id.replace('loc_', '');
      const loc = ALL_LOCATIONS.find(l => l.id === locId);
      if (loc) openCard(loc);
    }
  }, [openCard]);

  const showDropdown = (predictions.length > 0 || localResults.length > 0) && search.length >= 2;
  const activeCard = selectedLoc || selectedPlace;
  const cardName = selectedLoc ? selectedLoc.city : selectedPlace?.name ?? '';
  const cardSubtitle = selectedLoc ? `${selectedLoc.region} · ${selectedLoc.country}` : selectedPlace?.formatted_address ?? '';
  const cardLat = selectedLoc ? selectedLoc.coordinates[1] : selectedPlace?.geometry.location.lat ?? 0;
  const cardLng = selectedLoc ? selectedLoc.coordinates[0] : selectedPlace?.geometry.location.lng ?? 0;

  return (
    <View style={s.container}>
      {/* ── TomTom Map ── */}
      <TomTomMap
        ref={mapRef}
        style={s.map}
        initialLat={22.5937}
        initialLng={78.9629}
        initialZoom={5}
        onMapReady={() => setMapReady(true)}
        onMarkerPress={handleMarkerPress}
      />

      {/* ── Overlay ── */}
      <SafeAreaView style={s.overlay} edges={['top']}>
        <View style={s.searchRow}>
          <View style={s.searchPill}>
            <Text style={s.searchIcon}>◎</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search any place, city, landmark..."
              placeholderTextColor="#81C784"
              value={search}
              onChangeText={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchLoading
              ? <ActivityIndicator size="small" color="#4CAF50" style={{ marginRight: 4 }} />
              : search.length > 0
                ? <TouchableOpacity onPress={clearSearch}><Text style={s.clearBtn}>✕</Text></TouchableOpacity>
                : null
            }
          </View>
          <TouchableOpacity style={[s.locBtn, locLoading && { opacity: 0.5 }]} onPress={fetchLocation}>
            <Text style={s.locBtnText}>{locLoading ? '…' : '⊕'}</Text>
          </TouchableOpacity>
        </View>

        {showDropdown && (
          <View style={s.dropdown}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {localResults.map(loc => (
                <TouchableOpacity key={`local-${loc.id}`} style={s.dropItem} onPress={() => openCard(loc)} activeOpacity={0.7}>
                  <View style={[s.dropBadge, { backgroundColor: '#C8E6C9' }]}>
                    <Text style={s.dropBadgeText}>{loc.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dropMain}>{loc.city}</Text>
                    <Text style={s.dropSub}>{loc.region} · {loc.country}</Text>
                  </View>
                  <Text style={s.dropType}>Local</Text>
                </TouchableOpacity>
              ))}
              {predictions.map(pred => (
                <TouchableOpacity key={pred.place_id} style={s.dropItem} onPress={() => selectPrediction(pred)} activeOpacity={0.7}>
                  <View style={[s.dropBadge, { backgroundColor: '#BBDEFB' }]}>
                    <Text style={s.dropBadgeText}>📍</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dropMain}>{pred.structured_formatting.main_text}</Text>
                    <Text style={s.dropSub}>{pred.structured_formatting.secondary_text}</Text>
                  </View>
                  <Text style={s.dropType}>TomTom</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!showDropdown && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f.id} onPress={() => handleFilter(f)} style={[s.chip, activeFilter === f.id && s.chipActive]} activeOpacity={0.75}>
                <Text style={[s.chipText, activeFilter === f.id && s.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── Location detail card ── */}
      {activeCard && (
        <Animated.View style={[s.card, { transform: [{ translateY: cardAnim }] }]}>
          <View style={s.cardHandle} />
          <View style={s.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardCity}>{cardName}</Text>
              <Text style={s.cardRegion}>{cardSubtitle}</Text>
            </View>
            {selectedLoc && (
              <TouchableOpacity onPress={() => toggle(selectedLoc.id)} style={{ padding: 4, marginRight: 6 }}>
                <Text style={{ fontSize: 22 }}>{isSaved(selectedLoc.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={closeCard} style={s.cardClose}>
              <Text style={s.cardCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedLoc && (
            <>
              <Text style={s.cardDesc}>{selectedLoc.description}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {selectedLoc.highlights.map(h => (
                  <View key={h} style={s.hlChip}><Text style={s.hlText}>{h}</Text></View>
                ))}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {selectedLoc.tags.map(t => (
                  <View key={t} style={s.tagChip}><Text style={s.tagText}>{t}</Text></View>
                ))}
              </ScrollView>
            </>
          )}
          <View style={s.navModeRow}>
            {NAV_MODES.map(m => (
              <TouchableOpacity key={m.id} style={[s.navModeBtn, navMode === m.mode && s.navModeBtnActive]} onPress={() => setNavMode(m.mode)}>
                <Text style={[s.navModeBtnText, navMode === m.mode && s.navModeBtnTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.cardFooter}>
            {selectedLoc && (
              <View>
                <Text style={s.cardCostLabel}>Avg hotel / night</Text>
                <Text style={s.cardCost}>~₹{selectedLoc.avgHotelCost * 83}</Text>
              </View>
            )}
            <View style={[s.cardActions, !selectedLoc && { flex: 1 }]}>
              <TouchableOpacity
                style={[s.navBtn, navLoading && { opacity: 0.6 }, !selectedLoc && { flex: 1 }]}
                onPress={() => startNav(cardLat, cardLng, cardName, navMode)}
                disabled={navLoading}
              >
                {navLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={s.navBtnText}>Navigate</Text>}
              </TouchableOpacity>
              {selectedLoc && (
                <TouchableOpacity style={s.guideBtn} onPress={() => setShowGuide(true)}>
                  <Text style={s.guideBtnText}>Guide</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Navigation HUD ── */}
      {navRoute && navDest && (
        <View style={s.navHUD}>
          <View style={s.navHUDLeft}>
            <View style={[s.navDot, { backgroundColor: '#4CAF50' }]} />
            <View style={s.navStem} />
            <View style={[s.navDot, { backgroundColor: '#1565C0' }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.navFrom}>{userCoords ? 'Your Location' : 'Start'}</Text>
            <Text style={s.navTo}>{navDest.name}</Text>
            <Text style={s.navMeta}>{navRoute.totalDistance}  ·  {navRoute.totalDuration}</Text>
          </View>
          <View style={s.navHUDRight}>
            {navRoute.steps.length > 0 && (
              <TouchableOpacity style={s.stepsBtn} onPress={() => setShowSteps(true)}>
                <Text style={s.stepsBtnText}>Steps</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.navEnd} onPress={endNav}>
              <Text style={s.navEndText}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Steps modal ── */}
      <Modal visible={showSteps} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={s.modalOverlay}>
          <View style={s.stepsSheet}>
            <View style={s.guideHandle} />
            <Text style={s.stepsTitle}>Turn-by-Turn Directions</Text>
            <Text style={s.stepsMeta}>{navRoute?.totalDistance}  ·  {navRoute?.totalDuration}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              {navRoute?.steps.map((step, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.stepItem, i === currentStepIdx && s.stepItemActive]}
                  onPress={() => { setCurrentStepIdx(i); mapRef.current?.flyTo(step.start_location.lat, step.start_location.lng, 15); }}
                >
                  <View style={[s.stepNum, i === currentStepIdx && s.stepNumActive]}>
                    <Text style={s.stepNumText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stepInstr}>{step.html_instructions.replace(/<[^>]+>/g, '')}</Text>
                    <Text style={s.stepDist}>{step.distance.text}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 32 }} />
            </ScrollView>
            <TouchableOpacity style={s.stepsClose} onPress={() => setShowSteps(false)}>
              <Text style={s.stepsCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Travel Guide Modal ── */}
      <Modal visible={showGuide} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={s.modalOverlay}>
          <View style={s.guideSheet}>
            <View style={s.guideHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.guideCity}>{selectedLoc?.city}</Text>
              <Text style={s.guideRegion}>{selectedLoc?.region} · {selectedLoc?.country}</Text>
              <Text style={s.guideSection}>About</Text>
              <Text style={s.guideBody}>{selectedLoc?.description}</Text>
              <Text style={s.guideSection}>Must-See</Text>
              {selectedLoc?.highlights.map((h, i) => (
                <View key={h} style={s.guideItem}>
                  <View style={[s.guideItemDot, { backgroundColor: i < 3 ? '#4CAF50' : '#A5D6A7' }]}>
                    <Text style={s.guideItemNum}>{i + 1}</Text>
                  </View>
                  <Text style={s.guideItemText}>{h}</Text>
                </View>
              ))}
              <Text style={s.guideSection}>Best Season</Text>
              <View style={s.seasonRow}>
                {[{ s: 'Oct–Mar', l: 'Best', c: '#4CAF50' }, { s: 'Apr–Jun', l: 'Hot', c: '#FF7043' }, { s: 'Jul–Sep', l: 'Monsoon', c: '#1565C0' }].map(x => (
                  <View key={x.s} style={[s.seasonChip, { borderColor: x.c }]}>
                    <Text style={[s.seasonLabel, { color: x.c }]}>{x.l}</Text>
                    <Text style={s.seasonPeriod}>{x.s}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.guideSection}>Getting There</Text>
              {[
                { icon: '🚆', mode: 'Train', detail: 'Book 3AC on IRCTC. Rajdhani/Shatabdi for comfort.' },
                { icon: '✈', mode: 'Flight', detail: 'IndiGo/Air India serve nearby airports.' },
                { icon: '🚗', mode: 'Road', detail: 'NH highways + cab/bus options available.' },
              ].map(t => (
                <View key={t.mode} style={s.transportCard}>
                  <View style={s.transportIcon}><Text style={{ fontSize: 20 }}>{t.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.transportMode}>{t.mode}</Text>
                    <Text style={s.transportDetail}>{t.detail}</Text>
                  </View>
                </View>
              ))}
              <View style={s.guideActions}>
                <TouchableOpacity style={s.guideNavBtn} onPress={() => { if (selectedLoc) startNav(selectedLoc.coordinates[1], selectedLoc.coordinates[0], selectedLoc.city, navMode); setShowGuide(false); }}>
                  <Text style={s.guideNavBtnText}>Navigate Here</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.guideCloseBtn} onPress={() => setShowGuide(false)}>
                  <Text style={s.guideCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },

  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginTop: 6, gap: 10 },
  // Concave clay tube — sunken into background (reversed inner shadows)
  searchPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#DCF0DE',
    borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 13,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)',
    // Inset shadow = concave/sunken look
    shadowColor: 'rgba(27,62,31,0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 1,
  },
  searchIcon: { fontSize: 17, color: '#4CAF50' },
  searchInput: { flex: 1, color: '#1B5E20', fontSize: 14, fontWeight: '600' },
  clearBtn: { color: '#81C784', fontSize: 16, paddingHorizontal: 4 },
  // Location button — inflated clay circle
  locBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.98)',
    shadowColor: 'rgba(165,214,167,0.5)',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  locBtnText: { fontSize: 22, color: '#2E7D32', fontWeight: '900' },

  dropdown: {
    backgroundColor: 'rgba(241,248,242,0.98)',
    marginHorizontal: 14, marginTop: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.25)', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 10,
    maxHeight: 320, overflow: 'hidden',
  },
  dropItem: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(165,214,167,0.25)' },
  dropBadge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dropBadgeText: { fontSize: 16 },
  dropMain: { color: '#1B5E20', fontSize: 14, fontWeight: '700' },
  dropSub: { color: '#558B2F', fontSize: 11, marginTop: 1 },
  dropType: { color: '#81C784', fontSize: 10, fontWeight: '700' },

  filterScroll: { marginTop: 8 },
  filterContent: { paddingHorizontal: 14, paddingBottom: 6, gap: 8 },
  // Clay filter chips — inflated pill style
  chip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.98)',
    // Outer clay shadow
    shadowColor: 'rgba(165,214,167,0.45)',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  chipActive: {
    backgroundColor: '#2E7D32',
    shadowColor: 'rgba(27,62,31,0.4)',
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 10, elevation: 8,
  },
  chipText: { color: '#2E7D32', fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#FFF', fontWeight: '900' },

  card: {
    position: 'absolute', bottom: 88, left: 14, right: 14,
    backgroundColor: '#F1F8F2', borderRadius: 28, padding: 18,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.4)', shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1, shadowRadius: 16, elevation: 16,
  },
  cardHandle: { width: 36, height: 4, backgroundColor: '#A5D6A7', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardCity: { color: '#1B5E20', fontSize: 22, fontWeight: '900' },
  cardRegion: { color: '#558B2F', fontSize: 12, marginTop: 2 },
  cardClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center' },
  cardCloseText: { color: '#1B5E20', fontSize: 14, fontWeight: '900' },
  cardDesc: { color: '#2E7D32', fontSize: 13, lineHeight: 18 },
  hlChip: { backgroundColor: '#C8E6C9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  hlText: { color: '#1B5E20', fontSize: 11, fontWeight: '700' },
  tagChip: { backgroundColor: '#DCEDC8', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 },
  tagText: { color: '#33691E', fontSize: 10, fontWeight: '600' },

  navModeRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 4 },
  navModeBtn: { flex: 1, paddingVertical: 8, borderRadius: 16, alignItems: 'center', backgroundColor: '#E8F5E9', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  navModeBtnActive: { backgroundColor: '#4CAF50' },
  navModeBtnText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
  navModeBtnTextActive: { color: '#FFF' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  cardCostLabel: { color: '#558B2F', fontSize: 10, fontWeight: '600' },
  cardCost: { color: '#1B5E20', fontSize: 18, fontWeight: '900' },
  cardActions: { flexDirection: 'row', gap: 10 },
  navBtn: {
    backgroundColor: '#2E7D32', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: 'rgba(165,214,167,0.45)', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 8,
    alignItems: 'center', justifyContent: 'center', minWidth: 100,
  },
  navBtnText: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  guideBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.98)',
    shadowColor: 'rgba(165,214,167,0.4)', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 5,
  },
  guideBtnText: { color: '#2E7D32', fontSize: 13, fontWeight: '900' },

  navHUD: {
    position: 'absolute', bottom: 100, left: 16, right: 16,
    backgroundColor: '#F1F8F2', borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(21,101,192,0.3)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 12,
  },
  navHUDLeft: { alignItems: 'center', gap: 2 },
  navDot: { width: 10, height: 10, borderRadius: 5 },
  navStem: { width: 2, height: 20, backgroundColor: '#C8E6C9' },
  navFrom: { fontSize: 11, color: '#558B2F', fontWeight: '600' },
  navTo: { fontSize: 16, color: '#1B3A1F', fontWeight: '800', marginTop: 2 },
  navMeta: { fontSize: 12, color: '#2E7D32', fontWeight: '700', marginTop: 3 },
  navHUDRight: { alignItems: 'flex-end', gap: 6 },
  stepsBtn: { backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  stepsBtnText: { color: '#1B5E20', fontSize: 12, fontWeight: '800' },
  navEnd: { backgroundColor: '#E53935', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  navEndText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  stepsSheet: {
    backgroundColor: '#F1F8F2', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, maxHeight: '80%',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
  },
  stepsTitle: { color: '#1B5E20', fontSize: 18, fontWeight: '900', marginBottom: 2 },
  stepsMeta: { color: '#558B2F', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#E8F5E9', borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  stepItemActive: { backgroundColor: '#C8E6C9', borderColor: '#4CAF50' },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#A5D6A7', alignItems: 'center', justifyContent: 'center' },
  stepNumActive: { backgroundColor: '#4CAF50' },
  stepNumText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  stepInstr: { color: '#1B5E20', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  stepDist: { color: '#558B2F', fontSize: 11, marginTop: 3 },
  stepsClose: { backgroundColor: '#4CAF50', borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginTop: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  stepsCloseText: { color: '#FFF', fontSize: 15, fontWeight: '900' },

  guideSheet: {
    backgroundColor: '#F1F8F2', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, maxHeight: '88%',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
  },
  guideHandle: { width: 36, height: 4, backgroundColor: '#A5D6A7', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  guideCity: { color: '#1B5E20', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  guideRegion: { color: '#558B2F', fontSize: 13, marginBottom: 4 },
  guideSection: { color: '#1B5E20', fontSize: 14, fontWeight: '900', marginTop: 16, marginBottom: 10 },
  guideBody: { color: '#2E7D32', fontSize: 13, lineHeight: 20 },
  guideItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  guideItemDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  guideItemNum: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  guideItemText: { color: '#1B5E20', fontSize: 13, fontWeight: '600', flex: 1 },
  seasonRow: { flexDirection: 'row', gap: 10 },
  seasonChip: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', backgroundColor: '#F1F8F2', borderWidth: 2 },
  seasonLabel: { fontSize: 12, fontWeight: '900' },
  seasonPeriod: { color: '#558B2F', fontSize: 10, marginTop: 3 },
  transportCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#E8F5E9', borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  transportIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center' },
  transportMode: { color: '#1B5E20', fontSize: 13, fontWeight: '800' },
  transportDetail: { color: '#2E7D32', fontSize: 12, lineHeight: 17, marginTop: 2 },
  guideActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  guideNavBtn: { flex: 2, backgroundColor: '#4CAF50', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  guideNavBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  guideCloseBtn: { flex: 1, backgroundColor: '#C8E6C9', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  guideCloseBtnText: { color: '#1B5E20', fontSize: 16, fontWeight: '800' },
});
