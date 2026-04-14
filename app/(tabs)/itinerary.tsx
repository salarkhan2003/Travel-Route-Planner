import React, { useState } from 'react';
import {
  Modal, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTripStore } from '../../src/store/tripStore';
import { TRANSPORT_COLORS } from '../../src/constants/tripData';
import { ALL_LOCATIONS } from '../../src/constants/locations';
import { useCurrency } from '../../src/hooks/useCurrency';
import { POPULAR_ROUTES, PopularRoute } from '../../src/constants/popularRoutes';
import { useHistoryStore, TripStatus } from '../../src/store/historyStore';
import type { TripPath, TripNode } from '../../src/types/trip';

const MODE_ICON: Record<string, string> = {
  train: '🚆', flight: '✈', bus: '🚌', road: '🚗',
};

const STATUS_CONFIG: Record<TripStatus, { label: string; color: string; bg: string }> = {
  booked:    { label: 'Booked',    color: '#1565C0', bg: '#E3F2FD' },
  ongoing:   { label: 'Ongoing',   color: '#2E7D32', bg: '#E8F5E9' },
  completed: { label: 'Completed', color: '#558B2F', bg: '#F1F8E9' },
  cancelled: { label: 'Cancelled', color: '#B71C1C', bg: '#FFEBEE' },
};

