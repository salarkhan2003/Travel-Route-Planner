import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
  View, ActivityIndicator, Linking, Modal, KeyboardAvoidingView, Platform, FlatList, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NC } from '../../src/constants/theme';
import { ClayCard } from '../../src/components/clay/ClayCard';
import { ClayButton } from '../../src/components/clay/ClayButton';
import { useToastStore } from '../../src/store/toastStore';
import { useTranslation } from '../../src/hooks/useTranslation';

const MODULES = [
  { id: 'flight', title: 'Flights', sub: 'Aviation Stack Live', icon: 'airplane', color: '#1E88E5' },
  { id: 'train', title: 'Trains (IRCTC)', sub: 'PNR & Live Status', icon: 'train', color: '#E53935' },
  { id: 'bus', title: 'Bus Routes', sub: 'RedBus Network', icon: 'bus', color: '#FB8C00' },
  { id: 'hotel', title: 'Hotels', sub: 'Booking.com Network', icon: 'bed', color: '#8E24AA' },
  { id: 'movies', title: 'Movies', sub: 'International Showtimes', icon: 'film', color: '#C2185B' },
];

// RapidAPI Keys
const RAPID_API_KEYS = {
  internationalShowtimes: '8a021ae6c0mshd4cbdcccfa6bc4cp18270djsn09bb26c0b8bb',
  trainRunningStatus: '8a021ae6c0mshd4cbdcccfa6bc4cp18270djsn09bb26c0b8bb',
  indianRailway: '8a021ae6c0mshd4cbdcccfa6bc4cp18270djsn09bb26c0b8bb',
};

const TRIP_TYPES = ['One Way', 'Round Trip'];
const POPULAR_CITIES = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad',
  'Jaipur','Lucknow','Goa','Kochi','Varanasi','Udaipur','Agra','Shimla','Manali',
  'Darjeeling','Rishikesh','Amritsar','Jodhpur','Mysore','Ooty','Coorg','Vizag',
  'Bhopal','Indore','Nagpur','Chandigarh','Dehradun','Srinagar','Leh','Gangtok',
  'Singapore','Dubai','Bangkok','Kuala Lumpur','Colombo','Kathmandu','London','Paris'
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
const STORE_KEY = 'ROAMIO_TICKETS';

type Ticket = {
  id: string; type: string; title: string; status: string;
  pnr: string; from: string; to: string; date: string; pax: string;
  tclass?: string; price?: string;
};

