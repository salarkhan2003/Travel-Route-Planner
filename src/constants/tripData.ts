import { TripNode, TripPath } from '../types/trip';

export const INITIAL_NODES: TripNode[] = [
  {
    id: 'node-guntur',
    city: 'Guntur',
    country: 'India',
    coordinates: [80.4365, 16.3067],
    stayNights: 2,
    hotelCostPerNight: 30,
    totalStayCost: 60,
    isLocked: false,
    isGreyedOut: false,
  },
  {
    id: 'node-ajmer',
    city: 'Ajmer',
    country: 'India',
    coordinates: [74.6399, 26.4499],
    stayNights: 3,
    hotelCostPerNight: 25,
    totalStayCost: 75,
    isLocked: false,
    isGreyedOut: false,
  },
  {
    id: 'node-delhi',
    city: 'Delhi',
    country: 'India',
    coordinates: [77.1025, 28.7041],
    stayNights: 4,
    hotelCostPerNight: 55,
    totalStayCost: 220,
    isLocked: false,
    isGreyedOut: false,
  },
  {
    id: 'node-agra',
    city: 'Agra',
    country: 'India',
    coordinates: [78.0081, 27.1767],
    stayNights: 2,
    hotelCostPerNight: 40,
    totalStayCost: 80,
    isLocked: false,
    isGreyedOut: false,
  },
];

export const INITIAL_PATHS: TripPath[] = [
  {
    id: 'path-guntur-ajmer',
    fromNodeId: 'node-guntur',
    toNodeId: 'node-ajmer',
    selectedMode: 'train',
    isGreyedOut: false,
    options: [
      { mode: 'train', cost: 45, durationHrs: 22, label: 'Rajdhani Express' },
      { mode: 'flight', cost: 110, durationHrs: 2.5, label: 'IndiGo Direct' },
    ],
  },
  {
    id: 'path-ajmer-delhi',
    fromNodeId: 'node-ajmer',
    toNodeId: 'node-delhi',
    selectedMode: 'train',
    isGreyedOut: false,
    options: [
      { mode: 'train', cost: 30, durationHrs: 7, label: 'Shatabdi Express' },
      { mode: 'flight', cost: 95, durationHrs: 1.5, label: 'Air India' },
      { mode: 'road', cost: 20, durationHrs: 8, label: 'AC Bus' },
    ],
  },
  {
    id: 'path-delhi-agra',
    fromNodeId: 'node-delhi',
    toNodeId: 'node-agra',
    selectedMode: 'train',
    isGreyedOut: false,
    options: [
      { mode: 'train', cost: 15, durationHrs: 2, label: 'Gatimaan Express' },
      { mode: 'road', cost: 25, durationHrs: 3.5, label: 'Cab / Taxi' },
      { mode: 'bus', cost: 8, durationHrs: 4, label: 'UPSRTC Bus' },
    ],
  },
];

// Neon colors per transport mode
export const TRANSPORT_COLORS: Record<string, string> = {
  flight: '#00BFFF',  // neon blue
  train: '#39FF14',   // neon green
  road: '#FF6B00',    // neon orange
  bus: '#FF6B00',
};

export const TRANSPORT_ICONS: Record<string, string> = {
  flight: '✈️',
  train: '🚆',
  road: '🚗',
  bus: '🚌',
};
