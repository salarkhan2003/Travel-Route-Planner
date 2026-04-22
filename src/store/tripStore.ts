import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TripState, TripNode, TripPath, TransportMode, TripExpense, TripWeather } from '../types/trip';

function computeSpent(nodes: TripNode[], paths: TripPath[], extraExpenses: TripExpense[] = []): number {
  const stay = nodes.reduce((s, n) => s + n.totalStayCost, 0);
  const transport = paths.reduce((s, p) => {
    const opt = p.options.find((o) => o.mode === p.selectedMode);
    return s + (opt?.cost ?? 0);
  }, 0);
  const extras = extraExpenses.reduce((s, e) => {
    if (e.type === 'credit') return s - e.amount;
    return s + e.amount;
  }, 0);
  return stay + transport + extras;
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

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      nodes: [],
      paths: [],
      globalBudget: 50000,
      spentBudget: 0,
      selectedPathId: null,
      selectedNodeId: null,
      homeCity: 'Ajmer',
      routeWeathers: [
        { city: 'Ajmer', temp: '34C', cond: 'Sunny', icon: '☀️' },
        { city: 'Delhi', temp: '38C', cond: 'Cloudy', icon: '⛅' },
        { city: 'Singapore', temp: '29C', cond: 'Showers', icon: '🌧️' },
        { city: 'Goa', temp: '31C', cond: 'Breezy', icon: '🌤️' },
      ],
      extraExpenses: [],
      persona: 'none',

      reorderNode: (fromIndex, toIndex) => {
        const { nodes, paths, extraExpenses } = get();
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
        set({ nodes: reordered, paths: newPaths, spentBudget: computeSpent(reordered, newPaths, extraExpenses) });
      },

      selectPath: (pathId) => set({ selectedPathId: pathId, selectedNodeId: null }),
      selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedPathId: null }),

      swapTransport: (pathId, mode) => {
        const { paths, nodes, globalBudget, extraExpenses } = get();
        const updated = paths.map((p) => p.id === pathId ? { ...p, selectedMode: mode } : p);
        const { nodes: fn, paths: fp } = applyBudgetFilter(nodes, updated, globalBudget);
        set({ paths: fp, nodes: fn, spentBudget: computeSpent(fn, fp, extraExpenses) });
      },

      toggleLockNode: (nodeId) => {
        const { nodes } = get();
        set({ nodes: nodes.map((n) => n.id === nodeId ? { ...n, isLocked: !n.isLocked } : n) });
      },

      setBudget: (amount) => {
        const { nodes, paths, extraExpenses } = get();
        const { nodes: fn, paths: fp } = applyBudgetFilter(nodes, paths, amount);
        set({ globalBudget: amount, nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp, extraExpenses) });
      },

      updateNodeStay: (nodeId, nights) => {
        const { nodes, paths, globalBudget, extraExpenses } = get();
        const updated = nodes.map((n) =>
          n.id === nodeId ? { ...n, stayNights: nights, totalStayCost: nights * n.hotelCostPerNight } : n
        );
        const { nodes: fn, paths: fp } = applyBudgetFilter(updated, paths, globalBudget);
        set({ nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp, extraExpenses) });
      },

      addNode: (node) => {
        const { nodes, paths, globalBudget, extraExpenses } = get();
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
        set({ nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp, extraExpenses) });
      },

      removeNode: (nodeId) => {
        const { nodes, paths, globalBudget, extraExpenses } = get();
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
        set({ nodes: fn, paths: fp, spentBudget: computeSpent(fn, fp, extraExpenses) });
      },

      clearTrip: () => set({
        nodes: [], paths: [], spentBudget: 0,
        selectedPathId: null, selectedNodeId: null,
        extraExpenses: [],
      }),
      
      setHomeCity: (city) => set({ homeCity: city }),
      setRouteWeathers: (weathers) => set({ routeWeathers: weathers }),
      
      addExtraExpense: (expense) => set((s) => {
        // Prevent duplicates based on raw SMS content or existing ID
        const isDuplicate = s.extraExpenses.some(prev => 
          (expense.raw && prev.raw === expense.raw) || 
          (expense.id && prev.id === expense.id)
        );
        if (isDuplicate) return s;

        const newExpenses = [...s.extraExpenses, { 
          ...expense, 
          id: expense.id || `exp-${Date.now()}-${Math.random()}`, 
          date: expense.date || new Date().toISOString() 
        }];
        return {
          extraExpenses: newExpenses,
          spentBudget: computeSpent(s.nodes, s.paths, newExpenses)
        };
      }),

      setExtraExpenses: (expenses) => set((s) => ({
        extraExpenses: expenses,
        spentBudget: computeSpent(s.nodes, s.paths, expenses)
      })),

      setPersona: (persona) => set({ persona }),
    }),
    {
      name: 'trip-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
