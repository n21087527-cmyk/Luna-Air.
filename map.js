// 🌍 Client-side Map JavaScript for Luna Air Weather Map
// This file handles the interactive weather map functionality

console.log('🗺️ Map.js loaded successfully');

// Initialize map when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}

function initMap() {
  console.log('🚀 Initializing weather map...');
  
  // Check if map container exists
  const mapContainer = document.getElementById('weather-map');
  if (!mapContainer) {
    console.error('❌ Map container not found!');
    return;
  }
  
  console.log('✅ Map container found, map should be visible now');
  
  // Add any additional map initialization logic here
  // The main map logic is already in map.html
}

// Optional: Add real-time weather data fetching
async function fetchWeatherData() {
  try {
    // If you have a backend API, fetch data here
    // const response = await fetch('http://localhost:5000/api/risks');
    // const data = await response.json();
    // return data;
    
    console.log('📡 Weather data fetch function ready');
  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
  }
}

// Export functions if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initMap, fetchWeatherData };
}

console.log('✅ Weather map ready');














































































































































































































































































































































