import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { TripNode, TripPath } from '../types/trip';
import { TRANSPORT_COLORS } from '../constants/tripData';
import { useTripStore } from '../store/tripStore';

interface Props {
  nodes: TripNode[];
  paths: TripPath[];
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

        const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            // Slight curve via midpoint offset for visual appeal
            coordinates: [
              from.coordinates,
              getMidpointWithOffset(from.coordinates, to.coordinates),
              to.coordinates,
            ],
          },
        };

        return (
          <MapboxGL.ShapeSource
            key={path.id}
            id={`route-${path.id}`}
            shape={geojson}
            onPress={() => selectPath(path.id)}
          >
            {/* Glow layer (wider, lower opacity) */}
            <MapboxGL.LineLayer
              id={`glow-${path.id}`}
              style={{
                lineColor: color,
                lineWidth: isSelected ? 14 : 8,
                lineOpacity: 0.2,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Core neon line */}
            <MapboxGL.LineLayer
              id={`line-${path.id}`}
              style={{
                lineColor: color,
                lineWidth: isSelected ? 4 : 2.5,
                lineOpacity: path.isGreyedOut ? 0.3 : 0.95,
                lineCap: 'round',
                lineJoin: 'round',
                lineDasharray: path.selectedMode === 'flight' ? [4, 3] : undefined,
              }}
            />
          </MapboxGL.ShapeSource>
        );
      })}
    </>
  );
}

/** Offset midpoint perpendicular to the line for a subtle arc */
function getMidpointWithOffset(
  from: [number, number],
  to: [number, number]
): [number, number] {
  const midLng = (from[0] + to[0]) / 2;
  const midLat = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  // Perpendicular offset (scaled down)
  const offset = 0.8;
  return [midLng - dy * offset * 0.1, midLat + dx * offset * 0.1];
}
