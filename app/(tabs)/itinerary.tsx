/**
 * Roamio Itinerary (Liquid Clay v2)
 */
import React, { useState } from 'react';
import {
  Modal, ScrollView, StyleSheet, Text,
  TouchableOpacity, View, Image, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useTripStore } from '../../src/store/tripStore';
import { TRANSPORT_COLORS } from '../../src/constants/tripData';
import { ALL_LOCATIONS } from '../../src/constants/locations';
import { useCurrency } from '../../src/hooks/useCurrency';
import { POPULAR_ROUTES, PopularRoute } from '../../src/constants/popularRoutes';
import { useHistoryStore, TripStatus } from '../../src/store/historyStore';
import type { TripPath, TripNode } from '../../src/types/trip';
import { useSettingsStore } from '../../src/store/settingsStore';
import { MINT, CLAY_CARD_V2, CLAY_BTN_V2, ACCENTS, FONTS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

const MODE_ICON: Record<string, string> = { train: '🚆', flight: '✈️', bus: '🚌', road: '🚕' };
const STATUS_CONFIG: Record<TripStatus, { label: string; color: string; bg: string }> = {
  booked:    { label: 'Booked',    color: '#0284C7', bg: '#E0F2FE' },
  ongoing:   { label: 'Ongoing',   color: '#059669', bg: '#D1FAE5' },
  completed: { label: 'Completed', color: '#16A34A', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
};

function RouteDetailModal({ route, visible, onClose, onBook }: { route: PopularRoute; visible: boolean; onClose: () => void; onBook: () => void; }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { fmtFull } = useCurrency();
  const darkMode = useSettingsStore(s => s.darkMode);
  const card = darkMode ? '#0A1A12' : '#FFFFFF';
  const txt1 = darkMode ? '#F0FDF4' : MINT[900];
  const txt2 = darkMode ? '#6EE7B7' : MINT[700];
  const border = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={md.overlay}>
        <View style={[md.sheet, { backgroundColor: card }]}>
          <TouchableOpacity style={[md.topClose, { backgroundColor: card, borderColor: border }]} onPress={onClose}>
            <Ionicons name="close" size={24} color={txt1} />
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginHorizontal:-24,marginTop:-24,marginBottom:16,height:220,overflow:'hidden'}}>
              {route.image ? <Image source={{ uri: route.image }} style={{width:'100%',height:'100%'}} resizeMode="cover"/> : (
                <View style={{flex:1,backgroundColor:route.color+'33',justifyContent:'center',alignItems:'center'}}><Ionicons name="map" size={60} color={route.color}/></View>
              )}
              <View style={{position:'absolute',bottom:0,left:0,right:0,height:120,backgroundColor:'rgba(0,0,0,0.5)'}} />
              <View style={{position:'absolute',bottom:16,left:24,right:24}}>
                <View style={[md.themeBadge, { backgroundColor: route.color }]}><Text style={md.themeText}>{route.theme}</Text></View>
                <Text style={md.heroTitle}>{route.title}</Text>
              </View>
            </View>

            <View style={[md.heroMeta, { backgroundColor: route.color + '15', borderColor: route.color + '33' }]}>
              <View style={md.metaItem}><Text style={[md.metaVal, { color: txt1 }]}>{route.days}</Text><Text style={[md.metaLabel, { color: txt2 }]}>Days</Text></View>
              <View style={[md.metaDivider, { backgroundColor: border }]} />
              <View style={md.metaItem}><Text style={[md.metaVal, { color: txt1 }]}>{route.cities.length}</Text><Text style={[md.metaLabel, { color: txt2 }]}>Cities</Text></View>
              <View style={[md.metaDivider, { backgroundColor: border }]} />
              <View style={md.metaItem}><Text style={[md.metaVal, { color: txt1 }]}>{fmtFull(route.budget)}</Text><Text style={[md.metaLabel, { color: txt2 }]}>Budget</Text></View>
            </View>

            <Text style={[md.section, { color: txt1 }]}>Highlights</Text>
            <View style={md.hlRow}>
              {route.highlights.map(h => <View key={h} style={[md.hlChip, { borderColor: route.color + '66' }]}><Text style={[md.hlText, { color: route.color }]}>{h}</Text></View>)}
            </View>

            <Text style={[md.section, { color: txt1 }]}>{t('itinerary') || 'Day-by-Day Plan'}</Text>
            {route.itinerary.map(day => (
              <View key={day.day} style={[md.dayCard, { backgroundColor: darkMode ? '#0E291B' : MINT[50], borderColor: border }]}>
                <View style={[md.dayNum, { backgroundColor: route.color }]}><Text style={md.dayNumText}>D{day.day}</Text></View>
                <View style={{ flex: 1, padding: 16 }}>
                  <Text style={[md.dayCity, { color: txt1 }]}>{day.city}</Text>
                  {day.activities.map(a => <View key={a} style={md.actRow}><View style={[md.actDot, { backgroundColor: route.color }]} /><Text style={[md.actText, { color: txt1 }]}>{a}</Text></View>)}
                </View>
              </View>
            ))}

            <View style={md.actions}>
              <TouchableOpacity style={[md.bookBtnSmall, { backgroundColor: route.color }]} onPress={onBook}>
                <Ionicons name="bookmark" size={16} color="#fff" style={{marginRight:6}}/><Text style={md.bookBtnText}>Book Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[md.bookBtnSmall, { backgroundColor: MINT[600] }]} onPress={() => { onClose(); router.push(`/(tabs)/explore?q=${encodeURIComponent(route.cities[route.cities.length-1])}&start=${encodeURIComponent(route.cities[0])}`); }}>
                <Ionicons name="navigate" size={16} color="#fff" style={{marginRight:6}}/><Text style={md.bookBtnText}>Navigate Map</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SwapModal({ path, fromNode, toNode, visible, onClose, onSwap }: any) {
  const { fmtFull } = useCurrency();
  const darkMode = useSettingsStore(s => s.darkMode);
  const card = darkMode ? '#0A1A12' : '#FFFFFF';
  const txt1 = darkMode ? '#F0FDF4' : MINT[900];
  const txt2 = darkMode ? '#6EE7B7' : MINT[700];
  const border = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={md.overlay}>
        <View style={[md.sheet, { backgroundColor: card }]}>
          <Text style={[md.section, { color: txt1, marginTop: 10 }]}>Swap Transport</Text>
          <View style={md.optGrid}>
            {path.options.map((opt: any) => {
              const active = opt.mode === path.selectedMode;
              const color = TRANSPORT_COLORS[opt.mode] ?? MINT[500];
              return (
                <TouchableOpacity key={opt.mode} style={[md.optCard, { borderColor: active ? color : border, backgroundColor: darkMode ? (active ? color+'20' : '#0E291B') : (active ? color+'10' : MINT[50]) }]} onPress={() => onSwap(opt.mode)} activeOpacity={0.8}>
                  <Text style={{ fontSize: 24 }}>{MODE_ICON[opt.mode]}</Text>
                  <Text style={[md.optMode, { color: active ? color : txt2 }]}>{opt.label}</Text>
                  <Text style={[md.optCost, { color: txt1 }]}>{fmtFull(opt.cost)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={[md.bookBtn, { backgroundColor: MINT[600] }]} onPress={onClose}><Text style={md.bookBtnText}>Done</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function ItineraryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const nodes = useTripStore(s => s.nodes);
  const paths = useTripStore(s => s.paths);
  const spentBudget = useTripStore(s => s.spentBudget);
  const globalBudget = useTripStore(s => s.globalBudget);
  const swapTransport = useTripStore(s => s.swapTransport);
  const { fmtFull } = useCurrency();
  const { trips, addTrip } = useHistoryStore();
  const darkMode = useSettingsStore(s => s.darkMode);

  const bg      = darkMode ? '#020F08' : MINT[50];
  const card    = darkMode ? '#0A1A12' : '#FFFFFF';
  const border  = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';
  const primary = darkMode ? '#00F59B' : MINT[500];
  const txt1    = darkMode ? '#F0FDF4' : MINT[900];
  const txt2    = darkMode ? '#6EE7B7' : MINT[700];
  const surf    = darkMode ? '#0E291B' : MINT[100];

  const [tab, setTab] = useState<'routes' | 'popular' | 'history'>('routes');
  const [selectedRoute, setSelectedRoute] = useState<PopularRoute | null>(null);
  const [selectedPath, setSelectedPath] = useState<TripPath | null>(null);

  const totalDays = nodes.reduce((s, n) => s + n.stayNights, 0);
  const budgetPct = Math.min((spentBudget / globalBudget) * 100, 100);
  const isOver = spentBudget > globalBudget;

  const bookRoute = (route: PopularRoute) => {
    addTrip({
      routeId: route.id, title: route.title, cities: route.cities,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + route.days * 86400000).toISOString().split('T')[0],
      status: 'booked', totalSpent: route.budget, members: 1,
    });
    setSelectedRoute(null); setTab('history');
  };

  return (
    <View style={[s.container, { backgroundColor: bg }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
        <View style={[s.tabBar, { backgroundColor: card, borderColor: border }]}>
          {([['routes', 'My Routes'], ['popular', 'Popular'], ['history', 'History']] as const).map(([id, label]) => (
            <TouchableOpacity key={id} style={[s.tabBtn, tab === id && { backgroundColor: txt1 }]} onPress={() => setTab(id)}>
              <Text style={[s.tabBtnText, { color: tab === id ? bg : txt2 }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'routes' && (
          <>
            <View style={s.header}>
              <Text style={[s.heading, { color: txt1 }]}>My Planned Trip</Text>
              <View style={[s.metaBadge, { backgroundColor: primary }]}><Text style={s.metaBadgeText}>{nodes.length} cities · {totalDays}N</Text></View>
            </View>

            {nodes.length === 0 ? (
              <View style={s.emptyState}>
                <Ionicons name="map-outline" size={60} color={txt2} style={{marginBottom:16}} />
                <Text style={[s.emptyTitle, { color: txt1 }]}>No routes drawn yet</Text>
                <Text style={[s.emptyDesc, { color: txt2 }]}>Use the Explore map to drop markers and draw liquid strings!</Text>
                <TouchableOpacity style={[s.emptyBtn, { backgroundColor: primary }]} onPress={() => setTab('popular')}>
                  <Text style={s.emptyBtnText}>Browse Templates</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[s.budgetCard, { backgroundColor: card, borderColor: border }]}>
                  <View style={s.budgetTop}>
                    <View><Text style={[s.budgetLabel, { color: txt2 }]}>Budget Focus</Text><Text style={[s.budgetAmt, { color: txt1 }]}>{fmtFull(globalBudget)}</Text></View>
                    <View style={{ alignItems: 'flex-end' }}><Text style={[s.budgetLabel, { color: txt2 }]}>Estimated</Text><Text style={[s.budgetAmt, isOver && { color: '#EF4444' }, !isOver && { color: txt1 }]}>{fmtFull(spentBudget)}</Text></View>
                  </View>
                  <View style={[s.progressBg, { backgroundColor: surf, borderColor: border }]}><View style={[s.progressFill, { width: `${budgetPct}%` as any, backgroundColor: isOver ? '#EF4444' : primary }]} /></View>
                  <Text style={[s.budgetRemain, { color: txt2 }]}>{isOver ? `Over by ${fmtFull(spentBudget - globalBudget)}` : `${fmtFull(globalBudget - spentBudget)} remaining`}</Text>
                </View>

                {nodes.map((node, i) => {
                  const pathAfter = paths[i];
                  const isLast = i === nodes.length - 1;
                  return (
                    <View key={node.id}>
                      <View style={s.stopRow}>
                        <View style={s.stopLeft}>
                          <View style={[s.stopNumWrap, { backgroundColor: primary }]}><Text style={s.stopNum}>{i + 1}</Text></View>
                          {!isLast && <View style={[s.stopStem, { backgroundColor: border }]} />}
                        </View>
                        <View style={[s.stopBody, { backgroundColor: card, borderColor: border }]}>
                          <View style={s.stopTop}>
                            <View style={{ flex: 1 }}><Text style={[s.stopCity, { color: txt1 }]}>{node.city}</Text><Text style={[s.stopMeta, { color: txt2 }]}>{node.country} · {node.stayNights}N</Text></View>
                            <View style={{ alignItems: 'flex-end' }}><Text style={[s.stopCost, { color: primary }]}>{fmtFull(node.totalStayCost)}</Text><Text style={[s.stopCostLabel, { color: txt2 }]}>stay</Text></View>
                          </View>
                        </View>
                      </View>

                      {pathAfter && !isLast && (
                        <TouchableOpacity style={[s.pathRow, { backgroundColor: surf, borderColor: border }]} onPress={() => setSelectedPath(pathAfter)} activeOpacity={0.8}>
                          <Text style={{ fontSize: 24 }}>{MODE_ICON[pathAfter.selectedMode]}</Text>
                          <View style={{ flex: 1, marginLeft: 12 }}><Text style={[s.pathMode, { color: txt1 }]}>{pathAfter.options.find(o => o.mode === pathAfter.selectedMode)?.label}</Text></View>
                          <View style={{ alignItems: 'flex-end' }}><Text style={[s.pathCost, { color: txt1 }]}>{fmtFull(pathAfter.options.find(o => o.mode === pathAfter.selectedMode)?.cost ?? 0)}</Text><Text style={[s.pathDur, { color: txt2 }]}>{pathAfter.options.find(o => o.mode === pathAfter.selectedMode)?.durationHrs}h</Text></View>
                          <Ionicons name="chevron-forward" size={20} color={txt2} style={{marginLeft: 8}} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}

        {tab === 'popular' && (
          <>
            <Text style={[s.heading, { color: txt1, marginTop: 16, marginBottom: 20 }]}>Premium Inspirations</Text>
            {POPULAR_ROUTES.map(route => (
              <TouchableOpacity key={route.id} style={[s.routeCard, { backgroundColor: card, borderColor: border }]} onPress={() => setSelectedRoute(route)} activeOpacity={0.88}>
                <View style={s.routeImageBox}>
                  {route.image ? <Image source={{ uri: route.image }} style={s.routeImage} resizeMode="cover"/> : <View style={[s.routeImageFallback, { backgroundColor: route.color+'33' }]}><Ionicons name="map" size={40} color={route.color}/></View>}
                  <View style={s.routeImageOverlay} />
                  <View style={[s.routeThemeBadge, { backgroundColor: route.color }]}><Text style={s.routeThemeBadgeText}>{route.theme}</Text></View>
                </View>
                <View style={s.routeBody}>
                  <Text style={[s.routeTitle, { color: txt1 }]}>{route.title}</Text>
                  <Text style={[s.routeTagline, { color: txt2 }]}>{route.tagline}</Text>
                  <View style={s.routeMetaGrid}>
                    <View style={[s.routeMetaPill, { backgroundColor: surf, borderColor: border }]}><Text style={[s.routeMetaVal, { color: txt1 }]}>{route.days}D</Text></View>
                    <View style={[s.routeMetaPill, { backgroundColor: surf, borderColor: border }]}><Text style={[s.routeMetaVal, { color: txt1 }]}>{route.cities.length} Cities</Text></View>
                    <View style={[s.routeMetaPill, { backgroundColor: route.color+'15', borderColor: border }]}><Text style={[s.routeMetaVal, { color: route.color }]}>{fmtFull(route.budget).replace('.0k','k')}</Text></View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {tab === 'history' && (
          <>
            <Text style={[s.heading, { color: txt1, marginTop: 16, marginBottom: 20 }]}>Trip Archives</Text>
            {trips.length === 0 ? (
              <View style={s.emptyState}><Ionicons name="documents-outline" size={60} color={txt2} style={{marginBottom:16}}/><Text style={[s.emptyTitle, { color: txt1 }]}>No Archives</Text></View>
            ) : trips.map(trip => {
              const cfg = STATUS_CONFIG[trip.status];
              return (
                <View key={trip.id} style={[s.historyCard, { backgroundColor: card, borderColor: border }]}>
                  <View style={s.historyTop}>
                    <View style={{ flex: 1 }}><Text style={[s.historyTitle, { color: txt1 }]}>{trip.title}</Text><Text style={[s.historyDates, { color: txt2 }]}>{trip.startDate} → {trip.endDate}</Text></View>
                    <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}><Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text></View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                    <Ionicons name="card" size={16} color={txt2} style={{marginRight: 6}}/>
                    <Text style={[s.historySpent, { color: txt2 }]}>₹{trip.totalSpent.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {selectedRoute && <RouteDetailModal route={selectedRoute} visible={!!selectedRoute} onClose={() => setSelectedRoute(null)} onBook={() => bookRoute(selectedRoute)} />}
      {selectedPath && <SwapModal path={selectedPath} fromNode={nodes.find(n => n.id === selectedPath.fromNodeId)} toNode={nodes.find(n => n.id === selectedPath.toNodeId)} visible={!!selectedPath} onClose={() => setSelectedPath(null)} onSwap={(mode: string) => { swapTransport(selectedPath.id, mode as any); setSelectedPath(prev => prev ? { ...prev, selectedMode: mode as any } : null); }} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  tabBar: { ...CLAY_CARD_V2, flexDirection: 'row', marginHorizontal: 16, marginTop: 8, marginBottom: 12, borderRadius: 30, padding: 6, borderWidth: 1.5 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  tabBtnText: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 20 },
  heading: { fontSize: 28, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: -0.5 },
  metaBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  metaBadgeText: { color: '#FFF', fontSize: 13, fontFamily: FONTS.display, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontFamily: FONTS.display, fontWeight: '900', marginBottom: 8 },
  emptyDesc: { fontSize: 14, fontFamily: FONTS.body, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { ...CLAY_BTN_V2, borderRadius: 24, paddingHorizontal: 32, paddingVertical: 16 },
  emptyBtnText: { color: '#FFF', fontSize: 16, fontFamily: FONTS.display, fontWeight: '900' },
  budgetCard: { ...CLAY_CARD_V2, borderRadius: 36, padding: 22, marginBottom: 24, borderWidth: 1.5 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  budgetLabel: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  budgetAmt: { fontSize: 26, fontFamily: FONTS.display, fontWeight: '900' },
  progressBg: { height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 10, borderWidth: 1.5 },
  progressFill: { height: '100%', borderRadius: 8 },
  budgetRemain: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  stopRow: { flexDirection: 'row', marginBottom: 0 },
  stopLeft: { width: 36, alignItems: 'center' },
  stopNumWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stopNum: { color: '#FFF', fontSize: 15, fontFamily: FONTS.display, fontWeight: '900' },
  stopStem: { width: 2, flex: 1, marginTop: 4, minHeight: 16, borderRadius: 1 },
  stopBody: { ...CLAY_CARD_V2, flex: 1, borderRadius: 28, padding: 18, marginLeft: 16, marginBottom: 0, borderWidth: 1.5 },
  stopTop: { flexDirection: 'row', alignItems: 'flex-start' },
  stopCity: { fontSize: 20, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: -0.3 },
  stopMeta: { fontSize: 13, fontFamily: FONTS.body, marginTop: 4 },
  stopCost: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  stopCostLabel: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800' },
  pathRow: { ...CLAY_CARD_V2, flexDirection: 'row', alignItems: 'center', marginLeft: 52, marginVertical: 10, borderRadius: 24, padding: 16, borderWidth: 1.5 },
  pathMode: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '900' },
  pathCost: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900' },
  pathDur: { fontSize: 12, fontFamily: FONTS.display, fontWeight: '800', marginTop: 2 },
  routeCard: { ...CLAY_CARD_V2, borderRadius: 36, marginBottom: 20, borderWidth: 1.5, overflow: 'hidden' },
  routeImageBox: { width: '100%', height: 160, position: 'relative' },
  routeImage: { width: '100%', height: '100%' },
  routeImageFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  routeImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.4)' },
  routeThemeBadge: { position: 'absolute', bottom: 14, left: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  routeThemeBadgeText: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  routeBody: { padding: 20 },
  routeTitle: { fontSize: 20, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: -0.3 },
  routeTagline: { fontSize: 13, fontFamily: FONTS.body, marginTop: 4, marginBottom: 16 },
  routeMetaGrid: { flexDirection: 'row', gap: 10 },
  routeMetaPill: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  routeMetaVal: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '800' },
  historyCard: { ...CLAY_CARD_V2, borderRadius: 28, padding: 20, marginBottom: 14, borderWidth: 1.5 },
  historyTop: { flexDirection: 'row', alignItems: 'flex-start' },
  historyTitle: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  historyDates: { fontSize: 12, fontFamily: FONTS.body, marginTop: 4 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '900' },
  historySpent: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800' },
});

const md = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: Dimensions.get('window').height * 0.9, padding: 24 },
  topClose: { position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 1.5 },
  heroTitle: { fontSize: 28, fontFamily: FONTS.display, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  themeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  themeText: { color: '#FFF', fontSize: 11, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1 },
  heroMeta: { flexDirection: 'row', borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1.5 },
  metaItem: { flex: 1, alignItems: 'center' },
  metaVal: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  metaLabel: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
  metaDivider: { width: 1.5, height: '100%' },
  section: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900', marginBottom: 14 },
  hlRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  hlChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, backgroundColor: 'rgba(0,0,0,0.05)' },
  hlText: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  dayCard: { borderRadius: 24, marginBottom: 16, borderWidth: 1.5, overflow: 'hidden' },
  dayNum: { paddingVertical: 10, alignItems: 'center' },
  dayNumText: { color: '#FFF', fontSize: 14, fontFamily: FONTS.display, fontWeight: '900' },
  dayCity: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900', marginBottom: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  actDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  actText: { fontSize: 14, fontFamily: FONTS.body },
  actions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  bookBtnSmall: { ...CLAY_BTN_V2, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 24 },
  bookBtnText: { color: '#FFF', fontSize: 15, fontFamily: FONTS.display, fontWeight: '900' },
  optGrid: { gap: 12, marginBottom: 24 },
  optCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 2 },
  optMode: { flex: 1, fontSize: 16, fontFamily: FONTS.display, fontWeight: '900', marginLeft: 16 },
  optCost: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  bookBtn: { ...CLAY_BTN_V2, padding: 20, borderRadius: 24, alignItems: 'center' },
});
