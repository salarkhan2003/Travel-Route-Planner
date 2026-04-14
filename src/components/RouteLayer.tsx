/**
 * RouteLayer — renders trip route polylines on react-native-maps MapView.
 * (Replaced the previous @rnmapbox/maps implementation which is not installed.)
 */
import React from 'react';
import { Polyline } from 'react-native-maps';
import { TripNode, TripPath } from '../types/trip';
import { TRANSPORT_COLORS } from '../constants/tripData';
import { useTripStore } from '../store/tripStore';

interface Props {
  nodes: TripNode[];
  paths: TripPath[];
}

function getMidpointWithOffset(
  from: [number, number],
  to: [number, number]
): { latitude: number; longitude: number } {
  const midLng = (from[0] + to[0]) / 2;
  const midLat = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return { latitude: midLat + dx * 0.08, longitude: midLng - dy * 0.08 };
}

export function RouteLayer({ nodes, paths }: Props) {
  const selectPath = useTripStore((s) => s.selectPath);
  const selectedPathId = useTripStore((s) => s.selectedPathId);
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <>
      {paths.map((path) => {
        const from = nodeMap[path.fromNodeId];
        const to = nodeMap[path.toNodeId];
        if (!from || !to) return null;
        const color = path.isGreyedOut
          ? '#444444'
          : TRANSPORT_COLORS[path.selectedMode] ?? '#FFFFFF';
        const isSelected = selectedPathId === path.id;
        const mid = getMidpointWithOffset(from.coordinates, to.coordinates);
        return (
          <Polyline
            key={path.id}
            coordinates={[
              { latitude: from.coordinates[1], longitude: from.coordinates[0] },
              mid,
              { latitude: to.coordinates[1], longitude: to.coordinates[0] },
            ]}
            strokeColor={color}
            strokeWidth={isSelected ? 5 : 3}
            lineDashPattern={path.selectedMode === 'flight' ? [8, 4] : undefined}
            tappable
            onPress={() => selectPath(path.id)}
          />
        );
      })}
    </>
  );
}
