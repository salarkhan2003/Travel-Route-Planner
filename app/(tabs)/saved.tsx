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
              <Text style={s.emptyIconText}>+</Text>
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
                            {isSaved(loc.id) ? 'Saved' : 'Save'}
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
  scroll: { paddingHorizontal: 18, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 22 },
  heading: { fontSize: 28, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 3, fontWeight: '600' },
  countBadge: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: NC.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(165,214,167,0.35)',
    borderRightColor: 'rgba(165,214,167,0.25)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  countText: { color: NC.onPrimaryFixed, fontSize: 18, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingVertical: 72, paddingHorizontal: 32 },
  emptyIcon: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: NC.primaryFixed,
    alignItems: 'center', justifyContent: 'center', marginBottom: 22,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(165,214,167,0.35)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 18, elevation: 10,
  },
  emptyIconText: { fontSize: 40, color: NC.primary },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: NC.onSurface, marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: NC.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  filterRow: { marginBottom: 20 },
  chip: {
    paddingHorizontal: 20, paddingVertical: 11, borderRadius: 999,
    backgroundColor: NC.surfaceLowest,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.35)',
    borderRightColor: 'rgba(165,214,167,0.25)',
    shadowColor: 'rgba(165,214,167,0.45)', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  chipOn: {
    backgroundColor: NC.primary,
    borderColor: 'rgba(255,255,255,0.4)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', elevation: 8,
  },
  chipText: { color: NC.onSurfaceVariant, fontSize: 13, fontWeight: '700' },
  chipTextOn: { color: '#fff', fontWeight: '900' },
  emptyFilter: { paddingVertical: 36, alignItems: 'center' },
  emptyFilterText: { color: NC.onSurfaceVariant, fontSize: 15 },
  card: {
    backgroundColor: NC.surfaceLowest, borderRadius: 36, marginBottom: 16,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 10,
  },
  accentBar: { width: 6, borderTopLeftRadius: 36, borderBottomLeftRadius: 36 },
  cardInner: { flex: 1, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardCity: { fontSize: 22, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.3 },
  cardRegion: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 3 },
  heartWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: NC.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.3)', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  heartWrapActive: { backgroundColor: NC.primaryFixed },
  heartIcon: { fontSize: 20, color: NC.onSurfaceVariant },
  heartIconActive: { color: NC.primary },
  cardDesc: { fontSize: 13, color: NC.onSurfaceVariant, lineHeight: 19, marginBottom: 14 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  tag: {
    backgroundColor: NC.surfaceLow, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)',
  },
  tagText: { color: NC.primary, fontSize: 11, fontWeight: '700' },
  tagMore: { backgroundColor: NC.primaryFixed, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  tagMoreText: { color: NC.onPrimaryFixed, fontSize: 11, fontWeight: '800' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardCost: { fontSize: 16, fontWeight: '900', color: NC.primary },
  tagsInline: { flexDirection: 'row', gap: 6 },
  tagSmall: { backgroundColor: NC.secondaryContainer, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  tagSmallText: { color: NC.onSecondaryContainer, fontSize: 10, fontWeight: '800' },
});
