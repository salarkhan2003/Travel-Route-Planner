import React, { useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTripStore } from '../store/tripStore';
import { TripNodeMarker } from './TripNode';
import { TRANSPORT_COLORS } from '../constants/tripData';

const INDIA_REGION = {
  latitude: 22.5937,
  longitude: 78.9629,
  latitudeDelta: 18,
  longitudeDelta: 18,
};

export function MapCanvas() {
  const mapRef = useRef<InstanceType<typeof MapView>>(null);
  const nodes = useTripStore((s) => s.nodes);
  const paths = useTripStore((s) => s.paths);
  const selectPath = useTripStore((s) => s.selectPath);
  const selectNode = useTripStore((s) => s.selectNode);

  const handleMapPress = useCallback(() => {
    selectPath(null);
    selectNode(null);
  }, [selectPath, selectNode]);

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={INDIA_REGION}
        onPress={handleMapPress}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Neon route polylines */}
        {paths.map((path) => {
          const from = nodeMap[path.fromNodeId];
          const to = nodeMap[path.toNodeId];
          if (!from || !to) return null;

          const color = path.isGreyedOut
            ? '#444444'
            : TRANSPORT_COLORS[path.selectedMode] ?? '#FFFFFF';

          const mid = {
            latitude: (from.coordinates[1] + to.coordinates[1]) / 2 + 0.5,
            longitude: (from.coordinates[0] + to.coordinates[0]) / 2,
          };

          return (
            <Polyline
              key={path.id}
              coordinates={[
                { latitude: from.coordinates[1], longitude: from.coordinates[0] },
                mid,
                { latitude: to.coordinates[1], longitude: to.coordinates[0] },
              ]}
              strokeColor={color}
              strokeWidth={path.isGreyedOut ? 1.5 : 3}
              lineDashPattern={path.selectedMode === 'flight' ? [8, 4] : undefined}
              tappable
              onPress={() => selectPath(path.id)}
            />
          );
        })}

        {/* City node markers */}
        {nodes.map((node, index) => (
          <TripNodeMarker
            key={node.id}
            node={node}
            index={index}
            onPress={() => {
              selectNode(node.id);
              mapRef.current?.animateToRegion(
                {
                  latitude: node.coordinates[1],
                  longitude: node.coordinates[0],
                  latitudeDelta: 2,
                  longitudeDelta: 2,
                },
                800
              );
            }}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

// Google Maps dark style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];
