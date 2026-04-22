async function testApis() {
  const apiKey = '8a021ae6c0mshd4cbdcccfa6bc4cp18270djsn09bb26c0b8bb';

  console.log('Testing Trains Between Stations API...');
  try {
    const res = await fetch(`https://irctc1.p.rapidapi.com/v3/train_between_stations/?from=NDLS&to=CSTM`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      }
    });
    console.log('Train Status code:', res.status);
    const body = await res.json();
    console.log('Response body:', JSON.stringify(body).slice(0, 500));
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testApis();
