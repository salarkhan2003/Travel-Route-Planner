import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NC } from '../../constants/theme';
import { ClayCard } from '../clay/ClayCard';

const { width } = Dimensions.get('window');

interface Segment {
  mode: 'walking' | 'auto' | 'train' | 'flight' | 'metro' | 'bus';
  title: string;
  detail: string;
  time: string;
  status?: string;
}

const PERSONA_STYLES: any = {
  family: { color: '#4CAF50', label: 'Bulksync Routing', icon: 'people' },
  solo: { color: '#00E676', label: 'Safe-Zone Routing', icon: 'shield-checkmark' },
  business: { color: '#2196F3', label: 'Career Transit', icon: 'briefcase' },
  spiritual: { color: '#FFD600', label: 'Vow Navigation', icon: 'sunny' },
};

export function MasterGuide({ 
  visible, 
  onClose, 
  persona = 'family',
  from = 'Guntur',
  to = 'Singapore'
}: { 
  visible: boolean; 
  onClose: () => void; 
  persona?: string;
  from?: string;
  to?: string;
}) {
  const style = PERSONA_STYLES[persona] || PERSONA_STYLES.family;

  const segments: Segment[] = [
    { mode: 'walking', title: 'First Mile', detail: 'Walk to Guntur main gate auto stand.', time: '06:00 AM' },
    { mode: 'auto', title: 'Local Link', detail: 'Auto to Guntur Railway Station (Est ₹150).', time: '06:10 AM' },
    { mode: 'train', title: 'The Spine', detail: '12723 - Telangana Express (Coach S4, Seats 11-22).', time: '07:00 AM', status: 'On Track' },
    { mode: 'flight', title: 'The Bridge', detail: 'Singapore Airlines SQ423 (Terminal 3).', time: '04:00 PM' },
    { mode: 'metro', title: 'Last Mile', detail: 'Take Green Line MRT to Destination.', time: '09:00 PM' },
  ];

  if (!visible) return null;

  return (
    <View style={s.overlay}>
      <Animated.View style={s.sheet}>
        <View style={s.handle} />
        
        <View style={s.header}>
          <View style={[s.personaBadge, { backgroundColor: style.color + '20' }]}>
            <Ionicons name={style.icon} size={14} color={style.color} />
            <Text style={[s.personaText, { color: style.color }]}>{style.label}</Text>
          </View>
          <Text style={s.title}>{from} → {to}</Text>
          <Text style={s.subtitle}>End-to-End Smart Guide</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Micro Guides Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
            <TouchableOpacity style={[s.tab, s.tabActive]}>
              <Text style={s.tabTextActive}>Timeline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tab}>
              <Text style={s.tabText}>Know Before You Go</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tab}>
              <Text style={s.tabText}>Transit Hub</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tab}>
              <Text style={s.tabText}>Food Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tab}>
              <Text style={s.tabText}>Checklist</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* The Accordion Path */}
          <View style={s.timeline}>
            <View style={[s.liquidThread, { backgroundColor: style.color + '40' }]} />
            
            {segments.map((seg, i) => (
              <View key={i} style={s.step}>
                <View style={[s.iconBox, i === 2 && s.activeIconBox]}>
                  <View style={s.iconSheen} />
                  <Ionicons 
                    name={getModeIcon(seg.mode) as any} 
                    size={24} 
                    color={i === 2 ? '#FFF' : style.color} 
                  />
                  {i === 2 && persona === 'solo' && <View style={s.glowAura} />}
                </View>
                
                <View style={s.content}>
                  <View style={s.contentHeader}>
                    <Text style={s.segTitle}>{seg.title}</Text>
                    <Text style={s.segTime}>{seg.time}</Text>
                  </View>
                  <Text style={s.segDetail}>{seg.detail}</Text>
                  {seg.status && (
                    <View style={s.statusPill}>
                      <View style={s.statusDot} />
                      <Text style={s.statusText}>{seg.status}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Persona Specific Alert */}
          {persona === 'family' && (
            <ClayCard variant="mint" style={s.personaAlert}>
              <Ionicons name="information-circle" size={20} color={NC.primary} />
              <Text style={s.alertText}>
                Platform 4 is 500m away. Suggesting slow-walk route for elders.
              </Text>
            </ClayCard>
          )}

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>Back to Canvas</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function getModeIcon(mode: string) {
  switch (mode) {
    case 'walking': return 'walk';
    case 'auto': return 'car';
    case 'train': return 'train';
    case 'flight': return 'airplane';
    case 'metro': return 'subway';
    case 'bus': return 'bus';
    default: return 'ellipsis-horizontal';
  }
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', zIndex: 1000 },
  sheet: { backgroundColor: '#F1F8F2', borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '92%', paddingBottom: 20 },
  handle: { width: 40, height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, alignSelf: 'center', marginVertical: 15 },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  personaBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  personaText: { fontSize: 11, fontWeight: '900', marginLeft: 6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: NC.onSurfaceVariant, fontWeight: '700', marginTop: 4 },
  tabs: { marginVertical: 10, paddingHorizontal: 24 },
  tab: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: 'rgba(165,214,167,0.3)' },
  tabActive: { backgroundColor: NC.primary, borderColor: NC.primary },
  tabText: { fontSize: 13, fontWeight: '800', color: NC.onSurfaceVariant },
  tabTextActive: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  scroll: { paddingHorizontal: 24, paddingBottom: 100 },
  timeline: { marginTop: 20, position: 'relative' },
  liquidThread: { position: 'absolute', left: 26, top: 40, bottom: 40, width: 4, borderRadius: 2 },
  step: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  iconBox: { 
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.4)', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6
  },
  activeIconBox: { backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.5)' },
  iconSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(255,255,255,0.2)', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  glowAura: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,230,118,0.2)', zIndex: -1 },
  content: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(165,214,167,0.2)' },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  segTitle: { fontSize: 15, fontWeight: '900', color: NC.onSurface },
  segTime: { fontSize: 11, fontWeight: '700', color: NC.primary },
  segDetail: { fontSize: 13, color: NC.onSurfaceVariant, fontWeight: '600', lineHeight: 18 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#1B5E20' },
  personaAlert: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 16 },
  alertText: { flex: 1, fontSize: 13, color: NC.onSurface, fontWeight: '700', lineHeight: 18 },
  closeBtn: { backgroundColor: '#FFF', padding: 18, borderRadius: 24, alignItems: 'center', marginTop: 30, borderWidth: 2, borderColor: NC.primary },
  closeBtnText: { color: NC.primary, fontSize: 15, fontWeight: '900' },
});
