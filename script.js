const weatherDisplay = document.getElementById('weatherDisplay');
const errorDisplay = document.getElementById('errorDisplay');
const locationForm = document.getElementById('locationForm');
const locationInput = document.getElementById('locationInput');
const geoBtn = document.getElementById('geoBtn');

// Helper: Fetch coordinates for a city name using Open-Meteo geocoding
async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch coordinates');
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error('Location not found');
    return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name, country: data.results[0].country };
}

// Helper: Fetch weather data from Open-Meteo
async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    if (!data.current_weather) throw new Error('Weather data not available');
    return data.current_weather;
}

function displayWeather(info, location) {
    weatherDisplay.innerHTML = `
        <h2>${location}</h2>
        <p><strong>Temperature:</strong> ${info.temperature}°C</p>
        <p><strong>Weather:</strong> ${weatherCodeToText(info.weathercode)}</p>
        <p><strong>Wind Speed:</strong> ${info.windspeed} km/h</p>
        <p><strong>Time:</strong> ${info.time}</p>
    `;
    errorDisplay.textContent = '';
}

function displayError(msg) {
    errorDisplay.textContent = msg;
    weatherDisplay.innerHTML = '';
}

// Weather code to text (Open-Meteo codes)
function weatherCodeToText(code) {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return codes[code] || 'Unknown';
}

// Handle form submit
locationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = locationInput.value.trim();
    if (!city) {
        displayError('Please enter a location.');
        return;
    }
    try {
        weatherDisplay.innerHTML = 'Loading...';
        const coords = await getCoordinates(city);
        const weather = await getWeather(coords.lat, coords.lon);
        displayWeather(weather, `${coords.name}, ${coords.country}`);
    } catch (err) {
        displayError(err.message);
    }
});

// Handle geolocation button
geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        displayError('Geolocation is not supported by your browser.');
        return;
    }
    weatherDisplay.innerHTML = 'Getting your location...';
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const weather = await getWeather(lat, lon);
            displayWeather(weather, `Your Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
        } catch (err) {
            displayError(err.message);
        }
    }, (err) => {
        displayError('Unable to retrieve your location.');
    });
}); 