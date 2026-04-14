import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Callout, Marker, Polyline } from 'react-native-maps';
import { useTripStore } from '../../src/store/tripStore';
import {
  ALL_LOCATIONS, INDIA_LOCATIONS, SINGAPORE_LOCATIONS,
  Location as TripLocation,
} from '../../src/constants/locations';
import { TRANSPORT_COLORS } from '../../src/constants/tripData';
import { useSavedStore } from '../../src/store/savedStore';

let ExpoLocation: any = null;
try { ExpoLocation = require('expo-location'); } catch (_) {}

// ─── Filter config ────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all',       label: 'All India & SG', lat: 15.0,    lng: 90.0,    dLat: 35, dLng: 35 },
  { id: 'india',     label: 'India',          lat: 22.5937, lng: 78.9629, dLat: 22, dLng: 22 },
  { id: 'singapore', label: 'Singapore',      lat: 1.3521,  lng: 103.82,  dLat: 0.25, dLng: 0.25 },
  { id: 'spiritual', label: 'Spiritual',      lat: 26.0,    lng: 76.0,    dLat: 14, dLng: 14 },
  { id: 'beach',     label: 'Beach',          lat: 15.0,    lng: 74.0,    dLat: 12, dLng: 12 },
  { id: 'heritage',  label: 'Heritage',       lat: 27.0,    lng: 78.0,    dLat: 10, dLng: 10 },
  { id: 'food',      label: 'Food',           lat: 20.0,    lng: 78.0,    dLat: 18, dLng: 18 },
  { id: 'nature',    label: 'Nature',         lat: 12.0,    lng: 76.0,    dLat: 10, dLng: 10 },
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

// ─── Custom marker component ──────────────────────────────────────────────────
// Android fix: tracksViewChanges starts true, then goes false after render
// so the marker measures correctly before freezing.
function CityMarker({ loc, isSelected }: { loc: TripLocation; isSelected: boolean }) {
  const color = markerColor(loc);
  return (
    <View style={{ width: 120, alignItems: 'center' }}>
      <View style={[
        mStyles.bubble,
        { borderColor: color, backgroundColor: isSelected ? color : '#FFFFFF' },
      ]}>
        <Text style={[mStyles.name, { color: isSelected ? '#FFFFFF' : color }]}>
          {loc.city}
        </Text>
      </View>
      <View style={[mStyles.tail, { borderTopColor: color }]} />
    </View>
  );
}

function TripMarker({ city, index }: { city: string; index: number }) {
  return (
    <View style={{ width: 130, alignItems: 'center' }}>
      <View style={mStyles.tripBubble}>
        <View style={mStyles.tripNum}>
          <Text style={mStyles.tripNumText}>{index + 1}</Text>
        </View>
        <Text style={mStyles.tripCity}>{city}</Text>
      </View>
      <View style={[mStyles.tail, { borderTopColor: '#2E7D32' }]} />
    </View>
  );
}

