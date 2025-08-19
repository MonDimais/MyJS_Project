(() => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const statusEl = document.getElementById('status');
    const currentEl = document.getElementById('current');
    const placeEl = document.getElementById('place');
    const timeEl = document.getElementById('observed-at');
    const tempEl = document.getElementById('temperature');
    const unitEl = document.getElementById('unit');
    const summaryEl = document.getElementById('summary');
    const detailsEl = document.getElementById('details');
    const locBtn = document.getElementById('loc-btn');

    const WEATHER_CODE = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Light freezing rain', 67: 'Heavy freezing rain',
        71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };

    const formatTime = (iso) => new Date(iso).toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short', day: '2-digit', month: 'short' });

    function showStatus(message, type = 'info') {
        statusEl.textContent = message;
        statusEl.hidden = false;
        statusEl.dataset.type = type;
    }

    function hideStatus() {
        statusEl.hidden = true;
        statusEl.textContent = '';
        delete statusEl.dataset.type;
    }

    function showCurrent() { currentEl.hidden = false; }
    function hideCurrent() { currentEl.hidden = true; }

    async function geocodeCity(city) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Geocoding failed');
        const data = await res.json();
        if (!data.results || data.results.length === 0) throw new Error('Location not found');
        const r = data.results[0];
        const place = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
        return { latitude: r.latitude, longitude: r.longitude, place };
    }

    async function fetchWeather(latitude, longitude) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather request failed');
        return res.json();
    }

    function renderWeather(place, weather) {
        const c = weather.current;
        placeEl.textContent = place;
        timeEl.textContent = `Updated ${formatTime(c.time)}`;
        tempEl.textContent = Math.round(c.temperature_2m);
        unitEl.textContent = '°C';
        const code = WEATHER_CODE[c.weather_code] || '—';
        summaryEl.textContent = code;
        const details = [
            `Feels like ${Math.round(c.apparent_temperature)}°C`,
            `Wind ${Math.round(c.wind_speed_10m)} km/h`,
            `Humidity ${Math.round(c.relative_humidity_2m)}%`,
            c.precipitation ? `Precip ${c.precipitation} mm` : null
        ].filter(Boolean).join(' · ');
        detailsEl.textContent = details;
        showCurrent();

        function setWeatherTheme(code) {
            document.body.className = ''; // reset
          
            if ([0,1].includes(code)) { // clear
              document.body.classList.add('clear');
              document.getElementById('bird-sound')?.play();
            } 
            else if ([61,63,65,80,81,82].includes(code)) { // rain
              document.body.classList.add('rain');
              document.getElementById('rain-sound')?.play();
            }
            else if ([71,73,75,85,86,77].includes(code)) { // snow
              document.body.classList.add('snow');
            }
            else if ([95,96,99].includes(code)) { // thunderstorm
              document.body.classList.add('thunder');
              const s = document.getElementById('thunder-sound');
              s?.play();
              // flashing effect
              const flash = document.createElement('div');
              flash.className = 'flash';
              document.body.appendChild(flash);
              setTimeout(()=> flash.remove(), 300);
            }
        }
        setWeatherTheme(c.weather_code);
    }

    async function handleSearch(city) {
        if (!city || !city.trim()) return;
        hideCurrent();
        showStatus('Searching…');
        try {
            const { latitude, longitude, place } = await geocodeCity(city.trim());
            showStatus('Fetching weather…');
            const weather = await fetchWeather(latitude, longitude);
            hideStatus();
            renderWeather(place, weather);
        } catch (err) {
            console.error(err);
            showStatus(err.message || 'Something went wrong', 'error');
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSearch(input.value);
    });

    locBtn.addEventListener('click', async () => {
        if (!navigator.geolocation) {
            showStatus('Geolocation not supported in this browser', 'error');
            return;
        }
        showStatus('Getting your location…');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                showStatus('Fetching weather…');
                const weather = await fetchWeather(latitude, longitude);
                // Reverse geocode to get a human-readable place name
                const revUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`;
                const revRes = await fetch(revUrl);
                let place = 'Your location';
                if (revRes.ok) {
                    const rev = await revRes.json();
                    if (rev && rev.results && rev.results[0]) {
                        const r = rev.results[0];
                        place = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
                    }
                }
                hideStatus();
                renderWeather(place, weather);
            } catch (err) {
                console.error(err);
                showStatus('Could not fetch weather for your location', 'error');
            }
        }, (err) => {
            console.error(err);
            showStatus('Permission denied or location unavailable', 'error');
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    });

    // Prefill with an example
    handleSearch('London');
})();


