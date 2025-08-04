const BACKEND_URL = 'http://localhost:3000';  // change to your production URL when live

// Initialize the map centered on Champaign-Urbana area with zoom level 13
const map = L.map('map').setView([40.1106, -88.2073], 13);

// Get references to DOM elements for the refresh rate slider and its display label
const refreshRateSlider = document.getElementById('refreshRate');
const intervalValueLabel = document.getElementById('intervalValue');

// Define bus icon for vehicle markers
const busIcon = L.icon({
  iconUrl: 'assets/icons/bus.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});


// Store the refresh interval in milliseconds (convert from seconds)
let refreshIntervalMs = refreshRateSlider.value * 1000; // initial value in ms
let intervalId; // Store the interval ID so we can clear it when needed

/**
 * Starts the auto-refresh functionality for vehicle data
 * Clears any existing interval and starts a new one with the current refresh rate
 */
function startAutoRefresh() {
  if (intervalId) clearInterval(intervalId); // Clear existing interval if running
  intervalId = setInterval(fetchVehicles, refreshIntervalMs); // Start new interval
}



// Update interval value display and reset timer on slider change
refreshRateSlider.addEventListener('input', () => {
  refreshIntervalMs = refreshRateSlider.value * 1000; // Convert slider value to milliseconds
  intervalValueLabel.textContent = refreshRateSlider.value; // Update the display label
  startAutoRefresh(); // Restart the auto-refresh with new interval
});

// Initial start - begin auto-refresh when page loads
startAutoRefresh();

// Add OpenStreetMap tiles as the base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);



// Array to keep track of markers so we can clear old ones when new data arrives
let markers = [];  


// Array to hold stop markers so you can clear or update them later if needed
let stopMarkers = [];

async function fetchStopsAndDisplay() {
  try {
    const res = await fetch(`${BACKEND_URL}/stops`);
    const stops = await res.json();
    console.log('Stops fetched:', stops.length);

stops.forEach(stop => {
  const lat = parseFloat(stop.stop_lat);
  const lon = parseFloat(stop.stop_lon);
  if (!isNaN(lat) && !isNaN(lon)) {
    const circle = L.circleMarker([lat, lon], {
      radius: 6,
      fillColor: '#3388ff',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    }).bindPopup(`<b>${stop.stop_name}</b>`);
    circle.addTo(map);
    stopMarkers.push(circle);
      } else {
        console.warn('Invalid coordinates for stop:', stop);
      }
    });
  } catch (error) {
    console.error('Failed to load stops:', error);
  }
}

/**
 * Fetches vehicle data from the backend API and updates the map markers
 * This function is called periodically to keep the map updated with real-time vehicle positions
 */
async function fetchVehicles() {
  try {
    const res = await fetch(`${BACKEND_URL}/vehicles`);
    const data = await res.json();

    if (!data.vehicles || data.vehicles.length === 0) {
      console.warn('No vehicles found');
      return;
    }

    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.vehicles.forEach(vehicle => {
      const loc = vehicle.location || {};
      const latitude = parseFloat(loc.latitude ?? loc.lat);
      const longitude = parseFloat(loc.longitude ?? loc.lon);
      let heading = Number(vehicle.heading);
      if (isNaN(heading)) heading = 0;
      const route = vehicle.trip?.route_id || 'N/A';

      if (
        latitude == null || longitude == null ||
        isNaN(latitude) || isNaN(longitude)
      ) {
        console.warn('Invalid vehicle coordinates:', vehicle);
        return;
      }

      const popupContent = `Route: ${route}` + (heading ? `<br>Heading: ${heading}°` : '');

      const marker = L.rotatedMarker([latitude, longitude], {
        icon: busIcon,
        rotationAngle: heading,
        rotationOrigin: 'center center',
      }).addTo(map).bindPopup(popupContent);

      markers.push(marker);
    });
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
  }
}


// Fetch route information from the backend and log route details
fetch(`${BACKEND_URL}/routes`)
  .then(res => res.json())
  .then(routes => {
    routes.forEach(route => {
      console.log(`Route ${route.route_short_name} uses color #${route.route_color}`);
    });
  });

// Add a polyline to the map (appears to be incomplete - missing shapeCoordsArray and routeColor variables)
// L.polyline(shapeCoordsArray, { color: `#${routeColor}` }).addTo(map);

// Initial fetch of vehicle data when page loads
fetchVehicles();
fetchStopsAndDisplay();