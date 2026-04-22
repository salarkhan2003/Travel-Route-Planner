async function testApis() {
  const apiKey = '8a021ae6c0mshd4cbdcccfa6bc4cp18270djsn09bb26c0b8bb';

  console.log('Testing Flight API...');
  try {
    const res = await fetch('https://skyscanner44.p.rapidapi.com/api/v1/flights/searchFlight?adults=1&origin=LHR&destination=JFK&departureDate=2026-05-15', {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'skyscanner44.p.rapidapi.com'
      }
    });
    console.log('Flight Status:', res.status);
    const data = await res.json();
    console.log('Flight Working:', !data.message);
  } catch (err) {
    console.log('Flight Error:', err.message);
  }

  console.log('\nTesting Hotel API...');
  try {
    const res = await fetch('https://booking-com.p.rapidapi.com/v1/hotels/locations?name=Berlin', {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'booking-com.p.rapidapi.com'
      }
    });
    console.log('Hotel Status:', res.status);
    const data = await res.json();
    console.log('Hotel Working:', !data.message);
  } catch (err) {
    console.log('Hotel Error:', err.message);
  }
}

testApis();
