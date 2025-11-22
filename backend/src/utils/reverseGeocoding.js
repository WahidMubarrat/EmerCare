/**
 * Reverse geocoding utility to convert GPS coordinates to city name
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

import https from 'https';

/**
 * Convert GPS coordinates to city name
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string|null>} City name or null
 */
export async function getCityFromCoordinates(latitude, longitude) {
  // Nominatim reverse geocoding endpoint
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

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
          const result = JSON.parse(data);
          
          if (result && result.address) {
            // Try to get city from various possible fields
            const city = result.address.city 
              || result.address.town 
              || result.address.village 
              || result.address.municipality 
              || result.address.county
              || null;
            
            resolve(city);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Error parsing reverse geocoding response:', error);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error('Reverse geocoding request error:', error);
      resolve(null);
    });
  });
}
