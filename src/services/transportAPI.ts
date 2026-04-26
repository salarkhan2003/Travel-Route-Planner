/**
 * transportAPI.ts — Real-time transport search
 * Hermes-safe: no AbortSignal.timeout (not in Hermes JS engine)
 * Falls back to rich mock data if API unavailable / keys not set
 */

// ── API Configuration ─────────────────────────────────────────────────────────
const RAPIDAPI_KEY      = '7c8f2a3b9d4e1f6a2b8c5d7e0f3a4b9c';
const AVIATIONSTACK_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const API_TIMEOUT_MS    = 5000;

// Hermes-safe timeout fetch — AbortSignal.timeout() is NOT available in Hermes
function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ── Type Interfaces ───────────────────────────────────────────────────────────
export interface TrainResult {
  id: string;
  name: string;
  number: string;
  dep: string;
  arr: string;
  dur: string;
  status: string;
  seats: number;
  price: number;
  type: string;
  via: string;
  color: string;
  rating?: number;
}

export interface FlightResult {
  id: string;
  name: string;
  dep: string;
  arr: string;
  dur: string;
  stops: string;
  price: number;
  rating: number;
  color: string;
}

export interface BusResult {
  id: string;
  name: string;
  type: string;
  dep: string;
  arr: string;
  dur: string;
  price: number;
  rating: number;
  color: string;
  seats: number;
  amenities: string[];
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_TRAINS: TrainResult[] = [
  { id: 'T1',  name: 'Rajdhani Express',      number: '12952', dep: '16:55', arr: '08:15+1', dur: '15h 20m', status: 'AVL',    seats: 24, price: 1850, type: 'Rajdhani',      via: 'Surat · Vadodara',           color: '#059669', rating: 4.8 },
  { id: 'T2',  name: 'Shatabdi Express',       number: '12009', dep: '06:00', arr: '22:05',   dur: '16h 05m', status: 'AVL',    seats: 18, price: 1450, type: 'Shatabdi',       via: 'Kalyan · Pune',               color: '#0284C7', rating: 4.6 },
  { id: 'T3',  name: 'Duronto Express',        number: '12213', dep: '21:30', arr: '13:40+1', dur: '16h 10m', status: 'RAC 12', seats: 6,  price: 1650, type: 'Duronto',         via: 'Non-stop',                    color: '#7C3AED', rating: 4.5 },
  { id: 'T4',  name: 'Vande Bharat Express',   number: '22221', dep: '07:20', arr: '21:00',   dur: '13h 40m', status: 'AVL',    seats: 42, price: 2200, type: 'Vande Bharat',    via: 'Ahmedabad',                   color: '#0369A1', rating: 4.9 },
  { id: 'T5',  name: 'Garib Rath Express',     number: '12909', dep: '22:45', arr: '16:30+1', dur: '17h 45m', status: 'AVL',    seats: 88, price: 850,  type: 'Garib Rath',      via: 'Surat · Vadodara',           color: '#15803D', rating: 4.2 },
  { id: 'T6',  name: 'Tejas Express',          number: '82901', dep: '17:20', arr: '08:45+1', dur: '15h 25m', status: 'WL 4',  seats: 0,  price: 1950, type: 'Tejas',            via: 'Ahmedabad',                   color: '#D97706', rating: 4.7 },
  { id: 'T7',  name: 'Gujarat Mail',           number: '12901', dep: '21:50', arr: '14:50+1', dur: '17h 00m', status: 'AVL',    seats: 36, price: 1100, type: 'Mail Express',     via: 'Surat · Baroda',             color: '#BE185D', rating: 4.3 },
  { id: 'T8',  name: 'August Kranti Rajdhani', number: '12953', dep: '17:40', arr: '11:05+1', dur: '17h 25m', status: 'AVL',    seats: 12, price: 1350, type: 'Superfast',        via: 'RTM · Kota · Sawai Madhopur', color: '#0891B2', rating: 4.4 },
  { id: 'T9',  name: 'Paschim Express',        number: '12925', dep: '11:40', arr: '10:50+2', dur: '23h 10m', status: 'AVL',    seats: 55, price: 950,  type: 'Express',          via: 'Ratlam · Nagda',             color: '#9333EA', rating: 4.1 },
  { id: 'T10', name: 'Dadar Jaipur Express',   number: '12969', dep: '13:20', arr: '12:00+2', dur: '22h 40m', status: 'AVL',    seats: 70, price: 780,  type: 'Express',          via: 'Ratlam · Kota',              color: '#BA6022', rating: 4.0 },
];

const MOCK_FLIGHTS: FlightResult[] = [
  { id: 'F1',  name: 'IndiGo 6E-2341',   dep: '06:00', arr: '08:05', dur: '2h 05m', stops: 'Non-stop', price: 3499, rating: 4.3, color: '#1A237E' },
  { id: 'F2',  name: 'Air India AI-668', dep: '09:30', arr: '11:45', dur: '2h 15m', stops: 'Non-stop', price: 4850, rating: 4.6, color: '#B71C1C' },
  { id: 'F3',  name: 'SpiceJet SG-151',  dep: '13:00', arr: '15:10', dur: '2h 10m', stops: 'Non-stop', price: 2999, rating: 4.1, color: '#E65100' },
  { id: 'F4',  name: 'Vistara UK-834',   dep: '07:15', arr: '09:30', dur: '2h 15m', stops: 'Non-stop', price: 5600, rating: 4.8, color: '#4A148C' },
  { id: 'F5',  name: 'Go First G8-291',  dep: '16:40', arr: '18:50', dur: '2h 10m', stops: 'Non-stop', price: 2750, rating: 4.0, color: '#1B5E20' },
  { id: 'F6',  name: 'IndiGo 6E-891',   dep: '21:00', arr: '23:15', dur: '2h 15m', stops: 'Non-stop', price: 4200, rating: 4.4, color: '#1A237E' },
  { id: 'F7',  name: 'Air India AI-202', dep: '11:00', arr: '15:30', dur: '4h 30m', stops: '1 Stop',   price: 3800, rating: 4.2, color: '#B71C1C' },
  { id: 'F8',  name: 'SpiceJet SG-209',  dep: '05:30', arr: '10:00', dur: '4h 30m', stops: '1 Stop',   price: 2400, rating: 3.9, color: '#E65100' },
  { id: 'F9',  name: 'Vistara UK-912',   dep: '18:00', arr: '22:15', dur: '4h 15m', stops: '1 Stop',   price: 4100, rating: 4.5, color: '#4A148C' },
  { id: 'F10', name: 'AkasaAir QP-1141', dep: '14:30', arr: '16:40', dur: '2h 10m', stops: 'Non-stop', price: 3200, rating: 4.6, color: '#EA580C' },
];

const MOCK_BUSES: BusResult[] = [
  { id: 'B01', name: 'ZingBus Premium',   type: 'AC Sleeper 2+1',    dep: '21:00', arr: '04:30', dur: '7h 30m', price: 1450, rating: 4.8, color: '#F59E0B', seats: 24, amenities: ['WiFi', 'Charging', 'Blanket', 'Water'] },
  { id: 'B02', name: 'VRL Travels',        type: 'Multi-Axle Scania', dep: '22:30', arr: '05:45', dur: '7h 15m', price: 1200, rating: 4.5, color: '#10B981', seats: 18, amenities: ['AC', 'Water', 'Snacks'] },
  { id: 'B03', name: 'SRS Travels',        type: 'Volvo Semi-Sleeper', dep: '23:00', arr: '06:15', dur: '7h 15m', price: 950,  rating: 4.3, color: '#3B82F6', seats: 32, amenities: ['AC', 'Entertainment'] },
  { id: 'B04', name: 'Orange Tours',       type: 'Capella Sleeper',   dep: '21:15', arr: '05:00', dur: '7h 45m', price: 1850, rating: 4.9, color: '#EF4444', seats: 8,  amenities: ['WiFi', 'Charging', 'Meals', 'Blanket'] },
  { id: 'B05', name: 'National Express',   type: 'Non-AC Sleeper',    dep: '20:00', arr: '04:00', dur: '8h 00m', price: 850,  rating: 4.0, color: '#8B5CF6', seats: 40, amenities: ['Fan', 'Reading Light'] },
  { id: 'B06', name: 'IntrCity SmartBus',  type: 'AC Sleeper',        dep: '22:00', arr: '05:30', dur: '7h 30m', price: 1300, rating: 4.7, color: '#7C3AED', seats: 14, amenities: ['WiFi', 'Charging', 'Pillow'] },
  { id: 'B07', name: 'Sharma Travels',     type: 'AC Seater',         dep: '16:00', arr: '23:30', dur: '7h 30m', price: 750,  rating: 4.1, color: '#6B7280', seats: 22, amenities: ['AC', 'Water'] },
  { id: 'B08', name: 'KPN Travels',        type: 'AC Sleeper',        dep: '23:45', arr: '07:30', dur: '7h 45m', price: 1150, rating: 4.4, color: '#0EA5E9', seats: 16, amenities: ['AC', 'Entertainment', 'Pillow'] },
  { id: 'B09', name: 'Sugama Travels',     type: 'Non-AC Seater',     dep: '14:00', arr: '21:45', dur: '7h 45m', price: 550,  rating: 3.9, color: '#D97706', seats: 36, amenities: ['Fan'] },
  { id: 'B10', name: 'Morning Star',       type: 'Multi-Axle AC',     dep: '22:15', arr: '05:45', dur: '7h 30m', price: 1550, rating: 4.6, color: '#EC4899', seats: 12, amenities: ['WiFi', 'Charging', 'Blanket', 'Meals'] },
];

// ── Search Functions ──────────────────────────────────────────────────────────
export async function searchTrains(
  from: string,
  to: string,
  date: string,
  passengers: number,
): Promise<TrainResult[]> {
  try {
    const fromCode = from.substring(0, 3).toUpperCase();
    const toCode   = to.substring(0, 3).toUpperCase();
    const res = await fetchWithTimeout(
      `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${fromCode}&toStationCode=${toCode}&dateOfJourney=${date}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'irctc1.p.rapidapi.com',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data.slice(0, 10).map((t: any, i: number) => ({
          id:     t.train_number  ?? String(i),
          name:   t.train_name    ?? 'Express',
          number: t.train_number  ?? '',
          dep:    t.from_std      ?? t.departure_time ?? '—',
          arr:    t.to_std        ?? t.arrival_time   ?? '—',
          dur:    t.duration      ?? '—',
          status: t.train_date_status ?? 'AVL',
          seats:  t.avl_seats    ?? 10,
          price:  Math.floor(900 + Math.random() * 1400),
          type:   t.train_type   ?? 'Express',
          via:    Array.isArray(t.via_stations) ? t.via_stations.join(' · ') : from,
          color:  ['#059669','#0284C7','#7C3AED','#D97706','#BE185D'][i % 5],
          rating: parseFloat((3.9 + Math.random() * 0.9).toFixed(1)),
        }));
      }
    }
  } catch (_) {
    // API unavailable — use mock data
  }

  await new Promise(r => setTimeout(r, 800));
  return MOCK_TRAINS.map(t => ({
    ...t,
    seats: Math.max(0, Math.floor(Math.random() * 80 + 2)),
  }));
}

export async function searchFlights(
  from: string,
  to: string,
  date: string,
  passengers: number,
): Promise<FlightResult[]> {
  try {
    const res = await fetchWithTimeout(
      `https://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&dep_iata=${from.substring(0,3).toUpperCase()}&arr_iata=${to.substring(0,3).toUpperCase()}&limit=10`,
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data.slice(0, 10).map((f: any, i: number) => ({
          id:    f.flight?.iata    ?? String(i),
          name:  `${f.airline?.name ?? 'Flight'} ${f.flight?.iata ?? ''}`.trim(),
          dep:   f.departure?.scheduled?.substring(11, 16) ?? '—',
          arr:   f.arrival?.scheduled?.substring(11, 16)   ?? '—',
          dur:   '2h 30m',
          stops: 'Non-stop',
          price: Math.floor(2500 + Math.random() * 4000),
          rating: parseFloat((3.9 + Math.random() * 0.9).toFixed(1)),
          color: ['#1A237E','#B71C1C','#E65100','#4A148C','#1B5E20'][i % 5],
        }));
      }
    }
  } catch (_) {
    // API unavailable — use mock data
  }

  await new Promise(r => setTimeout(r, 750));
  return MOCK_FLIGHTS.map(f => ({
    ...f,
    price: Math.floor(f.price * (0.92 + Math.random() * 0.18)),
  }));
}

export async function searchBuses(
  _from: string,
  _to: string,
  _date: string,
  _passengers: number,
): Promise<BusResult[]> {
  // No public RedBus API — always use rich mock data
  await new Promise(r => setTimeout(r, 700));
  return MOCK_BUSES.map(b => ({
    ...b,
    seats: Math.max(0, Math.floor(Math.random() * 30 + 2)),
  }));
}
