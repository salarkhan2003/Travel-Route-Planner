import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../src/store/tripStore';
import { ClayCard } from '../src/components/clay/ClayCard';
import { NC } from '../src/constants/theme';

const PERSONAS = [
  {
    id: 'family',
    title: 'The Family',
    description: '11 People Group Travel',
    feature: 'Bulk-Sync Routing: Ensures everyone stays together. Auto-splits into 12-seater vans.',
    icon: 'people',
    color: '#4CAF50',
    logic: 'Bulk Group Guidance & Split Routing',
  },
  {
    id: 'solo',
    title: 'The Solo Explorer',
    description: 'Safe & Liquid Green Paths',
    feature: 'Safe-Zone Routing: Highlights well-lit and highly rated paths for security.',
    icon: 'person',
    color: '#00E676',
    logic: 'Liquid Green Paths & Glow Aura',
  },
  {
    id: 'business',
    title: 'The Business Mover',
    description: 'Career & Professional Sync',
    feature: 'Career Transit: Syncs with work data. Maps routes from office to liquid housing.',
    icon: 'briefcase',
    color: '#2196F3',
    logic: 'Professional Nodes & Work Sync',
  },
  {
    id: 'spiritual',
    title: 'The Spiritual Pilgrim',
    description: 'Vow & Ritual Navigation',
    feature: 'Vow Navigation: Includes ritual-specific stops and golden milestone markers.',
    icon: 'sunny',
    color: '#FFD600',
    logic: 'Golden Milestones & Ritual Stops',
  },
];

export default function PersonaScreen() {
  const router = useRouter();
  const setPersona = useTripStore(s => s.setPersona);
  const currentPersona = useTripStore(s => s.persona);

  const handleSelect = (id: any) => {
    setPersona(id);
    router.back();
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={NC.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>Choose Your Persona</Text>
        <Text style={s.subtitle}>Tailor Roamio to your travel style</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {PERSONAS.map((p) => (
          <TouchableOpacity key={p.id} activeOpacity={0.9} onPress={() => handleSelect(p.id)}>
            <ClayCard variant={currentPersona === p.id ? 'green' : 'white'} style={s.card}>
              <View style={s.cardHeader}>
                <View style={[s.iconBox, { backgroundColor: p.color + '20' }]}>
                  <Ionicons name={p.icon as any} size={28} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, currentPersona === p.id && { color: '#FFF' }]}>{p.title}</Text>
                  <Text style={[s.cardDesc, currentPersona === p.id && { color: 'rgba(255,255,255,0.8)' }]}>{p.description}</Text>
                </View>
                {currentPersona === p.id && (
                  <View style={s.checkMark}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  </View>
                )}
              </View>
              <View style={[s.divider, currentPersona === p.id && { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <Text style={[s.featureLabel, currentPersona === p.id && { color: 'rgba(255,255,255,0.6)' }]}>KEY FEATURE</Text>
              <Text style={[s.featureText, currentPersona === p.id && { color: '#FFF' }]}>{p.feature}</Text>
              <View style={s.logicBadge}>
                <Text style={s.logicText}>{p.logic}</Text>
              </View>
            </ClayCard>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={s.confirmBtn} onPress={() => router.back()}>
        <Text style={s.confirmText}>Confirm traveler type</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F2' },
  header: { padding: 24, paddingBottom: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 2 },
  title: { fontSize: 28, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: NC.onSurfaceVariant, fontWeight: '600', marginTop: 4 },
  scroll: { padding: 20, paddingBottom: 100 },
  card: { marginBottom: 16, padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  iconBox: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 20, fontWeight: '900', color: NC.onSurface },
  cardDesc: { fontSize: 13, color: NC.onSurfaceVariant, fontWeight: '700', marginTop: 2 },
  checkMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 14 },
  featureLabel: { fontSize: 10, fontWeight: '900', color: NC.outline, letterSpacing: 1, marginBottom: 6 },
  featureText: { fontSize: 13, color: NC.onSurface, fontWeight: '600', lineHeight: 18 },
  logicBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(165,214,167,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 14 },
  logicText: { fontSize: 11, fontWeight: '800', color: NC.primary },
  confirmBtn: { position: 'absolute', bottom: 30, left: 24, right: 24, backgroundColor: NC.primary, padding: 18, borderRadius: 20, alignItems: 'center', elevation: 8, shadowColor: NC.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  confirmText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
