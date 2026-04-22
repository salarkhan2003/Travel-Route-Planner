export interface PopularRoute {
  id: string;
  title: string;
  tagline: string;
  cities: string[];
  days: number;
  budget: number; // INR
  theme: string;
  color: string;
  image: string; // Hero image URL
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Evening_view_of_Varanasi_Ghats_from_the_Ganges.jpg/1280px-Evening_view_of_Varanasi_Ghats_from_the_Ganges.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Goa_beaches.jpg/1280px-Goa_beaches.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Marina_Bay_Sands_in_the_evening_%2820210109213032%29.jpg/1280px-Marina_Bay_Sands_in_the_evening_%2820210109213032%29.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Amer_fort_8.jpg/1280px-Amer_fort_8.jpg',
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
  {
    id: 'himalayan-highs',
    title: 'Himalayan Highs',
    tagline: 'Manali · Leh · Nubra Valley',
    cities: ['Manali', 'Leh', 'Pangong'],
    days: 12,
    budget: 45000,
    theme: 'Adventure',
    color: '#0288D1',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Pangong_Tso_2.jpg/1280px-Pangong_Tso_2.jpg',
    highlights: ['Rohtang Pass', 'Khardung La', 'Pangong Lake', 'Magnet Hill', 'Shanti Stupa'],
    itinerary: [
      { day: 1, city: 'Manali', activities: ['Arrive Manali', 'Hadimba Temple', 'Mall Road'], stay: 'Cottage Manali', transport: undefined },
      { day: 2, city: 'Manali', activities: ['Solang Valley', 'Vashisht hot springs'], stay: 'Cottage Manali' },
      { day: 3, city: 'Leh', activities: ['Drive to Leh', 'Sarchu stay'], stay: 'Camp Sarchu', transport: 'Road — 12h' },
      { day: 4, city: 'Leh', activities: ['Reach Leh', 'Rest for acclimatization'], stay: 'Hotel Leh' },
      { day: 5, city: 'Leh', activities: ['Shanti Stupa', 'Leh Palace', 'Market'], stay: 'Hotel Leh' },
      { day: 6, city: 'Leh', activities: ['Magnet Hill', 'Sangam point', 'Hall of Fame'], stay: 'Hotel Leh' },
      { day: 7, city: 'Nubra', activities: ['Khardung La pass', 'Diskit Monastery', 'Hunder dunes'], stay: 'Camp Nubra', transport: 'Road — 6h' },
      { day: 8, city: 'Pangong', activities: ['Shyok river drive', 'Pangong Lake sunset'], stay: 'Camp Pangong', transport: 'Road — 7h' },
      { day: 9, city: 'Leh', activities: ['Sunrise at lake', 'Return to Leh'], stay: 'Hotel Leh', transport: 'Road — 6h' },
      { day: 10, city: 'Leh', activities: ['Hemis Monastery', 'Thiksey Monastery'], stay: 'Hotel Leh' },
    ],
  },
  {
    id: 'singapore-gems',
    title: 'Singapore Gems',
    tagline: 'Little India · Sentosa · Marina Bay',
    cities: ['Singapore'],
    days: 4,
    budget: 35000,
    theme: 'City Lights',
    color: '#C2185B',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Singapore_Skyline_at_night_2012.jpg/1280px-Singapore_Skyline_at_night_2012.jpg',
    highlights: ['Spectra Water Show', 'Cloud Forest', 'Skyline Luge', 'Hawker Centres'],
    itinerary: [
      { day: 1, city: 'Singapore', activities: ['Jewel Changi', 'Little India walk', 'Mustafa Centre'], stay: 'Hotel Little India', transport: undefined },
      { day: 2, city: 'Singapore', activities: ['Gardens by the Bay', 'Marina Bay Sands', 'River Cruise'], stay: 'Hotel Little India' },
      { day: 3, city: 'Singapore', activities: ['Sentosa Island', 'Universal Studios'], stay: 'Hotel Little India' },
      { day: 4, city: 'Singapore', activities: ['Chinatown', 'Bugis Street shopping', 'Departure'], stay: '', transport: undefined },
    ],
  },
];
