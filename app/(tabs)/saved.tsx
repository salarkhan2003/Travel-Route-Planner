import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_LOCATIONS } from '../../src/constants/locations';
import { useSavedStore } from '../../src/store/savedStore';
import { useCurrency } from '../../src/hooks/useCurrency';

const FILTERS = ['All', 'India', 'Singapore', 'Spiritual', 'Beach', 'Heritage', 'Food'];

export default function SavedScreen() {
  const { savedIds, toggle, isSaved } = useSavedStore();
  const { fmtFull } = useCurrency();
  const [filter, setFilter] = useState('All');

  // Only show saved locations
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
          <Text style={s.heading}>Saved</Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>{savedIds.length} places</Text>
          </View>
        </View>

        {savedIds.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🤍</Text>
            <Text style={s.emptyTitle}>Nothing saved yet</Text>
            <Text style={s.emptyDesc}>
              Tap the heart icon on any city in the Explore tab to save it here.
            </Text>
          </View>
        ) : (
          <>
            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[s.chip, filter === f && s.chipActive]}
                >
                  <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
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
                  <View style={s.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardCity}>{loc.city}</Text>
                      <Text style={s.cardRegion}>{loc.region} · {loc.country}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggle(loc.id)}
                      style={s.heartBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={s.heartIcon}>{isSaved(loc.id) ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={s.cardDesc}>{loc.description}</Text>

                  {/* Highlights */}
                  <View style={s.tagsWrap}>
                    {loc.highlights.slice(0, 3).map(h => (
                      <View key={h} style={s.tag}>
                        <Text style={s.tagText}>{h}</Text>
                      </View>
                    ))}
                    {loc.highlights.length > 3 && (
                      <View style={[s.tag, s.tagMore]}>
                        <Text style={s.tagMoreText}>+{loc.highlights.length - 3}</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.cardFooter}>
                    <Text style={s.cardCost}>~{fmtFull(loc.avgHotelCost * 83)}/night</Text>
                    <View style={s.tagsInline}>
                      {loc.tags.slice(0, 2).map(t => (
                        <View key={t} style={s.tagSmall}>
                          <Text style={s.tagSmallText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  heading: { fontSize: 28, fontWeight: '900', color: '#1B5E20', letterSpacing: -0.5 },
  countBadge: { backgroundColor: '#C8E6C9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  countText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1B5E20', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#558B2F', textAlign: 'center', lineHeight: 21 },

  filterRow: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 50, marginRight: 8,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(200,230,201,0.7)',
    shadowColor: 'rgba(76,175,80,0.12)', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 3,
  },
  chipActive: { backgroundColor: '#4CAF50', borderColor: 'rgba(255,255,255,0.5)' },
  chipText: { color: '#558B2F', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#FFF' },

  emptyFilter: { paddingVertical: 32, alignItems: 'center' },
  emptyFilterText: { color: '#81C784', fontSize: 14 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 12,
    shadowColor: 'rgba(76,175,80,0.18)', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 6,
    borderWidth: 1, borderColor: 'rgba(200,230,201,0.5)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardCity: { fontSize: 20, fontWeight: '900', color: '#1B5E20', letterSpacing: -0.3 },
  cardRegion: { fontSize: 12, color: '#558B2F', marginTop: 2 },
  heartBtn: { padding: 4 },
  heartIcon: { fontSize: 24 },
  cardDesc: { fontSize: 13, color: '#2E7D32', lineHeight: 18, marginBottom: 10 },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: '#F0FAF1', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(200,230,201,0.7)' },
  tagText: { color: '#2E7D32', fontSize: 11, fontWeight: '600' },
  tagMore: { backgroundColor: '#C8E6C9' },
  tagMoreText: { color: '#1B5E20', fontSize: 11, fontWeight: '700' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardCost: { fontSize: 15, fontWeight: '900', color: '#1B5E20' },
  tagsInline: { flexDirection: 'row', gap: 6 },
  tagSmall: { backgroundColor: '#C8E6C9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagSmallText: { color: '#1B5E20', fontSize: 10, fontWeight: '700' },
});
