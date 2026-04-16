export interface Location {
  id: string;
  city: string;
  country: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
  description: string;
  emoji: string;
  tags: string[];
  avgHotelCost: number;
  highlights: string[];
}

export const INDIA_LOCATIONS: Location[] = [
  {
    id: 'delhi', city: 'Delhi', country: 'India', region: 'North India',
    coordinates: [77.1025, 28.7041], description: 'Capital city with Mughal heritage',
    emoji: 'DL', tags: ['heritage', 'food', 'shopping'],
    avgHotelCost: 55, highlights: ['Red Fort', 'Qutub Minar', 'India Gate', 'Chandni Chowk'],
  },
  {
    id: 'agra', city: 'Agra', country: 'India', region: 'North India',
    coordinates: [78.0081, 27.1767], description: 'Home of the Taj Mahal',
    emoji: 'AG', tags: ['heritage', 'romantic', 'UNESCO'],
    avgHotelCost: 40, highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri'],
  },
  {
    id: 'ajmer', city: 'Ajmer', country: 'India', region: 'Rajasthan',
    coordinates: [74.6399, 26.4499], description: 'Spiritual city with Dargah Sharif',
    emoji: 'AJ', tags: ['spiritual', 'pilgrimage', 'sufi'],
    avgHotelCost: 25, highlights: ['Dargah Sharif', 'Ana Sagar Lake', 'Pushkar nearby'],
  },
  {
    id: 'jaipur', city: 'Jaipur', country: 'India', region: 'Rajasthan',
    coordinates: [75.7873, 26.9124], description: 'The Pink City of Rajasthan',
    emoji: 'JP', tags: ['heritage', 'culture', 'shopping'],
    avgHotelCost: 45, highlights: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar'],
  },
  {
    id: 'mumbai', city: 'Mumbai', country: 'India', region: 'West India',
    coordinates: [72.8777, 19.0760], description: 'City of dreams and Bollywood',
    emoji: 'MB', tags: ['metro', 'food', 'nightlife', 'beach'],
    avgHotelCost: 70, highlights: ['Gateway of India', 'Marine Drive', 'Elephanta Caves'],
  },
  {
    id: 'goa', city: 'Goa', country: 'India', region: 'West India',
    coordinates: [74.1240, 15.2993], description: 'Beach paradise of India',
    emoji: 'GA', tags: ['beach', 'nightlife', 'water sports'],
    avgHotelCost: 60, highlights: ['Baga Beach', 'Old Goa Churches', 'Dudhsagar Falls'],
  },
  {
    id: 'hyderabad', city: 'Hyderabad', country: 'India', region: 'South India',
    coordinates: [78.4867, 17.3850], description: 'City of Nizams and Biryani',
    emoji: 'HY', tags: ['food', 'heritage', 'tech'],
    avgHotelCost: 50, highlights: ['Charminar', 'Golconda Fort', 'Ramoji Film City'],
  },
  {
    id: 'guntur', city: 'Guntur', country: 'India', region: 'Andhra Pradesh',
    coordinates: [80.4365, 16.3067], description: 'Chilli capital of India',
    emoji: 'GT', tags: ['food', 'agriculture', 'local'],
    avgHotelCost: 30, highlights: ['Kondaveedu Fort', 'Amaravathi', 'Nagarjuna Sagar'],
  },
  {
    id: 'varanasi', city: 'Varanasi', country: 'India', region: 'North India',
    coordinates: [82.9739, 25.3176], description: 'Oldest living city on earth',
    emoji: 'VR', tags: ['spiritual', 'pilgrimage', 'ghats'],
    avgHotelCost: 35, highlights: ['Dashashwamedh Ghat', 'Kashi Vishwanath', 'Sarnath'],
  },
  {
    id: 'kerala', city: 'Kochi', country: 'India', region: 'Kerala',
    coordinates: [76.2673, 9.9312], description: 'God\'s Own Country gateway',
    emoji: 'KC', tags: ['backwaters', 'nature', 'culture'],
    avgHotelCost: 55, highlights: ['Alleppey Backwaters', 'Munnar', 'Fort Kochi'],
  },
];

export const SINGAPORE_LOCATIONS: Location[] = [
  {
    id: 'sg-marina', city: 'Marina Bay', country: 'Singapore', region: 'Central',
    coordinates: [103.8554, 1.2834], description: 'Iconic skyline and Gardens by the Bay',
    emoji: 'MR', tags: ['iconic', 'luxury', 'views'],
    avgHotelCost: 180, highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'ArtScience Museum'],
  },
  {
    id: 'sg-sentosa', city: 'Sentosa Island', country: 'Singapore', region: 'South',
    coordinates: [103.8198, 1.2494], description: 'Resort island with Universal Studios',
    emoji: 'ST', tags: ['theme park', 'beach', 'resort'],
    avgHotelCost: 200, highlights: ['Universal Studios', 'S.E.A. Aquarium', 'Siloso Beach'],
  },
  {
    id: 'sg-chinatown', city: 'Chinatown', country: 'Singapore', region: 'Central',
    coordinates: [103.8444, 1.2838], description: 'Cultural heritage and street food',
    emoji: 'CT', tags: ['culture', 'food', 'heritage'],
    avgHotelCost: 120, highlights: ['Buddha Tooth Relic Temple', 'Maxwell Food Centre', 'Sri Mariamman Temple'],
  },
  {
    id: 'sg-orchard', city: 'Orchard Road', country: 'Singapore', region: 'Central',
    coordinates: [103.8321, 1.3048], description: 'Shopping paradise of Singapore',
    emoji: 'OR', tags: ['shopping', 'luxury', 'food'],
    avgHotelCost: 160, highlights: ['ION Orchard', 'Takashimaya', 'Emerald Hill'],
  },
  {
    id: 'sg-littleindia', city: 'Little India', country: 'Singapore', region: 'Central',
    coordinates: [103.8521, 1.3066], description: 'Vibrant Indian cultural district',
    emoji: 'LI', tags: ['culture', 'food', 'shopping'],
    avgHotelCost: 110, highlights: ['Sri Veeramakaliamman Temple', 'Mustafa Centre', 'Tekka Market'],
  },
  {
    id: 'sg-clarke', city: 'Clarke Quay', country: 'Singapore', region: 'Central',
    coordinates: [103.8462, 1.2905], description: 'Riverside nightlife and dining',
    emoji: 'CQ', tags: ['nightlife', 'dining', 'riverside'],
    avgHotelCost: 150, highlights: ['Riverside Walk', 'G-Max Bungee', 'Boat Quay'],
  },
  {
    id: 'sg-jewel', city: 'Jewel Changi', country: 'Singapore', region: 'East',
    coordinates: [103.9893, 1.3644], description: 'World\'s best airport experience',
    emoji: 'JC', tags: ['shopping', 'nature', 'iconic'],
    avgHotelCost: 140, highlights: ['HSBC Rain Vortex', 'Canopy Park', 'Forest Valley'],
  },
];

export const ALL_LOCATIONS = [...INDIA_LOCATIONS, ...SINGAPORE_LOCATIONS];