// ─── Route Detail Modal ───────────────────────────────────────────────────────
function RouteDetailModal({
  route, visible, onClose, onBook,
}: {
  route: PopularRoute;
  visible: boolean;
  onClose: () => void;
  onBook: () => void;
}) {
  const { fmtFull } = useCurrency();
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={md.overlay}>
        <View style={md.sheet}>
          <View style={md.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Hero */}
            <View style={[md.hero, { backgroundColor: route.color + '22', borderColor: route.color + '44' }]}>
              <View style={[md.themeBadge, { backgroundColor: route.color }]}>
                <Text style={md.themeText}>{route.theme}</Text>
              </View>
              <Text style={md.heroTitle}>{route.title}</Text>
              <Text style={md.heroTagline}>{route.tagline}</Text>
              <View style={md.heroMeta}>
                <View style={md.metaItem}>
                  <Text style={md.metaVal}>{route.days}</Text>
                  <Text style={md.metaLabel}>Days</Text>
                </View>
                <View style={md.metaDivider} />
                <View style={md.metaItem}>
                  <Text style={md.metaVal}>{route.cities.length}</Text>
                  <Text style={md.metaLabel}>Cities</Text>
                </View>
                <View style={md.metaDivider} />
                <View style={md.metaItem}>
                  <Text style={md.metaVal}>{fmtFull(route.budget)}</Text>
                  <Text style={md.metaLabel}>Budget</Text>
                </View>
              </View>
            </View>

            {/* Highlights */}
            <Text style={md.section}>Highlights</Text>
            <View style={md.hlRow}>
              {route.highlights.map((h) => (
                <View key={h} style={[md.hlChip, { borderColor: route.color + '66' }]}>
                  <Text style={[md.hlText, { color: route.color }]}>{h}</Text>
                </View>
              ))}
            </View>

            {/* Day-by-day itinerary */}
            <Text style={md.section}>Day-by-Day Plan</Text>
            {route.itinerary.map((day) => (
              <View key={day.day} style={md.dayCard}>
                <View style={[md.dayNum, { backgroundColor: route.color }]}>
                  <Text style={md.dayNumText}>D{day.day}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={md.dayHeader}>
                    <Text style={md.dayCity}>{day.city}</Text>
                    {day.transport && (
                      <View style={md.transportBadge}>
                        <Text style={md.transportText}>{day.transport}</Text>
                      </View>
                    )}
                  </View>
                  {day.activities.map((a) => (
                    <View key={a} style={md.actRow}>
                      <View style={[md.actDot, { backgroundColor: route.color }]} />
                      <Text style={md.actText}>{a}</Text>
                    </View>
                  ))}
                  {day.stay ? (
                    <Text style={md.stayText}>🏨 {day.stay}</Text>
                  ) : null}
                </View>
              </View>
            ))}

            {/* Cities */}
            <Text style={md.section}>Cities Covered</Text>
            <View style={md.citiesRow}>
              {route.cities.map((c, i) => (
                <React.Fragment key={c}>
                  <View style={[md.cityChip, { borderColor: route.color }]}>
                    <Text style={[md.cityText, { color: route.color }]}>{c}</Text>
                  </View>
                  {i < route.cities.length - 1 && (
                    <Text style={[md.cityArrow, { color: route.color }]}>→</Text>
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Actions */}
            <View style={md.actions}>
              <TouchableOpacity style={[md.bookBtn, { backgroundColor: route.color }]} onPress={onBook}>
                <Text style={md.bookBtnText}>Book This Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={md.closeBtn} onPress={onClose}>
                <Text style={md.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Transport swap modal ─────────────────────────────────────────────────────
function SwapModal({
  path, fromNode, toNode, visible, onClose, onSwap,
}: {
  path: TripPath; fromNode?: TripNode; toNode?: TripNode;
  visible: boolean; onClose: () => void; onSwap: (mode: string) => void;
}) {
  const { fmtFull } = useCurrency();
  const sel = path.options.find(o => o.mode === path.selectedMode);
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={md.overlay}>
        <View style={md.sheet}>
          <View style={md.handle} />
          <View style={md.routeHeader}>
            <View style={{ flex: 1 }}>
              <Text style={md.heroTitle}>{fromNode?.city}</Text>
              <Text style={md.heroTagline}>{fromNode?.country}</Text>
            </View>
            <Text style={{ fontSize: 20, color: '#A5D6A7', marginHorizontal: 8 }}>→</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={md.heroTitle}>{toNode?.city}</Text>
              <Text style={md.heroTagline}>{toNode?.country}</Text>
            </View>
          </View>
          {sel && (
            <View style={md.summaryCard}>
              <View style={md.heroMeta}>
                <View style={md.metaItem}>
                  <Text style={md.metaVal}>{sel.durationHrs}h</Text>
                  <Text style={md.metaLabel}>Duration</Text>
                </View>
                <View style={md.metaDivider} />
                <View style={md.metaItem}>
                  <Text style={md.metaVal}>{fmtFull(sel.cost)}</Text>
                  <Text style={md.metaLabel}>Cost</Text>
                </View>
                <View style={md.metaDivider} />
                <View style={md.metaItem}>
                  <Text style={md.metaVal}>{sel.label}</Text>
                  <Text style={md.metaLabel}>Service</Text>
                </View>
              </View>
            </View>
          )}
          <Text style={md.section}>Choose Transport</Text>
          <View style={md.optGrid}>
            {path.options.map(opt => {
              const active = opt.mode === path.selectedMode;
              const color = TRANSPORT_COLORS[opt.mode] ?? '#4CAF50';
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[md.optCard, active && { borderColor: color, borderWidth: 2.5 }]}
                  onPress={() => onSwap(opt.mode)}
                  activeOpacity={0.75}
                >
                  {active && <View style={[md.optDot, { backgroundColor: color }]} />}
                  <Text style={md.optIcon}>{MODE_ICON[opt.mode]}</Text>
                  <Text style={[md.optMode, { color: active ? color : '#1B3A1F' }]}>
                    {opt.mode.charAt(0).toUpperCase() + opt.mode.slice(1)}
                  </Text>
                  <Text style={md.optLabel}>{opt.label}</Text>
                  <Text style={md.optCost}>{fmtFull(opt.cost)}</Text>
                  <Text style={md.optDur}>{opt.durationHrs}h</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={[md.bookBtn, { backgroundColor: '#2E7D32' }]} onPress={onClose}>
            <Text style={md.bookBtnText}>Done</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ItineraryScreen() {
  const nodes = useTripStore(s => s.nodes);
  const paths = useTripStore(s => s.paths);
  const spentBudget = useTripStore(s => s.spentBudget);
  const globalBudget = useTripStore(s => s.globalBudget);
  const swapTransport = useTripStore(s => s.swapTransport);
  const { fmtFull } = useCurrency();
  const { trips, addTrip } = useHistoryStore();

  const [tab, setTab] = useState<'routes' | 'popular' | 'history'>('routes');
  const [selectedRoute, setSelectedRoute] = useState<PopularRoute | null>(null);
  const [selectedPath, setSelectedPath] = useState<TripPath | null>(null);

  const totalDays = nodes.reduce((s, n) => s + n.stayNights, 0);
  const budgetPct = Math.min((spentBudget / globalBudget) * 100, 100);
  const isOver = spentBudget > globalBudget;

  const bookRoute = (route: PopularRoute) => {
    addTrip({
      routeId: route.id,
      title: route.title,
      cities: route.cities,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + route.days * 86400000).toISOString().split('T')[0],
      status: 'booked',
      totalSpent: route.budget,
      members: 1,
    });
    setSelectedRoute(null);
    setTab('history');
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Tab bar */}
      <View style={s.tabBar}>
        {([['routes', 'My Routes'], ['popular', 'Popular'], ['history', 'History']] as const).map(([id, label]) => (
          <TouchableOpacity
            key={id}
            style={[s.tabBtn, tab === id && s.tabBtnActive]}
            onPress={() => setTab(id)}
          >
            <Text style={[s.tabBtnText, tab === id && s.tabBtnTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── MY ROUTES ── */}
        {tab === 'routes' && (
          <>
            <View style={s.header}>
              <Text style={s.heading}>My Routes</Text>
              <View style={s.metaBadge}>
                <Text style={s.metaBadgeText}>{nodes.length} cities · {totalDays}N</Text>
              </View>
            </View>

            {nodes.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🗺️</Text>
                <Text style={s.emptyTitle}>No routes yet</Text>
                <Text style={s.emptyDesc}>Tap a city on the map to start building your trip, or pick a Popular route below.</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={() => setTab('popular')}>
                  <Text style={s.emptyBtnText}>Browse Popular Routes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Budget card */}
                <View style={s.budgetCard}>
                  <View style={s.budgetTop}>
                    <View>
                      <Text style={s.budgetLabel}>Budget</Text>
                      <Text style={s.budgetAmt}>{fmtFull(globalBudget)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.budgetLabel}>Spent</Text>
                      <Text style={[s.budgetAmt, isOver && { color: '#E53935' }]}>{fmtFull(spentBudget)}</Text>
                    </View>
                  </View>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, {
                      width: `${budgetPct}%` as any,
                      backgroundColor: isOver ? '#E53935' : budgetPct > 75 ? '#FB8C00' : '#43A047',
                    }]} />
                  </View>
                  <Text style={s.budgetRemain}>
                    {isOver ? `Over by ${fmtFull(spentBudget - globalBudget)}` : `${fmtFull(globalBudget - spentBudget)} remaining`}
                  </Text>
                </View>

                {/* Route timeline */}
                {nodes.map((node, i) => {
                  const loc = ALL_LOCATIONS.find(l => l.city === node.city);
                  const pathAfter = paths[i];
                  const isLast = i === nodes.length - 1;
                  return (
                    <View key={node.id}>
                      <View style={s.stopRow}>
                        <View style={s.stopLeft}>
                          <View style={s.stopNumWrap}>
                            <Text style={s.stopNum}>{i + 1}</Text>
                          </View>
                          {!isLast && <View style={s.stopStem} />}
                        </View>
                        <View style={s.stopBody}>
                          <View style={s.stopTop}>
                            <View style={{ flex: 1 }}>
                              <Text style={s.stopCity}>{node.city}</Text>
                              <Text style={s.stopMeta}>{node.country} · {node.stayNights}N</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={s.stopCost}>{fmtFull(node.totalStayCost)}</Text>
                              <Text style={s.stopCostLabel}>stay</Text>
                            </View>
                          </View>
                          {loc?.description && <Text style={s.stopDesc} numberOfLines={2}>{loc.description}</Text>}
                          {loc && (
                            <View style={s.tagsWrap}>
                              {loc.highlights.slice(0, 3).map(h => (
                                <View key={h} style={s.tag}><Text style={s.tagText}>{h}</Text></View>
                              ))}
                              {loc.highlights.length > 3 && (
                                <View style={[s.tag, s.tagMore]}>
                                  <Text style={s.tagMoreText}>+{loc.highlights.length - 3}</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      </View>

                      {pathAfter && !isLast && (
                        <TouchableOpacity style={s.pathRow} onPress={() => setSelectedPath(pathAfter)} activeOpacity={0.7}>
                          <View style={[s.pathIconWrap, { backgroundColor: TRANSPORT_COLORS[pathAfter.selectedMode] ?? '#4CAF50' }]}>
                            <Text style={s.pathIconText}>{MODE_ICON[pathAfter.selectedMode]}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.pathMode}>{pathAfter.selectedMode.charAt(0).toUpperCase() + pathAfter.selectedMode.slice(1)}</Text>
                            <Text style={s.pathLabel}>{pathAfter.options.find(o => o.mode === pathAfter.selectedMode)?.label}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.pathCost}>{fmtFull(pathAfter.options.find(o => o.mode === pathAfter.selectedMode)?.cost ?? 0)}</Text>
                            <Text style={s.pathDur}>{pathAfter.options.find(o => o.mode === pathAfter.selectedMode)?.durationHrs}h</Text>
                          </View>
                          <Text style={s.pathChevron}>›</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}

                {/* Summary */}
                <View style={s.summaryCard}>
                  <Text style={s.summaryTitle}>Trip Summary</Text>
                  {[
                    { label: 'Accommodation', val: fmtFull(nodes.reduce((a, n) => a + n.totalStayCost, 0)) },
                    { label: 'Transport', val: fmtFull(paths.reduce((a, p) => a + (p.options.find(o => o.mode === p.selectedMode)?.cost ?? 0), 0)) },
                    { label: 'Total', val: fmtFull(spentBudget), hl: true },
                  ].map(item => (
                    <View key={item.label} style={[s.summaryRow, item.hl && s.summaryRowHL]}>
                      <Text style={[s.summaryLabel, item.hl && s.summaryLabelHL]}>{item.label}</Text>
                      <Text style={[s.summaryVal, item.hl && s.summaryValHL]}>{item.val}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* ── POPULAR ROUTES ── */}
        {tab === 'popular' && (
          <>
            <Text style={s.heading}>Popular Routes</Text>
            <Text style={s.subHeading}>Curated trips across India & Singapore</Text>
            {POPULAR_ROUTES.map(route => (
              <TouchableOpacity
                key={route.id}
                style={s.routeCard}
                onPress={() => setSelectedRoute(route)}
                activeOpacity={0.8}
              >
                <View style={[s.routeAccent, { backgroundColor: route.color }]} />
                <View style={s.routeBody}>
                  <View style={s.routeTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.routeTitle}>{route.title}</Text>
                      <Text style={s.routeTagline}>{route.tagline}</Text>
                    </View>
                    <View style={[s.routeTheme, { backgroundColor: route.color + '22', borderColor: route.color + '55' }]}>
                      <Text style={[s.routeThemeText, { color: route.color }]}>{route.theme}</Text>
                    </View>
                  </View>
                  <View style={s.routeMeta}>
                    <View style={s.routeMetaItem}>
                      <Text style={s.routeMetaVal}>{route.days}D</Text>
                      <Text style={s.routeMetaLabel}>Duration</Text>
                    </View>
                    <View style={s.routeMetaItem}>
                      <Text style={s.routeMetaVal}>{route.cities.length}</Text>
                      <Text style={s.routeMetaLabel}>Cities</Text>
                    </View>
                    <View style={s.routeMetaItem}>
                      <Text style={[s.routeMetaVal, { color: route.color }]}>₹{(route.budget / 1000).toFixed(0)}k</Text>
                      <Text style={s.routeMetaLabel}>Budget</Text>
                    </View>
                  </View>
                  <View style={s.routeCities}>
                    {route.cities.map((c, i) => (
                      <React.Fragment key={c}>
                        <Text style={s.routeCityText}>{c}</Text>
                        {i < route.cities.length - 1 && <Text style={[s.routeCityArrow, { color: route.color }]}>→</Text>}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
                <Text style={[s.routeChevron, { color: route.color }]}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <>
            <Text style={s.heading}>Trip History</Text>
            {trips.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📋</Text>
                <Text style={s.emptyTitle}>No trips yet</Text>
                <Text style={s.emptyDesc}>Book a popular route or plan your own trip to see it here.</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={() => setTab('popular')}>
                  <Text style={s.emptyBtnText}>Browse Popular Routes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              trips.map(trip => {
                const cfg = STATUS_CONFIG[trip.status];
                return (
                  <View key={trip.id} style={s.historyCard}>
                    <View style={s.historyTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.historyTitle}>{trip.title}</Text>
                        <Text style={s.historyDates}>{trip.startDate} → {trip.endDate}</Text>
                      </View>
                      <View style={[s.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '55' }]}>
                        <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    <View style={s.historyCities}>
                      {trip.cities.map((c, i) => (
                        <React.Fragment key={c}>
                          <Text style={s.historyCityText}>{c}</Text>
                          {i < trip.cities.length - 1 && <Text style={s.historyCityArrow}>→</Text>}
                        </React.Fragment>
                      ))}
                    </View>
                    <View style={s.historyFooter}>
                      <Text style={s.historySpent}>₹{trip.totalSpent.toLocaleString()} · {trip.members} member{trip.members > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Route detail modal */}
      {selectedRoute && (
        <RouteDetailModal
          route={selectedRoute}
          visible={!!selectedRoute}
          onClose={() => setSelectedRoute(null)}
          onBook={() => bookRoute(selectedRoute)}
        />
      )}

      {/* Swap transport modal */}
      {selectedPath && (
        <SwapModal
          path={selectedPath}
          fromNode={nodes.find(n => n.id === selectedPath.fromNodeId)}
          toNode={nodes.find(n => n.id === selectedPath.toNodeId)}
          visible={!!selectedPath}
          onClose={() => setSelectedPath(null)}
          onSwap={(mode) => {
            swapTransport(selectedPath.id, mode as any);
            setSelectedPath(prev => prev ? { ...prev, selectedMode: mode as any } : null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F0' },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },

  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    backgroundColor: '#E8F5E9', borderRadius: 16, padding: 4,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(76,175,80,0.2)', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: 'rgba(76,175,80,0.2)', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 3,
  },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: '#81C784' },
  tabBtnTextActive: { color: '#1B5E20', fontWeight: '800' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 14 },
  heading: { fontSize: 24, fontWeight: '800', color: '#1B3A1F', letterSpacing: -0.5, marginTop: 16, marginBottom: 4 },
  subHeading: { fontSize: 13, color: '#558B2F', marginBottom: 16 },
  metaBadge: { backgroundColor: '#C8E6C9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  metaBadgeText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1B3A1F', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#558B2F', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtn: {
    backgroundColor: '#4CAF50', borderRadius: 50, paddingHorizontal: 24, paddingVertical: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
  },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // Budget card
  budgetCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 20,
    shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: '#E8F5E9',
  },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  budgetLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 2 },
  budgetAmt: { fontSize: 20, fontWeight: '800', color: '#1B3A1F' },
  progressBg: { height: 6, backgroundColor: '#E8F5E9', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  budgetRemain: { fontSize: 12, color: '#558B2F', fontWeight: '600' },

  // Stop card
  stopRow: { flexDirection: 'row', marginBottom: 0 },
  stopLeft: { width: 36, alignItems: 'center' },
  stopNumWrap: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#2E7D32',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(46,125,50,0.3)', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  stopNum: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  stopStem: { width: 2, flex: 1, backgroundColor: '#C8E6C9', marginTop: 4, minHeight: 16 },
  stopBody: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14,
    marginLeft: 10, marginBottom: 0,
    shadowColor: 'rgba(0,0,0,0.05)', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: '#F0F4F0',
  },
  stopTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  stopCity: { fontSize: 17, fontWeight: '800', color: '#1B3A1F', letterSpacing: -0.3 },
  stopMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  stopCost: { fontSize: 16, fontWeight: '800', color: '#2E7D32' },
  stopCostLabel: { fontSize: 10, color: '#888', marginTop: 1 },
  stopDesc: { fontSize: 12, color: '#666', lineHeight: 17, marginBottom: 10 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#C8E6C9' },
  tagText: { color: '#2E7D32', fontSize: 11, fontWeight: '600' },
  tagMore: { backgroundColor: '#C8E6C9' },
  tagMoreText: { color: '#1B5E20', fontSize: 11, fontWeight: '700' },

  // Path row
  pathRow: {
    flexDirection: 'row', alignItems: 'center',
    marginLeft: 36, marginVertical: 6,
    backgroundColor: '#FFF', borderRadius: 14, padding: 12,
    shadowColor: 'rgba(0,0,0,0.04)', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F4F0', gap: 10,
  },
  pathIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pathIconText: { fontSize: 16 },
  pathMode: { fontSize: 13, fontWeight: '700', color: '#1B3A1F' },
  pathLabel: { fontSize: 11, color: '#888', marginTop: 1 },
  pathCost: { fontSize: 14, fontWeight: '800', color: '#2E7D32' },
  pathDur: { fontSize: 11, color: '#888', marginTop: 1 },
  pathChevron: { fontSize: 20, color: '#C8E6C9' },

  // Summary
  summaryCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginTop: 12,
    shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: '#E8F5E9',
  },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: '#1B3A1F', marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: '#F9FBF9', borderRadius: 12, marginBottom: 6,
  },
  summaryRowHL: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#C8E6C9' },
  summaryLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  summaryLabelHL: { color: '#1B5E20', fontWeight: '700' },
  summaryVal: { fontSize: 13, fontWeight: '700', color: '#1B3A1F' },
  summaryValHL: { fontSize: 15, fontWeight: '800', color: '#2E7D32' },

  // Popular route card
  routeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 20, marginBottom: 12,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: '#F0F4F0',
  },
  routeAccent: { width: 5, alignSelf: 'stretch' },
  routeBody: { flex: 1, padding: 14 },
  routeTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  routeTitle: { fontSize: 16, fontWeight: '800', color: '#1B3A1F', letterSpacing: -0.3 },
  routeTagline: { fontSize: 12, color: '#888', marginTop: 2 },
  routeTheme: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  routeThemeText: { fontSize: 10, fontWeight: '800' },
  routeMeta: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  routeMetaItem: { alignItems: 'center' },
  routeMetaVal: { fontSize: 15, fontWeight: '800', color: '#1B3A1F' },
  routeMetaLabel: { fontSize: 10, color: '#888', marginTop: 1 },
  routeCities: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  routeCityText: { fontSize: 12, color: '#558B2F', fontWeight: '600' },
  routeCityArrow: { fontSize: 12, fontWeight: '700' },
  routeChevron: { fontSize: 24, paddingRight: 14, fontWeight: '300' },

  // History card
  historyCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 10,
    shadowColor: 'rgba(0,0,0,0.05)', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: '#F0F4F0',
  },
  historyTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  historyTitle: { fontSize: 16, fontWeight: '800', color: '#1B3A1F' },
  historyDates: { fontSize: 11, color: '#888', marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '800' },
  historyCities: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  historyCityText: { fontSize: 12, color: '#558B2F', fontWeight: '600' },
  historyCityArrow: { fontSize: 12, color: '#A5D6A7' },
  historyFooter: {},
  historySpent: { fontSize: 12, color: '#888' },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const md = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#F4F6F0', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '92%',
    shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 20,
  },
  handle: { width: 36, height: 4, backgroundColor: '#C8E6C9', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  hero: { borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1.5 },
  themeBadge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  themeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#1B3A1F', letterSpacing: -0.5 },
  heroTagline: { fontSize: 13, color: '#558B2F', marginTop: 4, marginBottom: 12 },
  heroMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flex: 1, alignItems: 'center' },
  metaVal: { fontSize: 16, fontWeight: '800', color: '#1B3A1F' },
  metaLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  metaDivider: { width: 1, height: 28, backgroundColor: 'rgba(0,0,0,0.08)' },
  section: { fontSize: 14, fontWeight: '800', color: '#1B3A1F', marginTop: 16, marginBottom: 10 },
  hlRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hlChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1.5, backgroundColor: '#FFF' },
  hlText: { fontSize: 12, fontWeight: '700' },
  dayCard: {
    flexDirection: 'row', gap: 12, marginBottom: 12,
    backgroundColor: '#FFF', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#F0F4F0',
  },
  dayNum: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dayNumText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  dayCity: { fontSize: 15, fontWeight: '800', color: '#1B3A1F' },
  transportBadge: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  transportText: { color: '#2E7D32', fontSize: 10, fontWeight: '700' },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  actDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  actText: { fontSize: 12, color: '#444', flex: 1 },
  stayText: { fontSize: 11, color: '#888', marginTop: 4 },
  citiesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  cityChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, backgroundColor: '#FFF' },
  cityText: { fontSize: 13, fontWeight: '700' },
  cityArrow: { fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  bookBtn: {
    flex: 2, borderRadius: 50, paddingVertical: 16, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: 'rgba(0,0,0,0.15)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 6,
  },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  closeBtn: { flex: 1, backgroundColor: '#E8F5E9', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#C8E6C9' },
  closeBtnText: { color: '#1B5E20', fontSize: 16, fontWeight: '800' },
  routeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E8F5E9' },
  optGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  optCard: {
    width: '47%', backgroundColor: '#FFF', borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#E8F5E9',
    shadowColor: 'rgba(0,0,0,0.04)', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 2, position: 'relative',
  },
  optDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  optIcon: { fontSize: 28, marginBottom: 6 },
  optMode: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  optLabel: { fontSize: 10, color: '#888', marginBottom: 6, textAlign: 'center' },
  optCost: { fontSize: 16, fontWeight: '800', color: '#1B3A1F' },
  optDur: { fontSize: 11, color: '#888', marginTop: 2 },
});
