import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTripStore } from '../store/tripStore';
import { TRANSPORT_COLORS, TRANSPORT_ICONS } from '../constants/tripData';
import { BudgetSlider } from './BudgetSlider';

const COLLAPSED_HEIGHT = 60;
const EXPANDED_HEIGHT = Dimensions.get('window').height * 0.45;

export function ItineraryDrawer() {
  const [expanded, setExpanded] = useState(false);
  const drawerHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  const nodes = useTripStore((s) => s.nodes);
  const paths = useTripStore((s) => s.paths);
  const selectNode = useTripStore((s) => s.selectNode);
  const selectPath = useTripStore((s) => s.selectPath);
  const toggleLockNode = useTripStore((s) => s.toggleLockNode);
  const spentBudget = useTripStore((s) => s.spentBudget);

  const lockedCount = nodes.filter((n) => n.isLocked).length;

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.spring(drawerHeight, {
      toValue: next ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
      useNativeDriver: false,
      damping: 18,
      stiffness: 120,
    }).start();
  };

  return (
    <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
      <TouchableOpacity style={styles.handle} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.handleBar} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🗺️ Itinerary · {nodes.length} cities</Text>
          <View style={styles.headerRight}>
            <Text style={styles.totalCost}>${spentBudget.toFixed(0)} total</Text>
            {lockedCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{lockedCount} 🔒</Text>
              </View>
            )}
            <Text style={styles.chevron}>{expanded ? '▼' : '▲'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <>
          <BudgetSlider />
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {nodes.map((node, index) => {
              const pathAfter = paths[index];
              const pathColor = pathAfter ? TRANSPORT_COLORS[pathAfter.selectedMode] : null;
              return (
                <View key={node.id}>
                  <TouchableOpacity
                    style={[
                      styles.nodeRow,
                      node.isGreyedOut && styles.greyedOut,
                      node.isLocked && styles.lockedRow,
                    ]}
                    onPress={() => selectNode(node.id)}
                    onLongPress={() => toggleLockNode(node.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.nodeIndex}>
                      <Text style={styles.nodeIndexText}>{index + 1}</Text>
                    </View>
                    <View style={styles.nodeInfo}>
                      <Text style={styles.nodeCityText}>{node.city}{node.isLocked ? ' 🔒' : ''}</Text>
                      <Text style={styles.nodeSubText}>{node.stayNights} nights · ${node.hotelCostPerNight}/night</Text>
                    </View>
                    <Text style={styles.nodeCost}>${node.totalStayCost}</Text>
                  </TouchableOpacity>

                  {pathAfter && index < nodes.length - 1 && (
                    <TouchableOpacity
                      style={[styles.pathRow, pathAfter.isGreyedOut && styles.greyedOut]}
                      onPress={() => selectPath(pathAfter.id)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.pathLine, { backgroundColor: pathColor ?? '#444' }]} />
                      <Text style={styles.pathIcon}>{TRANSPORT_ICONS[pathAfter.selectedMode]}</Text>
                      <Text style={[styles.pathText, { color: pathColor ?? '#888' }]}>
                        {pathAfter.selectedMode.toUpperCase()}
                      </Text>
                      <Text style={styles.pathCost}>
                        ${pathAfter.options.find((o) => o.mode === pathAfter.selectedMode)?.cost ?? '?'}
                      </Text>
                      <Text style={styles.pathTap}>Tap to swap →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {lockedCount > 0 && (
              <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
                <Text style={styles.checkoutText}>
                  🛒 Checkout {lockedCount} locked stop{lockedCount > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(8, 8, 20, 0.96)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
    overflow: 'hidden',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 10 },
  handleBar: {
    width: 36, height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 8,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalCost: { color: '#39FF14', fontSize: 13, fontWeight: '700' },
  cartBadge: { backgroundColor: '#FFD700', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  cartBadgeText: { color: '#000', fontSize: 10, fontWeight: '800' },
  chevron: { color: '#888', fontSize: 12 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  nodeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 12, marginVertical: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  greyedOut: { opacity: 0.35 },
  lockedRow: { borderColor: '#FFD700', borderWidth: 1.5 },
  nodeIndex: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#39FF14', alignItems: 'center',
    justifyContent: 'center', marginRight: 10,
  },
  nodeIndexText: { color: '#000', fontSize: 11, fontWeight: '800' },
  nodeInfo: { flex: 1 },
  nodeCityText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  nodeSubText: { color: '#888', fontSize: 11, marginTop: 2 },
  nodeCost: { color: '#39FF14', fontSize: 15, fontWeight: '800' },
  pathRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 14, gap: 6 },
  pathLine: { width: 2, height: 20, borderRadius: 1, marginRight: 4 },
  pathIcon: { fontSize: 14 },
  pathText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  pathCost: { color: '#FFF', fontSize: 12, fontWeight: '600', flex: 1 },
  pathTap: { color: '#555', fontSize: 10 },
  checkoutBtn: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1.5, borderColor: '#FFD700',
    borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12,
  },
  checkoutText: { color: '#FFD700', fontSize: 14, fontWeight: '800' },
});
