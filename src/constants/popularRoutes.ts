export interface PopularRoute {
  id: string;
  title: string;
  tagline: string;
  cities: string[];
  days: number;
  budget: number; // INR
  theme: string;
  color: string;
  highlights: string[];
  itinerary: {
    day: number;
    city: string;
    activities: string[];
    stay: string;
    transport?: string;
  }[];
}

export const POPULAR_ROUTES: PopularRoute[] = [
  {
    id: 'golden-triangle',
    title: 'Golden Triangle',
    tagline: 'Delhi · Agra · Jaipur',
    cities: ['Delhi', 'Agra', 'Jaipur'],
    days: 7,
    budget: 18000,
    theme: 'Heritage',
    color: '#E65100',
    highlights: ['Taj Mahal at sunrise', 'Red Fort', 'Amber Fort', 'Qutub Minar', 'Hawa Mahal'],
    itinerary: [
      { day: 1, city: 'Delhi', activities: ['Arrive Delhi', 'Red Fort', 'Chandni Chowk street food'], stay: 'Hotel in Connaught Place', transport: undefined },
      { day: 2, city: 'Delhi', activities: ['Qutub Minar', 'India Gate', 'Humayun Tomb'], stay: 'Hotel in Connaught Place' },
      { day: 3, city: 'Agra', activities: ['Taj Mahal sunrise visit', 'Agra Fort'], stay: 'Hotel near Taj Mahal', transport: 'Gatimaan Express — 2h' },
      { day: 4, city: 'Agra', activities: ['Fatehpur Sikri day trip', 'Mehtab Bagh sunset'], stay: 'Hotel near Taj Mahal' },
      { day: 5, city: 'Jaipur', activities: ['Amber Fort', 'Jal Mahal'], stay: 'Heritage hotel Jaipur', transport: 'Road — 4h' },
      { day: 6, city: 'Jaipur', activities: ['City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Bazaar shopping'], stay: 'Heritage hotel Jaipur' },
      { day: 7, city: 'Delhi', activities: ['Return to Delhi', 'Departure'], stay: '', transport: 'Shatabdi Express — 4.5h' },
    ],
  },
  {
    id: 'spiritual-north',
    title: 'Spiritual North India',
    tagline: 'Ajmer · Pushkar · Varanasi',
    cities: ['Ajmer', 'Pushkar', 'Varanasi'],
    days: 6,
    budget: 12000,
    theme: 'Spiritual',
    color: '#6A1B9A',
    highlights: ['Ajmer Dargah', 'Pushkar Ghats', 'Ganga Aarti Varanasi', 'Sarnath'],
    itinerary: [
      { day: 1, city: 'Ajmer', activities: ['Dargah Sharif visit', 'Ana Sagar Lake'], stay: 'Budget hotel Ajmer', transport: undefined },
      { day: 2, city: 'Pushkar', activities: ['Pushkar Lake', 'Brahma Temple', 'Camel ride'], stay: 'Guesthouse Pushkar', transport: 'Road — 45 min' },
      { day: 3, city: 'Pushkar', activities: ['Sunrise at ghats', 'Local bazaar', 'Savitri Temple trek'], stay: 'Guesthouse Pushkar' },
      { day: 4, city: 'Varanasi', activities: ['Arrive Varanasi', 'Evening Ganga Aarti'], stay: 'Hotel near Ghats', transport: 'Train — 10h' },
      { day: 5, city: 'Varanasi', activities: ['Sunrise boat ride on Ganges', 'Kashi Vishwanath Temple', 'Sarnath'], stay: 'Hotel near Ghats' },
      { day: 6, city: 'Varanasi', activities: ['Morning ghats walk', 'Departure'], stay: '', transport: undefined },
    ],
  },
  {
    id: 'south-coastal',
    title: 'South Coastal Escape',
    tagline: 'Goa · Kochi · Munnar',
    cities: ['Goa', 'Kochi', 'Munnar'],
    days: 8,
    budget: 22000,
    theme: 'Beach & Nature',
    color: '#00838F',
    highlights: ['Baga Beach', 'Alleppey Backwaters', 'Munnar Tea Gardens', 'Fort Kochi'],
    itinerary: [
      { day: 1, city: 'Goa', activities: ['Arrive Goa', 'Baga Beach sunset'], stay: 'Beach resort North Goa', transport: undefined },
      { day: 2, city: 'Goa', activities: ['Old Goa churches', 'Dudhsagar Falls day trip'], stay: 'Beach resort North Goa' },
      { day: 3, city: 'Goa', activities: ['South Goa beaches', 'Palolem Beach'], stay: 'Beach resort North Goa' },
      { day: 4, city: 'Kochi', activities: ['Fort Kochi walk', 'Chinese fishing nets', 'Kathakali show'], stay: 'Heritage hotel Kochi', transport: 'Flight — 1h' },
      { day: 5, city: 'Kochi', activities: ['Alleppey backwater houseboat'], stay: 'Houseboat Alleppey', transport: 'Road — 1.5h' },
      { day: 6, city: 'Munnar', activities: ['Arrive Munnar', 'Tea museum', 'Eravikulam NP'], stay: 'Tea estate resort', transport: 'Road — 3h' },
      { day: 7, city: 'Munnar', activities: ['Top Station viewpoint', 'Mattupetty Dam', 'Tea garden walk'], stay: 'Tea estate resort' },
      { day: 8, city: 'Kochi', activities: ['Return Kochi', 'Departure'], stay: '', transport: 'Road — 3h' },
    ],
  },
  {
    id: 'india-singapore',
    title: 'India to Singapore',
    tagline: 'Delhi · Mumbai · Singapore',
    cities: ['Delhi', 'Mumbai', 'Singapore'],
    days: 10,
    budget: 65000,
    theme: 'International',
    color: '#1565C0',
    highlights: ['India Gate', 'Gateway of India', 'Marina Bay Sands', 'Sentosa Island', 'Little India SG'],
    itinerary: [
      { day: 1, city: 'Delhi', activities: ['Arrive Delhi', 'India Gate', 'Connaught Place'], stay: 'Hotel Delhi', transport: undefined },
      { day: 2, city: 'Delhi', activities: ['Red Fort', 'Humayun Tomb', 'Chandni Chowk'], stay: 'Hotel Delhi' },
      { day: 3, city: 'Mumbai', activities: ['Arrive Mumbai', 'Gateway of India', 'Marine Drive'], stay: 'Hotel Mumbai', transport: 'Flight — 2h' },
      { day: 4, city: 'Mumbai', activities: ['Elephanta Caves', 'Dharavi tour', 'Bandra'], stay: 'Hotel Mumbai' },
      { day: 5, city: 'Singapore', activities: ['Arrive Singapore', 'Jewel Changi', 'Orchard Road'], stay: 'Hotel Marina Bay', transport: 'Flight — 5.5h' },
      { day: 6, city: 'Singapore', activities: ['Marina Bay Sands', 'Gardens by the Bay', 'ArtScience Museum'], stay: 'Hotel Marina Bay' },
      { day: 7, city: 'Singapore', activities: ['Sentosa Island', 'Universal Studios'], stay: 'Hotel Marina Bay' },
      { day: 8, city: 'Singapore', activities: ['Little India', 'Chinatown', 'Clarke Quay'], stay: 'Hotel Marina Bay' },
      { day: 9, city: 'Singapore', activities: ['Botanic Gardens', 'Hawker food tour', 'Night Safari'], stay: 'Hotel Marina Bay' },
      { day: 10, city: 'Singapore', activities: ['Shopping', 'Departure'], stay: '', transport: undefined },
    ],
  },
  {
    id: 'rajasthan-royal',
    title: 'Royal Rajasthan',
    tagline: 'Jaipur · Jodhpur · Udaipur',
    cities: ['Jaipur', 'Jodhpur', 'Udaipur'],
    days: 8,
    budget: 20000,
    theme: 'Heritage & Culture',
    color: '#BF360C',
    highlights: ['Amber Fort', 'Mehrangarh Fort', 'Lake Pichola', 'City Palace Udaipur'],
    itinerary: [
      { day: 1, city: 'Jaipur', activities: ['Arrive Jaipur', 'City Palace', 'Jantar Mantar'], stay: 'Heritage hotel Jaipur', transport: undefined },
      { day: 2, city: 'Jaipur', activities: ['Amber Fort', 'Hawa Mahal', 'Bazaar'], stay: 'Heritage hotel Jaipur' },
      { day: 3, city: 'Jodhpur', activities: ['Arrive Jodhpur', 'Mehrangarh Fort', 'Blue City walk'], stay: 'Hotel Jodhpur', transport: 'Train — 5h' },
      { day: 4, city: 'Jodhpur', activities: ['Umaid Bhawan Palace', 'Mandore Gardens', 'Sardar Market'], stay: 'Hotel Jodhpur' },
      { day: 5, city: 'Udaipur', activities: ['Arrive Udaipur', 'Lake Pichola boat ride', 'City Palace'], stay: 'Lake view hotel', transport: 'Road — 5h' },
      { day: 6, city: 'Udaipur', activities: ['Jagdish Temple', 'Saheliyon ki Bari', 'Fateh Sagar Lake'], stay: 'Lake view hotel' },
      { day: 7, city: 'Udaipur', activities: ['Monsoon Palace', 'Vintage Car Museum', 'Bagore ki Haveli'], stay: 'Lake view hotel' },
      { day: 8, city: 'Udaipur', activities: ['Morning lake walk', 'Departure'], stay: '', transport: undefined },
    ],
  },
];
