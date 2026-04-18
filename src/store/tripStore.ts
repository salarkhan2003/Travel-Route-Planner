import { create } from 'zustand';
import type { TripState, TripNode, TripPath, TransportMode } from '../types/trip';

function computeSpent(nodes: TripNode[], paths: TripPath[]): number {
  const stay = nodes.reduce((s, n) => s + n.totalStayCost, 0);
  const transport = paths.reduce((s, p) => {
    const opt = p.options.find((o) => o.mode === p.selectedMode);
    return s + (opt?.cost ?? 0);
  }, 0);
  return stay + transport;
}

function applyBudgetFilter(nodes: TripNode[], paths: TripPath[], budget: number) {
  const threshold = budget * 0.8;
  return {
    nodes: nodes.map((n) => ({ ...n, isGreyedOut: n.totalStayCost > threshold })),
    paths: paths.map((p) => {
      const opt = p.options.find((o) => o.mode === p.selectedMode);
      return { ...p, isGreyedOut: (opt?.cost ?? 0) > threshold };
    }),
  };
}

  selectedPathId: string | null;
  selectedNodeId: string | null;
  homeCity: string;
  reorderNode: (fromIndex: number, toIndex: number) => void;
  selectPath: (pathId: string | null) => void;
  selectNode: (nodeId: string | null) => void;
  swapTransport: (pathId: string, mode: TransportMode) => void;
  toggleLockNode: (nodeId: string) => void;
  setBudget: (amount: number) => void;
  updateNodeStay: (nodeId: string, nights: number) => void;
  addNode: (node: TripNode) => void;
  removeNode: (nodeId: string) => void;
  clearTrip: () => void;
  setHomeCity: (city: string) => void;
}

export const useTripStore = create<TripState>()((set, get) => ({
  nodes: [],
  paths: [],
  globalBudget: 50000,
  spentBudget: 0,
  selectedPathId: null,
  selectedNodeId: null,
  homeCity: 'Ajmer',

  reorderNode: (fromIndex, toIndex) => {
    const { nodes, paths } = get();
    const reordered = [...nodes];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const newPaths: TripPath[] = reordered.slice(0, -1).map((node, i) => {
      const next = reordered[i + 1];
      const existing = paths.find(
        (p) => (p.fromNodeId === node.id && p.toNodeId === next.id) ||
               (p.fromNodeId === next.id && p.toNodeId === node.id)
      );
      return existing
        ? { ...existing, fromNodeId: node.id, toNodeId: next.id }
        : {
            id: `path-${node.id}-${next.id}`,
            fromNodeId: node.id, toNodeId: next.id,
            selectedMode: 'train' as TransportMode,
            isGreyedOut: false,
            options: [{ mode: 'train' as TransportMode, cost: 500, durationHrs: 5, label: 'Train' }],
          };
    });
    set({ nodes: reordered, paths: newPaths, spentBudget: computeSpent(reordered, newPaths) });
  },

  selectPath: (pathId) => set({ selectedPathId: pathId, selectedNodeId: null }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedPathId: null }),

  swapTransport: (pathId, mode) => {
    const { paths, nodes, globalBudget } = get();
    const updated = paths.map((p) => p.id === pathId ? { ...p, selectedMode: mode } : p);
    const { nodes: fn, paths: fp } = applyBudgetFilter(nodes, updated, globalBudget);
    set({ paths: fp, nodes: fn, spentBudget: computeSpent(fn, fp) });
  },

  toggleLockNode: (nodeId) => {
    const { nodes } = get();
    set({ nodes: nodes.map((n) => n.id === nodeId ? { ...n, isLocked: !n.isLocked } : n) });
  },

  setBudget: (amount) => {
    const { nodes, paths } = get();
    const { nodes: fn, paths: fp } = applyBudgetFilter(nodes, paths, amount);
    set({ globalBudget: amount, nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp) });
  },

  updateNodeStay: (nodeId, nights) => {
    const { nodes, paths, globalBudget } = get();
    const updated = nodes.map((n) =>
      n.id === nodeId ? { ...n, stayNights: nights, totalStayCost: nights * n.hotelCostPerNight } : n
    );
    const { nodes: fn, paths: fp } = applyBudgetFilter(updated, paths, globalBudget);
    set({ nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp) });
  },

  addNode: (node) => {
    const { nodes, paths, globalBudget } = get();
    const newNodes = [...nodes, node];
    const newPaths = [...paths];
    if (nodes.length > 0) {
      const prev = nodes[nodes.length - 1];
      newPaths.push({
        id: `path-${prev.id}-${node.id}`,
        fromNodeId: prev.id,
        toNodeId: node.id,
        selectedMode: 'train',
        isGreyedOut: false,
        options: [
          { mode: 'train', cost: 800, durationHrs: 8, label: 'Express Train' },
          { mode: 'flight', cost: 3500, durationHrs: 1.5, label: 'Direct Flight' },
          { mode: 'bus', cost: 400, durationHrs: 10, label: 'AC Bus' },
          { mode: 'road', cost: 1200, durationHrs: 6, label: 'Cab/Taxi' },
        ],
      });
    }
    const { nodes: fn, paths: fp } = applyBudgetFilter(newNodes, newPaths, globalBudget);
    set({ nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp) });
  },

  removeNode: (nodeId) => {
    const { nodes, paths, globalBudget } = get();
    const newNodes = nodes.filter((n) => n.id !== nodeId);
    const newPaths: TripPath[] = newNodes.slice(0, -1).map((node, i) => {
      const next = newNodes[i + 1];
      const existing = paths.find(
        (p) => (p.fromNodeId === node.id && p.toNodeId === next.id) ||
               (p.fromNodeId === next.id && p.toNodeId === node.id)
      );
      return existing ?? {
        id: `path-${node.id}-${next.id}`,
        fromNodeId: node.id, toNodeId: next.id,
        selectedMode: 'train' as TransportMode,
        isGreyedOut: false,
        options: [{ mode: 'train' as TransportMode, cost: 800, durationHrs: 8, label: 'Train' }],
      };
    });
    const { nodes: fn, paths: fp } = applyBudgetFilter(newNodes, newPaths, globalBudget);
    set({ nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp) });
  },

  clearTrip: () => set({
    nodes: [], paths: [], spentBudget: 0,
    selectedPathId: null, selectedNodeId: null,
  }),
  setHomeCity: (city) => set({ homeCity: city }),
}));