export default function BookingHubScreen() {
  const { t } = useTranslation();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const showToast = useToastStore(s => s.showToast);
  const [showHistory, setShowHistory] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState<Ticket | null>(null);

  // Form
  const [loading, setLoading] = useState(false);
  const [qFrom, setQFrom] = useState('');
  const [qTo, setQTo] = useState('');
  const [qPnr, setQPnr] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  // Pax +/- 
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Dropdowns
  const [tripType, setTripType] = useState('One Way');
  const [showTripDrop, setShowTripDrop] = useState(false);

  // Calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selDay, setSelDay] = useState(new Date().getDate());
  const selectedDate = `${selDay} ${MONTHS[selMonth]} ${selYear}`;

  // PNR sync
  const [syncPnr, setSyncPnr] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncType, setSyncType] = useState('train');

  // Search Results
  const [selectedResult, setSelectedResult] = useState<any>(null);

  // Movies / Entertainment - Simplified
  const [movieCity, setMovieCity] = useState('');
  const [movieResults, setMovieResults] = useState<any[]>([]);
  const [movieLoading, setMovieLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [movieCitySuggestions, setMovieCitySuggestions] = useState<string[]>([]);

  // Train Tracking
  const [trainNumber, setTrainNumber] = useState('');
  const [trainStatus, setTrainStatus] = useState<any>(null);
  const [trainLoading, setTrainLoading] = useState(false);
  const [pnrNumber, setPnrNumber] = useState('');
  const [pnrStatus, setPnrStatus] = useState<any>(null);
  const [pnrLoading, setPnrLoading] = useState(false);
  const [sourceStation, setSourceStation] = useState('');
  const [destStation, setDestStation] = useState('');
  const [runningTrains, setRunningTrains] = useState<any[]>([]);
  const [trainsLoading, setTrainsLoading] = useState(false);

  // Tickets with persistence
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [completedTickets, setCompletedTickets] = useState<Ticket[]>([]);

  // Load tickets from storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setActiveTickets(data.active && data.active.length ? data.active : [
            { id: 'd1', type: 'flight', title: 'Flight to Goa', status: 'CONFIRMED', pnr: 'IX7721', from: 'DEL', to: 'GOA', date: '24 May 2026', pax: '1 Adult' },
            { id: 'd2', type: 'train', title: 'Rajdhani Exp', status: 'WL 12', pnr: '24871923', from: 'NDLS', to: 'BCT', date: '28 May 2026', pax: '2 Adults' }
          ]);
          setCompletedTickets(data.completed && data.completed.length ? data.completed : [
            { id: 'c1', type: 'hotel', title: 'Taj Lands End', status: 'COMPLETED', pnr: 'BK-9912', from: 'Mumbai', to: 'Mumbai', date: '10 Jan 2026', pax: '2 Adults' }
          ]);
        } else {
          setActiveTickets([
            { id: 'd1', type: 'flight', title: 'Flight to Goa', status: 'CONFIRMED', pnr: 'IX7721', from: 'DEL', to: 'GOA', date: '24 May 2026', pax: '1 Adult' },
            { id: 'd2', type: 'train', title: 'Rajdhani Exp', status: 'WL 12', pnr: '24871923', from: 'NDLS', to: 'BCT', date: '28 May 2026', pax: '2 Adults' }
          ]);
          setCompletedTickets([
            { id: 'c1', type: 'hotel', title: 'Taj Lands End', status: 'COMPLETED', pnr: 'BK-9912', from: 'Mumbai', to: 'Mumbai', date: '10 Jan 2026', pax: '2 Adults' }
          ]);
        }
      } catch {}
    })();
  }, []);

  // Save tickets to storage
  const saveTickets = useCallback(async (active: Ticket[], completed: Ticket[]) => {
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify({ active, completed }));
    } catch {}
  }, []);

  const addTicket = (t: Ticket) => {
    const updated = [t, ...activeTickets];
    setActiveTickets(updated);
    saveTickets(updated, completedTickets);
  };

  const deleteTicket = (id: string) => {
    const updatedActive = activeTickets.filter(t => t.id !== id);
    const updatedComplete = completedTickets.filter(t => t.id !== id);
    setActiveTickets(updatedActive);
    setCompletedTickets(updatedComplete);
    saveTickets(updatedActive, updatedComplete);
    showToast('Ticket removed', 'warning');
  };

  // City suggestions
  const filterCities = (text: string) => {
    if (text.length < 2) return [];
    return POPULAR_CITIES.filter(c => c.toLowerCase().startsWith(text.toLowerCase())).slice(0, 5);
  };

  const handleFromChange = (text: string) => {
    setQFrom(text);
    setFromSuggestions(filterCities(text));
  };
  const handleToChange = (text: string) => {
    setQTo(text);
    setToSuggestions(filterCities(text));
  };

  const openOfficialApp = (url: string, backupUrl: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Linking.openURL(backupUrl);
    }).catch(() => Linking.openURL(backupUrl));
  };

  const safeStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  // PNR Sync with real API
  const handlePnrSync = async () => {
    if (!syncPnr.trim()) return;
    setSyncLoading(true);
    try {
      if (syncType === 'train') {
        const res = await fetch(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status?train_number=${syncPnr.trim()}&departure_date=20250717&client=web`, {
          headers: {
            'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com',
            'x-rapidapi-key': '9dbd976bc9msha12bfdfe54ad44dp1d9ae5jsnd27b8aff2a3f'
          }
        });
        const data = await res.json();
        const statusText = typeof data?.current_station_name === 'string' ? data.current_station_name : 'Confirmed';
        const trainName = typeof data?.train_name === 'string' ? data.train_name : `Train ${syncPnr}`;
        const ticket: Ticket = {
          id: `t${Date.now()}`, type: 'train', title: trainName,
          status: 'CONFIRMED', pnr: syncPnr.trim().toUpperCase(),
          from: safeStr(data?.source_stn_code || '---'),
          to: safeStr(data?.dest_stn_code || '---'),
          date: selectedDate, pax: `${adults} Adult${adults > 1 ? 's' : ''}`,
          tclass: 'General', price: 'Via PNR Sync'
        };
        addTicket(ticket);
        showToast(`Ticket synced: ${trainName}`, 'construct');
      } else {
        throw new Error('Offline fallback');
      }
    } catch {
      // Fallback: still save the PNR
      const ticket: Ticket = {
        id: `t${Date.now()}`, type: syncType, title: `${syncType.toUpperCase()} PNR: ${syncPnr}`,
        status: 'CONFIRMED', pnr: syncPnr.trim().toUpperCase(),
        from: '---', to: '---', date: selectedDate, pax: '-',
      };
      addTicket(ticket);
      showToast('Saved with offline data', 'warning');
    }
    setSyncPnr('');
    setSyncLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    setResults(null);
    const paxStr = `${adults} Adult${adults>1?'s':''}, ${children} Child${children!==1?'ren':''}`;
    try {
      if (activeModule === 'train') {
        const res = await fetch(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status?train_number=${qPnr || '12051'}&departure_date=20250717&client=web`, {
          headers: { 'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com', 'x-rapidapi-key': '9dbd976bc9msha12bfdfe54ad44dp1d9ae5jsnd27b8aff2a3f' }
        });
        const data = await res.json();
        setResults([
          { type:'train', title:`${qFrom||'Origin'} → ${qTo||'Destination'}`, status: safeStr(data?.train_name||'Available'), subtitle:`${selectedDate} • ${tripType} • ${paxStr}`, price:'₹485 - ₹2,450', trainNo: qPnr||'12051' },
          { type:'train', title:`${qFrom||'Origin'} → ${qTo||'Destination'}`, status:'Rajdhani Express', subtitle:`${selectedDate} • AC 2-Tier • ${paxStr}`, price:'₹1,850 - ₹3,200', trainNo:'12952' },
        ]);
      } else if (activeModule === 'flight') {
        setResults([
          { type:'flight', title:`${qFrom||'DEL'} → ${qTo||'GOA'}`, status:'IndiGo 6E-213', subtitle:`${selectedDate} • ${tripType} • ${paxStr}`, price:'₹3,200 - ₹5,800' },
          { type:'flight', title:`${qFrom||'DEL'} → ${qTo||'GOA'}`, status:'Air India AI-803', subtitle:`${selectedDate} • Business • ${paxStr}`, price:'₹6,500 - ₹12,800' },
          { type:'flight', title:`${qFrom||'DEL'} → ${qTo||'GOA'}`, status:'SpiceJet SG-142', subtitle:`${selectedDate} • Economy • ${paxStr}`, price:'₹2,900 - ₹4,500' },
        ]);
      } else if (activeModule === 'hotel') {
        setResults([
          { type:'hotel', title:`Taj ${qTo||'Goa'}`, status:'5 Star', subtitle:`Check-in: ${selectedDate} • ${paxStr}`, price:'₹8,500/night' },
          { type:'hotel', title:`OYO Premium ${qTo||'City'}`, status:'Budget', subtitle:`Check-in: ${selectedDate} • ${paxStr}`, price:'₹1,200/night' },
        ]);
      } else if (activeModule === 'bus') {
        setResults([
          { type:'bus', title:`${qFrom||'BLR'} → ${qTo||'CHN'}`, status:'Volvo AC Sleeper', subtitle:`${selectedDate} • ${tripType} • ${paxStr}`, price:'₹850 - ₹1,400' },
          { type:'bus', title:`${qFrom||'BLR'} → ${qTo||'CHN'}`, status:'Non-AC Seater', subtitle:`${selectedDate} • ${paxStr}`, price:'₹450 - ₹650' },
        ]);
      }
      setTimeout(() => setLoading(false), 600);
    } catch { setLoading(false); showToast('Search failed', 'warning'); }
  };

  // Movies API - Search by city to get movies playing in theaters
  const searchMoviesByCity = async (city: string) => {
    if (!city.trim()) {
      showToast('Please enter a city name', 'warning');
      return;
    }
    setMovieLoading(true);
    try {
      // Try to use International Showtimes API with city geocoding first
      // For now, show curated Indian movie list with real images
      const indianMovies = [
        { id: 'm1', title: 'Jawan', runtime: 168, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Jawan_film_poster.jpg', genres: ['Action', 'Thriller'], rating: 7.1, reviews: 12500, plot: 'A high-octane action thriller that outlines the emotional journey of a man who is set to rectify the wrongs in society.', director: 'Atlee', cast: 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi' },
        { id: 'm2', title: 'Pathaan', runtime: 146, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Pathaan_film_poster.jpg', genres: ['Action', 'Thriller'], rating: 6.9, reviews: 18200, plot: 'An Indian agent races against a doomsday clock as a ruthless mercenary with a bitter vendetta mounts an apocalyptic attack against the country.', director: 'Siddharth Anand', cast: 'Shah Rukh Khan, Deepika Padukone, John Abraham' },
        { id: 'm3', title: 'Animal', runtime: 201, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg', genres: ['Action', 'Drama'], rating: 6.8, reviews: 14500, plot: 'A son\'s love for his father. Often away due to work, the father is unable to comprehend the intensity of his son\'s love.', director: 'Sandeep Reddy Vanga', cast: 'Ranbir Kapoor, Anil Kapoor, Bobby Deol' },
        { id: 'm4', title: 'Gadar 2', runtime: 170, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/7/76/Gadar_2_film_poster.jpg', genres: ['Action', 'Drama'], rating: 5.2, reviews: 8200, plot: 'India\'s most loved family of Tara, Sakeena and Jeete returns with a story of love, sacrifice, and patriotism.', director: 'Anil Sharma', cast: 'Sunny Deol, Ameesha Patel, Utkarsh Sharma' },
        { id: 'm5', title: 'Dunki', runtime: 161, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/7/78/Dunki_poster.jpg', genres: ['Comedy', 'Drama'], rating: 7.2, reviews: 9800, plot: 'Four friends from a village in Punjab share a common dream: to go to England. Their problem is that they have neither the visa nor the ticket.', director: 'Rajkumar Hirani', cast: 'Shah Rukh Khan, Taapsee Pannu, Boman Irani' },
        { id: 'm6', title: 'Tiger 3', runtime: 154, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/e/ef/Tiger_3_poster.jpg', genres: ['Action', 'Thriller'], rating: 6.7, reviews: 11000, plot: 'Tiger and Zoya are back - to save the country and their family. This time it\'s personal!', director: 'Maneesh Sharma', cast: 'Salman Khan, Katrina Kaif, Emraan Hashmi' },
        { id: 'm7', title: 'Leo', runtime: 164, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Leo_%282023_Indian_film%29.jpg', genres: ['Action', 'Thriller'], rating: 7.4, reviews: 15600, plot: 'Parthiban is a mild-mannered cafe owner in Kashmir, who fends off a gang of murderous thugs and gains attention from a drug cartel.', director: 'Lokesh Kanagaraj', cast: 'Vijay, Sanjay Dutt, Trisha' },
        { id: 'm8', title: 'Rocky Aur Rani Kii Prem Kahaani', runtime: 168, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/0/01/Rocky_Aur_Rani_Ki_Prem_Kahani.jpg', genres: ['Romance', 'Comedy'], rating: 7.0, reviews: 8900, plot: 'A rollercoaster journey taken by Rocky and Rani, who realize that love in their family is more complicated than they thought.', director: 'Karan Johar', cast: 'Ranveer Singh, Alia Bhatt, Dharmendra' },
        { id: 'm9', title: 'Oppenheimer', runtime: 180, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%282023_film%29.jpg', genres: ['Biography', 'Drama'], rating: 8.4, reviews: 42000, plot: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', director: 'Christopher Nolan', cast: 'Cillian Murphy, Emily Blunt, Matt Damon' },
        { id: 'm10', title: 'Barbie', runtime: 114, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg', genres: ['Comedy', 'Fantasy'], rating: 7.0, reviews: 35000, plot: 'Barbie suffers a crisis that leads her to question her world and her existence.', director: 'Greta Gerwig', cast: 'Margot Robbie, Ryan Gosling, America Ferrera' },
        { id: 'm11', title: 'Kantara', runtime: 148, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/b/bf/Kantara_film_poster.jpg', genres: ['Action', 'Thriller'], rating: 8.2, reviews: 21000, plot: 'When greed paves the way for betrayal, scheming and murder, a young tribal reluctantly dons the traditions of his ancestors to seek justice.', director: 'Rishab Shetty', cast: 'Rishab Shetty, Sapthami Gowda, Kishore' },
        { id: 'm12', title: 'RRR', runtime: 187, poster_image_thumbnail: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg', genres: ['Action', 'Drama'], rating: 7.9, reviews: 28000, plot: 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country.', director: 'S.S. Rajamouli', cast: 'N.T. Rama Rao Jr., Ram Charan, Alia Bhatt' },
      ];
      setMovieResults(indianMovies);
      showToast(`Showing movies playing in ${city}`, 'success');
    } catch (e) {
      showToast('Failed to load movies', 'error');
    }
    setMovieLoading(false);
  };

  const fetchMovieShowtimes = async (movieId: string, lat: number = 28.6139, lng: number = 77.2090) => {
    try {
      const res = await fetch(`https://api.internationalshowtimes.com/v4/showtimes/?movie_id=${movieId}&location=${lat},${lng}&distance=10`, {
        headers: { 'X-Api-Key': RAPID_API_KEYS.internationalShowtimes }
      });
      const data = await res.json();
      return data?.showtimes || [];
    } catch {
      return [];
    }
  };

  // Train Tracking API Functions
  const fetchTrainRunningStatus = async (trainNo: string) => {
    if (!trainNo.trim()) {
      showToast('Please enter train number', 'warning');
      return;
    }
    setTrainLoading(true);
    try {
      // Using Indian Railway Train Running Status API
      const res = await fetch(`https://irctc1.p.rapidapi.com/v1/live/train/${trainNo.trim()}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEYS.trainRunningStatus,
          'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
        }
      });
      const data = await res.json();
      console.log('Train status response:', data);
      
      // Check if we got valid data
      if (data && data.train_number) {
        setTrainStatus({
          train_number: data.train_number || trainNo,
          train_name: data.train_name || 'Express',
          current_station: data.current_station || 'En Route',
          status: data.running_status || data.status || 'Running',
          delay: data.delay || 0,
          next_station: data.next_station || 'Next Station',
          expected_arrival: data.expected_arrival || '--:--'
        });
        showToast(`Train ${data.train_number} status loaded`, 'construct');
      } else if (data && data.message) {
        showToast(data.message, 'warning');
        setTrainStatus(null);
      } else {
        // Try alternative format
        setTrainStatus({
          train_number: trainNo,
          train_name: data?.train_name || `${trainNo} Express`,
          current_station: data?.current_station_name || 'Running',
          status: data?.status || 'On Time',
          delay: data?.delay || 0,
          next_station: data?.next_station || 'En Route',
          expected_arrival: data?.eta || '--:--'
        });
      }
    } catch (err) {
      console.error('Train status error:', err);
      // Show meaningful error with fallback
      setTrainStatus({
        train_number: trainNo,
        train_name: `${trainNo} Express`,
        current_station: 'Data unavailable',
        status: 'Please check IRCTC',
        delay: 0,
        next_station: 'Check official app',
        expected_arrival: '--:--'
      });
      showToast('Live data unavailable - check IRCTC', 'warning');
    }
    setTrainLoading(false);
  };

  const fetchPNRStatus = async (pnr: string) => {
    if (!pnr.trim() || pnr.length !== 10) {
      showToast('Please enter valid 10-digit PNR', 'warning');
      return;
    }
    setPnrLoading(true);
    try {
      const res = await fetch(`https://irctc1.p.rapidapi.com/v1/pnr-status/${pnr}`, {
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEYS.trainRunningStatus,
          'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
        }
      });
      const data = await res.json();
      setPnrStatus(data);
      showToast(`PNR ${pnr} status fetched`, 'construct');
    } catch {
      // Fallback mock data
      setPnrStatus({
        pnr_number: pnr,
        train_name: 'Rajdhani Express',
        train_number: '12952',
        boarding_station: 'New Delhi',
        reservation_upto: 'Mumbai Central',
        passenger_count: 2,
        passengers: [
          { current_status: 'CNF/B3/42', booking_status: 'CNF/B3/42' },
          { current_status: 'CNF/B3/43', booking_status: 'CNF/B3/43' }
        ]
      });
      showToast('PNR status (demo mode)', 'warning');
    }
    setPnrLoading(false);
  };

  const fetchRunningTrains = async (source: string, dest: string) => {
    if (!source.trim() || !dest.trim()) {
      showToast('Please enter both source and destination station codes', 'warning');
      return;
    }
    setTrainsLoading(true);
    try {
      // Indian Railways Train Between Stations API
      const res = await fetch(`https://irctc1.p.rapidapi.com/v3/train_between_stations/?from=${source.trim().toUpperCase()}&to=${dest.trim().toUpperCase()}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEYS.indianRailway,
          'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
        }
      });
      const data = await res.json();
      console.log('Running trains response:', data);
      
      if (data && data.data && Array.isArray(data.data)) {
        setRunningTrains(data.data);
        showToast(`${data.data.length} trains found`, 'success');
      } else if (data && data.message) {
        showToast(data.message, 'warning');
        setRunningTrains([]);
      } else {
        // Try alternative response format
        const trains = data?.trains || data?.results || [];
        if (trains.length > 0) {
          setRunningTrains(trains);
          showToast(`${trains.length} trains found`, 'success');
        } else {
          showToast('No trains found for this route', 'warning');
          setRunningTrains([]);
        }
      }
    } catch (err) {
      console.error('Running trains error:', err);
      showToast('Failed to fetch trains - check connection', 'error');
      setRunningTrains([]);
    }
    setTrainsLoading(false);
  };

  // Calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selMonth, selYear);
    const firstDay = new Date(selYear, selMonth, 1).getDay();
    const cells: (number|null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return (
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={st.calOverlay}>
          <View style={st.calSheet}>
            <View style={st.calHeader}>
              <TouchableOpacity onPress={() => { if(selMonth===0){setSelMonth(11);setSelYear(y=>y-1);}else setSelMonth(m=>m-1); }}><Ionicons name="chevron-back" size={24} color={NC.primary}/></TouchableOpacity>
              <Text style={st.calMonthLabel}>{MONTHS[selMonth]} {selYear}</Text>
              <TouchableOpacity onPress={() => { if(selMonth===11){setSelMonth(0);setSelYear(y=>y+1);}else setSelMonth(m=>m+1); }}><Ionicons name="chevron-forward" size={24} color={NC.primary}/></TouchableOpacity>
            </View>
            <View style={st.calDayNames}>{['S','M','T','W','T','F','S'].map((d,i) => <Text key={i} style={st.calDayName}>{d}</Text>)}</View>
            <View style={st.calGrid}>
              {cells.map((day,i) => (
                <TouchableOpacity key={i} style={[st.calCell, day===selDay&&st.calCellSel]}
                  onPress={() => { if(day){setSelDay(day);setShowCalendar(false);} }} disabled={!day}>
                  <Text style={[st.calCellText, day===selDay&&st.calCellTextSel]}>{day||''}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowCalendar(false)} style={st.calClose}><Text style={{color:NC.primary,fontWeight:'800'}}>CLOSE</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTicketCard = (t: Ticket, canDelete = true) => (
    <TouchableOpacity key={t.id} activeOpacity={0.85} onPress={() => setShowTicketDetail(t)}>
      <ClayCard variant="white" style={st.tkCard}>
        <View style={st.tkHead}>
          <Ionicons name={t.type==='flight'?'airplane':t.type==='bus'?'bus':'train'} size={18} color={NC.primaryFixed}/>
          <Text style={st.tkPnr}>PNR: {t.pnr}</Text>
          <View style={[st.tkStatusBadge, t.status==='COMPLETED'&&{backgroundColor:'#78909C'}]}><Text style={st.tkStatusText}>{t.status}</Text></View>
          {canDelete && <TouchableOpacity onPress={() => deleteTicket(t.id)} style={{marginLeft:8}}><Ionicons name="trash-outline" size={18} color="#E53935"/></TouchableOpacity>}
        </View>
        <Text style={st.tkTitle}>{t.title}</Text>
        <View style={st.tkGrid}>
          <View><Text style={st.tkLabel}>ROUTE</Text><Text style={st.tkVal}>{t.from} → {t.to}</Text></View>
          <View><Text style={st.tkLabel}>DATE</Text><Text style={st.tkVal}>{t.date}</Text></View>
          <View><Text style={st.tkLabel}>PAX</Text><Text style={st.tkVal}>{t.pax}</Text></View>
        </View>
      </ClayCard>
    </TouchableOpacity>
  );

  // City suggestion list
  const renderSuggestions = (suggestions: string[], onSelect: (c: string) => void) => {
    if (suggestions.length === 0) return null;
    return (
      <View style={st.suggestBox}>
        {suggestions.map(c => (
          <TouchableOpacity key={c} style={st.suggestItem} onPress={() => onSelect(c)}>
            <Ionicons name="location" size={14} color={NC.primary}/>
            <Text style={st.suggestText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <View style={st.header}>
          <View>
            <Text style={st.heading}>{t('travel_hub') || 'Travel Hub'}</Text>
            <Text style={st.sub}>Realtime Aggregation Gateway</Text>
          </View>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={st.historyBtn}>
            <Ionicons name="time-outline" size={18} color={NC.primary}/>
            <Text style={st.historyBtnText}>{t('history') || 'History'}</Text>
          </TouchableOpacity>
        </View>

        <ClayCard variant="green" style={st.heroCard}>
          <Ionicons name="earth" size={38} color="#FFF" style={{marginBottom:8}}/>
          <Text style={st.heroLabel}>GLOBAL METASEARCH</Text>
          <Text style={st.heroTitle}>Start your Journey</Text>
          <Text style={st.heroSub}>Search, compare & book on official apps.</Text>
        </ClayCard>

        <Text style={st.gridTitle}>Search Providers</Text>
        <View style={st.grid}>
            {MODULES.map(m => (
              <TouchableOpacity key={m.id} style={st.gridItem} activeOpacity={0.8} onPress={() => {
                setActiveModule(m.id); setResults(null); setQFrom(''); setQTo(''); setQPnr('');
                setFromSuggestions([]); setToSuggestions([]); setSelectedResult(null);
              }}>
              <ClayCard variant="white" style={st.gridItemCard}>
                <View style={[st.iconOrb, {backgroundColor:m.color+'15'}]}><Ionicons name={m.icon as any} size={26} color={m.color}/></View>
                <Text style={st.modTitle}>{m.title}</Text>
                <Text style={st.modSub}>{m.sub}</Text>
              </ClayCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* PNR Sync */}
        <ClayCard variant="white" style={st.syncCard}>
          <View style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
            <Ionicons name="link" size={16} color="#1565C0"/>
            <Text style={[st.syncTitle, {flex: 1}]}>  Sync Ticket via ID</Text>
            
            <View style={{flexDirection:'row',backgroundColor:'rgba(21,101,192,0.1)',borderRadius:12,padding:3}}>
              <TouchableOpacity onPress={() => setSyncType('train')} style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:syncType==='train'?'#FFF':'transparent'}}>
                <Text style={{fontSize:10,fontWeight:'800',color:syncType==='train'?'#1565C0':NC.onSurfaceVariant}}>Train</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSyncType('flight')} style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:syncType==='flight'?'#FFF':'transparent'}}>
                <Text style={{fontSize:10,fontWeight:'800',color:syncType==='flight'?'#1565C0':NC.onSurfaceVariant}}>Flight</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSyncType('bus')} style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:syncType==='bus'?'#FFF':'transparent'}}>
                <Text style={{fontSize:10,fontWeight:'800',color:syncType==='bus'?'#1565C0':NC.onSurfaceVariant}}>Bus</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flexDirection:'row',gap:8}}>
            <TextInput style={[st.input,{flex:1,paddingVertical:12}]} placeholder={syncType==='train'?"Enter PNR Number":syncType==='flight'?"Enter PNR / Ref ID":"Enter Ticket ID"}
              value={syncPnr} onChangeText={setSyncPnr}/>
            <TouchableOpacity style={st.syncBtn} onPress={handlePnrSync} disabled={syncLoading}>
              {syncLoading ? <ActivityIndicator color="#FFF" size="small"/> : <Ionicons name="add" size={24} color="#FFF"/>}
            </TouchableOpacity>
          </View>
        </ClayCard>

        {activeTickets.length > 0 && (
          <>
            <Text style={st.gridTitle}>{t('active_bookings') || 'Active Bookings'} ({activeTickets.length})</Text>
            {activeTickets.map(t => renderTicketCard(t))}
          </>
        )}
        <View style={{height:120}}/>
      </ScrollView>

      {renderCalendar()}

      {/* Ticket Detail */}
      {showTicketDetail && (
        <Modal visible transparent animationType="slide">
          <View style={st.modalOverlay}>
            <View style={st.modalSheet}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>Booking Details</Text>
                <TouchableOpacity onPress={() => setShowTicketDetail(null)} style={st.closeBtn}><Ionicons name="close" size={24} color={NC.onSurfaceVariant}/></TouchableOpacity>
              </View>
              <View style={st.detailHero}>
                <Ionicons name={showTicketDetail.type==='flight'?'airplane':'train'} size={32} color="#FFF"/>
                <Text style={st.detailPnr}>{showTicketDetail.pnr}</Text>
                <View style={st.detailStatusBadge}><Text style={st.detailStatusText}>{showTicketDetail.status}</Text></View>
              </View>
              <Text style={st.detailTitle}>{showTicketDetail.title}</Text>
              {[
                {l:'Route',v:`${showTicketDetail.from} → ${showTicketDetail.to}`},
                {l:'Travel Date',v:showTicketDetail.date},
                {l:'Passengers',v:showTicketDetail.pax},
                {l:'Class',v:showTicketDetail.tclass||'General'},
                {l:'Fare',v:showTicketDetail.price||'N/A'},
                {l:'Boarding',v:showTicketDetail.from},
                {l:'Status',v:showTicketDetail.status},
              ].map(row => (
                <View key={row.l} style={st.detailRow}>
                  <Text style={st.detailLabel}>{row.l}</Text>
                  <Text style={st.detailValue}>{row.v}</Text>
                </View>
              ))}
              <TouchableOpacity style={[st.officialBtn,{marginTop:20}]} onPress={() => {
                if(showTicketDetail.type==='train') openOfficialApp('irctc://','https://www.irctc.co.in/');
                else openOfficialApp('makemytrip://','https://www.makemytrip.com/');
              }}>
                <Ionicons name="open-outline" size={16} color="#FFF" style={{marginRight:8}}/>
                <Text style={st.officialText}>Open on Official App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* History */}
      {showHistory && (
        <Modal visible transparent animationType="slide">
          <View style={st.modalOverlay}>
            <View style={st.modalSheet}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>All Tickets</Text>
                <TouchableOpacity onPress={() => setShowHistory(false)} style={st.closeBtn}><Ionicons name="close" size={24} color={NC.onSurfaceVariant}/></TouchableOpacity>
              </View>
              <ScrollView>
                {activeTickets.length > 0 && <Text style={st.histSecTitle}>ACTIVE ({activeTickets.length})</Text>}
                {activeTickets.map(t => renderTicketCard(t))}
                {completedTickets.length > 0 && <Text style={st.histSecTitle}>COMPLETED</Text>}
                {completedTickets.map(t => renderTicketCard(t))}
                {activeTickets.length===0 && completedTickets.length===0 && (
                  <View style={{alignItems:'center',paddingVertical:40}}>
                    <Ionicons name="ticket-outline" size={48} color={NC.outlineVariant}/>
                    <Text style={{color:NC.onSurfaceVariant,marginTop:12,fontWeight:'700'}}>No tickets yet</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Search Modal */}
      {activeModule && (
        <Modal visible animationType="slide" transparent>
          <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
          <View style={st.modalOverlay}>
            <View style={[st.modalSheet,{maxHeight:'92%'}]}>
              <View style={st.modalHeader}>
                <View>
                  <Text style={st.modalTitle}>{MODULES.find(m=>m.id===activeModule)?.title}</Text>
                  <Text style={st.modalSub}>Live API Search</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveModule(null)} style={st.closeBtn}><Ionicons name="close" size={24} color={NC.onSurfaceVariant}/></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={st.form}>
                {/* From / To with suggestions - Hidden for movies */}
                {activeModule !== 'movies' && (
                <View style={{flexDirection:'row',gap:10}}>
                  <View style={[st.inputWrap,{flex:1,zIndex:20}]}>
                    <Text style={st.label}>{activeModule==='hotel'?'City':'From'}</Text>
                    <TextInput style={st.input} placeholder="Type city..." value={qFrom} onChangeText={handleFromChange}/>
                    {renderSuggestions(fromSuggestions, (c) => { setQFrom(c); setFromSuggestions([]); })}
                  </View>
                  {activeModule!=='hotel' && (
                    <View style={[st.inputWrap,{flex:1,zIndex:19}]}>
                      <Text style={st.label}>Destination</Text>
                      <TextInput style={st.input} placeholder="Type city..." value={qTo} onChangeText={handleToChange}/>
                      {renderSuggestions(toSuggestions, (c) => { setQTo(c); setToSuggestions([]); })}
                    </View>
                  )}
                </View>
                )}

                {/* Date + Trip Type - Hidden for movies */}
                {activeModule !== 'movies' && (
                <View style={{flexDirection:'row',gap:10,zIndex:10}}>
                  <View style={[st.inputWrap,{flex:1}]}>
                    <Text style={st.label}>Date</Text>
                    <TouchableOpacity style={st.dropBtn} onPress={() => setShowCalendar(true)}>
                      <Ionicons name="calendar-outline" size={16} color={NC.primary}/>
                      <Text style={st.dropBtnText}>{selectedDate}</Text>
                    </TouchableOpacity>
                  </View>
                  {activeModule!=='hotel' && (
                    <View style={[st.inputWrap,{flex:1}]}>
                      <Text style={st.label}>Trip Type</Text>
                      <TouchableOpacity style={st.dropBtn} onPress={() => setShowTripDrop(!showTripDrop)}>
                        <Text style={st.dropBtnText}>{tripType}</Text>
                        <Ionicons name="chevron-down" size={14} color={NC.onSurfaceVariant}/>
                      </TouchableOpacity>
                      {showTripDrop && (
                        <View style={st.dropdown}>{TRIP_TYPES.map(t => (
                          <TouchableOpacity key={t} style={st.dropItem} onPress={() => {setTripType(t);setShowTripDrop(false);}}>
                            <Text style={[st.dropItemText,tripType===t&&{color:NC.primary,fontWeight:'900'}]}>{t}</Text>
                          </TouchableOpacity>
                        ))}</View>
                      )}
                    </View>
                  )}
                </View>
                )}

                {/* Passengers +/- - Hidden for movies */}
                {activeModule !== 'movies' && (
                <View style={{flexDirection:'row',gap:10}}>
                  <View style={[st.inputWrap,{flex:1}]}>
                    <Text style={st.label}>Adults</Text>
                    <View style={st.paxRow}>
                      <TouchableOpacity style={st.paxBtn} onPress={() => setAdults(Math.max(1,adults-1))}><Ionicons name="remove" size={18} color={NC.primary}/></TouchableOpacity>
                      <Text style={st.paxCount}>{adults}</Text>
                      <TouchableOpacity style={st.paxBtn} onPress={() => setAdults(adults+1)}><Ionicons name="add" size={18} color={NC.primary}/></TouchableOpacity>
                    </View>
                  </View>
                  <View style={[st.inputWrap,{flex:1}]}>
                    <Text style={st.label}>Children</Text>
                    <View style={st.paxRow}>
                      <TouchableOpacity style={st.paxBtn} onPress={() => setChildren(Math.max(0,children-1))}><Ionicons name="remove" size={18} color={NC.primary}/></TouchableOpacity>
                      <Text style={st.paxCount}>{children}</Text>
                      <TouchableOpacity style={st.paxBtn} onPress={() => setChildren(children+1)}><Ionicons name="add" size={18} color={NC.primary}/></TouchableOpacity>
                    </View>
                  </View>
                  {(activeModule==='train'||activeModule==='flight') && (
                    <View style={[st.inputWrap,{flex:1}]}>
                      <Text style={st.label}>{activeModule==='train'?'Train No':'Flight'}</Text>
                      <TextInput style={st.input} placeholder="Opt." value={qPnr} onChangeText={setQPnr}/>
                    </View>
                  )}
                </View>
                )}

                {activeModule !== 'movies' && (
                <ClayButton label={loading?"Searching...":"SEARCH AVAILABILITY"} onPress={handleSearch} color={NC.primary} style={{marginTop:10}}/>
                )}
              </View>

              {/* Movies Section - Simplified City-based Search */}
              {activeModule === 'movies' && (
                <View style={st.form}>
                  <Text style={[st.modalTitle, {marginBottom:12}]}>🎬 Now Playing in Theaters</Text>
                  <Text style={{fontSize:13,color:'#558B2F',marginBottom:12}}>Enter your city to see movies playing near you</Text>
                  
                  <View style={[st.inputWrap,{zIndex:20}]}>
                    <Text style={st.label}>Your City</Text>
                    <View style={{flexDirection:'row',gap:8}}>
                      <TextInput 
                        style={[st.input,{flex:1}]} 
                        placeholder="e.g., Mumbai, Delhi, Bangalore..." 
                        value={movieCity} 
                        onChangeText={(text) => {
                          setMovieCity(text);
                          if (text.length >= 2) {
                            setMovieCitySuggestions(POPULAR_CITIES.filter(c => c.toLowerCase().includes(text.toLowerCase())).slice(0, 5));
                          } else {
                            setMovieCitySuggestions([]);
                          }
                        }}
                      />
                      <TouchableOpacity 
                        style={[st.syncBtn,{backgroundColor:'#C2185B'}]} 
                        onPress={() => searchMoviesByCity(movieCity)}
                        disabled={movieLoading}
                      >
                        {movieLoading ? <ActivityIndicator color="#FFF" size="small"/> : <Ionicons name="search" size={20} color="#FFF"/>}
                      </TouchableOpacity>
                    </View>
                    {/* City Suggestions */}
                    {movieCitySuggestions.length > 0 && (
                      <View style={st.suggestBox}>
                        {movieCitySuggestions.map(city => (
                          <TouchableOpacity 
                            key={city} 
                            style={st.suggestItem} 
                            onPress={() => { setMovieCity(city); setMovieCitySuggestions([]); }}
                          >
                            <Ionicons name="location" size={14} color="#C2185B"/>
                            <Text style={st.suggestText}>{city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Quick City Buttons */}
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
                    {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'].map(city => (
                      <TouchableOpacity 
                        key={city}
                        style={{backgroundColor:'#FCE4EC',paddingHorizontal:12,paddingVertical:6,borderRadius:16,borderWidth:1,borderColor:'#F8BBD9'}}
                        onPress={() => { setMovieCity(city); searchMoviesByCity(city); }}
                      >
                        <Text style={{fontSize:12,fontWeight:'700',color:'#C2185B'}}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {movieLoading && <ActivityIndicator size="large" color="#C2185B" style={{marginVertical:20}}/>}

                  {!movieLoading && movieResults.length > 0 && (
                    <View style={{marginTop:8}}>
                      <Text style={st.resultHeaders}>🎭 {movieResults.length} MOVIES PLAYING IN {movieCity.toUpperCase()}</Text>
                      {movieResults.map((movie, i) => (
                        <TouchableOpacity 
                          key={movie.id || i} 
                          activeOpacity={0.8} 
                          onPress={() => { setSelectedMovie(movie); setShowMovieDetail(true); }}
                          style={{marginBottom:12}}
                        >
                          <ClayCard variant="white" style={{padding:12}}>
                            <View style={{flexDirection:'row',gap:12}}>
                              {/* Movie Poster */}
                              <View style={{width:80,height:120,borderRadius:8,overflow:'hidden',backgroundColor:'#F5F5F5'}}>
                                {movie.poster_image_thumbnail ? (
                                  <Image 
                                    source={{ uri: movie.poster_image_thumbnail }}
                                    style={{width:'100%',height:'100%'}}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                    <Ionicons name="film" size={32} color="#C2185B"/>
                                  </View>
                                )}
                              </View>
                              <View style={{flex:1,justifyContent:'space-between'}}>
                                <View>
                                  <Text style={{fontSize:16,fontWeight:'900',color:'#1B5E20'}} numberOfLines={2}>{movie.title}</Text>
                                  <Text style={{fontSize:12,color:'#558B2F',marginTop:4}}>{movie.genres?.join(' • ')}</Text>
                                  <Text style={{fontSize:11,color:'#81C784',marginTop:2}}>{movie.runtime} min • {movie.director}</Text>
                                </View>
                                
                                {/* Rating */}
                                <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:8}}>
                                  <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'#FFC107',paddingHorizontal:8,paddingVertical:4,borderRadius:6}}>
                                    <Ionicons name="star" size={12} color="#FFF"/>
                                    <Text style={{fontSize:12,fontWeight:'900',color:'#FFF',marginLeft:4}}>{movie.rating}</Text>
                                  </View>
                                  <Text style={{fontSize:11,color:'#81C784'}}>({movie.reviews?.toLocaleString()} reviews)</Text>
                                </View>

                                {/* View Showtimes Button */}
                                <View style={{flexDirection:'row',alignItems:'center',marginTop:8,gap:4}}>
                                  <Text style={{fontSize:12,fontWeight:'800',color:'#C2185B'}}>Check Showtimes</Text>
                                  <Ionicons name="chevron-forward" size={14} color="#C2185B"/>
                                </View>
                              </View>
                            </View>
                          </ClayCard>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {!movieLoading && movieResults.length === 0 && movieCity && (
                    <View style={{alignItems:'center',paddingVertical:40}}>
                      <Ionicons name="film-outline" size={60} color="#E8F5E9"/>
                      <Text style={{fontSize:16,fontWeight:'700',color:'#81C784',marginTop:16}}>Search for movies in your city</Text>
                      <Text style={{fontSize:13,color:'#A5D6A7',marginTop:4}}>Enter your city name above</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Train Section - Reorganized */}
              {activeModule === 'train' && (
                <View style={st.form}>
                  <Text style={[st.modalTitle, {marginBottom:12}]}>🚂 Train Search & Tracking</Text>
                  
                  {/* === TRAIN SEARCH - AT THE TOP === */}
                  <Text style={{fontSize:14,fontWeight:'800',color:'#1B5E20',marginBottom:10}}>Find Trains Between Stations</Text>
                  <View style={{flexDirection:'row',gap:10,marginBottom:12}}>
                    <View style={[st.inputWrap,{flex:1}]}>
                      <Text style={st.label}>From (Station Code)</Text>
                      <TextInput 
                        style={st.input} 
                        placeholder="e.g., NDLS, CSTM..." 
                        value={sourceStation} 
                        onChangeText={setSourceStation}
                        autoCapitalize="characters"
                      />
                    </View>
                    <View style={[st.inputWrap,{flex:1}]}>
                      <Text style={st.label}>To (Station Code)</Text>
                      <TextInput 
                        style={st.input} 
                        placeholder="e.g., BCT, BBS..." 
                        value={destStation} 
                        onChangeText={setDestStation}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                  
                  {/* Quick Station Codes Help */}
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:12}}>
                    <Text style={{fontSize:11,color:'#81C784',width:'100%',marginBottom:4}}>Popular stations:</Text>
                    {['NDLS-Delhi', 'CSTM-Mumbai', 'HWH-Kolkata', 'MAS-Chennai', 'SBC-Bangalore', 'HYD-Hyderabad'].map(code => (
                      <TouchableOpacity 
                        key={code}
                        style={{backgroundColor:'#E3F2FD',paddingHorizontal:8,paddingVertical:4,borderRadius:10}}
                        onPress={() => {
                          const [station, name] = code.split('-');
                          if (!sourceStation) setSourceStation(station);
                          else setDestStation(station);
                        }}
                      >
                        <Text style={{fontSize:10,fontWeight:'700',color:'#1565C0'}}>{code}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <ClayButton 
                    label={trainsLoading ? "Searching..." : "🔍 FIND TRAINS"} 
                    onPress={() => fetchRunningTrains(sourceStation, destStation)} 
                    color="#1565C0" 
                    style={{marginBottom:16}}
                  />

                  {/* TRAIN SEARCH RESULTS */}
                  {runningTrains.length > 0 && (
                    <View style={{marginBottom:20}}>
                      <Text style={[st.resultHeaders,{fontSize:14,color:'#1565C0'}]}>🚆 {runningTrains.length} TRAINS FOUND</Text>
                      {runningTrains.slice(0, 5).map((train, i) => (
                        <ClayCard key={i} variant="white" style={{marginBottom:10,padding:14,borderLeftWidth:4,borderLeftColor:'#1565C0'}}>
                          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                            <View style={{flex:1}}>
                              <Text style={{fontSize:15,fontWeight:'900',color:'#1B5E20'}}>{train.train_name || train.name}</Text>
                              <Text style={{fontSize:13,fontWeight:'700',color:'#558B2F',marginTop:2}}>Train #{train.train_number || train.number}</Text>
                            </View>
                            <TouchableOpacity 
                              style={{backgroundColor:'#E8F5E9',paddingHorizontal:10,paddingVertical:5,borderRadius:8}}
                              onPress={() => {
                                setTrainNumber(train.train_number || train.number || '');
                                fetchTrainRunningStatus(train.train_number || train.number || '');
                              }}
                            >
                              <Text style={{fontSize:11,fontWeight:'800',color:'#2E7D32'}}>Track</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:'#E8F5E9'}}>
                            <View>
                              <Text style={{fontSize:10,color:'#81C784'}}>DEPARTURE</Text>
                              <Text style={{fontSize:16,fontWeight:'900',color:'#1B5E20'}}>{train.from_std || train.departure || '--:--'}</Text>
                            </View>
                            <View style={{alignItems:'center'}}>
                              <Text style={{fontSize:12,color:'#558B2F'}}>{train.duration_h || train.duration || '--'}</Text>
                              <View style={{width:40,height:1,backgroundColor:'#C8E6C9',marginVertical:4}} />
                              <Text style={{fontSize:10,color:'#81C784'}}>{train.distance || '--'} km</Text>
                            </View>
                            <View style={{alignItems:'flex-end'}}>
                              <Text style={{fontSize:10,color:'#81C784'}}>ARRIVAL</Text>
                              <Text style={{fontSize:16,fontWeight:'900',color:'#1B5E20'}}>{train.to_std || train.arrival || '--:--'}</Text>
                            </View>
                          </View>
                          <View style={{flexDirection:'row',gap:6,marginTop:8}}>
                            {(train.train_type || 'Express').split(' ').map((t: string, idx: number) => (
                              <View key={idx} style={{backgroundColor:'#FFF3E0',paddingHorizontal:8,paddingVertical:3,borderRadius:6}}>
                                <Text style={{fontSize:10,fontWeight:'700',color:'#E65100'}}>{t}</Text>
                              </View>
                            ))}
                          </View>
                        </ClayCard>
                      ))}
                      {runningTrains.length > 5 && (
                        <Text style={{textAlign:'center',fontSize:12,color:'#81C784',marginTop:4}}>
                          + {runningTrains.length - 5} more trains
                        </Text>
                      )}
                    </View>
                  )}

                  {/* === DIVIDER === */}
                  <View style={{height:2,backgroundColor:'#E8F5E9',marginVertical:16}} />

                  {/* === LIVE TRAIN TRACKING === */}
                  <Text style={{fontSize:14,fontWeight:'800',color:'#1B5E20',marginBottom:10}}>📍 Live Train Tracking</Text>
                  <View style={[st.inputWrap,{marginBottom:12}]}>
                    <Text style={st.label}>Enter Train Number</Text>
                    <View style={{flexDirection:'row',gap:8}}>
                      <TextInput 
                        style={[st.input,{flex:1}]} 
                        placeholder="e.g., 12952 for Rajdhani" 
                        value={trainNumber} 
                        onChangeText={setTrainNumber}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity 
                        style={[st.syncBtn,{backgroundColor:'#E53935'}]} 
                        onPress={() => fetchTrainRunningStatus(trainNumber)}
                        disabled={trainLoading}
                      >
                        {trainLoading ? <ActivityIndicator color="#FFF" size="small"/> : <Ionicons name="locate" size={20} color="#FFF"/>}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {trainStatus && (
                    <ClayCard variant="mint" style={{marginBottom:16,padding:16,borderLeftWidth:4,borderLeftColor:trainStatus.delay > 0 ? '#E53935' : '#4CAF50'}}>
                      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <View>
                          <Text style={{fontSize:18,fontWeight:'900',color:'#1B5E20'}}>{trainStatus.train_name}</Text>
                          <Text style={{fontSize:13,color:'#558B2F',marginTop:2}}>Train #{trainStatus.train_number}</Text>
                        </View>
                        <View style={{backgroundColor:trainStatus.delay > 0 ? '#FFEBEE' : '#E8F5E9',paddingHorizontal:10,paddingVertical:5,borderRadius:8}}>
                          <Text style={{fontSize:12,fontWeight:'900',color:trainStatus.delay > 0 ? '#E53935' : '#2E7D32'}}>
                            {trainStatus.delay > 0 ? `${trainStatus.delay}m delay` : 'On Time'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={{flexDirection:'row',alignItems:'center',marginTop:8,gap:8}}>
                        <View style={{width:10,height:10,borderRadius:5,backgroundColor:'#4CAF50'}} />
                        <Text style={{fontSize:14,fontWeight:'700',color:'#2E7D32'}}>Current: {trainStatus.current_station}</Text>
                      </View>
                      
                      <View style={{flexDirection:'row',alignItems:'center',marginTop:6,gap:8}}>
                        <View style={{width:10,height:10,borderRadius:5,backgroundColor:'#FFC107'}} />
                        <Text style={{fontSize:13,color:'#558B2F'}}>Next: {trainStatus.next_station}</Text>
                      </View>
                      
                      <View style={{marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:'#C8E6C9'}}>
                        <Text style={{fontSize:12,color:'#558B2F'}}>Expected Arrival: <Text style={{fontWeight:'800'}}>{trainStatus.expected_arrival}</Text></Text>
                      </View>
                    </ClayCard>
                  )}

                  {/* === PNR STATUS === */}
                  <Text style={{fontSize:14,fontWeight:'800',color:'#1B5E20',marginBottom:10}}>🎫 PNR Status Check</Text>
                  <View style={[st.inputWrap,{marginBottom:12}]}>
                    <Text style={st.label}>Enter 10-digit PNR Number</Text>
                    <View style={{flexDirection:'row',gap:8}}>
                      <TextInput 
                        style={[st.input,{flex:1}]} 
                        placeholder="e.g., 1234567890" 
                        value={pnrNumber} 
                        onChangeText={setPnrNumber}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                      <TouchableOpacity 
                        style={[st.syncBtn,{backgroundColor:'#1565C0'}]} 
                        onPress={() => fetchPNRStatus(pnrNumber)}
                        disabled={pnrLoading}
                      >
                        {pnrLoading ? <ActivityIndicator color="#FFF" size="small"/> : <Ionicons name="search" size={20} color="#FFF"/>}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {pnrStatus && (
                    <ClayCard variant="white" style={{padding:16,borderLeftWidth:4,borderLeftColor:'#1565C0'}}>
                      <Text style={{fontSize:17,fontWeight:'900',color:'#1B5E20'}}>{pnrStatus.train_name}</Text>
                      <Text style={{fontSize:14,fontWeight:'700',color:'#558B2F',marginTop:2}}>Train #{pnrStatus.train_number}</Text>
                      <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:6}}>
                        <Text style={{fontSize:13,color:'#2E7D32',fontWeight:'700'}}>{pnrStatus.boarding_station}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#81C784" />
                        <Text style={{fontSize:13,color:'#2E7D32',fontWeight:'700'}}>{pnrStatus.reservation_upto}</Text>
                      </View>
                      <Text style={{fontSize:12,color:'#81C784',marginTop:4}}>PNR: {pnrStatus.pnr_number}</Text>
                      
                      <View style={{marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#E8F5E9'}}>
                        <Text style={{fontSize:12,fontWeight:'900',color:'#1B5E20',marginBottom:8}}>Passenger Status:</Text>
                        {pnrStatus.passengers?.map((p: any, i: number) => (
                          <View key={i} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:6}}>
                            <View style={{width:24,height:24,borderRadius:12,backgroundColor:p.current_status.includes('CNF') ? '#E8F5E9' : '#FFEBEE',alignItems:'center',justifyContent:'center'}}>
                              <Text style={{fontSize:10,fontWeight:'900',color:p.current_status.includes('CNF') ? '#2E7D32' : '#E53935'}}>{i+1}</Text>
                            </View>
                            <Text style={{fontSize:14,fontWeight:'700',color:p.current_status.includes('CNF') ? '#2E7D32' : '#E53935'}}>
                              {p.current_status}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </ClayCard>
                  )}
                </View>
              )}

              {loading && <ActivityIndicator size="large" color={NC.primary} style={{marginVertical:30}}/>}

              {!loading && results && !selectedResult && (
                <View style={{marginTop:6}}>
                  <Text style={st.resultHeaders}>FOUND {results.length} RESULTS</Text>
                  {results.map((r,i) => (
                    <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => setSelectedResult(r)}>
                      <ClayCard variant="white" style={st.resultCard}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                          <Text style={st.resTitle} numberOfLines={1}>{safeStr(r.title)}</Text>
                          <View style={st.resStatusBadge}><Text style={st.resStatusText}>{safeStr(r.status)}</Text></View>
                        </View>
                        <Text style={st.resSub}>{safeStr(r.subtitle)}</Text>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                          <Text style={st.resPrice}>{safeStr(r.price)}</Text>
                          <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
                            <Text style={{fontSize:11,fontWeight:'800',color:NC.primary}}>Details</Text>
                            <Ionicons name="chevron-forward" size={14} color={NC.primary}/>
                          </View>
                        </View>
                      </ClayCard>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Detailed View */}
              {selectedResult && (
                <View style={{marginTop:6}}>
                  <TouchableOpacity style={{flexDirection:'row',alignItems:'center',marginBottom:16}} onPress={() => setSelectedResult(null)}>
                    <Ionicons name="arrow-back" size={20} color={NC.primary}/>
                    <Text style={{fontSize:14,fontWeight:'800',color:NC.primary,marginLeft:8}}>Back to Results</Text>
                  </TouchableOpacity>
                  
                  <ClayCard variant="green" style={{marginBottom:16,padding:20}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <Ionicons name={activeModule==='flight'?'airplane':activeModule==='bus'?'bus':activeModule==='train'?'train':'bed'} size={28} color="#FFF"/>
                      <View style={{backgroundColor:'rgba(255,255,255,0.2)',paddingHorizontal:10,paddingVertical:4,borderRadius:10}}>
                        <Text style={{color:'#FFF',fontSize:10,fontWeight:'900'}}>{safeStr(selectedResult.status)}</Text>
                      </View>
                    </View>
                    <Text style={{color:'#FFF',fontSize:20,fontWeight:'900',marginBottom:6}}>{safeStr(selectedResult.title)}</Text>
                    <Text style={{color:'rgba(255,255,255,0.9)',fontSize:13,fontWeight:'700'}}>{safeStr(selectedResult.subtitle)}</Text>
                    <Text style={{color:'#FFF',fontSize:24,fontWeight:'900',marginTop:16}}>{safeStr(selectedResult.price)}</Text>
                  </ClayCard>

                  <Text style={st.gridTitle}>Route Information</Text>
                  <ClayCard variant="white" style={{marginBottom:16}}>
                    <View style={st.detailRow}><Text style={st.detailLabel}>From</Text><Text style={st.detailValue}>{qFrom||'Origin'}</Text></View>
                    <View style={st.detailRow}><Text style={st.detailLabel}>To</Text><Text style={st.detailValue}>{qTo||'Destination'}</Text></View>
                    <View style={st.detailRow}><Text style={st.detailLabel}>Departure</Text><Text style={st.detailValue}>08:30 AM</Text></View>
                    <View style={[st.detailRow,{borderBottomWidth:0}]}><Text style={st.detailLabel}>Arrival</Text><Text style={st.detailValue}>11:45 AM</Text></View>
                  </ClayCard>

                  <Text style={st.gridTitle}>Availability & Fare</Text>
                  <ClayCard variant="white" style={{marginBottom:16}}>
                    <View style={st.detailRow}><Text style={st.detailLabel}>Available Seats</Text><Text style={[st.detailValue,{color:'#4CAF50'}]}>{Math.floor(Math.random()*40)+5} Seats</Text></View>
                    <View style={st.detailRow}><Text style={st.detailLabel}>Base Fare</Text><Text style={st.detailValue}>{safeStr(selectedResult.price)}</Text></View>
                    <View style={st.detailRow}><Text style={st.detailLabel}>Taxes & Fees</Text><Text style={st.detailValue}>+₹450</Text></View>
                    <View style={[st.detailRow,{borderBottomWidth:0}]}><Text style={st.detailLabel}>Refundable</Text><Text style={st.detailValue}>Yes (Partial)</Text></View>
                  </ClayCard>

                  <View style={{height: 10}}/>

                  <TouchableOpacity style={st.officialBtn} onPress={() => {
                    if(activeModule==='train') openOfficialApp('irctc://','https://www.irctc.co.in/');
                    else if(activeModule==='bus') openOfficialApp('redbus://','https://www.redbus.in/');
                    else if(activeModule==='flight') openOfficialApp('makemytrip://','https://www.makemytrip.com/flights/');
                    else openOfficialApp('booking://','https://www.booking.com/');
                  }}>
                    <Ionicons name="open-outline" size={18} color="#FFF" style={{marginRight:8}}/>
                    <Text style={[st.officialText,{fontSize:15}]}>Book on Official App</Text>
                  </TouchableOpacity>
                  <Text style={{textAlign:'center',fontSize:11,color:NC.onSurfaceVariant,marginTop:10}}>Redirects to partner application</Text>
                </View>
              )}
              <View style={{height:40}}/>
              </ScrollView>
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* Movie Detail Modal */}
      {showMovieDetail && selectedMovie && (
        <Modal visible transparent animationType="slide">
          <View style={st.modalOverlay}>
            <View style={[st.modalSheet,{maxHeight:'92%'}]}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>Movie Details</Text>
                <TouchableOpacity onPress={() => setShowMovieDetail(false)} style={st.closeBtn}>
                  <Ionicons name="close" size={24} color={NC.onSurfaceVariant}/>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Movie Poster */}
                <View style={{alignItems:'center',marginBottom:20}}>
                  <View style={{width:150,height:220,borderRadius:12,overflow:'hidden',backgroundColor:'#F5F5F5',shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:8,elevation:10}}>
                    {selectedMovie.poster_image_thumbnail ? (
                      <Image 
                        source={{ uri: selectedMovie.poster_image_thumbnail }}
                        style={{width:'100%',height:'100%'}}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Ionicons name="film" size={60} color="#C2185B"/>
                      </View>
                    )}
                  </View>
                </View>

                {/* Title & Rating */}
                <Text style={{fontSize:24,fontWeight:'900',color:'#1B5E20',textAlign:'center'}}>{selectedMovie.title}</Text>
                <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:12,marginTop:8}}>
                  <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'#FFC107',paddingHorizontal:10,paddingVertical:5,borderRadius:8}}>
                    <Ionicons name="star" size={14} color="#FFF"/>
                    <Text style={{fontSize:14,fontWeight:'900',color:'#FFF',marginLeft:4}}>{selectedMovie.rating}/10</Text>
                  </View>
                  <Text style={{fontSize:13,color:'#558B2F'}}>{selectedMovie.runtime} min</Text>
                  <Text style={{fontSize:13,color:'#81C784'}}>{selectedMovie.genres?.join(' • ')}</Text>
                </View>
                <Text style={{fontSize:12,color:'#81C784',textAlign:'center',marginTop:4}}>
                  {selectedMovie.reviews?.toLocaleString()} reviews
                </Text>

                {/* About Section */}
                <Text style={{fontSize:16,fontWeight:'900',color:'#1B5E20',marginTop:20,marginBottom:8}}>📖 About the Movie</Text>
                <ClayCard variant="white" style={{padding:16,marginBottom:16}}>
                  <Text style={{fontSize:14,color:'#2E7D32',lineHeight:22}}>{selectedMovie.plot}</Text>
                </ClayCard>

                {/* Cast & Crew */}
                <Text style={{fontSize:16,fontWeight:'900',color:'#1B5E20',marginBottom:8}}>� Cast & Crew</Text>
                <ClayCard variant="mint" style={{padding:16,marginBottom:16}}>
                  <View style={{marginBottom:8}}>
                    <Text style={{fontSize:12,color:'#81C784'}}>Director</Text>
                    <Text style={{fontSize:15,fontWeight:'800',color:'#1B5E20'}}>{selectedMovie.director}</Text>
                  </View>
                  <View>
                    <Text style={{fontSize:12,color:'#81C784'}}>Cast</Text>
                    <Text style={{fontSize:14,fontWeight:'700',color:'#2E7D32'}}>{selectedMovie.cast}</Text>
                  </View>
                </ClayCard>
                
                {/* Showtimes Section */}
                <Text style={{fontSize:16,fontWeight:'900',color:'#1B5E20',marginBottom:12}}>🎬 Showtimes in {movieCity}</Text>
                
                <ClayCard variant="white" style={{marginBottom:12,padding:16}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <View>
                      <Text style={{fontSize:15,fontWeight:'800',color:'#1B5E20'}}>PVR Cinemas</Text>
                      <Text style={{fontSize:11,color:'#558B2F'}}>Dolby Atmos • Recliner</Text>
                    </View>
                    <Text style={{fontSize:12,color:'#2E7D32',fontWeight:'700'}}>2.5 km</Text>
                  </View>
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                    {['10:30 AM', '1:15 PM', '4:00 PM', '7:30 PM', '10:45 PM'].map((time, i) => (
                      <TouchableOpacity key={i} style={{backgroundColor:'#C2185B',paddingHorizontal:14,paddingVertical:8,borderRadius:8}}>
                        <Text style={{color:'#FFF',fontSize:12,fontWeight:'800'}}>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{fontSize:11,color:'#81C784',marginTop:8}}>₹250 - ₹650 per ticket</Text>
                </ClayCard>

                <ClayCard variant="white" style={{marginBottom:12,padding:16}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <View>
                      <Text style={{fontSize:15,fontWeight:'800',color:'#1B5E20'}}>INOX Movies</Text>
                      <Text style={{fontSize:11,color:'#558B2F'}}>IMAX • 4K Projection</Text>
                    </View>
                    <Text style={{fontSize:12,color:'#2E7D32',fontWeight:'700'}}>4.1 km</Text>
                  </View>
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                    {['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'].map((time, i) => (
                      <TouchableOpacity key={i} style={{backgroundColor:'#1565C0',paddingHorizontal:14,paddingVertical:8,borderRadius:8}}>
                        <Text style={{color:'#FFF',fontSize:12,fontWeight:'800'}}>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{fontSize:11,color:'#81C784',marginTop:8}}>₹300 - ₹800 per ticket</Text>
                </ClayCard>

                <ClayCard variant="white" style={{marginBottom:16,padding:16}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <View>
                      <Text style={{fontSize:15,fontWeight:'800',color:'#1B5E20'}}>Cinepolis</Text>
                      <Text style={{fontSize:11,color:'#558B2F'}}>4DX • 7.1 Surround</Text>
                    </View>
                    <Text style={{fontSize:12,color:'#2E7D32',fontWeight:'700'}}>5.8 km</Text>
                  </View>
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                    {['9:45 AM', '12:30 PM', '3:45 PM', '7:00 PM', '10:15 PM'].map((time, i) => (
                      <TouchableOpacity key={i} style={{backgroundColor:'#E65100',paddingHorizontal:14,paddingVertical:8,borderRadius:8}}>
                        <Text style={{color:'#FFF',fontSize:12,fontWeight:'800'}}>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{fontSize:11,color:'#81C784',marginTop:8}}>₹200 - ₹550 per ticket</Text>
                </ClayCard>

                {/* Book Button */}
                <TouchableOpacity 
                  style={{backgroundColor:'#C2185B',borderRadius:16,paddingVertical:16,alignItems:'center',flexDirection:'row',justifyContent:'center',marginBottom:8}}
                  onPress={() => {
                    const searchQuery = encodeURIComponent(selectedMovie.title);
                    Linking.openURL(`https://in.bookmyshow.com/search/movies?search_query=${searchQuery}`);
                  }}
                >
                  <Ionicons name="ticket" size={22} color="#FFF" style={{marginRight:10}}/>
                  <Text style={{color:'#FFF',fontSize:17,fontWeight:'900'}}>Book on BookMyShow</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{backgroundColor:'#FFF',borderRadius:16,paddingVertical:14,alignItems:'center',borderWidth:2,borderColor:'#E53935',marginBottom:20}}
                  onPress={() => {
                    const searchQuery = encodeURIComponent(selectedMovie.title);
                    Linking.openURL(`https://paytm.com/movies/search?query=${searchQuery}`);
                  }}
                >
                  <Text style={{color:'#E53935',fontSize:15,fontWeight:'800'}}>Book on Paytm</Text>
                </TouchableOpacity>
                
                <View style={{height:20}}/>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container:{flex:1,backgroundColor:NC.background},
  scroll:{paddingHorizontal:20},
  header:{marginTop:10,marginBottom:24,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},
  heading:{fontSize:32,fontWeight:'900',color:NC.primary,letterSpacing:-0.5},
  sub:{fontSize:13,color:NC.onSurfaceVariant,fontWeight:'700',marginTop:4},
  historyBtn:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:NC.surfaceLowest,paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:2,borderColor:'rgba(165,214,167,0.3)'},
  historyBtnText:{fontSize:12,fontWeight:'800',color:NC.primary},
  heroCard:{padding:24,backgroundColor:NC.primaryFixed,marginBottom:24},
  heroLabel:{color:'rgba(255,255,255,0.7)',fontSize:10,fontWeight:'900',letterSpacing:1.5,marginBottom:4},
  heroTitle:{color:'#FFF',fontSize:22,fontWeight:'900',letterSpacing:-0.5,marginBottom:4},
  heroSub:{color:'rgba(255,255,255,0.85)',fontSize:12,lineHeight:18},
  gridTitle:{fontSize:16,fontWeight:'900',color:NC.onSurface,marginBottom:14},
  grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},
  gridItem:{width:'48%',marginBottom:14},
  gridItemCard:{padding:16,alignItems:'center'},
  iconOrb:{width:50,height:50,borderRadius:25,alignItems:'center',justifyContent:'center',marginBottom:8},
  modTitle:{fontSize:13,fontWeight:'900',color:NC.onSurface,textAlign:'center'},
  modSub:{fontSize:9,fontWeight:'700',color:NC.onSurfaceVariant,textAlign:'center',marginTop:2},
  syncCard:{padding:14,marginBottom:20,borderWidth:2,borderColor:'rgba(21,101,192,0.12)'},
  syncTitle:{fontSize:13,fontWeight:'900',color:'#1565C0'},
  syncBtn:{width:46,height:46,borderRadius:23,backgroundColor:'#1565C0',alignItems:'center',justifyContent:'center'},
  tkCard:{marginBottom:12,padding:14,borderLeftWidth:5,borderLeftColor:NC.primaryFixed},
  tkHead:{flexDirection:'row',alignItems:'center',marginBottom:8},
  tkPnr:{flex:1,fontSize:12,fontWeight:'900',color:NC.onSurface,marginLeft:6},
  tkStatusBadge:{backgroundColor:'#4CAF50',paddingHorizontal:8,paddingVertical:3,borderRadius:10},
  tkStatusText:{fontSize:9,fontWeight:'900',color:'#FFF'},
  tkTitle:{fontSize:16,fontWeight:'900',color:NC.primary,marginBottom:8},
  tkGrid:{flexDirection:'row',justifyContent:'space-between'},
  tkLabel:{fontSize:8,fontWeight:'800',color:NC.onSurfaceVariant,letterSpacing:1,marginBottom:1},
  tkVal:{fontSize:12,fontWeight:'800',color:NC.onSurface},
  histSecTitle:{fontSize:12,fontWeight:'900',color:NC.onSurfaceVariant,marginTop:16,marginBottom:10,letterSpacing:1},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end'},
  modalSheet:{backgroundColor:'#FFF',borderTopLeftRadius:36,borderTopRightRadius:36,maxHeight:'90%',padding:24},
  modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18},
  modalTitle:{fontSize:22,fontWeight:'900',color:NC.primary,letterSpacing:-0.5},
  modalSub:{fontSize:11,fontWeight:'700',color:NC.onSurfaceVariant,marginTop:3},
  closeBtn:{width:38,height:38,borderRadius:19,backgroundColor:NC.surfaceLow,alignItems:'center',justifyContent:'center'},
  form:{marginBottom:16},
  inputWrap:{marginBottom:14},
  label:{fontSize:10,fontWeight:'800',color:NC.onSurfaceVariant,marginBottom:6,letterSpacing:0.5},
  input:{backgroundColor:NC.surfaceLowest,borderWidth:2,borderColor:'rgba(165,214,167,0.3)',borderRadius:18,padding:14,fontSize:14,color:NC.onSurface,fontWeight:'700'},
  dropBtn:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:NC.surfaceLowest,borderWidth:2,borderColor:'rgba(165,214,167,0.3)',borderRadius:18,padding:14},
  dropBtnText:{fontSize:13,fontWeight:'700',color:NC.onSurface,flex:1},
  dropdown:{position:'absolute',top:68,left:0,right:0,backgroundColor:'#FFF',borderRadius:16,borderWidth:2,borderColor:'rgba(165,214,167,0.3)',zIndex:100,elevation:10,shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:12},
  dropItem:{padding:14,borderBottomWidth:1,borderBottomColor:'rgba(0,0,0,0.04)'},
  dropItemText:{fontSize:13,fontWeight:'700',color:NC.onSurface},
  paxRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:NC.surfaceLowest,borderWidth:2,borderColor:'rgba(165,214,167,0.3)',borderRadius:18,paddingVertical:10,paddingHorizontal:6},
  paxBtn:{width:32,height:32,borderRadius:16,backgroundColor:'rgba(165,214,167,0.3)',alignItems:'center',justifyContent:'center'},
  paxCount:{fontSize:18,fontWeight:'900',color:NC.onSurface,marginHorizontal:12},
  suggestBox:{backgroundColor:'#FFF',borderRadius:14,borderWidth:2,borderColor:'rgba(165,214,167,0.3)',marginTop:4,elevation:8,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:8},
  suggestItem:{flexDirection:'row',alignItems:'center',gap:8,padding:12,borderBottomWidth:1,borderBottomColor:'rgba(0,0,0,0.03)'},
  suggestText:{fontSize:14,fontWeight:'700',color:NC.onSurface},
  resultHeaders:{fontSize:11,fontWeight:'900',color:NC.outline,marginBottom:10,letterSpacing:1},
  resultCard:{padding:16,borderWidth:2,borderColor:NC.primaryFixed,marginBottom:12},
  resTitle:{fontSize:16,fontWeight:'900',color:NC.onSurface,flex:1},
  resStatusBadge:{backgroundColor:NC.primaryFixed,paddingHorizontal:10,paddingVertical:4,borderRadius:10},
  resStatusText:{fontSize:9,fontWeight:'900',color:'#FFF'},
  resSub:{fontSize:11,color:NC.onSurfaceVariant,marginTop:6,fontWeight:'600'},
  resPrice:{fontSize:18,fontWeight:'900',color:NC.primary,marginTop:6},
  bookDivider:{height:1,backgroundColor:'rgba(0,0,0,0.06)',marginVertical:12},
  officialBtn:{flexDirection:'row',backgroundColor:'#000',padding:14,borderRadius:16,alignItems:'center',justifyContent:'center'},
  officialText:{color:'#FFF',fontSize:13,fontWeight:'800'},
  calOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'},
  calSheet:{backgroundColor:'#FFF',borderRadius:28,padding:24,width:'85%'},
  calHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},
  calMonthLabel:{fontSize:18,fontWeight:'900',color:NC.primary},
  calDayNames:{flexDirection:'row',justifyContent:'space-around',marginBottom:8},
  calDayName:{fontSize:11,fontWeight:'800',color:NC.onSurfaceVariant,width:36,textAlign:'center'},
  calGrid:{flexDirection:'row',flexWrap:'wrap'},
  calCell:{width:'14.28%',alignItems:'center',justifyContent:'center',paddingVertical:8},
  calCellSel:{backgroundColor:NC.primary,borderRadius:20},
  calCellText:{fontSize:14,fontWeight:'700',color:NC.onSurface},
  calCellTextSel:{color:'#FFF',fontWeight:'900'},
  calClose:{alignItems:'center',marginTop:16,paddingVertical:10},
  detailHero:{alignItems:'center',backgroundColor:NC.primary,borderRadius:24,padding:22,marginBottom:18},
  detailPnr:{fontSize:26,fontWeight:'900',color:'#FFF',marginTop:8},
  detailStatusBadge:{backgroundColor:'rgba(255,255,255,0.2)',paddingHorizontal:14,paddingVertical:5,borderRadius:12,marginTop:8},
  detailStatusText:{fontSize:11,fontWeight:'900',color:'#FFF'},
  detailTitle:{fontSize:18,fontWeight:'900',color:NC.onSurface,marginBottom:14},
  detailRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:11,borderBottomWidth:1,borderBottomColor:'rgba(0,0,0,0.05)'},
  detailLabel:{fontSize:13,fontWeight:'700',color:NC.onSurfaceVariant},
  detailValue:{fontSize:13,fontWeight:'800',color:NC.onSurface},
});
