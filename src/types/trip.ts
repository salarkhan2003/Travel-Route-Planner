export type TransportMode = 'flight' | 'train' | 'road' | 'bus';

export interface TransportOption {
  mode: TransportMode;
  cost: number;
  durationHrs: number;
  label: string;
}

export interface TripNode {
  id: string;
  city: string;
  country: string;
  coordinates: [number, number];
  stayNights: number;
  hotelCostPerNight: number;
  totalStayCost: number;
  isLocked: boolean;
  isGreyedOut: boolean;
}

export interface TripPath {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  selectedMode: TransportMode;
  options: TransportOption[];
  isGreyedOut: boolean;
}

export interface TripState {
  nodes: TripNode[];
  paths: TripPath[];
  globalBudget: number;
  spentBudget: number;
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
