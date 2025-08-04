const map = L.map('map').setView([40.1106, -88.2073], 13);
const refreshRateSlider = document.getElementById('refreshRate');
const intervalValueLabel = document.getElementById('intervalValue');

let refreshIntervalMs = refreshRateSlider.value * 1000; // initial value in ms
let intervalId;

function startAutoRefresh() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(fetchVehicles, refreshIntervalMs);
}

// Update interval value display and reset timer on slider change
refreshRateSlider.addEventListener('input', () => {
  refreshIntervalMs = refreshRateSlider.value * 1000;
  intervalValueLabel.textContent = refreshRateSlider.value;
  startAutoRefresh();
});

// Initial start
startAutoRefresh();

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];  // Keep track of markers so we can clear old ones

async function fetchVehicles() {
  try {
    const res = await fetch('http://localhost:3000/vehicles');
    const data = await res.json();

    console.log('Vehicle data:', data);

    if (!data.vehicles || data.vehicles.length === 0) {
      console.warn('No vehicles found');
      return;
    }

    // Remove old markers before adding new ones
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    data.vehicles.forEach(vehicle => {
      const loc = vehicle.location || {};
      const latitude = loc.latitude || loc.lat || null;
      const longitude = loc.longitude || loc.lon || null;
      const heading = vehicle.heading;
      const route = vehicle.trip?.route_id || 'N/A';

      if (latitude === null || longitude === null) {
        console.warn('Missing or invalid coordinates for vehicle:', vehicle);
        return;
      }

      const marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`Route: ${route}<br>Heading: ${heading || 'N/A'}°`);

      markers.push(marker);
    });

  } catch (error) {
    console.error('Error fetching vehicle data:', error);
  }
}

fetch('/routes')
  .then(res => res.json())
  .then(routes => {
    routes.forEach(route => {
      console.log(`Route ${route.route_short_name} uses color #${route.route_color}`);
    });
  });



L.polyline(shapeCoordsArray, { color: `#${routeColor}` }).addTo(map);
fetchVehicles();
setInterval(fetchVehicles, 5000);
