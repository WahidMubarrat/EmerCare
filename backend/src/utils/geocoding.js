/**
 * Geocoding utility to convert addresses to GPS coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

const https = require('https');

/**
 * Convert address to GPS coordinates
 * @param {string} street - Street address
 * @param {string} city - City name
 * @param {string} postcode - Postal code
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
async function geocodeAddress(street, city, postcode) {
  // Build the address query
  const addressParts = [];
  if (street) addressParts.push(street);
  if (city) addressParts.push(city);
  if (postcode) addressParts.push(postcode);
  
  const address = addressParts.join(', ');
  
  if (!address) {
    throw new Error('Address is required for geocoding');
  }

  // URL encode the address
  const encodedAddress = encodeURIComponent(address);
  
  // Nominatim API endpoint
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'EmerCare-Healthcare-App/1.0'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          
          if (results && results.length > 0) {
            const location = results[0];
            resolve({
              latitude: parseFloat(location.lat),
              longitude: parseFloat(location.lon)
            });
          } else {
            // If geocoding fails, return null instead of throwing error
            // This allows registration to continue without coordinates
            console.warn(`Geocoding failed for address: ${address}`);
            resolve(null);
          }
        } catch (error) {
          console.error('Error parsing geocoding response:', error);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error('Geocoding request error:', error);
      resolve(null);
    });
  });
}

/**
 * Helper function to create GeoJSON Point from coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Object} GeoJSON Point object
 */
function createGeoJSONPoint(latitude, longitude) {
  return {
    type: 'Point',
    coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
  };
}

module.exports = {
  geocodeAddress,
  createGeoJSONPoint
};
