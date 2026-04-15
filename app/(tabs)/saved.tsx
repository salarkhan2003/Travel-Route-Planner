import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_LOCATIONS } from '../../src/constants/locations';
import { useSavedStore } from '../../src/store/savedStore';
import { useCurrency } from '../../src/hooks/useCurrency';
import { NC } from '../../src/constants/theme';

const FILTERS = ['All', 'India', 'Singapore', 'Spiritual', 'Beach', 'Heritage', 'Food'];

export default function SavedScreen() {
  const { savedIds, toggle, isSaved } = useSavedStore();
  const { fmtFull } = useCurrency();
  const [filter, setFilter] = useState('All');

  const savedLocations = ALL_LOCATIONS.filter(l => savedIds.includes(l.id));
  const filtered = savedLocations.filter(l => {
    if (filter === 'All') return true;
    if (filter === 'India') return l.country === 'India';
    if (filter === 'Singapore') return l.country === 'Singapore';
    return l.tags.includes(filter.toLowerCase());
  });

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.heading}>Saved Places</Text>
            <Text style={s.sub}>{savedIds.length} destinations saved</Text>
          </View>
          <View style={s.countBadge}>
            <Text style={s.countText}>{savedIds.length}</Text>
          </View>
        </View>

        {savedIds.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <Text style={s.emptyIconText}>♡</Text>
            </View>
            <Text style={s.emptyTitle}>Nothing saved yet</Text>
            <Text style={s.emptyDesc}>Tap the heart on any city in the Explore tab to save it here.</Text>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[s.chip, filter === f && s.chipOn]}>
                  <Text style={[s.chipText, filter === f && s.chipTextOn]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filtered.length === 0 ? (
              <View style={s.emptyFilter}>
                <Text style={s.emptyFilterText}>No saved places in "{filter}"</Text>
              </View>
            ) : (
              filtered.map(loc => (
                <View key={loc.id} style={s.card}>
                  <View style={[s.accentBar, { backgroundColor: loc.country === 'Singapore' ? NC.tertiary : NC.primary }]} />
                  <View style={s.cardInner}>
                    <View style={s.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.cardCity}>{loc.city}</Text>
                        <Text style={s.cardRegion}>{loc.region} · {loc.country}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggle(loc.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <View style={[s.heartWrap, isSaved(loc.id) && s.heartWrapActive]}>
                          <Text style={[s.heartIcon, isSaved(loc.id) && s.heartIconActive]}>
                            {isSaved(loc.id) ? '♥' : '♡'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <Text style={s.cardDesc} numberOfLines={2}>{loc.description}</Text>
                    <View style={s.tagsWrap}>
                      {loc.highlights.slice(0, 3).map(h => (
                        <View key={h} style={s.tag}><Text style={s.tagText}>{h}</Text></View>
                      ))}
                      {loc.highlights.length > 3 && (
                        <View style={s.tagMore}><Text style={s.tagMoreText}>+{loc.highlights.length - 3}</Text></View>
                      )}
                    </View>
                    <View style={s.cardFooter}>
                      <Text style={s.cardCost}>{fmtFull(loc.avgHotelCost * 83)}/night</Text>
                      <View style={s.tagsInline}>
                        {loc.tags.slice(0, 2).map(t => (
                          <View key={t} style={s.tagSmall}><Text style={s.tagSmallText}>{t}</Text></View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 20 },
  heading: { fontSize: 26, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 2, fontWeight: '600' },
  countBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: NC.primaryFixed, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4 },
  countText: { color: NC.onPrimaryFixed, fontSize: 16, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: NC.primaryFixed, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 6 },
  emptyIconText: { fontSize: 36, color: NC.primary },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: NC.onSurface, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: NC.onSurfaceVariant, textAlign: 'center', lineHeight: 21 },
  filterRow: { marginBottom: 18 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: NC.surfaceLowest, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 3 },
  chipOn: { backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.4)', shadowColor: NC.shadowButton, elevation: 6 },
  chipText: { color: NC.onSurfaceVariant, fontSize: 12, fontWeight: '700' },
  chipTextOn: { color: '#fff', fontWeight: '800' },
  emptyFilter: { paddingVertical: 32, alignItems: 'center' },
  emptyFilterText: { color: NC.onSurfaceVariant, fontSize: 14 },
  card: { backgroundColor: NC.surfaceLowest, borderRadius: 28, marginBottom: 14, flexDirection: 'row', overflow: 'hidden', shadowColor: 'rgba(42,49,39,0.12)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 24, elevation: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  accentBar: { width: 5, borderTopLeftRadius: 28, borderBottomLeftRadius: 28 },
  cardInner: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardCity: { fontSize: 20, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.3 },
  cardRegion: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 2 },
  heartWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: NC.surfaceLow, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  heartWrapActive: { backgroundColor: NC.primaryFixed },
  heartIcon: { fontSize: 18, color: NC.onSurfaceVariant },
  heartIconActive: { color: NC.primary },
  cardDesc: { fontSize: 13, color: NC.onSurfaceVariant, lineHeight: 18, marginBottom: 12 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: NC.surfaceLow, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  tagText: { color: NC.primary, fontSize: 11, fontWeight: '600' },
  tagMore: { backgroundColor: NC.primaryFixed, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  tagMoreText: { color: NC.onPrimaryFixed, fontSize: 11, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardCost: { fontSize: 15, fontWeight: '900', color: NC.primary },
  tagsInline: { flexDirection: 'row', gap: 6 },
  tagSmall: { backgroundColor: NC.secondaryContainer, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagSmallText: { color: NC.onSecondaryContainer, fontSize: 10, fontWeight: '700' },
});