const mStyles = StyleSheet.create({
  // Callout styles — rendered in native overlay, never clips
  callout: {
    borderRadius: 10, borderWidth: 2,
    paddingHorizontal: 12, paddingVertical: 6,
    minWidth: 60,
  },
  calloutText: {
    fontSize: 13, fontWeight: '800', textAlign: 'center',
  },
  tripCallout: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: 12, borderWidth: 2,
    borderColor: '#2E7D32', paddingHorizontal: 10, paddingVertical: 6,
  },
  tripCalloutNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center',
  },
  tripCalloutNumText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  tripCalloutCity: { color: '#1B5E20', fontSize: 13, fontWeight: '800' },
  // Keep old styles for nav marker
  bubble: {
    borderRadius: 10, borderWidth: 2,
    paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'center', elevation: 5,
  },
  name: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  tail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  tripBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E8F5E9', borderRadius: 12, borderWidth: 2,
    borderColor: '#2E7D32', paddingHorizontal: 8, paddingVertical: 5,
    alignSelf: 'center', elevation: 6,
  },
  tripNum: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center',
  },
  tripNumText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  tripCity: { color: '#1B5E20', fontSize: 12, fontWeight: '800' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const mapRef = useRef<InstanceType<typeof MapView>>(null);
  const nodes = useTripStore(s => s.nodes);
  const paths = useTripStore(s => s.paths);
  const selectNode = useTripStore(s => s.selectNode);
  const selectPath = useTripStore(s => s.selectPath);

  const { toggle, isSaved } = useSavedStore();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<TripLocation[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleLocs, setVisibleLocs] = useState<TripLocation[]>(ALL_LOCATIONS);
  const [selectedLoc, setSelectedLoc] = useState<TripLocation | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [navRoute, setNavRoute] = useState<{ from: { lat: number; lng: number }; to: TripLocation } | null>(null);

  const cardAnim = useRef(new Animated.Value(400)).current;
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

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
      mapRef.current?.animateToRegion({ latitude: c.lat, longitude: c.lng, latitudeDelta: 6, longitudeDelta: 6 }, 1000);
    } catch (_) {}
    setLocLoading(false);
  };

  const handleFilter = useCallback((f: typeof FILTERS[0]) => {
    setActiveFilter(f.id);
    setSearch('');
    setSearchResults([]);
    const locs = getFilteredLocs(f.id);
    setVisibleLocs(locs);
    mapRef.current?.animateToRegion(
      { latitude: f.lat, longitude: f.lng, latitudeDelta: f.dLat, longitudeDelta: f.dLng },
      900
    );
    if (locs.length > 1) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          locs.map(l => ({ latitude: l.coordinates[1], longitude: l.coordinates[0] })),
          { edgePadding: { top: 130, right: 30, bottom: 200, left: 30 }, animated: true }
        );
      }, 500);
    }
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (text.length < 2) { setSearchResults([]); return; }
    const q = text.toLowerCase();
    setSearchResults(ALL_LOCATIONS.filter(l =>
      l.city.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q) ||
      l.tags.some(t => t.includes(q)) ||
      l.highlights.some(h => h.toLowerCase().includes(q))
    ).slice(0, 8));
  }, []);

  const openCard = useCallback((loc: TripLocation) => {
    setSearch(loc.city);
    setSearchResults([]);
    setSelectedLoc(loc);
    mapRef.current?.animateToRegion(
      { latitude: loc.coordinates[1], longitude: loc.coordinates[0], latitudeDelta: 1.0, longitudeDelta: 1.0 },
      800
    );
    cardAnim.setValue(400);
    Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }).start();
  }, [cardAnim]);

  const closeCard = useCallback(() => {
    Animated.timing(cardAnim, { toValue: 400, useNativeDriver: true, duration: 200 }).start(() => setSelectedLoc(null));
    setSearch('');
  }, [cardAnim]);

  const startNav = useCallback((loc: TripLocation) => {
    const origin = userCoords ?? { lat: loc.coordinates[1] - 0.08, lng: loc.coordinates[0] - 0.08 };
    setNavRoute({ from: origin, to: loc });
    setShowGuide(false);
    closeCard();
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: origin.lat, longitude: origin.lng },
          { latitude: loc.coordinates[1], longitude: loc.coordinates[0] },
        ],
        { edgePadding: { top: 140, right: 40, bottom: 260, left: 40 }, animated: true }
      );
    }, 300);
  }, [userCoords, closeCard]);

  return (
    <View style={s.container}>
      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={{ latitude: 22.5937, longitude: 78.9629, latitudeDelta: 22, longitudeDelta: 22 }}
        onPress={() => { selectPath(null); selectNode(null); closeCard(); }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Trip route polylines */}
        {paths.map(path => {
          const from = nodeMap[path.fromNodeId];
          const to = nodeMap[path.toNodeId];
          if (!from || !to) return null;
          const color = TRANSPORT_COLORS[path.selectedMode] ?? '#4CAF50';
          return (
            <Polyline
              key={path.id}
              coordinates={[
                { latitude: from.coordinates[1], longitude: from.coordinates[0] },
                { latitude: (from.coordinates[1] + to.coordinates[1]) / 2 + 0.3, longitude: (from.coordinates[0] + to.coordinates[0]) / 2 },
                { latitude: to.coordinates[1], longitude: to.coordinates[0] },
              ]}
              strokeColor={color} strokeWidth={3}
              lineDashPattern={path.selectedMode === 'flight' ? [8, 4] : undefined}
              tappable onPress={() => selectPath(path.id)}
            />
          );
        })}

        {/* Trip node markers */}
        {nodes.map((node, i) => (
          <Marker
            key={node.id}
            coordinate={{ latitude: node.coordinates[1], longitude: node.coordinates[0] }}
            onPress={() => selectNode(node.id)}
            tracksViewChanges={false}
            pinColor="#2E7D32"
          >
            <Callout tooltip>
              <View style={mStyles.tripCallout}>
                <View style={mStyles.tripCalloutNum}>
                  <Text style={mStyles.tripCalloutNumText}>{i + 1}</Text>
                </View>
                <Text style={mStyles.tripCalloutCity}>{node.city}</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Discover location markers — use Callout for reliable text rendering */}
        {visibleLocs
          .filter(loc => !nodes.find(n => n.city === loc.city))
          .map(loc => {
            const color = markerColor(loc);
            const isSelected = selectedLoc?.id === loc.id;
            return (
              <Marker
                key={loc.id}
                coordinate={{ latitude: loc.coordinates[1], longitude: loc.coordinates[0] }}
                onPress={() => openCard(loc)}
                tracksViewChanges={false}
                pinColor={color}
              >
                <Callout tooltip onPress={() => openCard(loc)}>
                  <View style={[mStyles.callout, { borderColor: color, backgroundColor: isSelected ? color : '#FFF' }]}>
                    <Text style={[mStyles.calloutText, { color: isSelected ? '#FFF' : color }]}>
                      {loc.city}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}

        {/* Navigation route */}
        {navRoute && (
          <>
            <Polyline
              coordinates={[
                { latitude: navRoute.from.lat, longitude: navRoute.from.lng },
                { latitude: (navRoute.from.lat + navRoute.to.coordinates[1]) / 2 + 0.05, longitude: (navRoute.from.lng + navRoute.to.coordinates[0]) / 2 },
                { latitude: navRoute.to.coordinates[1], longitude: navRoute.to.coordinates[0] },
              ]}
              strokeColor="#1565C0" strokeWidth={5}
              lineDashPattern={[6, 3]}
            />
            <Marker coordinate={{ latitude: navRoute.to.coordinates[1], longitude: navRoute.to.coordinates[0] }} tracksViewChanges={false}>
              <View style={s.navMarker}>
                <Text style={s.navMarkerText}>{navRoute.to.city}</Text>
              </View>
              <View style={[mStyles.tail, { borderTopColor: '#1565C0' }]} />
            </Marker>
          </>
        )}
      </MapView>

      {/* ── Overlay (search + filters) ── */}
      <SafeAreaView style={s.overlay} edges={['top']}>
        {/* Search row */}
        <View style={s.searchRow}>
          <View style={s.searchPill}>
            <Text style={s.searchPillIcon}>◎</Text>
            <TextInput
              style={s.searchPillInput}
              placeholder="Search cities, regions, tags..."
              placeholderTextColor="#81C784"
              value={search}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); setSearchResults([]); }}>
                <Text style={s.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[s.locBtn, locLoading && { opacity: 0.5 }]} onPress={fetchLocation}>
            <Text style={s.locBtnText}>{locLoading ? '…' : '⊕'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search dropdown */}
        {searchResults.length > 0 && (
          <View style={s.dropdown}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {searchResults.map(loc => (
                <TouchableOpacity key={loc.id} style={s.dropItem} onPress={() => openCard(loc)} activeOpacity={0.7}>
                  <View style={[s.dropFlag, { backgroundColor: loc.country === 'Singapore' ? '#BBDEFB' : '#C8E6C9' }]}>
                    <Text style={s.dropFlagText}>{loc.country === 'Singapore' ? 'SG' : 'IN'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dropCity}>{loc.city}</Text>
                    <Text style={s.dropSub}>{loc.region} · {loc.tags.slice(0, 2).join(', ')}</Text>
                  </View>
                  <Text style={s.dropCost}>~₹{loc.avgHotelCost * 83}/night</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter chips */}
        {searchResults.length === 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.filterScroll}
            contentContainerStyle={s.filterContent}
            bounces
          >
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.id}
                onPress={() => handleFilter(f)}
                style={[s.chip, activeFilter === f.id && s.chipActive]}
                activeOpacity={0.75}
              >
                <Text style={[s.chipText, activeFilter === f.id && s.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── Location detail card ── */}
      {selectedLoc && (
        <Animated.View style={[s.card, { transform: [{ translateY: cardAnim }] }]}>
          <View style={s.cardHandle} />
          <View style={s.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardCity}>{selectedLoc.city}</Text>
              <Text style={s.cardRegion}>{selectedLoc.region} · {selectedLoc.country}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggle(selectedLoc.id)}
              style={{ padding: 4, marginRight: 6 }}
            >
              <Text style={{ fontSize: 22 }}>{isSaved(selectedLoc.id) ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeCard} style={s.cardClose}>
              <Text style={s.cardCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
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
          <View style={s.cardFooter}>
            <View>
              <Text style={s.cardCostLabel}>Avg hotel / night</Text>
              <Text style={s.cardCost}>~₹{selectedLoc.avgHotelCost * 83}</Text>
            </View>
            <View style={s.cardActions}>
              <TouchableOpacity style={s.navBtn} onPress={() => startNav(selectedLoc)}>
                <Text style={s.navBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.guideBtn} onPress={() => setShowGuide(true)}>
                <Text style={s.guideBtnText}>Guide</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Navigation HUD ── */}
      {navRoute && (
        <View style={s.navHUD}>
          <View style={s.navHUDLeft}>
            <View style={[s.navDot, { backgroundColor: '#4CAF50' }]} />
            <View style={s.navStem} />
            <View style={[s.navDot, { backgroundColor: '#1565C0' }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.navFrom}>{userCoords ? 'Your Location' : 'Start'}</Text>
            <Text style={s.navTo}>{navRoute.to.city}</Text>
          </View>
          <TouchableOpacity style={s.navEnd} onPress={() => setNavRoute(null)}>
            <Text style={s.navEndText}>End</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Travel Guide Modal ── */}
      <Modal visible={showGuide} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={s.modalOverlay}>
          <View style={s.guideSheet}>
            <View style={s.guideHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.guideCity}>{selectedLoc?.city}</Text>
              <Text style={s.guideRegion}>{selectedLoc?.region} · {selectedLoc?.country}</Text>

              <Text style={s.guideSection}>About</Text>
              <Text style={s.guideBody}>{selectedLoc?.description}. A destination rich in culture and local experiences.</Text>

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

              <Text style={s.guideSection}>Budget / night</Text>
              <View style={s.budgetRow}>
                {[{ tier: 'Budget', mult: 0.55, c: '#A5D6A7' }, { tier: 'Mid', mult: 1.0, c: '#4CAF50' }, { tier: 'Luxury', mult: 2.8, c: '#2E7D32' }].map(b => (
                  <View key={b.tier} style={[s.budgetTier, { borderColor: b.c }]}>
                    <Text style={[s.budgetTierLabel, { color: b.c }]}>{b.tier}</Text>
                    <Text style={s.budgetTierCost}>₹{Math.round((selectedLoc?.avgHotelCost ?? 40) * b.mult * 83).toLocaleString()}</Text>
                  </View>
                ))}
              </View>

              <View style={s.guideActions}>
                <TouchableOpacity style={s.guideNavBtn} onPress={() => { if (selectedLoc) startNav(selectedLoc); }}>
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

  // Overlay
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginTop: 6, gap: 10 },
  searchPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(241,248,242,0.97)', borderRadius: 50,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.3)', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 10,
  },
  searchPillIcon: { fontSize: 17, color: '#81C784' },
  searchPillInput: { flex: 1, color: '#1B5E20', fontSize: 14, fontWeight: '500' },
  searchClear: { color: '#81C784', fontSize: 16, paddingHorizontal: 4 },
  locBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(241,248,242,0.97)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.3)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 8,
  },
  locBtnText: { fontSize: 22, color: '#2E7D32', fontWeight: '900' },

  // Dropdown
  dropdown: {
    backgroundColor: 'rgba(241,248,242,0.98)',
    marginHorizontal: 14, marginTop: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.25)', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 10,
    maxHeight: 300, overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', padding: 13, gap: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(165,214,167,0.25)',
  },
  dropFlag: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dropFlagText: { color: '#1B5E20', fontSize: 10, fontWeight: '900' },
  dropCity: { color: '#1B5E20', fontSize: 14, fontWeight: '700' },
  dropSub: { color: '#558B2F', fontSize: 11, marginTop: 1 },
  dropCost: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },

  // Filter chips
  filterScroll: { marginTop: 8 },
  filterContent: { paddingHorizontal: 14, paddingBottom: 6, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 50,
    backgroundColor: 'rgba(241,248,242,0.95)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.2)', shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 5,
  },
  chipActive: {
    backgroundColor: '#4CAF50',
    shadowColor: 'rgba(76,175,80,0.5)', shadowRadius: 10, elevation: 8,
  },
  chipText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#FFF' },

  // Nav marker
  navMarker: {
    backgroundColor: '#1565C0', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
  },
  navMarkerText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  // Detail card
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
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  cardCostLabel: { color: '#558B2F', fontSize: 10, fontWeight: '600' },
  cardCost: { color: '#1B5E20', fontSize: 18, fontWeight: '900' },
  cardActions: { flexDirection: 'row', gap: 10 },
  navBtn: {
    backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: 'rgba(76,175,80,0.4)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 5,
  },
  navBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  guideBtn: { backgroundColor: '#C8E6C9', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  guideBtnText: { color: '#1B5E20', fontSize: 13, fontWeight: '800' },

  // Nav HUD
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
  navEnd: { backgroundColor: '#E53935', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  navEndText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  // Guide modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  guideSheet: {
    backgroundColor: '#F1F8F2', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, maxHeight: '88%',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 20,
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
  transportCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#E8F5E9', borderRadius: 16, padding: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  transportIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center' },
  transportMode: { color: '#1B5E20', fontSize: 13, fontWeight: '800' },
  transportDetail: { color: '#2E7D32', fontSize: 12, lineHeight: 17, marginTop: 2 },
  budgetRow: { flexDirection: 'row', gap: 10 },
  budgetTier: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', backgroundColor: '#F1F8F2', borderWidth: 2 },
  budgetTierLabel: { fontSize: 11, fontWeight: '800' },
  budgetTierCost: { color: '#1B5E20', fontSize: 13, fontWeight: '900', marginTop: 4 },
  guideActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  guideNavBtn: {
    flex: 2, backgroundColor: '#4CAF50', borderRadius: 50, paddingVertical: 16, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: 'rgba(76,175,80,0.4)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6,
  },
  guideNavBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  guideCloseBtn: { flex: 1, backgroundColor: '#C8E6C9', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  guideCloseBtnText: { color: '#1B5E20', fontSize: 16, fontWeight: '800' },
});
